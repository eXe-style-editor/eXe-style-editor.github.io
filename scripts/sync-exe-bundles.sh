#!/usr/bin/env bash
set -euo pipefail

EXE_REPO_URL="https://github.com/exelearning/exelearning"

usage() {
  cat <<'EOF'
Usage: scripts/sync-exe-bundles.sh [--skip-build]

Clones the official eXeLearning repo from GitHub (shallow) and copies
the static runtime bundles and official theme templates needed by EdEX.

Options:
  --skip-build    Do not rebuild importers/exporters bundles (bun not required).
                  Bundles already present in the clone are copied as-is.
                  Use when the bundle JS has not changed upstream.
  -h, --help      Show this help.
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RUN_BUILD=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-build)
      RUN_BUILD=0
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

WORK_DIR="$(mktemp -d)"
SOURCE_REPO="$WORK_DIR/exelearning"
trap 'rm -rf "$WORK_DIR"' EXIT

echo "Cloning $EXE_REPO_URL (depth 1)..."
git clone --depth 1 "$EXE_REPO_URL" "$SOURCE_REPO"

if [[ "$RUN_BUILD" -eq 1 ]]; then
  if ! command -v bun >/dev/null 2>&1; then
    echo "bun is required to rebuild bundles. Re-run with --skip-build to skip." >&2
    exit 1
  fi
  echo "Building bundles..."
  (
    cd "$SOURCE_REPO"
    bun install
    bun run bundle:importers
    bun run bundle:exporters
    bun run bundle:resources
  )
fi

if [[ ! -f "$SOURCE_REPO/public/app/yjs/importers.bundle.js" ]]; then
  echo "Missing importers.bundle.js — run without --skip-build to rebuild." >&2
  exit 1
fi

if [[ ! -f "$SOURCE_REPO/public/app/yjs/exporters.bundle.js" ]]; then
  echo "Missing exporters.bundle.js — run without --skip-build to rebuild." >&2
  exit 1
fi

RUNTIME_DIR="$REPO_ROOT/app/exe-runtime"
BUNDLES_DIR="$RUNTIME_DIR/bundles"
RESOURCES_DIR="$RUNTIME_DIR/resources"
THEMES_DIR="$RESOURCES_DIR/themes/base"
VENDOR_DIR="$RUNTIME_DIR/vendor"
OFFICIAL_THEMES_SOURCE="$SOURCE_REPO/public/files/perm/themes/base"
OFFICIAL_THEMES_DIR="$REPO_ROOT/reference/themes/official"
OFFICIAL_STYLES_JSON="$REPO_ROOT/app/official-styles.json"

rm -rf "$BUNDLES_DIR" "$RESOURCES_DIR" "$VENDOR_DIR"
mkdir -p "$BUNDLES_DIR" "$RESOURCES_DIR" "$THEMES_DIR" "$VENDOR_DIR/yjs"

cp "$SOURCE_REPO/public/app/yjs/importers.bundle.js" "$BUNDLES_DIR/importers.bundle.js"
cp "$SOURCE_REPO/public/app/yjs/exporters.bundle.js" "$BUNDLES_DIR/exporters.bundle.js"

if [[ -f "$SOURCE_REPO/public/libs/yjs/yjs.min.js" ]]; then
  cp "$SOURCE_REPO/public/libs/yjs/yjs.min.js" "$VENDOR_DIR/yjs/yjs.min.js"
else
  echo "Warning: yjs.min.js not found; ELPX import will not work in the browser." >&2
fi

if [[ -d "$SOURCE_REPO/public/bundles" ]]; then
  mkdir -p "$RESOURCES_DIR/bundles"
  cp -R "$SOURCE_REPO/public/bundles/." "$RESOURCES_DIR/bundles/"
else
  echo "Warning: $SOURCE_REPO/public/bundles not found; resource bundles were not copied." >&2
fi

if [[ -d "$OFFICIAL_THEMES_SOURCE" ]]; then
  cp -R "$OFFICIAL_THEMES_SOURCE/." "$THEMES_DIR/"
else
  echo "Warning: base themes directory not found; base themes were not copied." >&2
fi

if [[ -d "$OFFICIAL_THEMES_SOURCE" ]]; then
  rm -rf "$OFFICIAL_THEMES_DIR"
  mkdir -p "$OFFICIAL_THEMES_DIR"
  cp -R "$OFFICIAL_THEMES_SOURCE/." "$OFFICIAL_THEMES_DIR/"
else
  echo "Warning: base themes directory not found; official templates were not copied." >&2
fi

if [[ -d "$SOURCE_REPO/public/app/common/scorm" ]]; then
  mkdir -p "$RESOURCES_DIR/common/scorm"
  cp "$SOURCE_REPO/public/app/common/scorm/SCOFunctions.js" "$RESOURCES_DIR/common/scorm/SCOFunctions.js"
  cp "$SOURCE_REPO/public/app/common/scorm/SCORM_API_wrapper.js" "$RESOURCES_DIR/common/scorm/SCORM_API_wrapper.js"
else
  echo "Warning: SCORM support files not found; SCORM export may be incomplete." >&2
fi

SOURCE_COMMIT="$(git -C "$SOURCE_REPO" rev-parse HEAD)"
SOURCE_VERSION="$(node -e "const p=require(process.argv[1]); console.log(p.version || '')" "$SOURCE_REPO/package.json" 2>/dev/null || true)"
SYNCED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

{
  printf '{\n'
  printf '  "sourceRepo": "%s",\n' "$EXE_REPO_URL"
  printf '  "sourceBranch": "main",\n'
  printf '  "sourceCommit": "%s",\n' "$SOURCE_COMMIT"
  printf '  "sourceVersion": "%s",\n' "$SOURCE_VERSION"
  printf '  "syncedAt": "%s",\n' "$SYNCED_AT"
  printf '  "files": [\n'
  (
    cd "$RUNTIME_DIR"
    find bundles resources vendor -type f | sort | while IFS= read -r file; do
      size="$(wc -c < "$file")"
      hash="$(sha256sum "$file" | awk '{print $1}')"
      printf '%s\t%s\t%s\n' "$file" "$size" "$hash"
    done
  ) | awk 'BEGIN { first=1 } {
    if (!first) printf ",\n";
    first=0;
    printf "    { \"path\": \"%s\", \"size\": %s, \"sha256\": \"%s\" }", $1, $2, $3
  } END { if (!first) printf "\n" }'
  printf '  ]\n'
  printf '}\n'
} > "$RUNTIME_DIR/manifest.json"

node - "$OFFICIAL_THEMES_DIR" "$OFFICIAL_STYLES_JSON" <<'NODE'
const fs = require("fs");
const path = require("path");

const [themesRoot, outputPath] = process.argv.slice(2);

function xmlText(xml, tag) {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i");
  const match = String(xml || "").match(re);
  return match ? match[1].trim() : "";
}

function listFiles(dir) {
  const out = [];
  function walk(current, prefix = "") {
    const entries = fs.readdirSync(current, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(absolute, relative);
      else if (entry.isFile()) out.push(relative);
    }
  }
  walk(dir);
  return out;
}

if (!fs.existsSync(themesRoot)) {
  throw new Error(`Official themes directory not found: ${themesRoot}`);
}

const styles = fs.readdirSync(themesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b))
  .map((id) => {
    const dir = path.join(themesRoot, id);
    const files = listFiles(dir);
    const configPath = path.join(dir, "config.xml");
    const configXml = fs.existsSync(configPath) ? fs.readFileSync(configPath, "utf8") : "";
    return {
      id,
      dir: `reference/themes/official/${id}`,
      files,
      meta: {
        name: xmlText(configXml, "name"),
        title: xmlText(configXml, "title"),
        version: xmlText(configXml, "version"),
        compatibility: xmlText(configXml, "compatibility"),
        author: xmlText(configXml, "author"),
        description: xmlText(configXml, "description")
      }
    };
  });

const manifest = {
  generatedAt: new Date().toISOString(),
  styles
};

fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
NODE

echo "Synced eXeLearning runtime into $RUNTIME_DIR"
echo "Synced official theme templates into $OFFICIAL_THEMES_DIR"
echo "Regenerated $OFFICIAL_STYLES_JSON"
echo "Source: $EXE_REPO_URL@$SOURCE_COMMIT"
