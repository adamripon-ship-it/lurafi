# Lurafi Shopify theme

Kevin presence-simulator storefront for [lurafi.ai](https://lurafi.ai) — Shopify Online Store 2.0 theme with 12-locale i18n (Markets + theme locales).

## Stack

- Shopify theme (Liquid, JSON templates)
- Native multi-language via Shopify Markets (`/nl/`, `/fr/`, `/de/`, …)
- Theme strings: `locales/*.json`
- Registry: `config/languages.json`

## Docs

See [docs/I18N.md](docs/I18N.md) for locale build, Admin setup, and QA.

## Local scripts

```bash
node scripts/build-locales.mjs
node scripts/translate-locales.mjs    # optional: DEEPL_API_KEY
./scripts/activate-locales.sh
node scripts/i18n-browser-qa.mjs
```

## Deploy theme

```bash
shopify theme push -s fu03cn-1v.myshopify.com --theme 196456219011 --allow-live
```

Do not commit Shopify CLI tokens or `.env` files.
