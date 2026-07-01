#!/usr/bin/env bash
# Sync Kevin 3 product photos from local pack → assets/reference + hero rotator assets.
# Default source: ~/Downloads/3. Mitipi Kevin 3 Content
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${KEVIN3_CONTENT_DIR:-$HOME/Downloads/3. Mitipi Kevin 3 Content}"
REF="$ROOT/assets/reference"
ASSETS="$ROOT/assets"

if [[ ! -d "$SRC" ]]; then
  echo "ERROR: Kevin 3 content folder not found: $SRC" >&2
  echo "Set KEVIN3_CONTENT_DIR or place files at ~/Downloads/3. Mitipi Kevin 3 Content" >&2
  exit 1
fi

echo "Syncing reference pack from: $SRC"
rsync -a "$SRC/" "$REF/"

echo "Building hero product rotator assets (transparent PNG, retail Kevin .3)…"
python3 "$ROOT/scripts/build-hero-product-pngs.py"

find "$REF" -type f | sort > "$REF/INVENTORY.txt"
echo "Done. $(wc -l < "$REF/INVENTORY.txt" | tr -d ' ') reference files; hero assets in assets/kevin-hero-product-*"
