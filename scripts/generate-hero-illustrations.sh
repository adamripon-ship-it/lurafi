#!/usr/bin/env bash
# Generate Kevin 3.0 hero assets: 1× 3D GLB + 7× editorial illustrations.
# Prompts: docs/HERO-HIGGSFIELD-PROMPTS.md
#
# Usage:
#   ./scripts/generate-hero-illustrations.sh              # all
#   ./scripts/generate-hero-illustrations.sh --3d-only
#   ./scripts/generate-hero-illustrations.sh --illust-only
#   ./scripts/generate-hero-illustrations.sh --slide widow-89
#   ./scripts/generate-hero-illustrations.sh --dry-run
#
# Prereqs: higgsfield on PATH, auth + workspace set
set -uo pipefail

FAILED=0
SKIP_EXISTING="${SKIP_EXISTING:-1}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets"
REF_DIR="$ROOT/assets/reference"
FRONT_REF="$REF_DIR/clean-01-studio-white.png"
SIDE_REF="$REF_DIR/Edited - white BG/810_4982.jpg"
POSTER_SRC="$SIDE_REF"
WORKSPACE_ID="${HIGGSFIELD_WORKSPACE_ID:-c47ef442-fa47-46cf-ba90-113e76988a77}"

RUN_3D=1
RUN_ILLUST=1
DRY_RUN=0
SLIDE_FILTER=""

GLOBAL_NEG="photorealistic, photograph, DSLR, stock photo, Kevin device, Mitipi product, smart home gadget, security camera, CCTV, alarm panel, text overlay, watermark, logo, skyscraper, American suburb, picket fence, Amsterdam canal cliché, tulip field, oversaturated, harsh flash, lens flare, anime, chibi, 3D render look, low poly, cluttered composition, busy upper third, neon colors, Kevin box, product shot"
GLOBAL_STYLE="Apple editorial illustration style, soft gradient lighting, minimal clean lines, muted palette with warm interior amber glow against cool dusk exterior, dark edges blending into black background, upper third of frame relatively empty and soft for UI overlay, European Netherlands or Germany setting, dignified mood, no visible technology products"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --3d-only) RUN_ILLUST=0; shift ;;
    --illust-only) RUN_3D=0; shift ;;
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
      sed -n '2,14p' "$0"
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
  grep -Eo 'https://[^[:space:]]+\.(jpg|jpeg|png|webp|glb)' | tail -1
}

extract_any_url() {
  grep -Eo 'https://[^[:space:]]+' | tail -1
}

MAX_WEBP_BYTES=819200

compress_webp() {
  local src="$1" dest="$2"
  local tmp_png="${dest%.webp}-compress.png" q=82
  if command -v sips >/dev/null 2>&1; then
    sips -z 1600 1200 "$src" --out "$tmp_png" >/dev/null 2>&1 || cp "$src" "$tmp_png"
  else
    cp "$src" "$tmp_png"
  fi
  if ! command -v cwebp >/dev/null 2>&1; then
    cp "$tmp_png" "$dest"
    rm -f "$tmp_png"
    return 0
  fi
  while [[ "$q" -ge 50 ]]; do
    cwebp -q "$q" "$tmp_png" -o "$dest" 2>/dev/null || break
    local sz
    sz="$(wc -c < "$dest" | tr -d ' ')"
    if [[ "$sz" -le "$MAX_WEBP_BYTES" ]]; then
      rm -f "$tmp_png"
      return 0
    fi
    q=$((q - 6))
  done
  cwebp -q 50 -m 6 "$tmp_png" -o "$dest" 2>/dev/null || cp "$tmp_png" "$dest"
  rm -f "$tmp_png"
}

run_illustration() {
  local key="$1" outfile="$2" prompt="$3" slide_neg="$4"
  if [[ -n "$SLIDE_FILTER" && "$SLIDE_FILTER" != "$key" ]]; then return 0; fi
  local full_prompt="${prompt} ${GLOBAL_STYLE}. Avoid: ${GLOBAL_NEG}, ${slide_neg}"
  echo "→ $outfile (gpt_image_2, 3:4)"
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
    raw="$(higgsfield generate create gpt_image_2 \
      --prompt "$full_prompt" \
      --aspect_ratio 3:4 \
      --resolution 2k \
      --wait \
      --wait-timeout 25m \
      --wait-interval 8s 2>&1)" || true
    url="$(printf '%s\n' "$raw" | extract_url || true)"
    if [[ -n "$url" ]]; then
      curl -fsSL "$url" -o "$tmp"
      compress_webp "$tmp" "$OUT/$outfile"
      rm -f "$tmp"
      echo "  saved $OUT/$outfile ($(wc -c < "$OUT/$outfile" | tr -d ' ') bytes)"
      echo "  url: $url"
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

upload_ref() {
  local path="$1"
  higgsfield upload create "$path" --json 2>&1 | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id') or d.get('media_id') or '')"
}

run_3d() {
  echo "→ kevin-hero-3d.glb"
  if [[ "$SKIP_EXISTING" -eq 1 ]] && asset_exists "kevin-hero-3d.glb"; then
    echo "  skip (exists): $OUT/kevin-hero-3d.glb"
    return 0
  fi
  if [[ ! -f "$FRONT_REF" || ! -f "$SIDE_REF" ]]; then
    echo "  ERROR: missing refs: $FRONT_REF or $SIDE_REF" >&2
    FAILED=$((FAILED + 1))
    return 1
  fi
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "  [dry-run] front=$FRONT_REF side=$SIDE_REF"
    return 0
  fi
  local front_id side_id raw url attempt=1 max=4 wait_s=15
  echo "  uploading refs..."
  front_id="$(upload_ref "$FRONT_REF")"
  side_id="$(upload_ref "$SIDE_REF")"
  if [[ -z "$front_id" || -z "$side_id" ]]; then
    echo "  ERROR: upload failed (front=$front_id side=$side_id)" >&2
    FAILED=$((FAILED + 1))
    return 1
  fi
  echo "  media: front=$front_id side=$side_id"

  # Preferred: multi-image (two studio angles). CLI may require enable_rigging when animation flags leak.
  echo "  trying multi_image_to_3d..."
  while [[ "$attempt" -le "$max" ]]; do
    raw="$(higgsfield generate create multi_image_to_3d \
      --image-references "$front_id" \
      --image-references "$side_id" \
      --enable-rigging true \
      --wait \
      --wait-timeout 35m \
      --wait-interval 15s 2>&1)" || true
    url="$(printf '%s\n' "$raw" | grep -Eo 'https://[^[:space:]]+\.glb' | tail -1 || true)"
    if [[ -n "$url" ]]; then
      curl -fsSL "$url" -o "$OUT/kevin-hero-3d.glb"
      echo "  saved (multi_image_to_3d) $OUT/kevin-hero-3d.glb ($(wc -c < "$OUT/kevin-hero-3d.glb" | tr -d ' ') bytes)"
      echo "  url: $url"
      return 0
    fi
    [[ "$raw" == *"enable_animation"* ]] && break
    echo "  multi_image attempt $attempt/$max failed: $raw" >&2
    attempt=$((attempt + 1))
    sleep "$wait_s"
  done

  # Fallback: single-image sam_3_3d (faster, avoids rigging validation)
  echo "  fallback sam_3_3d..."
  raw="$(higgsfield generate create sam_3_3d \
    --image-references "$front_id" \
    --prompt "Kevin presence simulator device, charcoal grey acoustic fabric, studio product" \
    --wait \
    --wait-timeout 25m \
    --wait-interval 15s 2>&1)" || true
  url="$(printf '%s\n' "$raw" | grep -Eo 'https://[^[:space:]]+\.glb' | tail -1 || true)"
  if [[ -n "$url" ]]; then
    curl -fsSL "$url" -o "$OUT/kevin-hero-3d.glb"
    echo "  saved (sam_3_3d) $OUT/kevin-hero-3d.glb ($(wc -c < "$OUT/kevin-hero-3d.glb" | tr -d ' ') bytes)"
    echo "  url: $url"
    return 0
  fi
  echo "  ERROR: kevin-hero-3d.glb — $raw" >&2
  FAILED=$((FAILED + 1))
  return 1
}

make_poster() {
  echo "→ kevin-hero-3d-poster.webp"
  if [[ "$SKIP_EXISTING" -eq 1 ]] && asset_exists "kevin-hero-3d-poster.webp"; then
    echo "  skip (exists)"
    return 0
  fi
  if [[ "$DRY_RUN" -eq 1 ]]; then return 0; fi
  if [[ -f "$POSTER_SRC" ]]; then
    if command -v sips >/dev/null 2>&1; then
      sips -z 1000 800 "$POSTER_SRC" --out "$OUT/kevin-hero-3d-poster-tmp.png" >/dev/null 2>&1
      compress_webp "$OUT/kevin-hero-3d-poster-tmp.png" "$OUT/kevin-hero-3d-poster.webp"
      rm -f "$OUT/kevin-hero-3d-poster-tmp.png"
      echo "  saved from studio ref $OUT/kevin-hero-3d-poster.webp"
      return 0
    fi
    cp "$POSTER_SRC" "$OUT/kevin-hero-3d-poster.webp"
    return 0
  fi
  echo "  WARN: no poster source" >&2
  return 1
}

echo "Workspace: $WORKSPACE_ID"
echo "Output: $OUT"
echo ""

if [[ "$RUN_3D" -eq 1 ]]; then
  echo "=== Slide 1 — 3D Kevin ==="
  run_3d
  make_poster
  echo ""
fi

if [[ "$RUN_ILLUST" -eq 1 ]]; then
  echo "=== Slides 2–8 — Editorial illustrations ==="
  run_illustration "widow-89" "kevin-hero-illust-widow-89.webp" \
    "Editorial illustration of a dignified 89-year-old European white widow in a small German Kleinstadt apartment at dusk, seated in a worn but cared-for armchair beside a side table with reading glasses and teacup, warm lamp glow on her face, through the window soft cobblestone Marktplatz and gabled roofs in blue hour, interior feels lived-in and safe, she is calm not fearful, suggestion of recent visitor warmth in the room, caregiver visit energy without showing another person, upper third soft dark gradient empty for text overlay" \
    "frail caricature, nursing home, wheelchair unless subtle, medical equipment, sad poverty aesthetic, American interior, open door showing intruder, Kevin device, product on windowsill"

  run_illustration "mom-baby" "kevin-hero-illust-mom-baby.webp" \
    "Editorial illustration of a European white single mother in her early 30s holding a sleeping infant in a compact Dutch rijtjeshuis living room at evening, baby monitor glow subtle on sideboard, warm kitchen light spill from archway, through front window quiet brick street and neighbour windows with lights, mother confident and protective, upstairs implied safe nursery, ground floor feels actively occupied, soft Apple-style gradients, upper third muted for callout cards, no technology products visible" \
    "stressed crying mother, messy chaos, American apartment, baby brand logos, Kevin box, smart speaker, Ring doorbell, open empty dark house"

  run_illustration "mom-toddler" "kevin-hero-illust-mom-toddler.webp" \
    "Editorial illustration of a European white single mother with a 2-year-old toddler in a Dutch terraced home ground floor at dusk, child drawing at low table, mother glancing toward window while preparing dinner in background, warm TV glow reflection without showing screen content, through window a quiet courtyard and bicycle silhouette, feeling of believable evening routine, predator-deterrent sense of visible indoor activity, Apple editorial minimal style, upper third soft and uncluttered, European white cast" \
    "unsafe child alone, dark empty rooms upstairs, American suburb, Kevin product, security camera, intercom close-up, horror mood"

  run_illustration "student-studio" "kevin-hero-illust-student-studio.webp" \
    "Editorial illustration of a European white university student around 20 in a small German Altbau student studio Heidelberg-style, first time living alone, textbooks and laptop closed on desk, coat on hook, soft desk lamp, through tall window shared courtyard and opposite windows at blue hour, corridor door implied nearby, mood of quiet independence not loneliness, subtle shadow boyfriend illusion — suggestion of second coffee mug without showing a person, Apple editorial illustration, dark vignette edges, upper third clear" \
    "party scene, beer bottles, American dorm, fraternity posters, Kevin device, visible brand logos, messy hoarder room, night terror"

  run_illustration "expat-solo" "kevin-hero-illust-expat-solo.webp" \
    "Editorial illustration of a European white professional woman in her late 20s in a rented Amsterdam-style flat, suitcase unpacked but one bag still by door, she is at window looking at rainy street below, warm interior lamp behind her, building facade with European bikes and tram glow in distance, feeling of new country independence, home looks occupied to outsiders despite her being alone inside, soft gradient Apple editorial style, upper third empty soft darkness for UI, no smart home devices" \
    "Eiffel Tower, Big Ben, tourist landmarks, American city skyline, Kevin product, passport close-up text, lonely depression cliché, empty dark flat"

  run_illustration "expat-couple" "kevin-hero-illust-expat-couple.webp" \
    "Editorial illustration of a European white couple in their 30s locking the door of a Dutch rijtjeshuis suburban home at dusk, one holds car keys and small rolling suitcase, warm golden light glowing from living room window behind them, brick street and parked car subtle, sense of departure for holiday while home still looks alive inside, Apple editorial soft illustration, minimal detail, dark hero-compatible edges, upper third clear for callouts, no Kevin device visible" \
    "airport terminal, airplane, American suburban garage, McMansion, Kevin box by door, alarm keypad, dark dead interior"

  run_illustration "away-home" "kevin-hero-illust-away-home.webp" \
    "Editorial illustration of an unoccupied but visibly lived-in European holiday home or city flat at night viewed from slightly inside — chair with thrown scarf, muted TV glow on wall, cat silhouette on sofa optional, through window snowy Alps or North Sea coast dark blue, suggestion of multi-day away trip and ski week or summer house, multi-room occupancy implied by light spill from hallway, pet and human rhythm without showing people, Apple editorial illustration blending into black, upper third soft for callout overlay, European white middle-class interior cues" \
    "broken window, burglary scene, American cabin, visible Kevin product, smart home hub, robot vacuum brand, timer plug close-up, completely dark dead house"
fi

echo ""
if [[ "$FAILED" -gt 0 ]]; then
  echo "Finished with $FAILED failures."
  exit 1
fi
echo "Done. Review assets/kevin-hero-* then commit if valid."
