#!/usr/bin/env bash
# Batch-generate Kevin hero slides + feature/benefit visuals via Higgsfield.
# Prereqs: higgsfield on PATH, `higgsfield auth login`, `higgsfield workspace set <id>`
#
# Usage:
#   ./scripts/generate-mitipi-visuals.sh              # all targets
#   ./scripts/generate-mitipi-visuals.sh --hero-only
#   ./scripts/generate-mitipi-visuals.sh --features-only
#   ./scripts/generate-mitipi-visuals.sh --dry-run
#
# Prompt map: docs/FEATURE-VISUAL-PROMPTS.md
set -uo pipefail

FAILED=0

SKIP_EXISTING="${SKIP_EXISTING:-1}"

asset_exists() {
  local outfile="$1"
  [[ -f "$OUT/$outfile" ]] && [[ -s "$OUT/$outfile" ]]
}

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets"
REF_DIR="$ROOT/assets/reference"
LIFESTYLE_REF="$ROOT/assets/kevin-hero-burglary-prevention.jpg"
PRODUCT_REF="$REF_DIR/Edited - white BG/810_4982.jpg"
STUDIO_REF="$REF_DIR/Edited - white BG/810_4982.jpg"
CLOSEUP_REF="$REF_DIR/Edited - white BG/810_5010.jpg"
ANGLE_REF="$REF_DIR/clean-01-studio-white.png"
SHADOW_REF="$REF_DIR/Edited - white BG/810_4998.jpg"

RUN_HERO=1
RUN_FEATURES=1
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --hero-only) RUN_FEATURES=0 ;;
    --features-only) RUN_HERO=0 ;;
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

if ! command -v higgsfield >/dev/null 2>&1; then
  echo "Install: curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh"
  exit 1
fi

if [[ "$DRY_RUN" -eq 0 ]]; then
  authed=0
  for _ in 1 2 3 4 5 6; do
    if higgsfield account status >/dev/null 2>&1; then authed=1; break; fi
    sleep 8
  done
  if [[ "$authed" -eq 0 ]]; then
    echo "Auth required (or Higgsfield API unreachable):"
    echo "  higgsfield auth login"
    echo "  higgsfield workspace set <workspace_id>"
    exit 1
  fi
fi

pick_ref() {
  local path="$1"
  if [[ -f "$path" ]]; then
    printf '%s' "$path"
  else
    printf '%s' "$LIFESTYLE_REF"
  fi
}

extract_url() {
  grep -Eo 'https://[^[:space:]]+\.(jpg|jpeg|png|webp)' | tail -1
}

run_photoshoot() {
  local outfile="$1" mode="$2" aspect="$3" ref="$4" prompt="$5"
  echo "→ $outfile ($mode, $aspect)"
  if [[ "$SKIP_EXISTING" -eq 1 ]] && asset_exists "$outfile"; then
    echo "  skip (exists): $OUT/$outfile"
    return 0
  fi
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "  [dry-run] $prompt"
    return 0
  fi
  local url attempt=1 max_attempts=3
  while [[ "$attempt" -le "$max_attempts" ]]; do
    url="$(higgsfield product-photoshoot create \
      --mode "$mode" \
      --prompt "$prompt" \
      --image "$ref" \
      --aspect_ratio "$aspect" \
      --count 1 2>&1 | extract_url || true)"
    if [[ -n "$url" ]]; then
      curl -fsSL "$url" -o "$OUT/$outfile"
      echo "  saved $OUT/$outfile"
      echo "  url: $url"
      return 0
    fi
    echo "  attempt $attempt/$max_attempts failed for $outfile, retrying in 10s..." >&2
    attempt=$((attempt + 1))
    sleep 10
  done
  echo "  ERROR: no URL returned for $outfile after $max_attempts attempts" >&2
  FAILED=$((FAILED + 1))
  return 1
}

run_marketplace_asset() {
  local asset="$1" outfile="$2" ref="$3" prompt="$4"
  echo "→ $outfile (marketplace-cards:$asset)"
  if [[ "$SKIP_EXISTING" -eq 1 ]] && asset_exists "$outfile"; then
    echo "  skip (exists): $OUT/$outfile"
    return 0
  fi
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "  [dry-run] $prompt"
    return 0
  fi
  local url attempt=1 max_attempts=3
  while [[ "$attempt" -le "$max_attempts" ]]; do
    url="$(higgsfield marketplace-cards create \
      --asset "$asset" \
      --prompt "$prompt" \
      --image "$ref" \
      --category "smart home security" \
      --brand_context "Mitipi Kevin, grey heather fabric wedge, Swiss engineered, minimal white palette" 2>&1 | extract_url || true)"
    if [[ -n "$url" ]]; then
      curl -fsSL "$url" -o "$OUT/$outfile"
      echo "  saved $OUT/$outfile"
      echo "  url: $url"
      return 0
    fi
    echo "  attempt $attempt/$max_attempts failed for $outfile, retrying in 10s..." >&2
    attempt=$((attempt + 1))
    sleep 10
  done
  echo "  ERROR: no URL returned for $outfile after $max_attempts attempts" >&2
  FAILED=$((FAILED + 1))
  return 1
}

if [[ ! -f "$LIFESTYLE_REF" ]]; then
  echo "Missing lifestyle reference: $LIFESTYLE_REF"
  exit 1
fi

STUDIO_REF="$(pick_ref "$STUDIO_REF")"
PRODUCT_REF="$(pick_ref "$PRODUCT_REF")"
CLOSEUP_REF="$(pick_ref "$CLOSEUP_REF")"
ANGLE_REF="$(pick_ref "$ANGLE_REF")"
SHADOW_REF="$(pick_ref "$SHADOW_REF")"

echo "References:"
echo "  lifestyle: $PRODUCT_REF"
echo "  studio:    $STUDIO_REF"
echo "  closeup:   $CLOSEUP_REF"
echo ""

if [[ "$RUN_HERO" -eq 1 ]]; then
  echo "=== Hero slides 2–6 ==="
  run_photoshoot "kevin-hero-protecting-children.jpg" lifestyle_scene 3:4 "$PRODUCT_REF" \
    "Kevin wedge on wide white windowsill, Dutch rijtjeshuis living room Haarlem suburb, brick street at eye level through window, dusk, product 25% frame width lower-center, photorealistic"
  run_photoshoot "kevin-hero-seniors-widows.jpg" lifestyle_scene 3:4 "$PRODUCT_REF" \
    "Kevin wedge on wooden side table, German Kleinstadt senior apartment, Marktplatz cobblestones and timber façades through window, dusk, product 25% frame width, photorealistic"
  run_photoshoot "kevin-hero-luxury-dutch-villa.jpg" lifestyle_scene 3:4 "$PRODUCT_REF" \
    "Kevin wedge on marble console, luxury Dutch villa living room Blaricum, tall window to garden lawn and old trees, dusk, product 25% frame width, photorealistic"
  run_photoshoot "kevin-hero-students-university.jpg" lifestyle_scene 3:4 "$PRODUCT_REF" \
    "Kevin wedge on desk shelf, German Altbau student Wohnung Heidelberg, low-rise rooftops through window, dusk, product 25% frame width, photorealistic"
  run_photoshoot "kevin-hero-dutch-houseboat.jpg" lifestyle_scene 3:4 "$PRODUCT_REF" \
    "Kevin wedge on interior shelf, Dutch woonboot houseboat living room, quay and brick bank at waterline through window, dusk, product 25% frame width, photorealistic"
fi

if [[ "$RUN_FEATURES" -eq 1 ]]; then
  echo ""
  echo "=== Problem tiles ==="
  run_photoshoot "kevin-feature-problem-alarms.jpg" conceptual_product 4:3 "$PRODUCT_REF" \
    "Editorial split: empty hallway vs alarm siren after entry, deterrence before vs reaction after, no faces, cool security photography"
  run_photoshoot "kevin-feature-problem-cameras.jpg" conceptual_product 4:3 "$PRODUCT_REF" \
    "CCTV camera watching dark empty living room, footage does not make home feel occupied, cold monitor glow, editorial"
  run_photoshoot "kevin-feature-problem-lights.jpg" conceptual_product 4:3 "$PRODUCT_REF" \
    "Timer lamp predictable on-off in empty room vs warm varied light through window suggesting life inside, editorial contrast"

  echo ""
  echo "=== Solution ==="
  run_photoshoot "lurafi-product-studio.jpg" product_shot 3:2 "$STUDIO_REF" \
    "Kevin wedge smart home device on clean white studio sweep, 3/4 angle, soft shadow, catalog quality, grey heather fabric front"
  run_marketplace_asset infographic "kevin-feature-solution-light.jpg" "$STUDIO_REF" \
    "Kevin projecting warm amber light onto wall, minimal infographic icons, no text, presence simulation"
  run_marketplace_asset infographic "kevin-feature-solution-shadows.jpg" "$SHADOW_REF" \
    "Kevin projecting human silhouette on ceiling, shadow presence simulation, minimal icons, no text"
  run_marketplace_asset infographic "kevin-feature-solution-sound.jpg" "$STUDIO_REF" \
    "Kevin with subtle sound wave mood, kitchen and TV ambience icons, on-device privacy, no text"

  echo ""
  echo "=== Steps & specs ==="
  run_photoshoot "kevin-device-angle.jpg" product_shot 5:4 "$ANGLE_REF" \
    "Kevin wedge 3/4 angle on white, fabric front and top sensors visible, product hero for setup section"
  run_photoshoot "lurafi-product-closeup.jpg" product_shot 3:2 "$CLOSEUP_REF" \
    "Macro close-up Kevin fabric front panel and top control ring on marble, soft studio light"

  echo ""
  echo "=== Personas ==="
  run_photoshoot "kevin-persona-travel.jpg" lifestyle_scene 4:3 "$PRODUCT_REF" \
    "Kevin on windowsill, packed suitcase nearby, Dutch suburban home dusk, travel away mode, product 25% frame width"
  run_photoshoot "kevin-persona-alarm-complement.jpg" lifestyle_scene 4:3 "$PRODUCT_REF" \
    "Kevin beside disarmed alarm keypad, German townhouse entry hall, complementary deterrence, product 25% frame width"
  run_photoshoot "kevin-persona-living-alone.jpg" lifestyle_scene 4:3 "$PRODUCT_REF" \
    "Kevin in compact urban flat evening, believable occupied scene from outside, product 25% frame width"

  echo ""
  echo "=== App feature tiles (optional) ==="
  run_photoshoot "kevin-feature-schedules.jpg" lifestyle_scene 16:9 "$PRODUCT_REF" \
    "Kevin in living room, phone on table showing schedule blur, evening weekly routine, product 25% frame width"
  run_photoshoot "kevin-feature-geo.jpg" lifestyle_scene 16:9 "$PRODUCT_REF" \
    "Person leaving Dutch row house with phone, Kevin active inside window, geofence activation mood"
  run_photoshoot "kevin-feature-sounds.jpg" product_shot 16:9 "$STUDIO_REF" \
    "Kevin on shelf warm room, on-device sound simulation mood, privacy-first"
  run_photoshoot "kevin-feature-multi-device.jpg" lifestyle_scene 16:9 "$PRODUCT_REF" \
    "Two Kevin devices different rooms split view, apartment and home office, multi-place protection"
fi

echo ""
if [[ "$FAILED" -gt 0 ]]; then
  echo "Finished with $FAILED failure(s). Review log above."
  exit 1
fi
echo "Done. Review assets/ then: npm run theme:check && npm run theme:push:live"
