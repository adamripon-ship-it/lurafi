# Hero slide image prompts (Higgsfield / AI)

Kevin (Mitipi) hero slides: **realistic Dutch & German homes only** — varied typologies, not Amsterdam clichés.

## Higgsfield setup

| Task | Command | Notes |
|------|---------|--------|
| Slides 2–6 lifestyle | `product-photoshoot` → `lifestyle_scene` | Reference: `assets/kevin-hero-burglary-prevention.jpg` |
| Slide 1 burglary | Real photo (keep) | `assets/kevin-hero-burglary-prevention.jpg` |
| Batch regen (hero only) | `./scripts/generate-hero-images.sh` | Legacy; prefer `./scripts/generate-mitipi-visuals.sh --hero-only` |
| Batch regen (all visuals) | `./scripts/generate-mitipi-visuals.sh` | Hero + feature/benefit assets — see [FEATURE-VISUAL-PROMPTS.md](./FEATURE-VISUAL-PROMPTS.md) |

Aspect ratio: **3:4**. Reconnect Higgsfield MCP if token expired.

---

## Product placement (every slide)

Kevin is a **small wedge ~20 × 15 × 12 cm** (hand-sized smart-home device).

| Rule | Detail |
|------|--------|
| **Size in frame** | ~25–30% of image width — never dominates the window |
| **Position** | Lower-center on a **plausible surface** (sill, side table, shelf, desk) |
| **Angle** | 3/4 toward camera, same orientation as reference photo |
| **Shadow** | Soft contact shadow on surface |
| **Focus** | Product tack-sharp; exterior softly blurred (85mm, f/2.8) |
| **Hero UI** | Upper third relatively clear for floating callout cards |

**Negative:** oversized product, product taller than window sill, floating device, wrong proportions, melted geometry.

---

## Location palette (rotate — do not repeat Amsterdam canal on every slide)

| Slide | Setting | Example towns / typology |
|-------|---------|---------------------------|
| 1 | Studio product | White sweep — real photo |
| 2 | NL suburban family | Rijtjeshuis — Haarlem, Amersfoort, Zwolle |
| 3 | DE senior apartment | Kleinstadt — Rothenburg, Marburg, Freising |
| 4 | NL luxury home | Landgoed / villa — Blaricum, Wassenaar, Laren; or large polder country house |
| 5 | DE student Wohnung | Altbau — Heidelberg, Freiburg, Münster (low-rise) |
| 6 | NL houseboat | Amsterdam/Utrecht/Leiden **woonboot** — interior shelf, quay visible |

**Avoid:** Amsterdam centrum-only vibes, skyscrapers, glass towers, houses floating in water.

---

## Window geometry

- Camera **inside** the room; exterior is **through the glass**, at correct distance.
- **Canal / houseboat:** water is **beside** the hull or **between** two banks — never “room built in middle of canal”.
- **Houseboat window:** at waterline → quay, bikes, brick façades on **bank** at eye level when seated.
- **Luxury villa:** tall window → **garden, lawn, old trees, hedge** — not urban canal.
- **Rijtjeshuis ground floor:** **street & pavement** at eye level.
- **German Marktplatz:** façades **across** cobblestone square.

---

## Prompt template

```
Photorealistic editorial interior, natural dusk light, subtle grain, 85mm f/2.8.

PRODUCT (match reference, 25-30% frame width, lower-center, 3/4 angle, realistic shadow):
Kevin wedge — grey heather fabric front, white plastic sides, white arrow logo, two top sensors.

INTERIOR: [typology-specific believable styling]

WINDOW / VIEW: [slide-specific exterior — see below]

NEGATIVE: oversized product, house in middle of water, canal filling window, Amsterdam tourist cliché only, skyscrapers, surreal windows, faces, text.
```

### Slide 2 — NL rijtjeshuis (children)
Ground-floor living room, Haarlem-scale suburb. Device on **wide white windowsill**. Through window: **brick row street at eye level**, pavement, bikes, opposite identical two-storey homes, small hedges — **no canal**.

### Slide 3 — DE Kleinstadt (seniors)
Ground-floor **German apartment** above shop. Device on **wooden side table** beside window. Through window: **Marktplatz** — cobblestones, Rathaus, timber-framed façades **across** square, church spire distant.

### Slide 4 — NL luxury country house (women / affluent home)
Spacious **landgoed or villa** living room (Blaricum/Wassenaar). Device on **marble console** below tall window. Through window: **manicured garden, old oaks, lawn, hedge** — polder or estate, **no canal, no city**.

### Slide 5 — DE student Altbau (students)
Compact **German student Wohnung**, 4th floor Heidelberg-style. Device on **small desk** by window. Through window: **courtyard or side street** — 4-storey stucco/brick, warm windows, bikes below.

### Slide 6 — NL houseboat (unique homes)
**Converted Dutch houseboat** interior — narrow but cozy, wood panelling. Device on **built-in shelf** (not blocking window). Through window: **canal quay at waterline** — brick path, moored bikes, gabled houses on **opposite bank**; water visible **below** quay edge only.

---

## Asset filenames

| Fallback key | File |
|--------------|------|
| `burglary` | `kevin-hero-burglary-prevention.jpg` |
| `children` | `kevin-hero-protecting-children.jpg` |
| `seniors` | `kevin-hero-seniors-widows.jpg` |
| `luxury` | `kevin-hero-luxury-dutch-villa.jpg` |
| `students` | `kevin-hero-students-university.jpg` |
| `houseboat` | `kevin-hero-dutch-houseboat.jpg` |

After export: `npm run theme:check` → theme push.
