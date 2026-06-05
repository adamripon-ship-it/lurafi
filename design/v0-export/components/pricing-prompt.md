# v0 component prompt — Pricing

Build `PricingSection` id="pricing".

**Header:** Blue overline "Pricing", H2 "Choose your security layer.", subhead max-w-[580px] centered muted.

**Grid:** 2 columns @768px, max-w-[760px] centered, gap 12px.

**Card 1 — One-time (gray `#f5f5f7`):**
- Label: ONE-TIME PURCHASE (blue, 12px uppercase)
- Title: Kevin, 28px semibold
- Tagline: Own it forever.
- Price: CHF 609.00, 32px semibold
- Features list with ✓ (7 items from content-home-en.json)
- CTA: full-width `#0071e3` pill "Buy Now"

**Card 2 — Subscription (dark `#1d1d1f`):**
- Label: MONTHLY SUBSCRIPTION (`#2997ff`)
- Title: Kevin+ (white)
- Price: CHF 13.00 (white)
- Features list (7 items)
- CTA: full-width `#2997ff` pill "Subscribe Now"

Cards: `border-radius: 20px`, flex column, equal height. Reference `pricing-section.png`.
