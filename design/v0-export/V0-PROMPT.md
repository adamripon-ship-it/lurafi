# v0 — master prompt

Paste into **v0.dev** (new chat or project). Upload screenshots from `screenshots/` as image context.

---

Create a **Next.js 14 + Tailwind + shadcn/ui** landing page for **Kevin** (lurafi.com) — Swiss home presence simulator by Mitipi GmbH. Visual style: **Apple.com** — clean typography, generous whitespace, pill buttons, black hero, alternating white/gray/black sections.

## Global design tokens

```css
:root {
  --apple-blue: #0071e3;
  --apple-blue-hover: #0077ed;
  --apple-blue-dark: #2997ff;
  --apple-bg: #ffffff;
  --apple-bg-gray: #f5f5f7;
  --apple-text: #1d1d1f;
  --apple-text-muted: #6e6e73;
  --apple-text-on-dark: #f5f5f7;
  --apple-text-on-dark-muted: #d2d2d7;
  --font-apple: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  --touch-min: 44px;
  --container: 980px;
}
```

Typography: base 17px; hero `clamp(40px,7vw,80px)` semibold; section headings `clamp(28px,5vw,48px)`.

## Component architecture

Export as separate components in `components/lurafi/`:

| Component | File | Notes |
|-----------|------|-------|
| SiteHeader | `site-header.tsx` | Dark transparent, nav anchors, lang/country pills, cart, Buy Now |
| HeroSection | `hero-section.tsx` | Full black viewport, product + glass callout cards |
| ProblemSection | `problem-section.tsx` | 3-column tile grid |
| SolutionSection | `solution-section.tsx` | Pillars + image |
| StepsSection | `steps-section.tsx` | Numbered steps + stat counters |
| AppSection | `app-section.tsx` | Black bg, phone carousel, 4 feature tiles |
| PersonasSection | `personas-section.tsx` | 3 quote cards |
| StatsSection | `stats-section.tsx` | Animated count-up metrics |
| ProofSection | `proof-section.tsx` | Testimonial grid |
| PricingSection | `pricing-section.tsx` | Kevin vs Kevin+ plan cards |
| SpecsSection | `specs-section.tsx` | Spec table in rounded card |
| CtaSection | `cta-section.tsx` | Final conversion band |
| SiteFooter | `site-footer.tsx` | 4-column footer |
| LanguageSelector | `language-selector.tsx` | Country + language pill selects |

## Page layout (`app/page.tsx`)

Stack all sections. Section IDs for anchors: `#problem`, `#product`, `#how-it-works`, `#app`, `#pricing`.

## Copy (English)

**Hero**
- Eyebrow: Swiss presence simulation
- Headline: Make Home Look Alive.
- Lede: Kevin uses Swiss-engineered light, shadow, and everyday sound to make your home feel occupied before anyone tests the door.
- CTA: Buy Kevin | How it works

**Pricing**
- Kevin one-time CHF 609.00 — gray card, blue primary button
- Kevin+ subscription CHF 13.00/mo — dark card `#1d1d1f`, blue-dark button

(Full copy in `content-home-en.json`.)

## Images

```tsx
const HERO_DEVICE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143838195/XAqmtb4V6fmS5cL6eq54xv/lurafi-device-angle-transparent-feBmUBJ5mWe9dTyXfTHnUU.webp"
const APP_PHONE_1 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143838195/XAqmtb4V6fmS5cL6eq54xv/lurafi-app-iphone-mockup-8uNpRd5swi832cYXserPzn.webp"
const APP_PHONE_2 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663143838195/XAqmtb4V6fmS5cL6eq54xv/lurafi-app-schedule-mockup-kyUXBFJHfo5Kk8TJi6rwbt.webp"
```

## Responsive

- Mobile-first flex-col layouts
- `md:` 2–3 column grids
- Hero context cards: hide checkout card on mobile
- Header: hamburger drawer below 1024px

## Accessibility

- `focus-visible` blue rings, skip link, aria labels on carousel
- Min 44×44px interactive targets

Match attached screenshots. Start with `SiteHeader` + `HeroSection`.
