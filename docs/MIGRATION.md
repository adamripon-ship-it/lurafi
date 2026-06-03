# Migrate lurafi to another Shopify store

**Canonical best-practices plan (new account + lurafi.com + GitHub → Shopify):** [SETUP-NEW-SHOPIFY-ACCOUNT.md](./SETUP-NEW-SHOPIFY-ACCOUNT.md)

**Full phased plan (timeline, QA, risks):** [MIGRATION-PLAN.md](./MIGRATION-PLAN.md)  
**Cloudflare DNS for lurafi.com:** [CLOUDFLARE-DNS.md](./CLOUDFLARE-DNS.md)

This repo is the **Online Store 2.0 theme** for lurafi.ai. Moving to a new Shopify account involves **theme files** (mostly automated from git), **Admin content** (products, subscriptions, pages), **Markets/locales**, and **store settings** (payments, domain, checkout).

## What moves automatically vs manually

| Layer | In this repo? | How to migrate |
|-------|---------------|----------------|
| Theme (Liquid, CSS, JS, locales JSON) | Yes | `scripts/migrate-to-store.sh` or `shopify theme push` |
| Theme settings (product/page handles) | Partial (`config/settings_data.json`) | Push theme; verify in theme editor |
| Utility pages (`configure`, `sitemap`, `llms`) | Script | `./scripts/activate-locales.sh` |
| 12 storefront locales + URL prefixes | Script | Same |
| Product **translations** (NL, FR, DE, …) | Script | Same (requires products below) |
| Products `kevin`, `kevin-plus` | No | Export/import CSV or recreate in Admin |
| Variants (colors), images, pricing | No | Admin or CSV import |
| Kevin+ **selling plans** (subscription) | No | Shopify Subscriptions app on new store |
| Navigation menus | No | Recreate or export from old Admin |
| Markets, shipping, taxes, payments | No | Configure in new Admin |
| Custom domain `lurafi.ai` | No | DNS + connect in new store; remove from old |
| Customers & orders | No | Stay on old store, or Plus transfer / CSV export |
| GitHub deploy secrets | No | New Theme Access token + store hostname |

## Prerequisites

1. **Staff/collaborator access** on the **destination** store (Owner or Themes + Content permissions).
2. **Node 20+** and Shopify CLI (`npm ci` in repo root).
3. Decide migration mode:
   - **Staging first** — push unpublished theme, test on `*.myshopify.com`, then connect domain.
   - **Cutover** — point domain at new store after QA (recommended).

Collect from the new store after first login:

- Store hostname: `YOUR-STORE.myshopify.com`
- Live theme ID (after first push): from `shopify theme list`

## Quick start (theme + i18n)

```bash
export SHOPIFY_STORE="YOUR-STORE.myshopify.com"

# 1. Authenticate (browser opens once)
shopify store auth --store "$SHOPIFY_STORE" \
  --scopes read_themes,write_themes,read_locales,write_locales,read_translations,write_translations,\
read_content,write_content,read_online_store_pages,write_online_store_pages,read_markets,write_markets,read_products

# 2. Run automated migration helper
./scripts/migrate-to-store.sh
```

Or run steps individually:

```bash
npm run locales:build && npm run locales:sync
npm run theme:check
shopify theme push -s "$SHOPIFY_STORE" --unpublished   # safe first push
SHOPIFY_STORE="$SHOPIFY_STORE" ./scripts/activate-locales.sh
```

After QA, publish the theme in **Online Store → Themes**, or:

```bash
shopify theme publish -s "$SHOPIFY_STORE" --theme THEME_ID
```

## Products (required before checkout works)

The theme expects these **handles** (see `config/settings_data.json`):

| Handle | Purpose |
|--------|---------|
| `kevin` | One-time purchase (Kevin device) |
| `kevin-plus` | Device + monthly subscription |

### Create on the new store

1. **Products → Add product** with exact handles above (URL handle in SEO section).
2. Match **variants** used by configure flow (color options: grey, white, burgundy, espresso, navy, etc.).
3. Upload product media (theme also ships placeholder assets under `assets/kevin-*`).
4. For **Kevin+**: install **Shopify Subscriptions** (or your subscription app), attach a **selling plan** to `kevin-plus`. The configure page reads `selling_plan_groups` from the product.

### Bulk copy from old store

1. Old Admin → **Products → Export** (all products).
2. New Admin → **Import** (update handles/prices if needed).
3. Re-upload images if the CSV does not carry files across accounts.
4. Re-create selling plans on `kevin-plus` (plans do not transfer via CSV).

Then re-run locale setup so translations attach:

```bash
SHOPIFY_STORE="$SHOPIFY_STORE" ./scripts/activate-locales.sh
```

## Admin checklist (manual)

- [ ] **Settings → Markets** — primary market currency (CHF), countries
- [ ] **Settings → Languages** — confirm 12 locales published (script does most of this)
- [ ] **Settings → Payments** — Shopify Payments or provider
- [ ] **Settings → Shipping and delivery** — zones and rates
- [ ] **Settings → Taxes** — EU/CH as applicable
- [ ] **Online Store → Navigation** — header/footer menus
- [ ] **Settings → Domains** — add `lurafi.ai` when ready for cutover
- [ ] **Checkout** — branding, policies, contact email (`hello@lurafi.ai`)
- [ ] **Apps** — Subscriptions, analytics, any pixels

## Domain cutover (`lurafi.ai` / `lurafi.com`)

**Cloudflare + `lurafi.com`:** full steps in [CLOUDFLARE-DNS.md](./CLOUDFLARE-DNS.md).

1. On the **new** store: **Settings → Domains → Connect existing** → follow Shopify DNS instructions.
2. In **Cloudflare**, set `@` A and `www` CNAME with **grey cloud (DNS only)** — not orange/proxied.
3. Set **Primary domain** in Shopify.
4. On the **old** store: remove the domain **after** the new store serves correctly.
5. Regenerate GEO assets if the canonical domain or theme CDN path changes:

```bash
npm run geo:generate
shopify theme push -s "$SHOPIFY_STORE" --only "assets/llms*.txt" "assets/sitemap-ai.xml"
```

Update `config/languages.json` → `discovery.assetCdnPath` if the theme ID on CDN changes (path includes `/t/{theme_id}/`).

## Update this repository (optional, after cutover)

If the new store becomes production:

1. `package.json` — `theme:push:live` store + theme ID
2. `AGENTS.md`, `docs/SHOPIFY.md`, `docs/GITHUB-CURSOR.md`
3. GitHub repo secrets: `SHOPIFY_FLAG_STORE`, `SHOPIFY_CLI_THEME_TOKEN` (Theme Access app on **new** store)
4. `.github/workflows/deploy-theme.yml` default `theme_id`

Generate a Theme Access token: new store Admin → **Settings → Apps and sales channels → Develop apps** → create app with `write_themes`, install, copy Admin API access token for CI.

## Verification

```bash
npm run theme:check
node scripts/i18n-browser-qa.mjs   # against preview or live URL
```

Manual smoke test:

- [ ] `https://YOUR-DOMAIN/` (EN homepage)
- [ ] `/nl/`, `/fr/`, `/de/` — language switcher + translated configure URLs
- [ ] `/pages/configure?plan=buy` — add Kevin to cart → checkout
- [ ] `/pages/configure?plan=subscribe` — selling plan visible, checkout
- [ ] `/pages/sitemap`, `/cdn/.../llms.txt`

## Rollback

Keep the old store and theme live until the new store passes QA. To roll back domain: point DNS back to the old Shopify store primary domain settings.

## What Shopify cannot move between arbitrary accounts

- Order history (without Plus org tools or third-party migration apps)
- Installed apps and their data
- Some checkout customizations
- Selling plan definitions (recreate on new store)

For a **full** merchant migration (orders + customers), consider Shopify Plus **store transfer** within the same organization, or apps such as Matrixify / Store Importer — outside the scope of this theme repo.
