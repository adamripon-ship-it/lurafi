# Hero slide image prompts (Higgsfield / AI)

Kevin (Mitipi) hero slider: **slide 1 = product cutout only**; **slides 2–6 = persona lifestyle scenes with no Kevin device visible**.

## Higgsfield setup

| Task | Command | Notes |
|------|---------|--------|
| Slide 1 burglary | Real photo (keep) | `assets/kevin-hero-burglary-prevention.png` |
| Slides 2–6 persona | `higgsfield generate create gpt_image_2` | **No product reference** — text-to-image lifestyle |
| Batch regen (hero only) | `SKIP_EXISTING=0 ./scripts/generate-mitipi-visuals.sh --hero-only` | Persona function in script |
| Batch regen (all visuals) | `./scripts/generate-mitipi-visuals.sh` | Hero + feature/benefit assets |

Workspace: `c47ef442-fa47-46cf-ba90-113e76988a77`  
Aspect ratio: **3:4**. Resolution: **2k**.

If API returns **522/503**, complete theme copy/CSS and retry generation later using prompts below.

---

## Cast & setting (slides 2–6)

- **People:** European, white, authentic Netherlands/Germany — not stock-American.
- **No Kevin device** in frame — no smart-home gadgets, no product on sill.
- **Upper third** relatively clear for floating callout cards.
- **Negative:** Amsterdam canal cliché only, skyscrapers, surreal windows, text overlays, security cameras.

---

## Slide 1 — Preventing burglary (product only)

| Fallback key | File |
|--------------|------|
| `burglary` | `kevin-hero-burglary-prevention.png` |

Real product cutout on transparent/white — unchanged.

---

## Persona slides (2–6)

| # | Fallback key | Asset file | Short user-intent (CLI `--prompt`) |
|---|--------------|------------|-------------------------------------|
| 2 | `children` | `kevin-hero-persona-children.png` | European white Dutch family in rijtjeshuis suburban home at dusk, parent at door saying goodbye, child safe inside warm living room, brick street through window, photorealistic editorial, no smart home devices visible |
| 3 | `seniors` | `kevin-hero-persona-seniors.png` | European white senior woman in dignified German Kleinstadt apartment at dusk, reading chair, warm lamp, Marktplatz cobblestones through window, lived-in calm interior, photorealistic, no gadgets |
| 4 | `women` | `kevin-hero-persona-women.png` | European white single mother with young child in compact Dutch terraced flat at evening, warm interior light, quiet courtyard through window, confident safe mood, photorealistic, no security devices |
| 5 | `students` | `kevin-hero-persona-students.png` | European white university student in German Altbau student flat Heidelberg-style, first time living alone, textbooks on desk, courtyard through window at dusk, photorealistic, no product shots |
| 6 | `travel` | `kevin-hero-persona-travel.png` | European white couple leaving Dutch rijtjeshuis for holiday, packed suitcase by door, warm occupied light glowing inside at dusk, suburban brick street through window, photorealistic, no devices visible |

Legacy aliases: `luxury` → women; `travelling` → travel; `houseboat` → `kevin-hero-dutch-houseboat.png`.

---

## Regenerate one slide

```bash
export PATH="$HOME/.local/bin:$PATH"
higgsfield workspace set c47ef442-fa47-46cf-ba90-113e76988a77
SKIP_EXISTING=0 ./scripts/generate-mitipi-visuals.sh --hero-only
```

After export: `npm run locales:build && npm run locales:sync && npm run theme:check` → theme push.
