# Shopify Translate & Adapt (optional CMS workflow)

Use **Translate & Adapt** when the content team wants to bulk-update **FR / DE / CS** (or refresh NL) without editing each section manually in five languages.

## When to use

| Approach | Best for |
|----------|----------|
| **Theme Editor per locale** | NL copy that differs from EN; hero/pricing tweaks; image swaps |
| **Translate & Adapt** | Machine-assisted pass over theme locale strings; product/page translations |
| **Git + `locales:translate`** | Developer-led translation refresh (Claude/DeepL scripts) |

## Setup

1. Install [Translate & Adapt](https://apps.shopify.com/translate-and-adapt) from Shopify App Store (free tier available).
2. In the app, enable locales: **en**, **nl**, **fr**, **de**, **cs** (must match [config/languages.json](../config/languages.json)).
3. Choose translation source: manual review recommended for customer-facing marketing copy.

## What it translates

- Theme locale strings (`locales/*.json`) after theme push
- Products, pages, and meta fields registered in Shopify Admin
- Does **not** replace section settings edited in Customize — those are stored per-locale in theme config on Shopify

## Workflow with phased CMS

1. Content team seeds EN (and NL if needed) in **Customize**.
2. Run Translate & Adapt for FR/DE/CS theme strings **or** switch language in Customize and edit manually.
3. Developers run `npm run locales:build` only when syncing Git — see pipeline guard in [I18N-SHOPIFY.md](./I18N-SHOPIFY.md#cms-migration).

## QA after translation

```bash
LURAFI_URL=https://mitipi.eu npm run qa:i18n
```

Check `/nl`, `/fr`, `/de`, `/cs` homepages for English leakage in headlines and CTAs.
