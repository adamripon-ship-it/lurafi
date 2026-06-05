# v0 component prompt — Hero

Build `HeroSection` for Kevin/lurafi landing page.

**Layout:** `min-h-[100dvh]` black background, padding-top for sticky header. Radial glow overlay at 50% 70%.

**Content (centered):**
- Overline: "Swiss presence simulation" — `#64b5ff`, 17px
- H1: "Make Home Look Alive." — white, `clamp(40px,7vw,80px)`, font-semibold
- Lede: muted `#d2d2d7`, max-w-[600px]
- CTAs row: "Buy Kevin" (`#2997ff` pill) + "How it works ›" link

**Product area:** Centered device image with `drop-shadow(0 30px 60px rgba(0,0,0,0.5))`. Max height ~42vh mobile.

**Floating glass cards** (absolute, backdrop-blur, `rgba(29,29,31,0.72)`, border `rgba(255,255,255,0.16)`, radius 18px):
1. Away mode — top-left
2. Privacy — right
3. Checkout — bottom-left (hidden on mobile)

**Scroll indicator:** pill outline with bouncing dot at bottom.

Use Next.js Image, Tailwind, mobile-first. Reference `hero-desktop.png`.
