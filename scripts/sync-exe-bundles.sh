#!/usr/bin/env bash
set -euo pipefail

EXE_REPO_URL="https://github.com/exelearning/exelearning"
EXE_REPO_SLUG="exelearning/exelearning"

usage() {
  cat <<'EOF'
Usage: scripts/sync-exe-bundles.sh [--force] [--from-main] [--skip-build]

By default, checks the latest stable eXeLearning release on GitHub and updates
EdEX runtime bundles only when a newer static release is available.

Options:
  --force         Refresh from the selected source even if it matches the
                  version already recorded in app/exe-runtime/manifest.json.
  --from-main     Sync from the main branch instead of the latest release.
                  This mode is intended for development snapshots.
  --skip-build    Only valid with --from-main. Skip bun rebuild and copy the
                  bundles already present in the cloned repo.
  -h, --help      Show this help.
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RUNTIME_DIR="$REPO_ROOT/app/exe-runtime"
BUNDLES_DIR="$RUNTIME_DIR/bundles"
RESOURCES_DIR="$RUNTIME_DIR/resources"
THEMES_DIR="$RESOURCES_DIR/themes/base"
VENDOR_DIR="$RUNTIME_DIR/vendor"
OFFICIAL_THEMES_DIR="$REPO_ROOT/reference/themes/official"
OFFICIAL_STYLES_JSON="$REPO_ROOT/app/official-styles.json"
RUNTIME_SOURCE_JS="$REPO_ROOT/app/runtime-source.js"

FORCE=0
FROM_MAIN=0
RUN_BUILD=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force)
      FORCE=1
      shift
      ;;
    --from-main)
      FROM_MAIN=1
      shift
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

if [[ "$FROM_MAIN" -eq 0 && "$RUN_BUILD" -eq 0 ]]; then
  echo "--skip-build is only valid together with --from-main." >&2
  exit 2
fi

need_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    exit 1
  fi
}

manifest_value() {
  local key="$1"
  node -e '
    const fs = require("fs");
    const [file, key] = process.argv.slice(1);
    if (!fs.existsSync(file)) process.exit(0);
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const value = data[key];
    if (value !== undefined && value !== null) process.stdout.write(String(value));
  ' "$RUNTIME_DIR/manifest.json" "$key" 2>/dev/null || true
}

resolve_tag_commit() {
  local tag="$1"
  local commit
  commit="$(git ls-remote "$EXE_REPO_URL" "refs/tags/$tag^{}" | awk 'NR==1 { print $1 }')"
  if [[ -z "$commit" ]]; then
    commit="$(git ls-remote "$EXE_REPO_URL" "refs/tags/$tag" | awk 'NR==1 { print $1 }')"
  fi
  printf '%s' "$commit"
}

copy_runtime_from_root() {
  local source_root="$1"
  local bundles_source="$2"
  local themes_source="$3"
  local yjs_source="$4"
  local scorm_source="$5"
  local importers_source="$6"
  local exporters_source="$7"

  if [[ ! -f "$source_root/$importers_source" ]]; then
    echo "Missing $importers_source in source root $source_root" >&2
    exit 1
  fi

  if [[ ! -f "$source_root/$exporters_source" ]]; then
    echo "Missing $exporters_source in source root $source_root" >&2
    exit 1
  fi

  rm -rf "$BUNDLES_DIR" "$RESOURCES_DIR" "$VENDOR_DIR"
  mkdir -p "$BUNDLES_DIR" "$RESOURCES_DIR" "$THEMES_DIR" "$VENDOR_DIR/yjs"

  cp "$source_root/$importers_source" "$BUNDLES_DIR/importers.bundle.js"
  cp "$source_root/$exporters_source" "$BUNDLES_DIR/exporters.bundle.js"

  if [[ -f "$source_root/$yjs_source" ]]; then
    cp "$source_root/$yjs_source" "$VENDOR_DIR/yjs/yjs.min.js"
  else
    echo "Warning: $yjs_source not found; ELPX import will not work in the browser." >&2
  fi

  if [[ -d "$source_root/$bundles_source" ]]; then
    mkdir -p "$RESOURCES_DIR/bundles"
    cp -R "$source_root/$bundles_source/." "$RESOURCES_DIR/bundles/"
  else
    echo "Warning: $bundles_source not found; resource bundles were not copied." >&2
  fi

  if [[ -d "$source_root/$themes_source" ]]; then
    cp -R "$source_root/$themes_source/." "$THEMES_DIR/"
    rm -rf "$OFFICIAL_THEMES_DIR"
    mkdir -p "$OFFICIAL_THEMES_DIR"
    cp -R "$source_root/$themes_source/." "$OFFICIAL_THEMES_DIR/"
  else
    echo "Warning: $themes_source not found; base themes were not copied." >&2
  fi

  if [[ -d "$source_root/$scorm_source" ]]; then
    mkdir -p "$RESOURCES_DIR/common/scorm"
    cp "$source_root/$scorm_source/SCOFunctions.js" "$RESOURCES_DIR/common/scorm/SCOFunctions.js"
    cp "$source_root/$scorm_source/SCORM_API_wrapper.js" "$RESOURCES_DIR/common/scorm/SCORM_API_wrapper.js"
  else
    echo "Warning: $scorm_source not found; SCORM export may be incomplete." >&2
  fi
}

write_runtime_manifest() {
  local source_mode="$1"
  local source_ref="$2"
  local source_commit="$3"
  local source_version="$4"
  local source_release_tag="$5"
  local source_release_asset="$6"
  local source_release_published_at="$7"
  local synced_at

  synced_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  {
    printf '{\n'
    printf '  "sourceRepo": "%s",\n' "$EXE_REPO_URL"
    printf '  "sourceMode": "%s",\n' "$source_mode"
    if [[ "$source_mode" == "release" ]]; then
      printf '  "sourceReleaseTag": "%s",\n' "$source_release_tag"
      printf '  "sourceReleaseAsset": "%s",\n' "$source_release_asset"
      printf '  "sourceReleasePublishedAt": "%s",\n' "$source_release_published_at"
    else
      printf '  "sourceBranch": "%s",\n' "$source_ref"
    fi
    printf '  "sourceCommit": "%s",\n' "$source_commit"
    printf '  "sourceVersion": "%s",\n' "$source_version"
    printf '  "syncedAt": "%s",\n' "$synced_at"
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
}

write_runtime_source_js() {
  local source_mode="$1"
  local source_ref="$2"
  local source_commit="$3"
  local source_version="$4"
  local source_release_tag="$5"
  local source_release_asset="$6"
  local source_release_published_at="$7"

  node - "$RUNTIME_SOURCE_JS" "$source_mode" "$source_ref" "$source_commit" "$source_version" "$source_release_tag" "$source_release_asset" "$source_release_published_at" <<'NODE'
const fs = require("fs");

const [
  outputPath,
  sourceMode,
  sourceRef,
  sourceCommit,
  sourceVersion,
  sourceReleaseTag,
  sourceReleaseAsset,
  sourceReleasePublishedAt
] = process.argv.slice(2);

const payload = {
  sourceMode,
  sourceCommit,
  sourceVersion
};

if (sourceMode === "release") {
  payload.sourceReleaseTag = sourceReleaseTag;
  payload.sourceReleaseAsset = sourceReleaseAsset;
  payload.sourceReleasePublishedAt = sourceReleasePublishedAt;
} else {
  payload.sourceBranch = sourceRef;
}

const js = `window.__EDEX_RUNTIME_SOURCE__ = ${JSON.stringify(payload, null, 2)};\n`;
fs.writeFileSync(outputPath, js);
NODE
}

regenerate_official_styles_json() {
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
}

sync_from_release() {
  local latest_json latest_tag latest_published_at release_asset release_version current_release_tag source_commit
  need_cmd gh
  need_cmd unzip

  latest_json="$(gh release view --repo "$EXE_REPO_SLUG" --json tagName,publishedAt,assets,targetCommitish)"
  latest_tag="$(node -e '
    const data = JSON.parse(process.argv[1]);
    process.stdout.write(String(data.tagName || ""));
  ' "$latest_json")"
  latest_published_at="$(node -e '
    const data = JSON.parse(process.argv[1]);
    process.stdout.write(String(data.publishedAt || ""));
  ' "$latest_json")"
  release_asset="$(node -e '
    const data = JSON.parse(process.argv[1]);
    const tag = String(data.tagName || "");
    const expected = `exelearning-static-${tag}.zip`;
    const asset = (data.assets || []).find((item) => item.name === expected);
    if (!asset) process.exit(1);
    process.stdout.write(asset.name);
  ' "$latest_json")" || {
    echo "Static release asset not found for $latest_tag" >&2
    exit 1
  }

  current_release_tag="$(manifest_value sourceReleaseTag)"
  if [[ "$FORCE" -eq 0 && -n "$current_release_tag" && "$current_release_tag" == "$latest_tag" ]]; then
    echo "Bundles already up to date with release $latest_tag."
    exit 0
  fi

  WORK_DIR="$(mktemp -d)"
  trap 'rm -rf "$WORK_DIR"' EXIT

  echo "Downloading $release_asset from $EXE_REPO_SLUG..."
  (
    cd "$WORK_DIR"
    gh release download "$latest_tag" --repo "$EXE_REPO_SLUG" --pattern "$release_asset"
    unzip -q "$release_asset"
  )

  copy_runtime_from_root \
    "$WORK_DIR/static" \
    "bundles" \
    "files/perm/themes/base" \
    "libs/yjs/yjs.min.js" \
    "app/common/scorm" \
    "app/yjs/importers.bundle.js" \
    "app/yjs/exporters.bundle.js"

  source_commit="$(resolve_tag_commit "$latest_tag")"
  release_version="${latest_tag#v}"
  write_runtime_manifest "release" "$latest_tag" "$source_commit" "$release_version" "$latest_tag" "$release_asset" "$latest_published_at"
  write_runtime_source_js "release" "$latest_tag" "$source_commit" "$release_version" "$latest_tag" "$release_asset" "$latest_published_at"
  regenerate_official_styles_json

  echo "Synced eXeLearning runtime into $RUNTIME_DIR"
  echo "Synced official theme templates into $OFFICIAL_THEMES_DIR"
  echo "Regenerated $OFFICIAL_STYLES_JSON"
  echo "Source release: $EXE_REPO_SLUG@$latest_tag"
}

sync_from_main() {
  local work_dir source_repo source_commit source_version
  need_cmd git

  if [[ "$RUN_BUILD" -eq 1 ]]; then
    need_cmd bun
  fi

  work_dir="$(mktemp -d)"
  source_repo="$work_dir/exelearning"
  trap 'rm -rf "$work_dir"' EXIT

  echo "Cloning $EXE_REPO_URL (depth 1)..."
  git clone --depth 1 "$EXE_REPO_URL" "$source_repo"

  if [[ "$RUN_BUILD" -eq 1 ]]; then
    echo "Building bundles from main..."
    (
      cd "$source_repo"
      bun install
      bun run bundle:importers
      bun run bundle:exporters
      bun run bundle:resources
    )
  fi

  copy_runtime_from_root \
    "$source_repo/public" \
    "bundles" \
    "files/perm/themes/base" \
    "libs/yjs/yjs.min.js" \
    "app/common/scorm" \
    "app/yjs/importers.bundle.js" \
    "app/yjs/exporters.bundle.js"

  source_commit="$(git -C "$source_repo" rev-parse HEAD)"
  source_version="$(node -e "const p=require(process.argv[1]); process.stdout.write(String(p.version || ''))" "$source_repo/package.json" 2>/dev/null || true)"
  write_runtime_manifest "main" "main" "$source_commit" "$source_version" "" "" ""
  write_runtime_source_js "main" "main" "$source_commit" "$source_version" "" "" ""
  regenerate_official_styles_json

  echo "Synced eXeLearning runtime into $RUNTIME_DIR"
  echo "Synced official theme templates into $OFFICIAL_THEMES_DIR"
  echo "Regenerated $OFFICIAL_STYLES_JSON"
  echo "Source branch: $EXE_REPO_SLUG@main ($source_commit)"
}

if [[ "$FROM_MAIN" -eq 1 ]]; then
  sync_from_main
else
  sync_from_release
fi
