# KEVIN / mitipi.eu — Image Generation & Integration Plan (Higgsfield)

> Status: **DRAFT for owner approval.** No images generated yet. On approval I execute the
> chosen batch(es), review, integrate, push live.

## 0. The root cause we're fixing
Earlier AI images failed because they were **text-to-image guesses of "a security device"** →
the model invented a triangle wall-alarm that is **not** the real KEVIN. The real KEVIN is a
**grey woven-fabric-covered rectangular box** (white top edge, small triangle logo, ~speaker
sized) — confirmed from `Kevin_Master_Photo_Front_Grey_*.jpg`.

**Hard rule:** any image where the device appears is generated **image-to-image with the real
product photo as a reference** — never text-to-image. Scenes with no device can be text-to-image.

## 1. Model selection (best AI per asset)
| Asset type | Model | Why | Mode |
|---|---|---|---|
| Conceptual scenes, **no product** (problem tiles) | **Nano Banana 2** (Google) | fast, 4K photoreal, clean text-to-image, 4:3 | text→image |
| Lifestyle/persona scenes (people, homes) | **Nano Banana 2** | flexible full scenes, consistent grade | text→image (+ref if device visible) |
| **Product-in-scene** (device must be exact) | **Seedream 4.5** (Bytedance) | 4K, precise control/compositing from a reference | **image→image** w/ product photo |
| Pure human portraits (if ever needed) | Soul 2.0 (Higgsfield) | realistic people/editorial | — |

All at **2K**, then downscaled/compressed for web (see §5).

## 2. Shared style system (prepended to every prompt → cohesive set)
**STYLE:** `Cinematic editorial photograph, premium Swiss design sensibility, calm and
sophisticated, natural directional light with soft shadows, muted neutral palette with a single
cool-blue accent (#0071e3), shallow depth of field, full-frame 35mm look, ultra-realistic, fine
detail, photographed not rendered.`
**GLOBAL NEGATIVES:** `no text, no captions, no watermarks, no logos, no brand names, no UI,
no distorted geometry, no extra fingers, not cartoon, not 3D-render look, no fake security-brand
devices.`

## 3. Image inventory + engineered prompts

### BATCH A — Problem section `lp-problem.liquid` (REQUIRED — this is the ask)
3 images · **aspect 4:3** · Nano Banana 2 · text→image · these show the *shortcomings of old
methods*, **no KEVIN device, no people**.

- **A1 `kevin-feature-problem-alarms.jpg` — "Alarms react"**
  `[STYLE] A wall-mounted home alarm siren and keypad in a dim modern hallway at night, one cold
  red status LED glowing, pale blue moonlight from a side window, empty silent apartment, tense
  mood of a system that only reacts after a break-in. Nobody home. [NEGATIVES]`
- **A2 `kevin-feature-problem-cameras.jpg` — "Cameras record"**
  `[STYLE] A small modern indoor CCTV security camera mounted high in the corner of a dark empty
  living room at night, tiny status light, cool blue ambient glow, sense of passive recording
  while the home sits exposed and unoccupied. Nobody home. [NEGATIVES]`
- **A3 `kevin-feature-problem-lights.jpg` — "Lights are predictable"**
  `[STYLE] A single table lamp plugged into a mechanical plug-in timer switch, casting one harsh
  predictable pool of light in an otherwise pitch-dark empty living room at night, rest of the
  home in flat shadow, a monotonous "obviously automated" feeling. Nobody home. [NEGATIVES]`

### BATCH B — Personas `lp-personas.liquid` (RECOMMENDED — `living-alone` is confirmed missing)
3 images · **aspect 4:3** · warm, reassuring; device optional/subtle (use ref if shown).

- **B1 `kevin-persona-travel.jpg` — traveler away**
  `[STYLE] Dusk exterior of a warm Swiss apartment building, one flat's windows glowing softly
  with lived-in light and a faint moving shadow inside, while the resident is away travelling;
  reassuring, safe, "looks occupied while you're gone." [NEGATIVES]`
- **B2 `kevin-persona-alarm-complement.jpg` — complements an alarm**
  `[STYLE] Cozy modern living room in the evening with warm lamplight and a subtle wall-mounted
  alarm panel near the door, the room feeling genuinely lived-in (not just armed); calm, layered
  security. [NEGATIVES]`
- **B3 `kevin-persona-living-alone.jpg` — living alone, safe**
  `[STYLE] Warm evening street view of a ground-floor flat with softly glowing curtains and a
  gentle interior light variation suggesting presence, conveying safety and calm for someone who
  lives alone. No identifiable faces. [NEGATIVES]`

### BATCH C — Hero slideshow `hero-slide.liquid` (OPTIONAL — product-accurate, most complex)
~6 images · **aspect 4:5 (≈800×1000 portrait)** · **Seedream 4.5 image→image** with
`Kevin_Master_Photo_Front_Grey_*.jpg` as reference so the device is the REAL box. Files:
`kevin-hero-persona-{children,seniors,women,students,travel}.png`, `kevin-hero-dutch-houseboat.png`.
- Pattern per slide: `[STYLE] Place THIS exact grey woven-fabric KEVIN device (from reference)
  naturally on a shelf/sideboard in <context: a Dutch houseboat / family home / senior's flat /
  student flat / traveler's apartment>, evening, warm believable light suggesting someone is home.
  Keep the device's shape, fabric texture, white top edge and proportions identical to the
  reference. [NEGATIVES]` (one tailored context line per slide).

## 4. Generation workflow (credit-minimizing)
1. Generate **1 variant per slot** in the approved batch (not 4) → cheapest first pass.
2. I post the results for your review (inline).
3. **Regenerate only the misses** (tweak prompt/seed) — no blanket re-runs.
4. Approve final set → integrate.
> Rough order of magnitude: Batch A = 3 gens, B = 3, C ≈ 6 (image-to-image). I'll confirm exact
> credit cost from `show_plans_and_credits` before spending, and stop if low.

## 5. Integration + deploy
1. Download finals → **optimize for web**: resize to ~1280px long edge, convert to JPG/WebP,
   target **<250 KB each** (the old PNGs were 4–8 MB — a real performance bug).
2. Save into `assets/` with the **exact expected filenames** (table above).
3. Revert `lp-problem.liquid` image defaults from the temporary icons back to `<img …asset_url>`
   (image_picker overrides preserved). Batches B/C already use `<img>`.
4. `npm run theme:check` → must pass.
5. `shopify theme push --allow-live --only <changed files + new assets>` (surgical, live theme
   184679596410), then verify on mitipi.eu + screenshot.

## 6. Decision needed from you
- **Scope:** Batch A only / A+B / A+B+C?
- **Tone confirm:** Problem tiles = dark/tense "old way fails"; Personas/Hero = warm/safe. OK?
- On approval I run the chosen batch, show results before integrating.
