# SEO / GEO playbook — mitipi.eu

How mitipi.eu is built to be **understood, retrieved and cited** by search engines and by AI
answer engines (ChatGPT, Perplexity, Gemini, Google AI Overviews / AI Mode, Claude), in all five
storefront languages (en, nl, fr, de, cs). Everything reconciles to one entity model:
`config/entity.json`. Change facts there first, then propagate (see the runbook).

## 1. What the evidence supports (and what it does not)

Only large-sample, dated work from primary sources is used to decide what we build. Vendor blog
posts are cited for numbers only where they publish their sample.

| Finding | Evidence | What we do about it |
| --- | --- | --- |
| Adding **quotations, statistics and cited sources** to a page raises its visibility in generative answers by roughly 30–40%; keyword stuffing performs worse than doing nothing. | GEO benchmark of 10,000 queries (Aggarwal et al., KDD 2024) and its 2026 replications ([Peec.ai statistics](https://peec.ai/ai-search-geo-statistics), [ConvertMate benchmark 2026](https://www.convertmate.io/research/geo-benchmark-2026)). | Every summary opens with the entity, its category and concrete numbers (price, 32 GB, 70+ h, 9 W, 3-year warranty), carries the dated Galaxus quote and the awards, and never repeats keywords. |
| **Off-site brand mentions** are the strongest correlate of appearing in AI answers (r ≈ 0.66 with AI Overview presence); brands are cited far more often through third-party pages than their own. | [Ahrefs 2026 correlation study](https://ahrefs.com/blog/ai-brand-visibility-correlations); AirOps 2025/2026 state-of-AI-search report. | Off-site consistency checklist in §6 (Galaxus, press, kevinswiss.com, marketplaces) all describe Kevin with the same sentence. |
| Answer engines run a **live search first**; crawlability, clear structure, sequential headings and schema correlate with higher citation rates; content **not refreshed quarterly** loses citations; Perplexity favours pages updated in the last 30 days. | [Semrush AI Visibility Index 2026 (126 M prompts)](https://www.semrush.com/news/463141-semrush-releases-expanded-2026-ai-visibility-index-analyzing-126-million-ai-search-prompts/); [OtterlyAI, 1 M+ citations, 2026](https://otterly.ai/blog/the-ai-citations-report-2026/); [Machine Relations citation factors 2026](https://machinerelations.ai/research/ai-search-citation-factors-2026). | Region-coded hreflang clusters, canonical per language, `lastmod` in the AI sitemap from git history, a visible **Content reviewed** date on editorial pages and `dateModified` in schema, question-shaped headings, FAQPage on every page with FAQs. |
| **`llms.txt` does not raise citations**: a 300,000-domain study finds no correlation with AI citations and server logs (500 M AI-bot visits) show almost no requests for it. | [SE Ranking llms.txt study](https://seranking.com/blog/llms-txt/); [Digital Applied adoption data 2026](https://www.digitalapplied.com/blog/llms-txt-in-practice-adoption-evidence-2026). | We keep `llms.txt` / `llms-full.txt` because they are cheap, per-language, and double as the canonical brand summary, **not** because they drive citations. Expect no lift from them alone. |
| **Keywords in the URL slug**: no large-sample study isolates URL tokens as a driver of LLM citations. Retrieval-grounded engines reuse classic web search, where a descriptive slug is a small relevance signal and URL churn is a cost. | Google Search Central guidance on URL structure; absence of contrary evidence in the studies above. | The URL policy (§3) keeps descriptive, language-native slugs with the entity token on product URLs, and forbids repeated renames. It is treated as hygiene, not as a growth lever. |

Never promise placement: answers are non-deterministic; test each prompt several times per engine.

## 2. Entity model

`config/entity.json` is the single source of truth (organization, product, offers, specs, proof,
markets, per-locale handles, `updated` date). It feeds:

- `scripts/generate-llms-assets.mjs` → `assets/llms*.txt` (one short + one full file per language,
  prose from `config/llms/{short,full}.<lang>.md`, URLs and prices from the model).
- `scripts/generate-sitemap-ai.mjs` → `assets/sitemap-ai.xml` (all routes × all locales, full
  region-coded hreflang set, `lastmod` from git).
- `tests/unit/geo-assets.test.mjs` → fails CI when a surface drifts from the model.

Structured data (`snippets/structured-data.liquid`, `structured-data-product.liquid`,
`structured-data-offers.liquid`, FAQPage in `sections/main-editorial-page.liquid` and
`sections/lp-faq.liquid`) mirrors the same facts by hand; the unit test checks the mirrored values.

Graph on every page: `Organization` (Mitipi AG, address, register id, founding date, awards,
`sameAs`) → `WebSite` → `Product` (KEVIN® 3, `@id` shared by the home page and the product page,
one `Offer` per variant with price, availability, free shipping to the checkout markets, 30-day
return policy and 3-year warranty) → `WebPage` (`inLanguage`, `datePublished`, `dateModified`) →
`BreadcrumbList`, plus `FAQPage` wherever FAQ blocks are visible.

## 3. URL naming policy (all languages)

Rules (`config/url-policy.json`, enforced by the unit test):

1. Lowercase ASCII `a-z`, `0-9`, single hyphens; transliterate accents (`é→e`, German `ü→ue`).
2. At most five words. One word = one token a person would type.
3. One canonical URL per language: `https://mitipi.eu[/nl|/fr|/de|/cs]/{pages|products}/{handle}`.
   The prefix comes from Shopify Markets; English has none.
4. **Product handles**: entity token first, then the category term in that language
   (`kevin-presence-simulator`, `kevin-aanwezigheidssimulator`, `kevin-simulateur-de-presence`,
   `kevin-anwesenheitssimulator`, `kevin-simulator-pritomnosti`).
5. **Page handles**: the page topic in that language, no brand prefix, no stopwords
   (`/pages/pricing`, `/nl/pages/prijzen`, `/fr/pages/tarifs`, `/de/pages/preise`, `/cs/pages/ceny`).
   They already comply and were renamed once (see `legacyHandles`); they are not renamed again.
6. Never rename without a 301 from the old path and from every legacy handle. Never rename the
   same URL twice in a year.

Current product URLs violate rule 4 (EN `kevin-plus` is a legacy Kevin+ subscription name; the
other languages carry the category but not the entity token). `npm run url:policy` prints the
plan; `npm run url:policy -- --apply` performs the Shopify changes (handles, translated handles,
redirects) and updates the repo in one go. Run it with Admin credentials, then rebuild and deploy.

## 4. Page metadata rules (per language)

- Title: `{entity} {category or topic}: {concrete benefit or numbers} | Mitipi`, written natively in
  each language, not translated word for word. Titles above ~60 characters are acceptable for
  retrieval but Google truncates them in results; keep the entity and topic in the first 60.
- Description: one or two sentences that answer the page's question with numbers; under ~160
  characters shows in full on Google, longer is fine for LLM extraction.
- Every page has `<html lang>`, one canonical, the full region-coded hreflang cluster with
  `x-default` = English, `og:locale`, `og:image` (theme asset fallback, never the favicon).
- Sources: home `seo.home.*` (locales), editorial pages `config/footer-pages-en.json` +
  `config/i18n/pages-<lang>.json` (pushed with `scripts/sync-page-copy-i18n.mjs`), product
  `config/product-kevin-plus.json` (pushed with `scripts/sync-product-copy.mjs`).

## 5. Runbook

```bash
# 1. facts changed? edit config/entity.json (bump "updated") and the theme setting seo_last_reviewed
# 2. prose changed? edit config/llms/full.en.md and short.en.md, then translate to
#    config/llms/{full,short}.{nl,fr,de,cs}.md (DeepL, glossary: Kevin, Mitipi, KEVIN® 3)
npm run locales:build && npm run locales:sync     # theme strings
npm run geo:generate                              # sitemap-ai.xml + llms*.txt
npm run test:unit                                 # drift guard
npm run theme:check
# Shopify-side (needs admin token): product copy, page copy, URL policy
node scripts/sync-product-copy.mjs --dry-run && node scripts/sync-product-copy.mjs
node scripts/sync-page-copy-i18n.mjs
npm run url:policy && npm run url:policy -- --apply
# live QA (never back-to-back on production, see docs/QA-LEARNINGS.md)
LURAFI_URL=https://mitipi.eu npx playwright test tests/e2e/seo-smoke.spec.js tests/e2e/purchase-flow.spec.js
```

## 6. Off-site consistency checklist

Use the same canonical sentence everywhere (from `config/entity.json`): *KEVIN® 3 is a Swiss presence
simulator by Mitipi AG (Fribourg) that deters burglars by making a home look and sound occupied
with light, patented moving shadows and 70+ hours of household sounds; no camera, no microphone,
keeps working when Wi-Fi is jammed; €579.95 one-time, no subscription.*

- [ ] kevinswiss.com product copy and category label
- [ ] Galaxus and other retailer listings (title, category, description)
- [ ] Press kit boilerplate and award pages
- [ ] LinkedIn / company directories (legal name Mitipi AG, Fribourg, founded 2018)
- [ ] App Store / Google Play descriptions of the Kevin app
- [ ] Wikipedia / Wikidata entity if one exists

## 7. Measurement loop (monthly)

Prompt suite, run three times per engine (ChatGPT search, Perplexity, Gemini, Google AI Mode) in
each language; log mention, citation URL, correctness against the entity model:

1. "best burglar deterrent without a camera" / "presence simulator for home security"
2. "Kevin presence simulator review" / "Mitipi Kevin price"
3. "does Kevin work when Wi-Fi is jammed" / "alternative to a monitored alarm without subscription"
4. "fake occupancy device holiday home" / "TV simulator vs presence simulator"

Fix drift upstream (entity model → site → off-site), re-query, and record the delta here.

## 8. Known open questions (need an owner decision)

1. Support email: footer, contact and press pages use `hello@lurafi.com` / `press@lurafi.com`; the
   machine-readable files use `hello@mitipi.eu`. Confirm the live mailbox and align every surface.
2. Resolved 2026-09-17: live Shopify Markets sell to all 27 EU countries plus CH, LI, NO and IS, so
   the free-shipping claim is correct and now drives `entity.organization.shippingCountries`, the Offer
   `shippingDestination`, `applicableCountry` and Organization `areaServed`. Still open: the theme's
   country selector lists only six countries (`publishedCountries`); decide whether to expose every
   market country.
3. `.cursor/skills/kevin-product-fact-check/SKILL.md` referenced by AGENTS.md does not exist in
   the repository, and kevinswiss.com is not reachable from CI; the product facts here come from
   the site's own published pages (`config/footer-pages-en.json`, `config/product-kevin-plus.json`).

## 9. Live Shopify audit (2026-09-17, Admin API, read-only)

Verified against store `6mzhe1-yf` (primary domain mitipi.eu):

| Area | Live state | Registry / theme | Result |
| --- | --- | --- | --- |
| Locales | en (primary), nl, fr, de, cs published | `config/languages.json` | aligned |
| Live theme | lurafi-footer-pages `185079038330`, role MAIN | `config/live-theme.json` | aligned |
| Markets | European Union (27 countries, local currencies on, EUR base, web presence mitipi.eu + /nl /fr /de /cs), Norway & Iceland (EUR), Switzerland & Liechtenstein (CHF) | `entity.organization.shippingCountries` (31) | aligned after this change |
| Pages | 12 registry pages published with matching template suffixes; nl/fr/de/cs handles, titles, meta titles and descriptions translated | `config/languages.json` pages | aligned |
| Product `kevin-plus` | ACTIVE, one variant `KEVINPLUS-GREY` at 579.95 EUR, translated handle/title/body/meta in nl, fr, de, cs | `config/product-kevin-plus.json`, `entity.product` | aligned |
| Product `kevin-front-cover` | ACTIVE, Red/Brown/Blue/White at 29.95 EUR | `entity.product.covers` | aligned |
| URL redirects | 14 legacy page handles redirect per locale | `config/languages.json` legacyHandles | aligned |

Findings that need an Admin-side action (not performed by the theme repo):

1. Duplicate page `kevin-app` (Page `700492218746`, title "The Kevin App") exists next to `the-kevin-app`
   with the same body. Unpublish it and redirect `/pages/kevin-app` (all locales) to `/pages/the-kevin-app`.
2. `kevin-front-cover` has no SEO title/description and no translations (title, handle). Add cover copy per
   locale (extend `scripts/sync-product-copy.mjs`) before applying the cover targets of the URL policy.
3. `kevin-plus` still carries the product type "AI Presence Simulator Subscription". Set it to
   "Presence simulator" (product type feeds merchant-centre and category signals).
4. `kevin-plus` reports inventory 0 while "continue selling" keeps it purchasable. Confirm this is intended;
   the Offer availability in structured data follows Shopify's `available` flag.
5. Country selector: six countries versus 31 market countries (see open question 2).

