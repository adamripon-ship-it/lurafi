# CMS backend provisioning — mitipi.eu

One command sets up the entire Shopify CMS backend so the content team can edit
every section, image, and translation from Shopify Admin. All steps are
**idempotent** — re-running skips anything that already exists.

**Store:** `6mzhe1-yf.myshopify.com` (Mitipi GmbH) · **Theme:** live theme `185079038330`

---

## What it provisions

`scripts/provision-cms.mjs` runs these existing setup scripts in order:

| # | Step | Script | Effect |
|---|------|--------|--------|
| 1 | `metaobjects` | `setup-metaobjects.mjs` | Creates metaobject definitions (`faq_item`, `testimonial`, `spec_row`, `persona`, `press_item`, `trust_badge`) that sections read via `shop.metaobjects.*` with built-in fallbacks. |
| 2 | `i18n` | `activate-locales.sh` → `setup-shopify-i18n.mjs` | Enables + publishes the 5 storefront locales (EN/NL/FR/DE/CS) and registers Admin translations so copy is editable per language in **Translate & Adapt**. |
| 3 | `markets` | `setup-market-countries.mjs --apply` | Markets countries + currencies (CH→CHF, EU→EUR with local currencies e.g. CZ→CZK). |
| 4 | `files` | `upload-assets.mjs` (per `config/files-manifest.json`) | Uploads the content images to **Shopify Files** with alt text, so they're pickable in the Theme Editor. Mirrors the theme-asset fallbacks — nothing changes visually until someone picks a Files image. |
| 5 | `navigation` | `setup-cms-navigation.mjs` | Creates header/footer menus and writes menu handles into the section-group JSON. |
| 6 | `footer-templates` | `build-footer-page-templates.mjs` | Generates `templates/page.*.json` for editorial pages (repo only). |
| 7 | `footer-pages` | `sync-footer-pages.mjs` | Creates/updates the footer editorial pages in Admin. |
| 8 | `audit` | `audit-translations.mjs` | Translation-drift check across the 5 locales (verify, non-fatal). |

Steps **2** and **3** change outward-facing store config (published locales,
currencies) and are flagged `[live store config]` in the logs.

---

## How to run

### Option A — GitHub Actions (recommended, no local setup)

Actions → **Provision CMS backend (manual)** → *Run workflow*:

1. Run first with **mode = `dry`** (default) — preflight + full plan, zero writes. Read the log.
2. Re-run with **mode = `apply`** to execute. Optionally set **steps** to a comma list (e.g. `metaobjects,i18n`) to run a subset.

Uses the same production secrets as the deploy workflow. Metaobject/translation/
file mutations need a token with `write_metaobjects`, `write_translations`,
`write_files`, `write_publications`, `write_content`, and
`write_online_store_navigation` scopes — provide `SHOPIFY_CLIENT_ID` /
`SHOPIFY_CLIENT_SECRET` for a custom app that has them (the admin-gql lib
exchanges these for a scoped Admin token via `client_credentials`).

### Option B — Local CLI

```bash
# .env has SHOPIFY_ADMIN_TOKEN (or SHOPIFY_CLIENT_ID/SECRET) + SHOPIFY_STORE
npm run cms:provision:dry          # preflight + plan, no writes
npm run cms:provision              # execute all steps
node scripts/provision-cms.mjs --apply --only=metaobjects,i18n
node scripts/provision-cms.mjs --apply --skip=markets --keep-going
node scripts/provision-cms.mjs --list
```

---

## After provisioning

- Steps 5–6 can modify repo files (`sections/*-group.json`, `templates/page.*.json`).
  If run locally, commit those and deploy the theme; the CI job runs them in an
  ephemeral checkout, so re-run them locally (or just `cms:navigation` +
  `cms:footer-templates`) to capture the repo changes.
- Deploy the theme so the storefront picks up any group/template changes:
  Actions → **Deploy theme (manual)** (theme `185079038330`).
- Content team can now edit copy per language (Theme Editor + Translate & Adapt),
  swap images (Files), and manage FAQ/testimonials (Content → Metaobjects) — no code.

## Content model (source of truth)

```
Git (structure)                         Shopify Admin (content)
sections/*.liquid { schema }      →      Theme Editor settings, per locale
locales/*.json (build-locales)    →      default copy fallback (blank field = fallback)
metaobject DEFINITIONS            →      metaobject ENTRIES (FAQ, testimonials, …)
config/files-manifest.json        →      Files CDN media (image_picker targets)
```

Blank field in Customize = built-in locale fallback; filled field = per-language
override. Section liquid decodes stored entities before `| escape` (see the
`section-intro` / `lp-audience` / `lp-jammer` decode-guard) so admin-entered copy
can never double-escape.
