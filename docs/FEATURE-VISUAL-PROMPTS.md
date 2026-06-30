# Feature & benefit visual prompts (Higgsfield)

Maps each mitipi.eu theme section to target assets, Higgsfield mode, user-intent prompt, and aspect ratio.

**Rules (all lifestyle shots):** Kevin wedge ~20×15×12 cm, **25–30% frame width**, lower-center, 3/4 angle, soft contact shadow. Dutch/German interiors only — no Amsterdam-only canals, no houses in middle of water. See [HERO-IMAGE-PROMPTS.md](./HERO-IMAGE-PROMPTS.md) for window geometry.

**Reference images:** `assets/reference/` (Drive downloads) + `assets/kevin-hero-burglary-prevention.jpg`.

**Batch script:** `./scripts/generate-mitipi-visuals.sh` (requires `higgsfield auth login` + workspace).

---

## Reference image picks

| Role | Local path |
|------|------------|
| Lifestyle / hero | `assets/kevin-hero-burglary-prevention.jpg` |
| Studio product | `assets/reference/Edited - white BG/810_4982.jpg` |
| Close-up detail | `assets/reference/Edited - white BG/810_5010.jpg` |
| Device angle | `assets/reference/clean-01-studio-white.png` |
| Shadow demo | `assets/reference/Edited - white BG/810_4998.jpg` |

---

## Hero slider (`sections/hero.liquid`)

Slide 1 keeps real photo. Regenerate slides 2–6 only.

| Slide | Fallback key | Output file | Mode | Aspect | Prompt (user-intent) |
|-------|--------------|-------------|------|--------|----------------------|
| 1 | `burglary` | `kevin-hero-burglary-prevention.jpg` | — | 3:4 | Real photo (keep) |
| 2 | `children` | `kevin-hero-protecting-children.jpg` | `lifestyle_scene` | 3:4 | Kevin on white windowsill, Dutch rijtjeshuis Haarlem suburb, brick street at eye level, dusk, product 25% frame width |
| 3 | `seniors` | `kevin-hero-seniors-widows.jpg` | `lifestyle_scene` | 3:4 | Kevin on side table, German Kleinstadt senior apartment, Marktplatz cobblestones through window, dusk |
| 4 | `luxury` | `kevin-hero-luxury-dutch-villa.jpg` | `lifestyle_scene` | 3:4 | Kevin on marble console, Dutch landgoed villa, garden and old trees through tall window, dusk |
| 5 | `students` | `kevin-hero-students-university.jpg` | `lifestyle_scene` | 3:4 | Kevin on desk, German Altbau student Wohnung Heidelberg, courtyard rooftops through window, dusk |
| 6 | `houseboat` | `kevin-hero-dutch-houseboat.jpg` | `lifestyle_scene` | 3:4 | Kevin on shelf, Dutch woonboot interior, quay and opposite bank at waterline through window, dusk |

---

## Problem section (`sections/lp-problem.liquid`)

Conceptual contrast visuals — **not** Kevin product shots. Use `conceptual_product` or `hero_banner` for wide mood.

| Tile | Locale key | Output file | Mode | Aspect | Prompt |
|------|------------|-------------|------|--------|--------|
| Alarms react | `home.problem.tile_1_*` | `kevin-feature-problem-alarms.jpg` | `conceptual_product` | 4:3 | Split scene: silent empty hallway vs siren alarm panel flashing red after break-in, editorial security photography, no faces |
| Cameras record | `home.problem.tile_2_*` | `kevin-feature-problem-cameras.jpg` | `conceptual_product` | 4:3 | CCTV camera watching dark empty living room, cold blue monitor glow, still feels unoccupied from window perspective |
| Lights predictable | `home.problem.tile_3_*` | `kevin-feature-problem-lights.jpg` | `conceptual_product` | 4:3 | Timer lamp harsh on-off pattern in empty room vs warm varied light through window suggesting life inside |

---

## Solution section (`sections/lp-solution.liquid`)

| Element | Output file | Mode | Aspect | Prompt |
|---------|-------------|------|--------|--------|
| Section hero | `lurafi-product-studio.jpg` | `product_shot` | 3:2 | Kevin wedge on clean white studio sweep, 3/4 angle, soft shadow, catalog quality |
| Pillar: warm light | `kevin-feature-solution-light.jpg` | `marketplace-cards --asset infographic` | 1:1 | Infographic: Kevin projecting warm amber light cone onto wall, minimal icons, no text |
| Pillar: shadows | `kevin-feature-solution-shadows.jpg` | `marketplace-cards --asset infographic` | 1:1 | Infographic: silhouette of person reading projected on ceiling, Kevin device on sill |
| Pillar: sound | `kevin-feature-solution-sound.jpg` | `marketplace-cards --asset infographic` | 1:1 | Infographic: sound waves from Kevin, kitchen/TV ambience icons, privacy-first on-device |

Reference for studio shot: `810_4982.jpg`. Reference for shadow pillar: `810_4998.jpg`.

---

## How it works (`sections/lp-steps.liquid`)

| Element | Output file | Mode | Aspect | Prompt |
|---------|-------------|------|--------|--------|
| Device angle | `kevin-device-angle.jpg` | `product_shot` | 5:4 | Kevin wedge 3/4 angle on white, showing fabric front and top sensors, transparent-friendly background |

Replaces CloudFront fallback URL in liquid.

---

## Specifications (`sections/lp-specs.liquid`)

| Element | Output file | Mode | Aspect | Prompt |
|---------|-------------|------|--------|--------|
| Close-up | `lurafi-product-closeup.jpg` | `product_shot` | 3:2 | Macro close-up Kevin fabric front panel and top control ring, marble surface, soft studio light |

Reference: `810_5010.jpg`.

---

## Personas (`sections/lp-personas.liquid`)

| Persona | Locale key | Output file | Mode | Aspect | Prompt |
|---------|------------|-------------|------|--------|--------|
| Travel often | `persona_1_*` | `kevin-persona-travel.jpg` | `lifestyle_scene` | 4:3 | Kevin on windowsill, packed suitcase nearby, Dutch suburban home at dusk, warm interior |
| Already have alarm | `persona_2_*` | `kevin-persona-alarm-complement.jpg` | `lifestyle_scene` | 4:3 | Kevin beside disarmed alarm keypad, German townhouse entry, complementary deterrence mood |
| Living alone | `persona_3_*` | `kevin-persona-living-alone.jpg` | `lifestyle_scene` | 4:3 | Kevin in compact urban flat, evening light, believable occupied scene from outside perspective |

---

## App section (`sections/lp-app.liquid`)

Phone mockups **keep existing** `lurafi-app-*.jpg` assets unless Drive app screenshots are added later.

Feature tiles (optional lifestyle accents):

| Tile | Output file | Mode | Aspect | Prompt |
|------|-------------|------|--------|--------|
| Weekly schedules | `kevin-feature-schedules.jpg` | `lifestyle_scene` | 16:9 | Kevin in living room, phone on coffee table showing schedule UI blur, evening routine |
| Geo activation | `kevin-feature-geo.jpg` | `lifestyle_scene` | 16:9 | Kevin active as person leaves Dutch row house with phone in hand, geofence concept |
| Your sounds | `kevin-feature-sounds.jpg` | `product_shot` | 16:9 | Kevin on shelf, warm room, subtle sound-wave mood, on-device privacy |
| Multiple places | `kevin-feature-multi-device.jpg` | `lifestyle_scene` | 16:9 | Two Kevin devices in different rooms split composition, apartment + office |

---

## Configure / product page

| Page | Output file | Mode | Notes |
|------|-------------|------|-------|
| Configure covers | `kevin-front-cover-*.png` | — | Already in theme; use Drive color variants if regen needed |
| Product split | `lurafi-product-split-usecases.jpg` | `hero_banner` | 16:9 wide banner, Kevin + light/shadow/sound triptych |

---

## Post-generation checklist

1. Review proportions — Kevin must not dominate frame on lifestyle shots.
2. `npm run theme:check`
3. Visual QA on mobile (touch targets unchanged; images lazy-loaded).
4. `npm run theme:push:live` when approved.
