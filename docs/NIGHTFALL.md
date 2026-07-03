# Nightfall — homepage design system notes

**Shipped:** 2026-07 (PRs #26, #27 + phase-3 cleanup) · **Scope:** homepage only

## What it is

The homepage runs on the hero's dark stage (near-black gradient, kevin
purple/magenta/pink glow accents) with **zero content images** — the hero
product photo is the only image on the page, enforced by an e2e assertion
(`#MainContent img` ≤ 1 in `tests/e2e/hero-banner-qa.spec.js`). All other
visuals are CSS: glyph tiles, the scroll-scrubbed window motif, the activity
ticker, the phone frame, signal animations.

## How the scoping works (don't break this)

- `assets/nightfall.css` is loaded by `layout/theme.liquid` **only when**
  `request.page_type == 'index' and show_configure == false`, and the same
  condition adds class `nightfall` to `<body>`.
- Every rule in nightfall.css is prefixed `body.nightfall`. Configure, cart,
  editorial, and footer pages are therefore untouched twice over.
- Inside the scope, the `--apple-*` design tokens are redefined so the light
  system re-themes itself; only hardcoded hexes get explicit overrides.
- `assets/header.js` keeps the header `data-theme="dark"` on nightfall pages
  (class-guarded — other pages keep the light-bar flip).

## Scroll animation

- Modern browsers: CSS `animation-timeline: scroll()/view()` (hero drift +
  mechanism window scrub). One 0..1 timeline; phase segments live inside the
  keyframes.
- Fallback (Safari, older): `assets/scroll-fx.js` writes `--nf-progress`
  into paused keyframes; rAF armed only while targets intersect.
- Reduced motion / no-JS: static designed end-states everywhere. The resting
  state of every keyframe equals the visible base state — nothing on the page
  waits for JS.

## Editing content (content team)

Same contract as always: Theme Editor → pick language → edit section fields;
**blank field = built-in translation** from the locale files. New sections
(Mechanism, Jammer story, Authority) follow it. Copy sources of truth:
`config/home-en.json` (EN), `nlHome` in `scripts/build-locales.mjs` (NL),
`locales/{fr,de,cs}.json` (hand-translated). Run
`npm run locales:build && npm run locales:sync` after editing sources.

## Editorial claims policy

Every marketing claim must be traceable to product documentation or a cited,
linked source (the Galaxus Kevin.3 review is the only third-party quote in
use, attributed in the Authority section and FAQ). No invented ratings,
awards, or endorsements — the unverified "award-winning" badge was removed
deliberately. Police/97% statistics remain banned per `config/brandscript.json`.

## Adding a section

1. Create `sections/lp-<name>.liquid`: `section-apple` class, copy via
   `home.<id>.*` locale fallbacks, reuse stagger wrappers (`.tile-grid-2/3`,
   `.stats-grid-4`, `.cta-row`) so the reveal system animates it.
2. Add the copy block to `config/home-en.json` + `nlHome` + FR/DE/CS files.
3. Wire it into `templates/index.json` (settings shipped as `""`).
4. Style it in nightfall.css under `body.nightfall`.
5. Extend the e2e spec; keep the image-free guarantee intact.
