# Shopify i18n (Lurafi theme)

## Source of truth

| Layer | Location | Purpose |
|-------|----------|---------|
| Homepage copy (EN) | `config/home-en.json` | Canonical English strings for `home.*` locale keys |
| Theme locales | `locales/en.default.json`, `locales/nl.json`, … | Storefront `{{ 'key' | t }}` strings |
| Theme template | `templates/index.json` | Empty text settings — do **not** store English here |
| Markets / pages | `config/languages.json` | Published locales, translated page handles, product copy |
| Admin API | `scripts/setup-shopify-i18n.mjs` | Publish locales, markets web presence, page/product translations |

Run after locale or `config/languages.json` changes:

```bash
npm run locales:build && npm run locales:sync
./scripts/activate-locales.sh
npm run theme:push:live
./scripts/publish-lurafi-live.sh   # if lurafi-deploy is not the active live theme
```

## Liquid pattern (sections)

Never pipe `section.settings` through `| t` when the setting holds English placeholder text.

```liquid
{%- if section.settings.heading != blank -%}
  {{ section.settings.heading }}
{%- else -%}
  {{ 'home.problem.heading' | t }}
{%- endif -%}
```

Merchant overrides in the theme editor show the setting value as-is; blank settings fall back to locale keys.

## build-locales.mjs

`npm run locales:build` merges `config/home-en.json` into `en.home.*` and only applies **non-empty** overrides from `templates/index.json`. Empty index settings must not wipe locale files.

## Published locales

From `config/languages.json`: **en**, **nl**, **fr**, **de**, **cs**. Hreflang and the language selector filter `localization.available_languages` using the CSV injected by `locales:build` into `layout/theme.liquid` and related snippets.
