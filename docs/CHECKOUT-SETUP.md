# Checkout setup — mitipi.eu

Shopify is the **only** checkout path. The theme never processes payments; it adds line items to the Shopify cart and sends users to hosted checkout (`/checkout` → Shop Pay / `/checkouts/...`).

## Flow

| Step | Where | What happens |
|------|--------|--------------|
| Configure | `/pages/configure?plan=buy` | `configure-v2.js` reads `#ConfigureData`, user picks color |
| Add + checkout | `LurafiCart.addAndCheckout` in `assets/cart-api.js` | `POST /cart/clear.js` → `POST /cart/add.js` → `window.location = /checkout` |
| PDP path | `/products/kevin` | Standard Shopify cart + drawer → checkout button |
| Hosted checkout | Shopify / Shop Pay | Payment, shipping, tax — all in Admin |

Subscribe UI is **disabled** on configure (buy-only). `kevin-plus` + selling plans exist in Admin for future use.

## Required Admin state

1. **Product `kevin`** — 5 color variants (Grey, White, Burgundy, Espresso, Navy), €649, published to Online Store
2. **Product `kevin-plus`** — published (subscription path)
3. **Theme setting** `product_buy` = `kevin` (not `kevin-plus`)
4. **Selling plan** on `kevin-plus` — `npm run shopify:commerce:setup`
5. **Payments + shipping** — configured in Admin → Settings (manual verify)

## One-command repair

After migration, token refresh, or “checkout broken” reports:

```bash
npm run shopify:checkout:ensure
```

This script:

- Creates `kevin` if missing (5 variants)
- Publishes products to Online Store
- Sets live theme `product_buy` → `kevin` and republishes (cache bust)
- Runs `shopify:commerce:setup` + `qa-mitipi-backend.mjs`

## Verify locally

```bash
node scripts/qa-mitipi-backend.mjs          # Admin API checklist
curl -s https://mitipi.eu/products/kevin.json | jq '.product.variants | length'  # expect 5
LURAFI_URL=https://mitipi.eu npx playwright test tests/e2e/checkout-smoke.spec.js
```

**Production QA:** Do not run `qa:full` back-to-back on mitipi.eu — wait ≥30 minutes between full Playwright suites ([QA-LEARNINGS.md](./QA-LEARNINGS.md)).

## Common failures

| Symptom | Cause | Fix |
|---------|--------|-----|
| Configure CTA does nothing / “invalid variant” | Missing `kevin` or preview variant IDs in HTML | `npm run shopify:checkout:ensure` |
| Wrong product in cart | Live theme `product_buy` = `kevin-plus` | Ensure script or Theme Editor → `product_buy` |
| `/checkout` 404 or empty cart | Cart session / Cloudflare challenge | Retry in browser; avoid hammering with Playwright |
| E2E fails on `shop.app` | Shop Pay redirect (normal) | Smoke test accepts `shop.app/checkout` and `/checkouts/` |

## Key files

- `sections/main-configure.liquid` — `#ConfigureData` JSON
- `assets/configure-v2.js` — buy-only UI
- `assets/cart-api.js` — `LurafiCart.addAndCheckout`
- `config/settings_data.json` — repo default `product_buy: kevin`
- `scripts/ensure-checkout-ready.mjs` — automated repair
- `tests/e2e/checkout-smoke.spec.js` — critical path E2E
