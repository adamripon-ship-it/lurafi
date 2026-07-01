# Shopify operations — mitipi.eu

## Store

| Item | Value |
|------|--------|
| Storefront | https://mitipi.eu/ |
| Admin store | `6mzhe1-yf.myshopify.com` (Mitipi GmbH) |
| Admin URL | https://admin.shopify.com/store/6mzhe1-yf |
| Live theme | **lurafi-footer-pages** — ID `185079038330` (see `config/live-theme.json`) |
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
npm run theme:deploy:live
# alias: npm run theme:push:live
```

This script (`scripts/deploy-theme-live.sh`):

1. Reads **theme ID from `config/live-theme.json`** (single source of truth)
2. Pushes files to that theme
3. **Republishes** and **busts homepage page cache** via Admin API (`themeFilesUpsert` on `templates/index.json` + `themePublish`)
4. Verifies https://mitipi.eu/ serves the expected theme + HTML markers

After a partial push only, republish + cache bust + verify without re-uploading everything:

```bash
npm run theme:publish:live
npm run theme:verify:live
```

Homepage cache still stale after publish? Run the dedicated bust script:

```bash
npm run theme:cache:bust
```

Partial push (still republishes + verifies):

```bash
./scripts/deploy-theme-live.sh --only "sections/hero.liquid"
```

After locale-only changes:

```bash
./scripts/deploy-theme-live.sh --only "locales/*"
```

Post-deploy smoke:

```bash
node scripts/qa-mitipi-backend.mjs
npm run theme:verify:live
curl -sI https://mitipi.eu/ | head -5
```

### Why republish + cache bust?

Shopify caches rendered homepage HTML (`etag: page_cache:…`). `theme push` and CLI `theme publish` update theme files but **do not always invalidate** that cache. The deploy script calls `scripts/bust-homepage-page-cache.mjs`, which uses Admin GraphQL `themeFilesUpsert` (same effect as Theme Editor → Save on `templates/index.json`) plus `themePublish` to force a fresh homepage render.

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
