# v0 component prompt — Header

Build `SiteHeader` — Apple-style sticky nav for lurafi.com.

**Theme:** `data-theme="dark"` — transparent background over black hero. White logo, muted nav links `#d2d2d7`, hover white.

**Desktop (1024px+):** CSS grid: logo | divider line | nav links | flex spacer | utilities.

**Nav links:** Why Kevin, Product, How it works, App, Pricing — anchor hrefs to `/#problem`, `/#product`, etc.

**Utilities (right):**
- Country select pill: "Switzerland (CHF)" — translucent `rgba(255,255,255,0.1)`, 12px font, 999px radius
- Language select: "EN"
- Log in link (hidden on small mobile)
- Cart icon button with count badge
- "Buy Now" — `btn-apple-primary--sm`, `#0071e3`, 14px

**Mobile:** Logo + EN selector + Buy pill + cart + hamburger. Slide-in panel with grouped links (Explore, Buy, Support).

Min touch target 44px. Reference `hero-desktop.png` header.
