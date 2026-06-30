#!/usr/bin/env bash
# Regenerate hero slide lifestyle images via Higgsfield product-photoshoot.
# Prereqs: higgsfield on PATH, `higgsfield auth login`, workspace set.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REF="$ROOT/assets/kevin-hero-burglary-prevention.jpg"
OUT="$ROOT/assets"
ASPECT="3:4"

if ! command -v higgsfield >/dev/null 2>&1; then
  echo "Install: curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh"
  exit 1
fi

if ! higgsfield account status >/dev/null 2>&1; then
  echo "Run: higgsfield auth login && higgsfield workspace set <id>"
  exit 1
fi

if [[ ! -f "$REF" ]]; then
  echo "Missing reference: $REF"
  exit 1
fi

run_slide() {
  local outfile="$1"
  local prompt="$2"
  echo "→ $outfile"
  local url
  url="$(higgsfield product-photoshoot create \
    --mode lifestyle_scene \
    --prompt "$prompt" \
    --image "$REF" \
    --aspect_ratio "$ASPECT" \
    --count 1 | tail -1)"
  curl -fsSL "$url" -o "$OUT/$outfile"
  echo "  saved $OUT/$outfile"
}

run_slide "kevin-hero-protecting-children.jpg" \
  "Kevin wedge on wide white windowsill, Dutch rijtjeshuis living room Haarlem suburb, brick street at eye level through window, dusk, product 25% frame width lower-center, photorealistic"

run_slide "kevin-hero-seniors-widows.jpg" \
  "Kevin wedge on wooden side table, German Kleinstadt senior apartment, Marktplatz cobblestones and timber façades through window, dusk, product 25% frame width, photorealistic"

run_slide "kevin-hero-luxury-dutch-villa.jpg" \
  "Kevin wedge on side table, luxury Dutch villa living room Blaricum, tall window to garden lawn and old trees, dusk, product 25% frame width, photorealistic"

run_slide "kevin-hero-students-university.jpg" \
  "Kevin wedge on desk shelf, German Altbau student Wohnung Heidelberg, low-rise rooftops through window, dusk, product 25% frame width, photorealistic"

run_slide "kevin-hero-dutch-houseboat.jpg" \
  "Kevin wedge on interior shelf, Dutch woonboot houseboat living room, quay and brick bank at waterline through window, dusk, product 25% frame width, photorealistic"

echo "Done. Review assets/ then npm run theme:push:live"
