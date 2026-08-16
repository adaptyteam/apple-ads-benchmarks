#!/usr/bin/env bash
# Build the installable .plugin bundle for Cowork. See apple-ads-cli/scripts/pack-plugin.sh.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:-/tmp/apple-ads-benchmarks.plugin}"
STAGE="$(mktemp -d)"
mkdir -p "$STAGE/.claude-plugin"
cp .claude-plugin/plugin.json "$STAGE/.claude-plugin/"
cp -R skills data "$STAGE/"
cp README.md LICENSE "$STAGE/"
rm -f "$OUT"
( cd "$STAGE" && zip -qr "$OUT" . -x "*.DS_Store" )
rm -rf "$STAGE"
echo "built $OUT ($(unzip -Z1 "$OUT" | grep -c .) entries)"
