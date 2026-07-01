# Agent guide — lurafi theme

## Project

Shopify OS 2.0 theme for **mitipi.eu** (Kevin presence simulator, Mitipi GmbH).

## Before changing code

1. Read `config/languages.json` for locale URLs and handles.
2. Use `{{ 'key' | t }}` with `| t: default:` only when needed for theme-editor fallbacks.
3. Run `npm run locales:build && npm run locales:sync` after locale key changes.
4. **Product fact-check (mandatory):** For any customer-facing copy change, read and complete `.cursor/skills/kevin-product-fact-check/SKILL.md` — cross-check against https://kevinswiss.com before finishing. See `.cursor/rules/mitipi-product-fact-check.mdc`.

## Deploy

- Store: `6mzhe1-yf.myshopify.com` (Mitipi GmbH; primary domain **`https://mitipi.eu`**). Admin: `https://admin.shopify.com/store/6mzhe1-yf`. Live theme: **lurafi-footer-pages** `185079038330`. Refresh API token: `./scripts/shopify-refresh-admin-token.sh` (uses `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET` in `.env`; auto-runs from scripts when token expires). Do not use `mitipi-2.myshopify.com` for API/OAuth (alias only).
- **QA on production:** Do not run `qa:full` back-to-back on mitipi.eu (≥30 min between runs). Post-deploy: `node scripts/qa-mitipi-backend.mjs` + `curl -sI https://mitipi.eu/`. See [docs/QA-LEARNINGS.md](./docs/QA-LEARNINGS.md) and [docs/INCIDENT-2026-06-24.md](./docs/INCIDENT-2026-06-24.md).
- Theme push: `npm run theme:deploy:live` (or `theme:push:live`) — reads `config/live-theme.json`, republishes to bust page cache, verifies mitipi.eu. After partial pushes only: `npm run theme:publish:live`.
- Admin locales/pages: `./scripts/activate-locales.sh` (not in theme zip).
- Products: `node scripts/migrate-products-from-lurafi.mjs` (needs `write_products` on lurafi app) or import `scripts/data/products-import.csv` in Admin → Products → Import.
- **Access checklist (GitHub / Shopify / Cloudflare):** [ACCESS-SETUP.md](./ACCESS-SETUP.md) · `./scripts/verify-access.sh`.
- Migration quick reference: [MIGRATION.md](./MIGRATION.md) · Cloudflare: [CLOUDFLARE-DNS.md](./CLOUDFLARE-DNS.md) · `./scripts/migrate-to-store.sh`.
- GitHub Actions deploy secrets: `./scripts/sync-github-deploy-secrets.sh` → environment **production** (see `.github/workflows/deploy-theme.yml`).
- **Shopify MCP (Option A):** docs/schema only — [Marketplace](https://cursor.com/marketplace/shopify) or `.cursor/mcp.json`; see `docs/SHOPIFY-MCP.md`. Call `learn_shopify_api` first; pass `conversationId` on every `shopify-dev-mcp` tool. `OPT_OUT_INSTRUMENTATION=true` is set in repo config.

## Legacy stores (do not deploy here)

- `fu03cn-1v.myshopify.com` — old lurafi production (theme `196456219011`)
- `lurafi.com` / `lurafi.ai` — previous domains; see migration docs

## GitHub

Use `gh` and `git` with account **adamripon-ship-it**. Open PRs to `main`; do not force-push `main`.

## Vercel

Use the Vercel MCP plugin and `npx vercel` with team **adamripon-6504s-projects** — see `.cursor/rules/vercel-full-access.mdc`. Do not deploy this Shopify theme to Vercel unless asked.

## Do not

- Commit secrets or paste tokens in chat.
- Edit the plan file in `.cursor/plans/`.
- Hardcode EN/NL-only language lists — use `localization.available_languages`.
