# Shopify operations — lurafi.ai

## Store

| Item | Value |
|------|--------|
| Storefront | https://lurafi.ai/ |
| Admin store | `fu03cn-1v.myshopify.com` |
| Live theme ID | `196456219011` |
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
shopify store auth --store fu03cn-1v.myshopify.com \
  --scopes read_themes,write_themes,read_locales,write_locales,read_translations,write_translations,\
read_content,write_content,read_online_store_pages,write_online_store_pages,read_markets,write_markets,read_products
```

## Deploy (recommended flow)

1. Work on a **duplicate theme** in Admin or `shopify theme dev`.
2. `npm run theme:check`
3. Push to live only when ready:

```bash
npm run theme:push:live
# or: shopify theme push -s fu03cn-1v.myshopify.com --theme 196456219011 --allow-live
```

After locale changes, push the whole `locales/` folder:

```bash
shopify theme push ... --only "locales/*"
```

## Multi-language

See [I18N.md](./I18N.md). Admin locale setup:

```bash
./scripts/activate-locales.sh
```

## GitHub Actions

| Workflow | When |
|----------|------|
| **Theme Check** | Every push/PR to `main` |
| **Deploy theme (manual)** | You run it; requires repo secrets |

## What not to commit

- Theme Access passwords / custom app tokens
- `.shopify/` session cache
- `node_modules/`
- QA screenshots under `scripts/qa-screenshots/`

`config/settings_data.json` in this repo only references product/page **handles** (safe to commit).
