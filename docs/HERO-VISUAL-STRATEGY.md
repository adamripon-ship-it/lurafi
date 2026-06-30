# Hero visual strategy — Kevin 3.0 (Apple-style)

**Status:** Planning doc · **Do not deploy** until assets + theme integration are complete.  
**Store:** [mitipi.eu](https://mitipi.eu) · **Theme:** `sections/hero.liquid` + `snippets/hero-slide.liquid`  
**Related:** [HERO-HIGGSFIELD-PROMPTS.md](./HERO-HIGGSFIELD-PROMPTS.md) · [HERO-SLIDE-COPY.md](./HERO-SLIDE-COPY.md) · [HERO-IMAGE-PROMPTS.md](./HERO-IMAGE-PROMPTS.md) (legacy photoreal)

---

## Executive summary

The hero becomes an **Apple product-page carousel** on a **pure black stage** (`#000`) with blue radial glow (`--apple-blue` / `#2997ff`). **Slide 1** is an **interactive 3D Kevin** (Google `<model-viewer>` + Higgsfield `generate_3d` GLB from Drive refs in `assets/reference/`). **Slides 2–8** are **editorial illustrations** — soft gradients, minimal geometry, European NL/DE settings — **never photoreal lifestyle photos** and **never showing the Kevin device**. Each slide maps to one audience micro-persona with three floating context callouts (already wired in Liquid).

### Slide count recommendation: **8 total** (1 product + 7 illustrations)

| Option | Slides | Verdict |
|--------|--------|---------|
| **8 (recommended)** | 1 × 3D + 7 × illustration | Covers all four audience groups and seven distinct emotional hooks without over-merging widows, moms, and students into one “women alone” frame. ~49 s full cycle at 7 s autoplay — acceptable with pause control. |
| 6 (fallback) | 1 × 3D + 5 × illustration | Use if dot nav feels crowded on 320 px viewports or Higgsfield budget is tight. Merge slides per [6-slide compression map](#6-slide-fallback-compression) below. |

**Why not 9+:** Mobile dot labels truncate; LCP preload budget stays on slide 1 only; more slides dilute message before CTA.

---

## Design principles (Apple × Mitipi)

| Principle | Implementation |
|-----------|----------------|
| Dark hero stage | Existing `.hero-apple` black + grain + blue glow — illustrations sit *inside* the glow, not on white |
| Product moment | Slide 1 only — 3D Kevin with orbit + optional auto-rotate (respects reduced motion) |
| Editorial illustration | Slides 2+ — flat/soft-3D hybrid, muted palette, **no Kevin product**, no security cameras |
| European cast | White European faces/hands, NL rijtjeshuis / DE Altbau / Kleinstadt — not US suburban stock |
| Callout safe zone | **Upper third** of each illustration relatively clear for `.hero-context-cards` |
| Brand blues | Accent glow `#2997ff`, CTA `#0071e3` — illustrations may include warm interior amber; avoid competing saturated blues in art |
| Typography | Headline/lede unchanged above slider; slide-specific story lives in callouts |

---

## Audience groups → slides

| Group | Slide(s) | Persona | Core USP |
|-------|----------|---------|----------|
| **1 — Single women** | 2, 3, 4, 5 | Widow 89 · Mom + baby · Mom + 2yo · Student studio | Predator deterrence, shadow “someone home” illusion, ground-floor activity while children upstairs |
| **2 — Expats** | 6, 7 | Solo abroad · Couple on holiday | Empty flat abroad still “lived in”; no neighbour favours in new country |
| **3 — Frequent travelers / second homes** | 8 | Away for events, ski week, holiday home | Multi-day believable occupancy; pet + human sound layers |
| **4 — Retired elderly** | 2 *(shared)* + dedicated callout angle | Widow + caregiver shadow simulation | Family visit rhythms without cameras; dignity-first deterrence |

Slide 2 (widow 89) serves **Group 1** and **Group 4** with copy tuned in [HERO-SLIDE-COPY.md](./HERO-SLIDE-COPY.md). Group 4’s “caregiver shadow” USP gets strongest emphasis on slide 8’s alternate callouts if using 6-slide mode; in 8-slide mode slide 2 callout 3 covers caregiver simulation.

---

## Slide map (8-slide primary)

| # | `slide_label` key | Asset file | Type | Audience |
|---|-------------------|------------|------|----------|
| 1 | `hero.slide_1` | `kevin-hero-3d.glb` + `kevin-hero-3d-poster.webp` | **Interactive 3D** | Product / burglary prevention |
| 2 | `hero.slide_2` | `kevin-hero-illust-widow-89.webp` | Illustration | Single women · Retired (89yo widow) |
| 3 | `hero.slide_3` | `kevin-hero-illust-mom-baby.webp` | Illustration | Single women (mom + infant) |
| 4 | `hero.slide_4` | `kevin-hero-illust-mom-toddler.webp` | Illustration | Single women (mom + 2yo) |
| 5 | `hero.slide_5` | `kevin-hero-illust-student-studio.webp` | Illustration | Single women (student, first flat) |
| 6 | `hero.slide_6` | `kevin-hero-illust-expat-solo.webp` | Illustration | Expats (solo, new city) |
| 7 | `hero.slide_7` | `kevin-hero-illust-expat-couple.webp` | Illustration | Expats (couple, holiday departure) |
| 8 | `hero.slide_8` | `kevin-hero-illust-away-home.webp` | Illustration | Travelers · holiday home · event trips |

Legacy `image_fallback` keys (`children`, `seniors`, `women`, etc.) remain until theme schema is updated in Phase 2.

---

## Asset matrix

| Filename | Format | Export size | Visual type | Subtle animation | LCP / perf notes |
|----------|--------|-------------|-------------|------------------|------------------|
| `kevin-hero-3d.glb` | GLB (Draco optional) | ≤ 2 MB target | Higgsfield `generate_3d` (`multi_image_to_3d`) | `<model-viewer auto-rotate>` when motion OK | **Not LCP** — poster is LCP |
| `kevin-hero-3d-poster.webp` | WebP | 800 × 1000 (3:4) | Render still from GLB or `810_4982.jpg` | None | **Primary LCP** on slide 1 — `fetchpriority="high"` |
| `kevin-hero-3d-poster@2x.webp` | WebP | 1600 × 2000 | Same | None | `srcset` for retina |
| `kevin-hero-illust-widow-89.webp` | WebP + PNG fallback | 1200 × 1600 (3:4) | Editorial illustration | Optional 1–2 px parallax on window glow (CSS) | Lazy; preload only slide 2 after first paint |
| `kevin-hero-illust-mom-baby.webp` | WebP | 1200 × 1600 | Editorial illustration | Warm lamp flicker (CSS `@keyframes`, reduced-motion off) | Lazy |
| `kevin-hero-illust-mom-toddler.webp` | WebP | 1200 × 1600 | Editorial illustration | None | Lazy |
| `kevin-hero-illust-student-studio.webp` | WebP | 1200 × 1600 | Editorial illustration | None | Lazy |
| `kevin-hero-illust-expat-solo.webp` | WebP | 1200 × 1600 | Editorial illustration | None | Lazy |
| `kevin-hero-illust-expat-couple.webp` | WebP | 1200 × 1600 | Editorial illustration | None | Lazy |
| `kevin-hero-illust-away-home.webp` | WebP | 1200 × 1600 | Editorial illustration | Optional subtle snow/rain particles outside window | Lazy |

**Shopify delivery:** Upload to **Files** or theme `assets/`; illustrations as `image_picker` on blocks; GLB via `assets/kevin-hero-3d.glb` (Shopify allows `.glb` in assets).

**Reference inputs (local only, gitignored):**

| Purpose | Path |
|---------|------|
| 3D front / hero angle | `assets/reference/clean-01-studio-white.png` |
| 3D side / depth | `assets/reference/Edited - white BG/810_4982.jpg` |
| Optional third angle | `assets/reference/Edited - white BG/810_4998.jpg` |

---

## Slide 1 — Interactive 3D architecture

```
┌─────────────────────────────────────────┐
│  hero-apple (black + glow)              │
│  ┌─────────────────────────────────┐    │
│  │ <model-viewer>                  │    │
│  │   src=kevin-hero-3d.glb         │    │
│  │   poster=kevin-hero-3d-poster   │    │
│  │   camera-controls               │    │
│  │   auto-rotate (if motion OK)    │    │
│  └─────────────────────────────────┘    │
│  hero-context-cards (3)                 │
└─────────────────────────────────────────┘
```

1. **Generate GLB** — Higgsfield `generate_3d` with `multi_image_to_3d`, refs uploaded from Drive paths above (see [HERO-HIGGSFIELD-PROMPTS.md](./HERO-HIGGSFIELD-PROMPTS.md)).
2. **Poster frame** — Export PNG/WebP from model-viewer or use studio still; must match first paint before GLB loads.
3. **Snippet change** — Extend `hero-slide.liquid` with `slide_visual == 'model3d'` branch (Phase 2).
4. **Script** — Load `@google/model-viewer` module once from CDN; defer until slide 1 visible.
5. **Fallback** — If WebGL unavailable, show poster image only (`<img>` path identical to today’s product slide).

---

## Slides 2–8 — Illustration art direction

Replace current **photoreal persona PNGs** (`kevin-hero-persona-*.png`) with **Apple editorial illustration**:

- Soft gradient backgrounds blending into hero black (no hard white matting)
- Simplified architecture: Dutch gable / German stucco / student corridor door — recognizable but not hyper-detailed
- **Warm interior light** vs cool exterior dusk — sells “occupied home” without showing Kevin
- **No product, no app UI, no cameras, no alarm panels**
- Figures: European white cast, natural poses, dignified (especially 89yo widow — not frail caricature)
- Composition: subject lower two-thirds; **upper third quieter** for callouts

Style refs (internal mood, not to paste in prompts): Apple Health / HomePod / Vision Pro feature illustrations — minimal line weight, atmospheric depth, no cartoon exaggeration.

---

## 6-slide fallback compression

If reducing to **6 slides**, merge illustration assets:

| 6-slide # | Merged from (8-slide) | Notes |
|-----------|----------------------|-------|
| 2 | 2 + 4 (widow + mom toddler) | Dual callout set; art favours mom+toddler, copy references seniors in callout 3 |
| 3 | 3 + 5 (mom baby + student) | Split “single women” across two callout themes on one image |
| 4 | 6 + 7 (expats) | Single “new country / holiday” illustration |
| 5 | 8 (travel / second home) | Unchanged |
| 6 | — | Drop duplicate elderly angle (covered in slide 2 copy) |

Keep slide 1 (3D) unchanged.

---

## Implementation phases

### Phase 1 — Assets & docs (current)

- [x] Strategy, Higgsfield prompts, slide copy docs
- [ ] Higgsfield: `generate_3d` → GLB + poster
- [ ] Higgsfield: 7 × `generate_image` illustrations (2k, 3:4)
- [ ] Optimise: WebP ~150–250 KB each, GLB ≤ 2 MB
- [ ] Place finals in `assets/` with names from asset matrix

### Phase 2 — Theme integration

- [ ] `snippets/hero-slide.liquid` — add `model3d` visual type + `<model-viewer>`
- [ ] `sections/hero.liquid` schema — 8 blocks preset; new `image_fallback` keys or remove fallbacks
- [ ] `assets/lurafi.css` — `.hero-slider__model`, illustration variant (soft edge fade into black, not photo border-radius box)
- [ ] `locales/en.default.json` (+ `npm run locales:build && sync`) — `hero.slide_7`, `hero.slide_8` keys
- [ ] `assets/hero-slider.js` — pause 3D auto-rotate when slide inactive; honour `prefers-reduced-motion`
- [ ] Update `scripts/generate-mitipi-visuals.sh` for illustration batch

### Phase 3 — QA & launch

- [ ] `npm run theme:check`
- [ ] Lighthouse mobile: LCP ≤ 2.5 s (poster), CLS from model-viewer slot fixed height
- [ ] Keyboard: carousel tabs + model-viewer focus trap avoided
- [ ] Screen reader: slide labels + callouts; 3D described via alt on poster
- [ ] Cross-browser: Safari iOS WebGL, fallback poster
- [ ] Theme push to preview theme first — **not live** until sign-off

---

## WCAG & motion

Existing behaviour (keep and extend):

| Requirement | Current | Phase 2 addition |
|-------------|---------|------------------|
| **`prefers-reduced-motion`** | `hero-slider.js` starts paused; CSS disables callout float, scroll bounce | Disable `<model-viewer auto-rotate>`; static poster acceptable |
| **Pause control** | `[data-hero-slider-pause]` visible when autoplay > 0 | Pausing carousel also pauses 3D rotation |
| **Autoplay** | Default 7 s; 0 disables | Consider 8 s for 8 slides (optional) |
| **Keyboard** | Arrow/Home/End on focused carousel | Model-viewer has built-in keyboard rotate — ensure slide focus order |
| **Contrast** | Callout cards on dark — verify `#f5f5f7` on `rgba(29,29,31,0.92)` | Re-test on illustration busy areas — add scrim if needed |
| **Live region** | `aria-live="polite"` announces slide changes | Include “3D product view” in slide 1 label |

CSS hooks already present:

```css
@media (prefers-reduced-motion: reduce) {
  .hero-context-card { animation: none; }
}
.motion-reduced .hero-slider[data-hero-slider] .hero-slider__slide { transition: none; }
```

Add:

```css
@media (prefers-reduced-motion: reduce) {
  model-viewer { --auto-rotate-speed: 0; }
}
```

---

## Higgsfield workspace

| Setting | Value |
|---------|-------|
| Workspace ID | `c47ef442-fa47-46cf-ba90-113e76988a77` |
| Illustration model | `gpt_image_2` or successor — text-to-image, **no product reference** |
| 3D model | `multi_image_to_3d` (2 views minimum) |
| Aspect ratio | **3:4** (matches `.hero-slider__image` portrait slot) |

**Account check (2026-06-30):** MCP `balance` returned transient error (`Request ID: f57fee69-23ab-451b-b51c-fa3f9375ce43`). Retry before batch generation; use `get_cost: true` on first 3D job to preflight credits.

---

## Migration from current hero

| Current asset | Disposition |
|---------------|-------------|
| `kevin-hero-burglary-prevention.png` | Replaced by 3D + poster; keep as emergency fallback |
| `kevin-hero-persona-*.png` | Replaced by `kevin-hero-illust-*.webp` |
| `docs/HERO-IMAGE-PROMPTS.md` | Superseded for slides 2+ by [HERO-HIGGSFIELD-PROMPTS.md](./HERO-HIGGSFIELD-PROMPTS.md); retain for archive |

---

## Sign-off checklist

- [ ] All 8 slides reviewed on iPhone SE + desktop 1440px
- [ ] No Kevin device visible in slides 2–8
- [ ] Callouts readable on every illustration
- [ ] Reduced-motion path tested
- [ ] DE + NL locale copy reviewed
- [ ] Stakeholder approves 8 vs 6 slide count
