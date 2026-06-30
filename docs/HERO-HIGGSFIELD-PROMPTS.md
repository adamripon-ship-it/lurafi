# Hero Higgsfield prompts — Kevin 3.0

Per-asset generation prompts for the Apple-style hero carousel.  
**Master plan:** [HERO-VISUAL-STRATEGY.md](./HERO-VISUAL-STRATEGY.md) · **Copy:** [HERO-SLIDE-COPY.md](./HERO-SLIDE-COPY.md)

---

## Global settings

| Setting | Value |
|---------|-------|
| Workspace | `c47ef442-fa47-46cf-ba90-113e76988a77` |
| Aspect ratio | **3:4** (portrait) |
| Resolution | **2k** (export master); compress to WebP for theme |
| Slides 2+ | **Text-to-image only** — no Kevin product reference images |
| Cast | European, white, authentic NL/DE — not American stock |
| Style | **Apple editorial illustration** — soft gradient, minimal detail, atmospheric, not photoreal, not cartoon |

### Global negative prompt (append to every slide 2+ job)

```
photorealistic, photograph, DSLR, stock photo, Kevin device, Mitipi product, smart home gadget, security camera, CCTV, alarm panel, text overlay, watermark, logo, skyscraper, American suburb, picket fence, Amsterdam canal cliché, tulip field, oversaturated, harsh flash, lens flare, anime, chibi, 3D render look, low poly, cluttered composition, busy upper third, neon colors, Kevin box, product shot
```

### Global style suffix (append to every slide 2+ prompt)

```
Apple editorial illustration style, soft gradient lighting, minimal clean lines, muted palette with warm interior amber glow against cool dusk exterior, dark edges blending into black background, upper third of frame relatively empty and soft for UI overlay, European Netherlands or Germany setting, dignified mood, no visible technology products
```

---

## Slide 1 — Interactive 3D Kevin (product)

**Output files:** `assets/kevin-hero-3d.glb`, `assets/kevin-hero-3d-poster.webp`  
**Tool:** Higgsfield `generate_3d`  
**Model:** `multi_image_to_3d` (preferred) or `image_to_3d`

### Reference images (local paths — upload via MCP before generate)

| Role | File | Notes |
|------|------|-------|
| Primary front / 3-4 view | `assets/reference/clean-01-studio-white.png` | Transparent-friendly studio angle |
| Side / depth | `assets/reference/Edited - white BG/810_4982.jpg` | White BG studio shot |
| Optional rear | `assets/reference/Edited - white BG/810_4998.jpg` | Improves mesh accuracy |

### Workflow

```bash
# 1. Select workspace (CLI or MCP select_workspace)
# 2. Upload refs → media_id per file (media_upload or widget)
# 3. Preflight cost:
#    generate_3d params: { model: "multi_image_to_3d", medias: [...], get_cost: true }
# 4. Submit job with both medias
# 5. Download GLB → assets/kevin-hero-3d.glb
# 6. Render poster still (model-viewer screenshot or 810_4982 export) → kevin-hero-3d-poster.webp
```

### 3D generation notes

- **Do not** use lifestyle/persona refs for 3D — product studio only
- Target GLB **≤ 2 MB** (Draco mesh compression if tool offers)
- Fabric texture: charcoal grey acoustic fabric, subtle ribbing — match `clean-01-studio-white.png`
- No environment in mesh — device only, origin centered, Y-up
- Poster: same angle as default camera; **800×1000** WebP, transparent or soft shadow on transparent

### 3D negative (implicit — choose clean studio refs)

Avoid refs with hands, furniture, or cropped device. Do not prompt for lifestyle context.

---

## Slide 2 — Widow, 89, alone (Groups 1 + 4)

**Output:** `assets/kevin-hero-illust-widow-89.webp`  
**Tool:** `generate_image` · **Model:** `gpt_image_2` (or current best illustration model)

### Prompt

```
Editorial illustration of a dignified 89-year-old European white widow in a small German Kleinstadt apartment at dusk, seated in a worn but cared-for armchair beside a side table with reading glasses and teacup, warm lamp glow on her face, through the window soft cobblestone Marktplatz and gabled roofs in blue hour, interior feels lived-in and safe, she is calm not fearful, suggestion of recent visitor warmth in the room, caregiver visit energy without showing another person, upper third soft dark gradient empty for text overlay
```

### Slide-specific negatives

```
frail caricature, nursing home, wheelchair unless subtle, medical equipment, sad poverty aesthetic, American interior, open door showing intruder, Kevin device, product on windowsill
```

---

## Slide 3 — Single mother + baby (Group 1)

**Output:** `assets/kevin-hero-illust-mom-baby.webp`

### Prompt

```
Editorial illustration of a European white single mother in her early 30s holding a sleeping infant in a compact Dutch rijtjeshuis living room at evening, baby monitor glow subtle on sideboard, warm kitchen light spill from archway, through front window quiet brick street and neighbour windows with lights, mother confident and protective, upstairs implied safe nursery, ground floor feels actively occupied, soft Apple-style gradients, upper third muted for callout cards, no technology products visible
```

### Slide-specific negatives

```
stressed crying mother, messy chaos, American apartment, baby brand logos, Kevin box, smart speaker, Ring doorbell, open empty dark house
```

---

## Slide 4 — Single mother + toddler 2yo (Group 1)

**Output:** `assets/kevin-hero-illust-mom-toddler.webp`

### Prompt

```
Editorial illustration of a European white single mother with a 2-year-old toddler in a Dutch terraced home ground floor at dusk, child drawing at low table, mother glancing toward window while preparing dinner in background, warm TV glow reflection without showing screen content, through window a quiet courtyard and bicycle silhouette, feeling of believable evening routine, predator-deterrent sense of visible indoor activity, Apple editorial minimal style, upper third soft and uncluttered, European white cast
```

### Slide-specific negatives

```
unsafe child alone, dark empty rooms upstairs, American suburb, Kevin product, security camera, intercom close-up, horror mood
```

---

## Slide 5 — Student studio, first flat alone (Group 1)

**Output:** `assets/kevin-hero-illust-student-studio.webp`

### Prompt

```
Editorial illustration of a European white university student around 20 in a small German Altbau student studio Heidelberg-style, first time living alone, textbooks and laptop closed on desk, coat on hook, soft desk lamp, through tall window shared courtyard and opposite windows at blue hour, corridor door implied nearby, mood of quiet independence not loneliness, subtle shadow boyfriend illusion — suggestion of second coffee mug without showing a person, Apple editorial illustration, dark vignette edges, upper third clear
```

### Slide-specific negatives

```
party scene, beer bottles, American dorm, fraternity posters, Kevin device, visible brand logos, messy hoarder room, night terror
```

---

## Slide 6 — Expat solo, new country (Group 2)

**Output:** `assets/kevin-hero-illust-expat-solo.webp`

### Prompt

```
Editorial illustration of a European white professional woman in her late 20s in a rented Amsterdam-style flat, suitcase unpacked but one bag still by door, she is at window looking at rainy street below, warm interior lamp behind her, building facade with European bikes and tram glow in distance, feeling of new country independence, home looks occupied to outsiders despite her being alone inside, soft gradient Apple editorial style, upper third empty soft darkness for UI, no smart home devices
```

### Slide-specific negatives

```
Eiffel Tower, Big Ben, tourist landmarks, American city skyline, Kevin product, passport close-up text, lonely depression cliché, empty dark flat
```

---

## Slide 7 — Expat couple leaving for holiday (Group 2)

**Output:** `assets/kevin-hero-illust-expat-couple.webp`

### Prompt

```
Editorial illustration of a European white couple in their 30s locking the door of a Dutch rijtjeshuis suburban home at dusk, one holds car keys and small rolling suitcase, warm golden light glowing from living room window behind them, brick street and parked car subtle, sense of departure for holiday while home still looks alive inside, Apple editorial soft illustration, minimal detail, dark hero-compatible edges, upper third clear for callouts, no Kevin device visible
```

### Slide-specific negatives

```
airport terminal, airplane, American suburban garage, McMansion, Kevin box by door, alarm keypad, dark dead interior
```

---

## Slide 8 — Frequent traveler / holiday home / event trip (Group 3)

**Output:** `assets/kevin-hero-illust-away-home.webp`

### Prompt

```
Editorial illustration of an unoccupied but visibly lived-in European holiday home or city flat at night viewed from slightly inside — chair with thrown scarf, muted TV glow on wall, cat silhouette on sofa optional, through window snowy Alps or North Sea coast dark blue, suggestion of multi-day away trip and ski week or summer house, multi-room occupancy implied by light spill from hallway, pet and human rhythm without showing people, Apple editorial illustration blending into black, upper third soft for callout overlay, European white middle-class interior cues
```

### Slide-specific negatives

```
broken window, burglary scene, American cabin, visible Kevin product, smart home hub, robot vacuum brand, timer plug close-up, completely dark dead house
```

---

## Batch commands

### Illustrations only (after MCP auth OK)

```bash
export PATH="$HOME/.local/bin:$PATH"
higgsfield workspace set c47ef442-fa47-46cf-ba90-113e76988a77

# Extend generate-mitipi-visuals.sh with ILLUST_* vars — or run MCP generate_image per slide
# Example single slide:
# higgsfield generate create gpt_image_2 --prompt "$(cat docs/HERO-HIGGSFIELD-PROMPTS.md | ...)" --aspect-ratio 3:4 --resolution 2k
```

### Post-processing

```bash
# Optimise for theme (example with cwebp)
for f in assets/kevin-hero-illust-*.png; do
  cwebp -q 82 "$f" -o "${f%.png}.webp"
done
```

---

## Quality checklist (per asset)

- [ ] Upper third readable for three callout cards
- [ ] No Kevin / Mitipi product anywhere in slides 2–8
- [ ] European NL/DE architecture — not US
- [ ] Illustration style consistent across slides 2–8 (same line weight / gradient family)
- [ ] Edges fade to black compatible with `.hero-apple` background
- [ ] WebP ≤ 250 KB at 1200×1600 where possible
- [ ] Alt text drafted in [HERO-SLIDE-COPY.md](./HERO-SLIDE-COPY.md)

---

## Account status

**2026-06-30:** Higgsfield MCP `balance` check failed with transient API error (`Request ID: f57fee69-23ab-451b-b51c-fa3f9375ce43`). Retry before batch run. Use `get_cost: true` on first 3D job to confirm credits.

If API returns **522/503**, complete theme integration locally and retry generation later — docs and copy are sufficient to proceed with Phase 2 scaffolding.
