#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/sync-exe-bundles.sh [--source PATH] [--skip-build]

Copies the static eXeLearning runtime bundles needed by EdEX into
app/exe-runtime/.

Options:
  --source PATH   eXeLearning checkout to sync from.
  --skip-build    Do not run bun bundle tasks before copying.
  -h, --help      Show this help.

Environment:
  EXE_SOURCE_REPO  Alternative source checkout path.
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_REPO="${EXE_SOURCE_REPO:-/home/jjdeharo/Documentos/github/OTROS_REPOSITORIOS/exelearning}"
RUN_BUILD=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)
      SOURCE_REPO="${2:-}"
      if [[ -z "$SOURCE_REPO" ]]; then
        echo "Missing value for --source" >&2
        exit 2
      fi
      shift 2
      ;;
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

if [[ ! -d "$SOURCE_REPO/.git" ]]; then
  echo "eXeLearning source repo not found: $SOURCE_REPO" >&2
  exit 1
fi

if [[ ! -f "$SOURCE_REPO/public/app/yjs/importers.bundle.js" ]]; then
  echo "Missing importers bundle in $SOURCE_REPO/public/app/yjs" >&2
  exit 1
fi

if [[ ! -f "$SOURCE_REPO/public/app/yjs/exporters.bundle.js" ]]; then
  echo "Missing exporters bundle in $SOURCE_REPO/public/app/yjs" >&2
  exit 1
fi

if [[ "$RUN_BUILD" -eq 1 ]]; then
  if ! command -v bun >/dev/null 2>&1; then
    echo "bun is required to rebuild bundles. Re-run with --skip-build to copy existing files." >&2
    exit 1
  fi
  (
    cd "$SOURCE_REPO"
    bun run bundle:importers
    bun run bundle:exporters
    bun run bundle:resources
  )
fi

RUNTIME_DIR="$REPO_ROOT/app/exe-runtime"
BUNDLES_DIR="$RUNTIME_DIR/bundles"
RESOURCES_DIR="$RUNTIME_DIR/resources"
THEMES_DIR="$RESOURCES_DIR/themes/base"
VENDOR_DIR="$RUNTIME_DIR/vendor"

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

if [[ -d "$SOURCE_REPO/public/files/perm/themes/base" ]]; then
  cp -R "$SOURCE_REPO/public/files/perm/themes/base/." "$THEMES_DIR/"
else
  echo "Warning: base themes directory not found; base themes were not copied." >&2
fi

if [[ -d "$SOURCE_REPO/public/app/common/scorm" ]]; then
  mkdir -p "$RESOURCES_DIR/common/scorm"
  cp "$SOURCE_REPO/public/app/common/scorm/SCOFunctions.js" "$RESOURCES_DIR/common/scorm/SCOFunctions.js"
  cp "$SOURCE_REPO/public/app/common/scorm/SCORM_API_wrapper.js" "$RESOURCES_DIR/common/scorm/SCORM_API_wrapper.js"
else
  echo "Warning: SCORM support files not found; SCORM export may be incomplete." >&2
fi

SOURCE_COMMIT="$(git -C "$SOURCE_REPO" rev-parse HEAD)"
SOURCE_BRANCH="$(git -C "$SOURCE_REPO" branch --show-current || true)"
SOURCE_VERSION="$(node -e "const p=require(process.argv[1]); console.log(p.version || '')" "$SOURCE_REPO/package.json" 2>/dev/null || true)"
SYNCED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

{
  printf '{\n'
  printf '  "sourceRepo": "%s",\n' "$SOURCE_REPO"
  printf '  "sourceBranch": "%s",\n' "$SOURCE_BRANCH"
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

echo "Synced eXeLearning runtime into $RUNTIME_DIR"
echo "Source: $SOURCE_REPO@$SOURCE_COMMIT"
