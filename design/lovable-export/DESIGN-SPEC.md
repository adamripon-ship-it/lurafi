# Lurafi (Kevin) — Design Specification

**Exported:** 2026-06-05  
**Live reference:** https://www.lurafi.com  
**Source of truth:** `assets/lurafi.css`, `config/home-en.json`, `sections/*.liquid`

## Brand & positioning

- **Product:** Kevin — Swiss-engineered home presence simulator (light, shadow, sound)
- **Company:** Mitipi GmbH (shop name on storefront)
- **Tone:** Apple.com-inspired — minimal, confident, privacy-first, premium hardware
- **Primary conversion:** Buy Kevin / Configure → `https://www.lurafi.com/pages/configure?plan=buy`

## Design system (Apple-inspired)

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--apple-blue` | `#0071e3` | Primary CTAs on light backgrounds, overlines |
| `--apple-blue-hover` | `#0077ed` | Primary button hover |
| `--apple-blue-dark` | `#2997ff` | CTAs/links on dark backgrounds, hero links |
| `--apple-bg` | `#ffffff` | Page default |
| `--apple-bg-gray` | `#f5f5f7` | Section alt, gray tiles |
| `--apple-bg-dark` | `#000000` | Hero, app section |
| `--apple-bg-card-dark` | `#1d1d1f` | Dark cards, pillar icons |
| `--apple-text` | `#1d1d1f` | Body on light |
| `--apple-text-muted` | `#6e6e73` | Secondary on light |
| `--apple-text-muted-dark` | `#a1a1a6` | Secondary on dark |
| `--apple-text-on-dark` | `#f5f5f7` | Headings on dark |
| `--apple-text-on-dark-muted` | `#d2d2d7` | Body on dark |
| Hero overline | `#64b5ff` | Eyebrow on black hero |

### Typography

- **Font stack:** `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif`
- **Base:** 17px / 1.47059 / -0.022em
- **Headline hero:** `clamp(40px, 7vw, 80px)`, weight 600
- **Headline section:** `clamp(28px, 5vw, 48px)`, weight 600
- **Body elevated:** `clamp(19px, 2.5vw, 28px)` — section subheads
- **Body reduced:** 14px — labels, captions

### Spacing & layout

- **Container:** max 980px (1120px @1280, 1280px @1440, 1440px @1600)
- **Section padding:** `clamp(52px, 8vw, 92px)` vertical
- **Inline padding:** `max(clamp(16px, 4vw, 22px), safe-area)`
- **Spacing scale:** 8 / 16 / 24 / 40 / 64px
- **Touch target min:** 44×44px
- **Breakpoints:** 768px tablet, 1024px desktop, 1280px wide

### Buttons & links

- **Primary (light bg):** `.btn-apple-primary` — blue fill, pill radius 980px, 17px
- **Primary small:** `.btn-apple-primary--sm` — 14px, header CTA
- **Blue on dark:** `.btn-apple-blue` — `#2997ff` fill
- **Secondary:** `.btn-apple-secondary` — blue outline
- **Text link:** `.link-apple-blue` — blue-dark + chevron SVG

### Tiles & cards

- **Radius:** 20px
- **Variants:** gray (`#f5f5f7`), white, dark (`#1d1d1f`)
- **Grids:** 1-col mobile → 2 or 3 cols @768px, gap 12px

## Page structure (homepage)

Order from `templates/index.json`:

1. **Hero** (`hero.liquid`) — full viewport black, product + floating context cards
2. **Problem** (`lp-problem`) — 3 tiles, light bg
3. **Solution** (`lp-solution`) — pillars + image
4. **Steps** (`lp-steps`) — 3 steps + stat row
5. **App** (`lp-app`) — black section, phone carousel + 4 feature tiles
6. **Personas** (`lp-personas`) — 3 persona cards with quotes
7. **Stats** (`lp-stats`) — 4 metrics + badges
8. **Proof** (`lp-proof`) — 3 testimonials
9. **Pricing** (`lp-pricing`) — buy vs subscribe cards
10. **Specs** (`lp-specs`) — spec table
11. **CTA** (`lp-cta`) — final conversion band
12. **Footer** (`footer.liquid`) — 4-column links

## Key components

### Header (`header.liquid`)

- `data-theme="dark"` on hero (transparent over black); frosted light bar after scroll
- **3-zone layout @1440px+:** LURAFI wordmark logo | nav links (flex 1) | utilities
- Logo: `lurafi-logo.png` image (933×256), inverted white on dark header — not text
- **No divider** between logo and nav
- Utilities: language-only selector, Log in (@1440px+), cart, Buy Now
- Mobile/tablet (<1440px): hamburger → slide-in panel with grouped links
- Sticky offset: `--header-offset` accounts for safe area

### Language selector (`language-selector.liquid`)

- **Language only** — no country/currency/region selector (permanent merchant policy)
- Flag labels: 🇬🇧 EN, 🇳🇱 NL, 🇫🇷 FR, 🇩🇪 DE, 🇨🇿 CS
- Pill select: 36px min-height, 999px radius, translucent on dark header
- Mobile: compact pill in header bar; full control also in mobile drawer

### Hero

- Black full-height (`100dvh`), radial glow overlay
- Centered stack: overline → H1 → lede → CTAs
- Product image with drop shadow + 3 glass context cards (Away / Privacy / Checkout)
- Scroll indicator at bottom

### App section

- Black background, blue overline, white H2
- Dual phone mockup carousel (protected + schedule screens)
- 4 tiles below: schedules, geo, sounds, multi-device

### Pricing

- Centered overline + H2 + subhead
- 2-column plan cards (max 760px):
  - **Kevin** — gray tile, CHF 609, primary blue CTA
  - **Kevin+** — dark tile, CHF 13/mo, blue-dark CTA
- Feature lists with ✓ prefix

### Footer

- Disclaimer note (`footer.note`), 4-column link grid (Product, Company, Support, Where to Buy)
- Configure link → `/pages/configure?plan=buy`
- Copyright: `Copyright © {{ year }} {{ shop_name }}. All rights reserved.` (Mitipi GmbH)
- Legal links: Privacy Policy, Terms of Use, optional LLM summary

## Content copy (EN)

Full strings in `config/home-en.json` and `design/lovable-export/content-home-en.json` (copy).

## Assets (public URLs)

| Asset | URL |
|-------|-----|
| Device hero | `https://d2xsxph8kpxj0f.cloudfront.net/310519663143838195/XAqmtb4V6fmS5cL6eq54xv/lurafi-device-angle-transparent-feBmUBJ5mWe9dTyXfTHnUU.webp` |
| App screen 1 | `https://d2xsxph8kpxj0f.cloudfront.net/310519663143838195/XAqmtb4V6fmS5cL6eq54xv/lurafi-app-iphone-mockup-8uNpRd5swi832cYXserPzn.webp` |
| App screen 2 | `https://d2xsxph8kpxj0f.cloudfront.net/310519663143838195/XAqmtb4V6fmS5cL6eq54xv/lurafi-app-schedule-mockup-kyUXBFJHfo5Kk8TJi6rwbt.webp` |

## Screenshots

See `screenshots/`:

- `hero-desktop.png` — hero + header (desktop)
- `hero-mobile.png` — hero (390px)
- `app-section.png` — Kevin App band
- `pricing-section.png` — pricing cards
- `full-page.png` — viewport capture

## Accessibility

- Skip link, semantic landmarks, `aria-labelledby` on sections
- Focus-visible: 2px blue outline
- Min 44px touch targets, 16px+ input font on mobile
- Carousel: `aria-roledescription="carousel"`, prev/next controls

## Responsive rules

- Mobile-first; stack CTAs and grids vertically
- Hero context card "Checkout" hidden on mobile
- Header: mobile Buy + menu; desktop inline nav + CTA
- App phones: carousel on mobile, side-by-side @768px
