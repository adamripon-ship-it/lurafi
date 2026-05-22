# Contributing — Lurafi Shopify theme

Production storefront: [lurafi.ai](https://lurafi.ai/). This repo is the **theme only** (not Shopify Admin).

## Workflow

1. Branch from `main`: `git checkout -b fix/short-description`
2. Edit theme files; run checks locally:

   ```bash
   npm ci
   npm run locales:build
   npm run locales:sync
   npm run theme:check
   ```

3. Open a PR → **Theme Check** must pass on GitHub.
4. Merge to `main` → deploy with `npm run theme:push:live` or the manual **Deploy theme** Action.

Do **not** push untested changes directly to live without CI green.

## Locales

- Source of truth for EN/NL copy: `scripts/build-locales.mjs`
- Registry: `config/languages.json`
- After adding keys: `npm run locales:build && npm run locales:sync`
- Machine translation: `npm run locales:translate` (optional `DEEPL_API_KEY`)

## Shopify

- Never commit `.env`, Theme Access passwords, or `.shopify/` cache.
- Test on a **duplicate theme** when changing layout or checkout-adjacent UI.
- See [docs/SHOPIFY.md](docs/SHOPIFY.md) and [docs/I18N.md](docs/I18N.md).

## GitHub

See [docs/GITHUB-CURSOR.md](docs/GITHUB-CURSOR.md). `main` is protected: PR + `theme-check` required.
