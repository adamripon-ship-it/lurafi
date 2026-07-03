# Visual rebuild masterplan — mitipi.eu (Higgsfield MCP pipeline)

**Status:** Plan for owner approval · no assets generated yet · execute batch-by-batch with approval gates
**Parallel track:** [CMS-BACKEND-PLAN.md](./CMS-BACKEND-PLAN.md) — ships the delivery rails these assets land on
**Supersedes / absorbs:** [kevin-image-generation-plan.md](./kevin-image-generation-plan.md), [FEATURE-VISUAL-PROMPTS.md](./FEATURE-VISUAL-PROMPTS.md), [HERO-HIGGSFIELD-PROMPTS.md](./HERO-HIGGSFIELD-PROMPTS.md) (carousel-era; hero is now focus-v4)
**Balance checked:** 2,161 Higgsfield credits (Ultra plan) — sufficient for all batches incl. 2 review rounds

---

## 1. North star

Every pixel a visitor sees should feel like it came from **one Swiss studio on one shoot day**: a dark, calm, premium stage; one product hero moment; European homes at dusk; light as the protagonist (because light *is* the product). We recreate **every visual asset** with AI generation routed through the **Higgsfield MCP**, post-processed with the **Adobe MCP**, delivered via **Shopify Files/CDN**, and QA'd with **Playwright visual regression** — without copying kevinswiss.com's art, layout crops, or photography.

### Design DNA (extracted from the live theme — this is "the vibe" and it does not change)

| Token | Value | Where |
|---|---|---|
| Stage | Pure black `#000000` hero → white `#f5f5f7` funnel sections | `hero.css`, `lurafi.css` |
| Brand accent | `#0071e3` CTA blue · `#2997ff` glow blue | `--apple-blue*` |
| Hero glow | Purple → magenta → pink layered radial glow behind product | `.hero-banner__glow-layer--*` (focus-v4) |
| Typography | Apple-system stack, tight tracking, `clamp()` fluid scale | `--font-apple` |
| Imagery grade | Cinematic editorial, muted neutrals + warm amber interior light vs. cool dusk exterior, single cool-blue accent | existing prompt docs |
| Cast & place | European (NL rijtjeshuis / DE Altbau / CH), dusk; never US-suburban stock | HERO-VISUAL-STRATEGY.md |
| Emotion | Calm confidence ("lived-in"), never fear imagery — matches `config/brandscript.json` guide-first positioning | brandscript |
| Motion | `motion-ready`/`motion-reduced` classes, easing `cubic-bezier(0.16,1,0.3,1)`, staggered entries, everything honors `prefers-reduced-motion` | `hero.css`, `theme.js` |

### Non-negotiables (carried over + hardened)

1. **Device accuracy rule** (from kevin-image-generation-plan.md): any frame containing the Kevin device is **image-to-image with a real reference photo** from `assets/reference/` (see `INVENTORY.txt`), never text-to-image. The device is a grey woven-fabric rectangular box with white top edge — models invent fake triangle alarms without a reference.
2. **No kevinswiss.com derivation.** We may share product truth (it's the same device) but compositions, scenes, casting, and grade are original. No screenshots, no image-to-image from their site, no recreating their specific scenes.
3. **Claims guardrail:** no imagery implying police endorsement, statistics, or break-in dramatization (no balaclava-burglar clichés). Problem tiles show *absence signals* (dark windows, dead camera, predictable timer), not intruders.
4. **Real UI stays real.** App-store screenshots of the Kevin app are captured from the actual app (or rebuilt in Figma from real screens) — never AI-hallucinated UI. AI may generate the *device frame/environment around* a real screenshot only.
5. **Every asset ships with per-locale alt text** through the locale pipeline (`scripts/build-locales.mjs`) or Shopify Files alt fields.

---

## 2. Pipeline (same 6 stages for every batch)

```
BRIEF → GENERATE (Higgsfield MCP) → GRADE/RETOUCH (Adobe MCP) → OPTIMIZE (sharp) → DELIVER (Shopify Files via CMS rails) → QA (Playwright + human)
```

| Stage | Tool | Detail |
|---|---|---|
| Brief | This doc §4 | Per-asset prompt = STYLE DNA block + scene intent + negatives; aspect + target size fixed up front |
| Generate | `higgsfield generate_image` / `generate_video` / `generate_3d` | Model per routing table §3. **Always re-run `models_explore(action:'recommend')` before a batch** — catalog moves fast; §3 is the floor, not the ceiling. Batch 3–4 candidates per asset, pick 1. |
| Grade / retouch | Adobe MCP | `image_adjust_color_temperature` / `image_adjust_hsl` to lock the shared grade; `image_remove_background` for product cutouts; `image_apply_monochromatic_tint` for shadow illustrations; `image_crop_and_resize` for exact section crops |
| Upscale (if needed) | `higgsfield upscale_image` to 4K masters | Masters archived in Drive; web gets derivatives only |
| Optimize | `sharp`-based script (`scripts/optimize-assets.mjs`, to be added) | AVIF + WebP + JPG fallback, exact rendered dimensions ×2, strip metadata. **Budget: ≤180 KB per section image, ≤300 KB hero product, ≤2.5 MB hero video** |
| Deliver | Shopify Files (CDN) + theme `image_picker` settings | See CMS plan — goal is zero hardcoded `asset_url` images; content team can swap any image in Theme Editor |
| QA | `tests/e2e/` + screenshot diffs, manual gate | New `visual-regression.spec.js`: hero, each LP section, configure page @ 390/768/1440px. Owner approves each batch before deploy |

---

## 3. Model routing (verified against live Higgsfield catalog, 2026-07)

| Task | Primary model | Why | Fallback |
|---|---|---|---|
| Product-in-scene (device visible) | **Seedream 5.0 lite** (`seedream_v5_lite`, quality `high`) — image-to-image with reference photo | Instruction-based editing preserves exact device geometry/fabric | Nano Banana 2 img2img |
| Conceptual scenes, no device (problem tiles, textures) | **Nano Banana 2** (`nano_banana_2`, 2k) | Fast, photoreal, clean text-to-image | Cinema Studio Image 2.5 |
| Cinematic mood stills (proof/press backgrounds) | **Cinema Studio Image 2.5** (`cinematic_studio_2_5`, 2k–4k) | Film-grade lighting control | Soul Cinema |
| People / persona portraits | **Soul 2.0** (`soul_2`, 2k) | Realistic European editorial people | Soul Cast for recurring persona identity across images |
| Shadow-scene editorial illustrations | **Nano Banana Pro** (`nano_banana_pro`) with illustration style block | Replaces retired recraft flow; strongest style adherence | GPT Image 2 |
| Anything with rendered text (OG images, press kit covers) | **Nano Banana Pro** or **GPT Image 2** (4k, quality high) | Only models with reliable typography | — |
| Hero ambient video loop | **Cinema Studio Video 3.0** (`cinematic_studio_3_0`, 1080p–4K, 6–8 s, audio off) — **pass the same frame as `start_image` AND `end_image` for a seamless loop** | Only cinema-grade i2v with start/end frame control | `cinematic_studio_video_v2` (silent mode) |
| "View from the street" demo clip | Cinema Studio Video 3.0, i2v from approved dusk-facade still, multi-shot off | Product truth: light/shadow variation behind curtains | — |
| Interactive 3D product | **SAM 3 3D Objects** (`sam_3_3d`) — GLB from white-BG reference photo | Powers `<model-viewer>` progressive enhancement | Skip if mesh quality < photo |
| Colorway recolors (configure page) | Seedream 5.0 lite instruction edit on master photo ("recolor fabric to burgundy, keep geometry/lighting") | Preserves identical framing across all 5 colors | Adobe `image_adjust_hsl` on masked fabric |
| Cleanup / cutouts | `higgsfield remove_background` or Adobe `image_remove_background` | Per-asset judgment | — |
| Social ad variants (post-launch) | Marketing Studio Image / DTC Ads with brand kit | Out of site scope; noted for reuse | — |

**Prompt system:** keep the two proven blocks from the legacy docs, updated for focus-v4 —

- **STYLE DNA (photoreal):** *"Cinematic editorial photograph, premium Swiss design sensibility, calm and sophisticated, natural directional light with soft shadows, muted neutral palette with a single cool-blue accent (#0071e3), warm amber interior light against cool dusk exterior, shallow depth of field, full-frame 35mm look, photographed not rendered."*
- **STYLE DNA (illustration):** *"Editorial marketing illustration, flat painted shapes with soft airbrush gradients, Apple feature-page poster style, dark edges blending into pure black #000000, upper third calm for UI overlay, European Netherlands/Germany setting, dignified mood."*
- **GLOBAL NEGATIVES:** *"no text, no watermarks, no logos, no fake security devices, no cameras/CCTV, no US suburbs, no balaclavas or intruders, no neon oversaturation, no Amsterdam-canal cliché."*

---

## 4. Asset-by-asset rebuild inventory

38 files are referenced by the theme today; 57 are orphaned (§6). Rebuild in 7 batches, each independently shippable.

### Batch 1 — Hero product suite (highest impact, LCP-critical)

| Asset | Replaces | Spec | Model / mode |
|---|---|---|---|
| `kevin-hero-product-front` (AVIF/WebP/PNG + @2x) | current CloudFront transparent webp + `kevin-hero-product-front.*` | Transparent cutout, 3/4 front, lit for black stage w/ subtle rim light matching purple/magenta glow; less top-crop than today (audit: device too cropped) | Real reference photo → Adobe remove-bg + grade; **only regenerate if reference photos can't provide the angle** (then Seedream i2i) |
| `kevin-hero-product-side/top/back` refresh | same names | Same treatment, consistent light rig | same |
| **Hero ambient loop** `kevin-hero-loop.{mp4,webm}` (new) | static-only hero | 6–8 s seamless loop, 1080p (4K master), device static, glow breathing + micro light-pulse on fabric; ≤2.5 MB; `autoplay muted loop playsinline`, poster = product still, **disabled under `prefers-reduced-motion` and on `saveData`** | Cinema Studio Video 3.0, i2v, same start/end frame |
| Hero poster/OG `og-home-{en,nl,fr,de,cs}.png` (new) | none (OG falls back to product shot) | 1200×630, product + one-line tagline per locale, black stage | Nano Banana Pro 2k (text-capable) |

### Batch 2 — Problem tiles (3) — `lp-problem.liquid`

`kevin-feature-problem-alarms/cameras/lights` → same names, 4:3, ≤150 KB each. Nano Banana 2 text-to-image (no device, no people): siren reacting too late (empty hallway, red glow), jammed camera (dead feed, matter-of-fact not scary), robotic timer lamp in obviously empty room. Grade-matched set generated in one session.

### Batch 3 — Solution & steps

| Asset | Section | Spec | Model |
|---|---|---|---|
| `kevin-solution-outside-view` (replaces `kevin-hero-shadow-widow-89.webp` in `lp-solution`) | Solution split "from the street" | 3:4 dusk facade, warm occupied window w/ soft silhouette + shifting light, cool street | Nano Banana Pro illustration DNA |
| **Street-view demo clip** `kevin-street-demo.{mp4,webm}` (new, optional block) | Solution split | 8–10 s, fixed camera on that facade, light/shadow variation cycles; sells shadows better than copy (audit gap #3) | Cinema Studio Video 3.0 i2v |
| `kevin-steps-product-side` (replaces `kevin-hero-product-side.webp` in `lp-steps`) | Steps | Device near window, plug visible, hand placing it (plug-and-play story) | Seedream i2i w/ reference |
| 3 step glyphs (new, optional) | Steps timeline | Minimal line icons (plug / calendar / waves), SVG via Adobe `image_vectorize` | Nano Banana Pro → vectorize |

### Batch 4 — App section (6 phone frames) — `lp-app.liquid`

Real app screens re-captured (or Figma-rebuilt) → composited into **AI-generated device-in-hand / on-desk environments** (Seedream i2i: real screenshot pasted into frame, environment generated around it). Dark premium desk surfaces, EU home context. Never generate the UI itself.

### Batch 5 — Personas (3 used + 2 spare) — `lp-personas.liquid`

`kevin-persona-work/alarm-complement/multi-property` + spares (`travel`, `living-alone`) → 4:3 ≤160 KB. Soul 2.0 for people-led scenes (commuter at door with bag; owner arming alarm panel *and* Kevin on sill; two-flats split composition). Use **Soul Cast** to keep one recurring "owner" identity across the set for continuity. Device visible → composite via Seedream i2i pass.

### Batch 6 — Specs & configure

| Asset | Spec | Model |
|---|---|---|
| `kevin-specs-top` (replaces `kevin-hero-product-top.png`, 1.35 MB → ≤200 KB) | Top-down detail: fabric weave + controls, macro light | Reference photo re-grade; Seedream i2i only for angle gaps |
| `lurafi-product-closeup` refresh | Fabric macro w/ blue accent light | same |
| `kevin-front-cover-{grey,white,red,brown,blue}-v3.png` (configure page, 5) | Identical framing/lighting across colors, transparent, ≤120 KB each | One master (reference) → Seedream recolor instruction per colorway → Adobe HSL fine-tune, QA vs. real color chips |
| `kevin-3d.glb` (new, progressive) | `<model-viewer>` on specs/configure, lazy-loaded, poster fallback | SAM 3 3D from white-BG reference |

### Batch 7 — Footer pages, press, brand

Templates (`page.features/how-it-works/the-kevin-app/setup-guide/about-kevin/careers/press/pricing`) reuse Batch 1–6 outputs wherever possible (same scene family = cohesion + fewer credits). Net-new: 1 careers culture image (Soul Cinema), 1 press-kit cover w/ typography (Nano Banana Pro 4k), refreshed `kevin-hero-3d-poster.webp`. Logo/wordmark and favicon are **brand identity — not AI-regenerated**; only re-exported (SVG + crisp PNG sizes) via Adobe vectorize if needed.

---

## 5. Motion & animation upgrades (site-wide, designer/animation track)

Principles: one easing family (`cubic-bezier(0.16,1,0.3,1)`), 200–750 ms, animate opacity/transform only, every effect has a `motion-reduced` and no-JS state (pattern already in `hero.css` — extend it, don't fork it).

1. **Hero:** ambient loop (Batch 1) behind existing copy stagger; glow layers get a 12 s breathing keyframe (CSS only, GPU-composited); trust chips keep 0.4 s entry.
2. **Scroll narrative:** IntersectionObserver-driven reveals already exist — add a **scroll-scrubbed light sweep** on the Solution split (CSS `animation-timeline: view()` with JS fallback): as the section enters, the facade's window light "turns on". This is the single most on-brand animation possible — the product's job, performed by the page.
3. **Problem tiles:** stagger-in + subtle hover parallax (transform: translateY(-4px), shadow deepen) — no new tech.
4. **Steps timeline:** draw-in connector line (`stroke-dashoffset`), numbers count via existing `countup.js`.
5. **App section:** phone frames slide/settle with 3° → 0° rotation; screenshot content cross-fades on carousel advance.
6. **Stats:** existing count-up (zero-flash already fixed in PR #25) + badge shimmer once (never looping).
7. **Configure:** colorway swap cross-fade (150 ms) + device shadow color-matched per colorway.
8. **Performance guardrails:** hero LCP element stays an `<img>` (video is decorative, `preload=none`, poster-first); CLS = 0 via explicit aspect ratios; total added JS < 4 KB (no animation library — CSS + existing observers).

---

## 6. Cleanup (part of Batch 1 PR)

- Delete 57 orphaned assets (incl. five 8–10 MB persona PNGs and duplicate `-v2`/`-polished` variants) — full list generated by `scripts/audit-assets.mjs` (to be added: greps sections/snippets/templates for references, prints orphans).
- Re-encode the 6 retained multi-hundred-KB JPGs to AVIF/WebP.
- Add CI guard: fail theme-check job if any `assets/*.{png,jpg}` > 350 KB or orphaned.

---

## 7. Batches, gates, budget

| Batch | Assets | Est. credits (incl. 3–4 candidates/asset + 2 review rounds) | Gate |
|---|---|---|---|
| 1 Hero suite + loop + OG | 8 img + 1 video | ~320 | Owner approves on preview theme before live |
| 2 Problem tiles | 3 | ~60 | Section screenshot diff |
| 3 Solution/steps + demo clip | 5 + 1 video | ~260 | Owner |
| 4 App frames | 6 | ~120 | Real-UI check (fact-gate) |
| 5 Personas | 5 | ~150 | Owner |
| 6 Specs + colorways + 3D | 8 + 1 GLB | ~180 | Color QA vs. physical chips |
| 7 Footer/press/brand | 4 | ~80 | Owner |
| **Total** | **~40 assets** | **~1,170 of 2,161 available** | 45% headroom |

Execution per batch: 1 session generate → grade → optimize → PR with before/after screenshots → owner approval → deploy to **preview theme** (never straight to live) → Playwright visual QA → publish.

## 8. Acceptance criteria (the "10/10" bar)

- [ ] Zero orphaned or >350 KB raster assets in `assets/`
- [ ] Homepage LCP < 2.0 s (4G moto-mid), CLS = 0, hero video ≤2.5 MB and reduced-motion-safe
- [ ] Every visible image swappable per-locale in Theme Editor (CMS plan rails)
- [ ] One recognizable grade across all sections (side-by-side contact sheet review)
- [ ] Device is pixel-faithful in every frame it appears (reference overlay check)
- [ ] No asset derived from kevinswiss.com; no claims-violating imagery
- [ ] Visual regression suite green at 390/768/1440
