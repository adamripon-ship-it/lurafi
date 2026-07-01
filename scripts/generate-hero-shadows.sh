#!/usr/bin/env bash
# Generate slides 2–8: photorealistic exterior house views with occupant shadows on curtains.
# Same locked camera, color grade, and 1200×1600 export for every slide.
#
# Usage:
#   ./scripts/generate-hero-shadows.sh              # all 7
#   ./scripts/generate-hero-shadows.sh --slide widow-89
#   SKIP_EXISTING=0 ./scripts/generate-hero-shadows.sh
set -uo pipefail

FAILED=0
SKIP_EXISTING="${SKIP_EXISTING:-1}"
SHADOW_MODEL="${SHADOW_MODEL:-gpt_image_2}"
EXPORT_W=1200
EXPORT_H=1600

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets"
WORKSPACE_ID="${HIGGSFIELD_WORKSPACE_ID:-c47ef442-fa47-46cf-ba90-113e76988a77}"
SLIDE_FILTER=""
DRY_RUN=0

GLOBAL_STYLE="Photorealistic exterior photograph from the street at dusk blue hour in the Netherlands or Germany. LOCKED COMPOSITION for entire series: eye-level camera on quiet residential sidewalk, 3:4 vertical portrait, single European row house or terraced brick facade fills lower two-thirds centered, one ground-floor window with warm amber tungsten interior glow through semi-sheer lace curtains, a clear human shadow silhouette projected on the curtain from inside — shadow only, no visible people or faces from outside, upper third dark sky fading smoothly to pure black for UI overlay. IDENTICAL cinematic color grade every image: cool teal-blue twilight exterior, warm amber window light, subtle natural film grain, realistic brick and stucco textures, shallow depth of field on facade, documentary architectural photography — absolutely NOT illustration, NOT editorial art, NOT vector, NOT cartoon, NOT painted, NOT flat graphic design"

GLOBAL_NEG="illustration, editorial illustration, vector art, flat design, cartoon, anime, painted, airbrush poster, Apple marketing graphic, stylized, simplified geometry, visible person outside the house, face visible through window, stock photo watermark, text overlay, logo, American suburban, picket fence, Kevin device, Mitipi product, smart home gadget, security camera, CCTV, alarm panel, Amsterdam canal cliché, tulip field, oversaturated HDR, harsh flash, white matting, hard rectangular crop border, interior room view, people posing for camera inside visible"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --slide)
      SLIDE_FILTER="${2:-}"
      shift 2
      ;;
    --slide=*)
      SLIDE_FILTER="${1#--slide=}"
      shift
      ;;
    -h|--help)
      sed -n '2,10p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

if ! command -v higgsfield >/dev/null 2>&1; then
  echo "Install: curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh"
  exit 1
fi

if [[ "$DRY_RUN" -eq 0 ]]; then
  higgsfield workspace set "$WORKSPACE_ID" >/dev/null 2>&1 || true
fi

asset_exists() {
  local f="$1"
  [[ -f "$OUT/$f" ]] && [[ -s "$OUT/$f" ]]
}

extract_url() {
  grep -Eo 'https://[^[:space:]]+\.(jpg|jpeg|png|webp)' | tail -1
}

MAX_WEBP_BYTES=900000

normalize_export() {
  local src="$1" dest="$2"
  local tmp_png="${dest%.webp}-norm.png"
  if command -v sips >/dev/null 2>&1; then
    sips -z "$EXPORT_H" "$EXPORT_W" "$src" --out "$tmp_png" >/dev/null 2>&1 || cp "$src" "$tmp_png"
  else
    cp "$src" "$tmp_png"
  fi
  if command -v cwebp >/dev/null 2>&1; then
    local q=85
    while [[ "$q" -ge 55 ]]; do
      cwebp -q "$q" "$tmp_png" -o "$dest" 2>/dev/null || break
      local sz
      sz="$(wc -c < "$dest" | tr -d ' ')"
      if [[ "$sz" -le "$MAX_WEBP_BYTES" ]]; then
        rm -f "$tmp_png"
        return 0
      fi
      q=$((q - 5))
    done
    cwebp -q 55 -m 6 "$tmp_png" -o "$dest" 2>/dev/null || cp "$tmp_png" "$dest"
  else
    cp "$tmp_png" "$dest"
  fi
  rm -f "$tmp_png"
}

run_shadow() {
  local key="$1" outfile="$2" scenario="$3" slide_neg="$4"
  if [[ -n "$SLIDE_FILTER" && "$SLIDE_FILTER" != "$key" ]]; then return 0; fi
  local full_prompt="Photorealistic exterior house photograph — NOT illustration. ${scenario} ${GLOBAL_STYLE}. Strictly avoid: ${GLOBAL_NEG}, ${slide_neg}"
  echo "→ $outfile ($SHADOW_MODEL, ${EXPORT_W}×${EXPORT_H})"
  if [[ "$SKIP_EXISTING" -eq 1 ]] && asset_exists "$outfile"; then
    echo "  skip (exists): $OUT/$outfile"
    return 0
  fi
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "  [dry-run] $full_prompt"
    return 0
  fi
  local tmp="${OUT}/${outfile%.webp}.png" raw url attempt=1 max=12 wait_s=10
  while [[ "$attempt" -le "$max" ]]; do
    raw="$(higgsfield generate create "$SHADOW_MODEL" \
      --prompt "$full_prompt" \
      --aspect_ratio 3:4 \
      --resolution 2k \
      --wait \
      --wait-timeout 25m \
      --wait-interval 8s 2>&1)" || true
    url="$(printf '%s\n' "$raw" | extract_url || true)"
    if [[ -n "$url" ]]; then
      curl -fsSL "$url" -o "$tmp"
      normalize_export "$tmp" "$OUT/$outfile"
      rm -f "$tmp"
      echo "  saved $OUT/$outfile ($(wc -c < "$OUT/$outfile" | tr -d ' ') bytes)"
      return 0
    fi
    echo "  attempt $attempt/$max failed: $raw" >&2
    [[ "$raw" == *"520"* || "$raw" == *"522"* || "$raw" == *"503"* || "$raw" == *"429"* ]] && wait_s=30 || wait_s=10
    attempt=$((attempt + 1))
    sleep "$wait_s"
  done
  echo "  ERROR: $outfile" >&2
  FAILED=$((FAILED + 1))
  return 1
}

echo "Workspace: $WORKSPACE_ID"
echo "Output: $OUT (${EXPORT_W}×${EXPORT_H} normalized)"
echo ""

echo "=== Slides 2–8 — Exterior shadow photographs (NL/DE) ==="

run_shadow "widow-89" "kevin-hero-shadow-widow-89.webp" \
  "Dutch or German Kleinstadt brick row house at dusk. Shadow on curtain shows dignified elderly woman seated in armchair silhouette — slow evening at home alone, caregiver visit rhythm implied by second softer shadow near doorway." \
  "frail caricature, nursing home signage, medical equipment visible, American interior"

run_shadow "mom-baby" "kevin-hero-shadow-mom-baby.webp" \
  "Dutch rijtjeshuis terraced house at dusk. Shadow on curtain shows adult holding infant silhouette — protective mother pacing softly with baby, warm nursery glow spill." \
  "stressed crying pose, messy chaos, American apartment, baby brand logos"

run_shadow "mom-toddler" "kevin-hero-shadow-mom-toddler.webp" \
  "Dutch terraced home at dusk. Shadow on curtain shows adult with small toddler silhouette — child height shadow beside parent, evening routine movement past window." \
  "unsafe child alone outside, dark dead interior, American suburb"

run_shadow "student-studio" "kevin-hero-shadow-student-studio.webp" \
  "German Altbau student building facade at dusk Heidelberg-style. Shadow on curtain shows young adult at desk silhouette — first flat alone, second shadow of mug or second figure suggesting company." \
  "party scene, beer bottles, American dorm, fraternity posters"

run_shadow "expat-solo" "kevin-hero-shadow-expat-solo.webp" \
  "Amsterdam-style European apartment block facade at rainy dusk. Shadow on curtain shows single woman at window silhouette — new city independence, occupied flat from street view." \
  "Eiffel Tower, Big Ben, tourist landmarks, lonely depression cliché"

run_shadow "expat-couple" "kevin-hero-shadow-expat-couple.webp" \
  "Dutch rijtjeshuis suburban facade at dusk. Two human shadow silhouettes on curtain walking past window with suitcase shapes — couple leaving for holiday while home stays lit and alive inside." \
  "airport terminal, airplane, American garage, McMansion"

run_shadow "away-home" "kevin-hero-shadow-away-home.webp" \
  "European holiday home or city flat facade at night. Multiple windows lit warm amber; shadow on main curtain shows seated figure or cat silhouette — believable multi-day occupancy while owners away, snowy Alps or coast implied in dark sky only." \
  "broken window, burglary scene, American cabin, completely dark dead house"

echo ""
if [[ "$FAILED" -gt 0 ]]; then
  echo "Finished with $FAILED failures."
  exit 1
fi
echo "Done. Deploy: shopify theme push --only assets/kevin-hero-shadow-*.webp snippets/hero-slide.liquid assets/lurafi.css"
