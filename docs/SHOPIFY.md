# Shopify operations — mitipi.eu

## Store

| Item | Value |
|------|--------|
| Storefront | https://mitipi.eu/ |
| Admin store | `6mzhe1-yf.myshopify.com` (Mitipi GmbH) |
| Admin URL | https://admin.shopify.com/store/6mzhe1-yf |
| Live theme | **lurafi-deploy** — ID `184679596410` |
| Products | Kevin (buy), Kevin+ (subscribe) |

This repository is the **Online Store 2.0 theme** only. Checkout, Markets, shipping, and payments are configured in Shopify Admin.

## Repository layout (theme)

```
assets/          Static CSS, JS, images, llms*.txt, sitemap-ai.xml
config/          settings_schema.json, settings_data.json, languages.json
layout/          theme.liquid
locales/         Translation JSON (12 languages)
sections/        OS 2.0 sections
snippets/        Reusable Liquid
templates/       JSON templates + page templates
```

Dev scripts under `scripts/` are **not** uploaded to Shopify (see `.shopifyignore`).

## Local setup

```bash
npm ci
# Token auth (recommended): SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET in .env
./scripts/shopify-refresh-admin-token.sh
```

Or interactive CLI auth:

```bash
shopify store auth --store 6mzhe1-yf.myshopify.com \
  --scopes read_themes,write_themes,read_locales,write_locales,read_translations,write_translations,\
read_content,write_content,read_online_store_pages,write_online_store_pages,read_markets,write_markets,read_products
```

## Deploy (recommended flow)

1. Work on a **duplicate theme** in Admin or `shopify theme dev`.
2. `npm run predeploy`
3. Push to live only when ready:

```bash
npm run theme:push:live
# or: shopify theme push -s 6mzhe1-yf.myshopify.com --theme 184679596410 --allow-live
```

After locale changes, push the whole `locales/` folder:

```bash
shopify theme push -s 6mzhe1-yf.myshopify.com --theme 184679596410 --only "locales/*"
```

Post-deploy smoke:

```bash
node scripts/qa-mitipi-backend.mjs
curl -sI https://mitipi.eu/ | head -5
```

## Theme settings (merchant data)

`config/settings_data.json` in git includes product/page **handles** and the **favicon** reference (`shopify://shop_images/kevin-ico.png`). Logo and other Theme Editor images remain merchant-managed in Admin.

## Multi-language

See [I18N.md](./I18N.md). Admin locale setup:

```bash
./scripts/activate-locales.sh
```

## GitHub Actions

| Workflow | When |
|----------|------|
| **Theme Check** | Every push/PR to `main` |
| **Deploy theme (manual)** | You run it; requires repo secrets (`SHOPIFY_FLAG_STORE`, OAuth client or `SHOPIFY_CLI_THEME_TOKEN`) |

Sync secrets: `./scripts/sync-github-deploy-secrets.sh`

## What not to commit

- Theme Access passwords / custom app tokens
- `.shopify/` session cache
- `node_modules/`
- QA screenshots under `scripts/qa-screenshots/`

## Legacy

Previous production used `fu03cn-1v.myshopify.com` (theme `196456219011`) and `lurafi.com` / `lurafi.ai`. Do not deploy this repo to those targets. See [MIGRATION.md](./MIGRATION.md).
