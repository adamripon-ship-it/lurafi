# mitipi.eu — URL architecture & hreflang (Phase 1)

_Audited 2026-09-15 against the live storefront (theme 185079038330) and the Shopify Admin API._

## Target languages and markets (identified from the live site)

| Locale | Shopify locale | URL prefix | Markets served (mitipi.eu web presence) |
|---|---|---|---|
| English (primary, x-default) | `en` | `/` | European Union, Switzerland, Norway & Iceland |
| Dutch | `nl` | `/nl/` | European Union (NL, BE) |
| French | `fr` | `/fr/` | European Union (FR, BE, LU), Switzerland |
| German | `de` | `/de/` | European Union (DE, AT), Switzerland, Liechtenstein |
| Czech | `cs` | `/cs/` | European Union (CZ) |

All five locales are published on one web presence (mitipi.eu, locale subfolders). Markets: `european-union` (EUR), `ch` (CHF, primary market), `norway-iceland` (EUR).

## Audit findings (before)

1. **Two competing hreflang sets on every page.** Shopify emits a correct language-level set from `content_for_header` (translated handles, no region codes). The theme's own `snippets/seo-hreflang.liquid` emitted a second set with two defects: a double slash for the primary locale (`https://mitipi.eu//pages/features`) and the *current* page's translated handle reused for every locale (`/nl/pages/kevin-konfigurieren` on the German configure page). Those URLs either redirect or 404, which invalidates the cluster for Google.
2. **No region codes and no bidirectional region coverage.** Only `en, nl, fr, de, cs` + `x-default`.
3. **Canonical ≠ localized slug on the theme's set** (canonical was correct, the theme's alternate links were not).
4. **Slugs with English/brand words in non-English paths:** `/nl/pages/kevin-functies`, `/nl/pages/kevin-configureren`, `/de/pages/kevin-konfigurieren`, `/de/pages/kevin-app-de`, `/fr/pages/configurer-kevin`, `/cs/pages/konfigurovat-kevin`, `/de/pages/presse-1`, `/cs/pages/kontakt-1`, `/fr/pages/contact` (untranslated handle), plus `/products/kevin-plus` untranslated in all locales.
5. **Product page not translated at all** (title, description, meta) in nl/de/fr/cs.
6. **No meta titles/descriptions** on any page in any locale (Shopify page SEO fields empty; only the homepage has a theme-level title/description).

## Platform constraints (Shopify)

- `/pages/` and `/products/` path segments are fixed by Shopify and cannot be translated or removed. Handles (the last segment) can be translated per locale via Translate & Adapt / `translationsRegister`.
- Locale subfolders (`/de/`) are the only option on one domain; subdomains are not used (constraint 5 satisfied).
- Shopify's automatic hreflang tags are always emitted; the theme adds region-qualified tags and an `x-default` that point at the same localized URLs (identical URLs for several regions are allowed by Google).

## Recommended URL structure (keyword slugs, no brand words, hyphenated, lowercase)

| Page | en (x-default) | nl | fr | de | cs |
|---|---|---|---|---|---|
| Home | `/` | `/nl/` | `/fr/` | `/de/` | `/cs/` |
| Configure & buy | `/pages/configure` | `/nl/pages/configureren` | `/fr/pages/configurer` | `/de/pages/konfigurieren` | `/cs/pages/konfigurace` |
| Features | `/pages/features` | `/nl/pages/functies` | `/fr/pages/fonctionnalites` | `/de/pages/funktionen` | `/cs/pages/funkce` |
| How it works | `/pages/how-it-works` | `/nl/pages/hoe-het-werkt` | `/fr/pages/comment-ca-marche` | `/de/pages/so-funktionierts` | `/cs/pages/jak-to-funguje` |
| App | `/pages/the-kevin-app` | `/nl/pages/mobiele-app` | `/fr/pages/application-mobile` | `/de/pages/app` | `/cs/pages/mobilni-aplikace` |
| Pricing | `/pages/pricing` | `/nl/pages/prijzen` | `/fr/pages/tarifs` | `/de/pages/preise` | `/cs/pages/ceny` |
| About | `/pages/about-kevin` | `/nl/pages/over-ons` | `/fr/pages/a-propos` | `/de/pages/ueber-uns` | `/cs/pages/o-nas` |
| Press | `/pages/press` | `/nl/pages/pers` | `/fr/pages/presse` | `/de/pages/presse-medien` | `/cs/pages/tisk` |
| Careers | `/pages/careers` | `/nl/pages/vacatures` | `/fr/pages/carrieres` | `/de/pages/karriere` | `/cs/pages/kariera` |
| Setup guide | `/pages/setup-guide` | `/nl/pages/installatie` | `/fr/pages/guide-installation` | `/de/pages/einrichtung` | `/cs/pages/navod` |
| Contact | `/pages/contact` | `/nl/pages/contact-opnemen` | `/fr/pages/contact` | `/de/pages/kontakt` | `/cs/pages/kontaktujte-nas` |
| Product | `/products/kevin-plus` | `/nl/products/aanwezigheidssimulator` | `/fr/products/simulateur-de-presence` | `/de/products/anwesenheitssimulator` | `/cs/products/simulator-pritomnosti` |

Notes: "Kevin" is the product brand and is removed from every slug. The English page handles `about-kevin`, `the-kevin-app` and the product handle `kevin-plus` are kept as-is on the primary locale because changing primary handles would change the canonical of every localized page at once; they are candidates for a later migration with 301s (`/pages/about`, `/pages/app`, `/products/presence-simulator`).

**Every slug change ships with a 301 redirect** from the old localized URL (Shopify URL redirects) so existing links keep working.

## Hreflang cluster (bidirectional, identical on every page of the cluster)

Region codes are ISO 3166-1 alpha-2; languages are ISO 639-1. Every page in the cluster emits the same full set, so A→B always implies B→A. `x-default` is the English primary URL.

```html
<!-- Core page: configure & buy. Emitted identically on all five localized URLs. -->
<link rel="canonical" href="https://mitipi.eu/pages/configure">
<link rel="alternate" hreflang="x-default" href="https://mitipi.eu/pages/configure">
<link rel="alternate" hreflang="en"     href="https://mitipi.eu/pages/configure">
<link rel="alternate" hreflang="en-IE"  href="https://mitipi.eu/pages/configure">
<link rel="alternate" hreflang="en-CH"  href="https://mitipi.eu/pages/configure">
<link rel="alternate" hreflang="en-NO"  href="https://mitipi.eu/pages/configure">
<link rel="alternate" hreflang="en-IS"  href="https://mitipi.eu/pages/configure">
<link rel="alternate" hreflang="nl"     href="https://mitipi.eu/nl/pages/configureren">
<link rel="alternate" hreflang="nl-NL"  href="https://mitipi.eu/nl/pages/configureren">
<link rel="alternate" hreflang="nl-BE"  href="https://mitipi.eu/nl/pages/configureren">
<link rel="alternate" hreflang="fr"     href="https://mitipi.eu/fr/pages/configurer">
<link rel="alternate" hreflang="fr-FR"  href="https://mitipi.eu/fr/pages/configurer">
<link rel="alternate" hreflang="fr-BE"  href="https://mitipi.eu/fr/pages/configurer">
<link rel="alternate" hreflang="fr-CH"  href="https://mitipi.eu/fr/pages/configurer">
<link rel="alternate" hreflang="fr-LU"  href="https://mitipi.eu/fr/pages/configurer">
<link rel="alternate" hreflang="de"     href="https://mitipi.eu/de/pages/konfigurieren">
<link rel="alternate" hreflang="de-DE"  href="https://mitipi.eu/de/pages/konfigurieren">
<link rel="alternate" hreflang="de-AT"  href="https://mitipi.eu/de/pages/konfigurieren">
<link rel="alternate" hreflang="de-CH"  href="https://mitipi.eu/de/pages/konfigurieren">
<link rel="alternate" hreflang="de-LI"  href="https://mitipi.eu/de/pages/konfigurieren">
<link rel="alternate" hreflang="cs"     href="https://mitipi.eu/cs/pages/konfigurace">
<link rel="alternate" hreflang="cs-CZ"  href="https://mitipi.eu/cs/pages/konfigurace">
```

On the German page the `<link rel="canonical">` is `https://mitipi.eu/de/pages/konfigurieren` and the alternate set above is repeated verbatim (constraint 1 and 2).

## Implementation in this repo

- `config/languages.json` is the single source of truth for per-locale handles. `scripts/build-locales.mjs` now also generates `snippets/seo-locale-routes.liquid` (a Liquid map of handle → localized handle) and the region list, so `snippets/seo-hreflang.liquid` can emit the cluster above without redirects and without the double-slash bug.
- Translated handles and 301 redirects are pushed to Shopify by `scripts/sync-locale-handles.mjs` (idempotent; reads `config/languages.json`).
- Page and product SEO titles/descriptions per locale are set by `scripts/sync-page-seo.mjs` from `config/seo.json`.

## GEO / AI-search notes

- Slugs carry the primary keyword of each locale (presence simulator / Anwesenheitssimulator / aanwezigheidssimulator / simulateur de présence / simulátor přítomnosti) where a page has one.
- `llms.txt` / `llms-full.txt` are already exposed per locale; the sitemap-ai.xml lists all localized URLs and is regenerated by `npm run geo:generate` after handle changes.


## Implementation status (2026-09-15)

Implemented and live:

- `snippets/seo-hreflang.liquid` rewritten: resolves the current page/product to each locale's translated handle via the generated route table `snippets/seo-locale-routes.liquid` (built by `scripts/build-locales.mjs` from `config/languages.json`), emits language + region codes per locale (`hreflang` arrays in `config/languages.json`) and `x-default` = English. Double-slash bug and wrong-slug bug fixed.
- Translated page handles changed to keyword slugs (see table above) via `scripts/sync-page-copy-i18n.mjs`; 301 redirects created for every previous localized handle (`legacyHandles` in `config/languages.json`).
- Product `kevin-plus` handle translated per locale via `scripts/sync-product-copy.mjs`.
- Page meta title/description set in EN (`global.title_tag` / `global.description_tag` metafields) and translated for NL/DE/FR/CS.
- Homepage `<title>` and meta description per locale from `locales/*.json` `seo.home`.
