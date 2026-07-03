# CMS v2 + Shopify backend plan — mitipi.eu

**Status:** Plan for owner approval · parallel track to [VISUAL-REBUILD-PLAN.md](./VISUAL-REBUILD-PLAN.md) (this doc builds the rails those assets land on)
**Extends:** [CMS-EDITORIAL-WORKFLOW-PLAN.md](./CMS-EDITORIAL-WORKFLOW-PLAN.md), [CMS-ADMIN-SETUP-CHECKLIST.md](./CMS-ADMIN-SETUP-CHECKLIST.md), [CONTENT-TEAM-GUIDE.md](./CONTENT-TEAM-GUIDE.md)
**Store:** `6mzhe1-yf.myshopify.com` (Mitipi GmbH) · live theme `lurafi-deploy`

---

## 1. Goal

The content team updates **any copy, image, or video, in any of the 5 languages, in ≤2 minutes, without a developer** — through Shopify Admin (Theme Editor + metaobjects + Files), with the Shopify MCP as an assistant layer on top. Developers keep Git as the source of truth for *structure* (sections, schemas, defaults); Shopify owns *content*.

```
Git (structure)                    Shopify Admin (content)
sections/*.liquid schemas    →     Theme Editor per-locale settings
locales/* (via build-locales) →    default copy fallbacks
metaobject DEFINITIONS       →     metaobject ENTRIES (personas, FAQs, quotes…)
image_picker settings        →     Files CDN media library
                                   ↑ Shopify MCP: bulk ops, translations, audits
```

**Rule of thumb stays:** blank field in Customize = built-in locale fallback; filled field = per-language override.

---

## 2. Current state → gaps

Already working (from CMS-EDITORIAL-WORKFLOW-PLAN): section settings with `| t` fallbacks, per-locale editing in Customize, header/footer menus, image pickers on 8 sections. PR #25 tightened the fallback chain (index.json overrides blanked → locale files are single source).

| # | Gap | Consequence today |
|---|---|---|
| 1 | 15+ images are **hardcoded `asset_url` fallbacks** (problem tiles, personas, app screenshots, steps/specs/solution) | Image swap = Git commit + deploy |
| 2 | Repeating content (personas, quotes, FAQ, spec rows, press logos) lives in **section settings / locale JSON** | Adding a 4th persona = code change; no reuse on footer pages |
| 3 | No staging discipline in tooling | `theme:push:live` deploys straight to the live theme |
| 4 | Translations split across locale JSON (Git) and Translate & Adapt (Admin) with no audit | Drift (the exact bug fixed in PR #25) can silently return |
| 5 | Files library unorganized, no naming/alt-text convention | Content team can't find the right asset |
| 6 | Video not supported by any section | Visual plan's hero loop / street demo has nowhere to land |

---

## 3. Workstream A — every image & video editable (prereq for visual Batches 1–7)

1. **Shopify Files library convention:** upload via Admin API (`fileCreate`) with names mirroring repo names (`kevin-hero-product-front--v3`), per-locale **alt text set at upload**, one `mitipi-site/` naming prefix per section (`hero--`, `problem--`…). MCP-assisted bulk upload script: `scripts/upload-assets.mjs` (Admin GraphQL, staged uploads).
2. **Section refactor (one PR):** every hardcoded `asset_url` image/video becomes `image_picker` / `video` setting + **theme-asset fallback** (current file stays as default so nothing visually changes at deploy):
   - `lp-problem` 3 tiles, `lp-personas` 3 cards, `lp-app` 6 phones, `lp-steps`, `lp-specs`, `lp-solution` (+ new optional `video` setting for the street-demo clip), `hero` (+ optional `video` setting for the ambient loop, `image` poster).
   - Pattern: `{%- if section.settings.image != blank -%}{{ section.settings.image | image_url: width: 1600 | image_tag: ... }}{%- else -%}<img src="{{ 'fallback.webp' | asset_url }}" ...>{%- endif -%}` with `loading`, `sizes`, explicit width/height (CLS = 0).
3. **Acceptance:** content lead swaps the hero product image and a problem tile on the preview theme without developer help; Playwright suite still green.

## 4. Workstream B — metaobjects for repeating content

Create definitions via Admin API migration script `scripts/setup-metaobjects.mjs` (idempotent, safe to re-run):

| Metaobject | Fields | Renders in |
|---|---|---|
| `persona` | title, body, quote, image (file), sort | `lp-personas` blocks (dynamic source) + footer pages |
| `testimonial` | quote, author, location, sort | `lp-proof` |
| `faq_item` | question, answer (rich text), sort | new `lp-faq` section + `llms.txt` generation input |
| `spec_row` | label, value, sort | `lp-specs` |
| `press_item` | outlet, logo (file), url, quote | new press strip below hero (audit Week 2 #9) |
| `trust_badge` | label, icon (file), sort | `lp-stats` badges, hero trust chips |

Sections read entries through **dynamic sources / `shop.metaobjects`**, keeping current hardcoded content as fallback when no entries exist (zero-risk rollout). All metaobject fields are translatable in **Translate & Adapt** — one place for the content team to localize repeating content.

## 5. Workstream C — translation & content ops

1. **Keep Git pipeline for defaults** (`locales:build`/`locales:sync` + CI check) — it is the safety net that guarantees no "Translation missing".
2. **Translate & Adapt** owns per-locale *overrides* (section settings, metaobjects, menus).
3. **Drift audit script** `scripts/audit-translations.mjs` (Shopify MCP/Admin `translatableResources` GraphQL): reports untranslated overrides per locale; runs weekly via CI cron, posts summary to the repo issue.
4. **MCP assistant layer (the "easy content updates via Shopify MCP" ask):** documented recipes in CONTENT-TEAM-GUIDE for driving updates through Claude + Shopify MCP, e.g. *"update the FR hero headline"* → `graphql_mutation translationsRegister`, *"swap the persona image"* → `fileCreate` + metaobject update, *"how did last week's sales do"* → `run-analytics-query`. Guardrail: MCP writes go to the **preview theme/draft entries** first; publishing stays a human click.

## 6. Workstream D — backend / integration hardening

| Item | Action |
|---|---|
| **Staging discipline** | `theme:push:preview` (unpublished theme) becomes the default; `theme:publish:live` requires `--yes-live` flag; GitHub Action deploys `main` → preview theme automatically, publish stays manual |
| **CI** | Extend theme-check workflow: asset-size guard (VISUAL plan §6), Playwright visual regression on preview theme URL, translation drift audit |
| **Products** | Colorway images (Batch 6) attached to variants via `productSet`; configure page reads variant media instead of hardcoded `kevin-front-cover-*` assets |
| **Pricing tiers** | Decision needed: rent/subscription tier (kevinswiss parity — audit revenue gap). If yes: selling plan via `shopify:commerce:setup`, pricing section gets second plan card (schema already supports blocks) |
| **Analytics** | ShopifyQL weekly report (sessions → configure → checkout funnel) via MCP `run-analytics-query`; wire conversion events for CTA clicks (`cart-api.js` already centralizes) |
| **SEO/AEO** | `llms.txt` + sitemap generation reads FAQ/persona metaobjects so AI-visible content stays in sync with the CMS automatically (`geo:generate` extension) |
| **Access** | Re-authorize Shopify MCP connector (token expired); content team gets `Themes + Files + Translations` staff permissions only |

## 7. Sequencing (parallel with visual batches)

| Week | CMS/backend | Visual rebuild (other track) |
|---|---|---|
| 1 | A: section refactor to pickers + Files conventions + upload script | Batch 1 hero suite (lands on A's rails) |
| 2 | B: metaobject definitions + personas/testimonials/spec rows migration; D: preview-theme CI | Batches 2–3 |
| 3 | B: FAQ + press metaobjects (new sections); C: drift audit + MCP recipes | Batches 4–5 |
| 4 | D: variant media, analytics report, pricing-tier decision; C: content-team training on new flow | Batches 6–7 + cleanup |

## 8. Acceptance criteria

- [ ] Content lead performs, unassisted, in Admin: hero headline change (NL), hero image swap, persona added, FAQ added, spec row edited, press logo added — each live in <5 min via preview → publish
- [ ] Zero hardcoded content images in liquid (fallbacks only)
- [ ] Translation drift audit green for 5 locales
- [ ] `main` auto-deploys to preview theme; live publish is manual + logged
- [ ] Shopify MCP recipes documented and tested for the 5 most common content tasks
