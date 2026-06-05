# Lovable — paste this to start

Copy everything below the line into a **new Lovable project** chat. Attach screenshots from `screenshots/` and import `TOKENS.json` values as CSS variables or Tailwind theme extension.

---

Build a **React + Tailwind** marketing site for **Kevin** by Mitipi GmbH (lurafi.com) — a Swiss-engineered home presence simulator. Match the live site at https://www.lurafi.com exactly in look and feel.

## Design system (Apple-inspired)

Use these tokens (from `TOKENS.json`):

- **Font:** SF Pro / system sans-serif stack
- **Primary blue:** `#0071e3` (light sections), `#2997ff` (dark sections)
- **Backgrounds:** white `#fff`, gray `#f5f5f7`, black `#000`
- **Text:** `#1d1d1f` on light, `#f5f5f7` on dark; muted `#6e6e73` / `#a1a1a6`
- **Container:** max 980px centered, section padding `clamp(52px, 8vw, 92px)`
- **Buttons:** pill-shaped (border-radius 980px), min-height 44px
- **Tiles:** 20px radius, 12px grid gap
- **Breakpoints:** mobile-first, `md:768px`, `lg:1024px`

## Pages to build

Single long-scroll landing page with these sections in order:

1. **Header** — transparent dark theme over hero. Logo "Mitipi GmbH", nav: Why Kevin, Product, How it works, App, Pricing. Right: country selector (Switzerland CHF), language EN, Log in, cart icon, blue "Buy Now" pill.
2. **Hero** — full viewport black. Overline "Swiss presence simulation" in light blue. H1 "Make Home Look Alive." Subhead about Swiss-engineered light/shadow/sound. CTAs: "Buy Kevin" (blue pill) + "How it works" link with chevron. Center product image (wedge speaker device). Three floating glass cards: Away mode, Privacy, Checkout.
3. **Problem** — "Empty is an invitation." 3 gray tiles: Alarms react, Cameras record, Lights are predictable.
4. **Solution** — "Deterrence that feels human." 3 pillars + product image.
5. **Steps** — "Plug in. Set routines. Leave calmly." 3 numbered steps + stats row (60s setup, 1 wire, 100% privacy, 24/7).
6. **App** — black section. "Presence on your schedule." Two iPhone mockups in carousel. 4 tiles: Weekly schedules, Geo-aware, Your own sounds, Multiple places.
7. **Personas** — 3 cards with quotes (travel, alarm complement, multi-property).
8. **Stats** — 97%, 70h+, 9W, 0 cameras — with award badges.
9. **Proof** — 3 testimonials (Zurich, Lyon, Munich).
10. **Pricing** — two cards side by side: Kevin CHF 609 one-time (gray) vs Kevin+ CHF 13/mo subscription (dark card).
11. **Specs** — "Designed to be simple, private, and portable." spec table.
12. **Final CTA** — "Leave without advertising it." Buy + Learn more.
13. **Footer** — 4 columns: Product, Company, Support, Where to Buy. Copyright Mitipi GmbH.

## Copy source

Use exact copy from attached `content-home-en.json`.

## Images

- Hero device: `https://d2xsxph8kpxj0f.cloudfront.net/310519663143838195/XAqmtb4V6fmS5cL6eq54xv/lurafi-device-angle-transparent-feBmUBJ5mWe9dTyXfTHnUU.webp`
- App mockups: iphone-mockup + schedule-mockup URLs in DESIGN-SPEC.md

## UX requirements

- Mobile-first, 48px touch targets, 16px min input font
- Sticky header with scroll theme switch (dark on hero → light below)
- Smooth scroll to anchor sections
- Accessible focus rings, skip link, semantic HTML

## Reference files in repo

- `design/lovable-export/DESIGN-SPEC.md` — full spec
- `design/lovable-export/components/` — React reference components
- `design/lovable-export/screenshots/` — visual reference

Start with Header + Hero. Match the attached `hero-desktop.png` and `hero-mobile.png` screenshots pixel-close.
