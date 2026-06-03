# Agent guide — lurafi theme

## Project

Shopify OS 2.0 theme for **lurafi.ai** (Kevin). Store: `fu03cn-1v.myshopify.com`, live theme `196456219011`.

## Before changing code

1. Read `config/languages.json` for locale URLs and handles.
2. Use `{{ 'key' | t }}` with `| t: default:` only when needed for theme-editor fallbacks.
3. Run `npm run locales:build && npm run locales:sync` after locale key changes.

## Deploy

- Store: `mitipi-2.myshopify.com` (migration target). Refresh API token: `./scripts/shopify-refresh-admin-token.sh` (uses `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET` in `.env`; auto-runs from scripts when token expires).
- Theme push: `npm run theme:push:live` or push `locales/*` after JSON changes.
- Admin locales/pages: `./scripts/activate-locales.sh` (not in theme zip).
- Products: `node scripts/migrate-products-from-lurafi.mjs` (needs `write_products` on lurafi app) or import `scripts/data/products-import.csv` in Admin → Products → Import.
- Shopify MCP: call `learn_shopify_api` (api: `admin` or `use-shopify-cli`) before other `user-shopify-dev-mcp` tools; pass returned `conversationId` on every call.

## GitHub

Use `gh` and `git` with account **adamripon-ship-it**. Open PRs to `main`; do not force-push `main`.

## Vercel

Use the Vercel MCP plugin and `npx vercel` with team **adamripon-6504s-projects** — see `.cursor/rules/vercel-full-access.mdc`. Do not deploy this Shopify theme to Vercel unless asked.

## Do not

- Commit secrets or paste tokens in chat.
- Edit the plan file in `.cursor/plans/`.
- Hardcode EN/NL-only language lists — use `localization.available_languages`.
