# Repository Audit

**Date:** 2026-06-19  
**Scope:** Factual inventory of `/Users/adam/lurafi` based only on files and directories opened or executed during this audit.  
**Repository identity:** Shopify Online Store 2.0 theme (`lurafi-theme` v2.1.0) for lurafi.ai — not an application backend with an AI document pipeline.

---

## 1. Directory tree (depth 3)

Excluded from listing: `node_modules/`, `.next/`, `dist/`, and `.git/` object internals.  
All paths below were verified to exist on disk unless marked otherwise.

```
lurafi/                              ✓ EXISTS
├── .claude/                         ✓ EXISTS
├── .cursor/                         ✓ EXISTS
│   ├── remote-check-afc637/         ✓ EXISTS
│   │   ├── layout/                  ✓ EXISTS
│   │   └── sections/                ✓ EXISTS
│   └── rules/                       ✓ EXISTS
├── .github/                         ✓ EXISTS
│   └── workflows/                   ✓ EXISTS
├── assets/                          ✓ EXISTS
├── config/                          ✓ EXISTS
├── design/                          ✓ EXISTS
│   ├── lovable-export/              ✓ EXISTS
│   │   ├── components/              ✓ EXISTS
│   │   └── screenshots/             ✓ EXISTS
│   └── v0-export/                   ✓ EXISTS
│       ├── components/              ✓ EXISTS
│       └── screenshots/             ✓ EXISTS
├── docs/                            ✓ EXISTS
├── layout/                          ✓ EXISTS
├── locales/                         ✓ EXISTS
├── scripts/                         ✓ EXISTS
│   ├── data/                        ✓ EXISTS
│   ├── i18n/                        ✓ EXISTS
│   ├── lib/                         ✓ EXISTS
│   └── qa-screenshots/              ✓ EXISTS
│       ├── audit/                   ✓ EXISTS
│       └── i18n/                    ✓ EXISTS
├── sections/                        ✓ EXISTS
├── snippets/                        ✓ EXISTS
├── templates/                       ✓ EXISTS
│   └── customers/                   ✓ EXISTS
└── tests/                           ✓ EXISTS
    └── e2e/                         ✓ EXISTS
```

**Also present at repo root (depth 1, not expanded):** `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, `SECURITY.md`, `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `playwright.config.js`, `.env.example`, `.shopifyignore`, `.theme-check.yml`, `.nvmrc`, `.editorconfig`.

**Excluded directories that exist but were omitted from the tree:** `node_modules/` (present).  
**Excluded directories that do not exist:** `.next/`, `dist/`.

**Not present at repo root:** `src/`, `app/`, `api/`, `services/`, `functions/`, `backend/`, `packages/` (beyond empty pnpm workspace config), `firestore.rules`, `storage.rules`, `pyproject.toml`, `requirements.txt`, `Makefile`, `CLAUDE.md`.

---

## 2. Runtime language reality

| Artifact | Present? | Notes |
|----------|----------|-------|
| `pyproject.toml` | **No** | Not found anywhere in repo |
| `requirements.txt` | **No** | Not found anywhere in repo |
| FastAPI / Python service | **No** | Zero `*.py` files found |
| TypeScript / JavaScript | **Yes** | Primary runtime for tooling and theme JS |

**Actual stack (from `README.md`, `package.json`, file inventory):**

- **Liquid** — theme sections, snippets, layouts, templates
- **JavaScript (ES modules)** — `assets/*.js`, `scripts/*.mjs`, `tests/e2e/*.spec.js`
- **JSON** — Shopify theme config, locales, templates
- **Shell** — `scripts/*.sh`
- **TypeScript (reference only)** — four `.tsx` files under `design/lovable-export/components/` and `design/v0-export/components/`; not part of deployed theme runtime

**LangGraph:**

| Package | Present? |
|---------|----------|
| Python `langgraph` | **No** — no matches in any file; no Python project |
| JS `@langchain/langgraph` | **No** — not in `package.json` or `package-lock.json` |

**Vertex AI / Firebase / Firestore:** No matches for `vertex`, `firebase`, `firestore`, or `langgraph` anywhere in the repository.

**Conclusion:** This repo is a **Node.js + Liquid Shopify theme**. There is **no Python service**, **no FastAPI**, and **no LangGraph** (Python or JS).

---

## 3. Seven-step pipeline (Upload → Extraction → Compliance Score → Chat Edit → Generation → Token Check → Export)

Searched repository for pipeline step names and related terms (`upload`, `extraction`, `compliance`, `chat edit`, `generation`, `token check`, `export`, `langgraph`, `vertex`). No implementation of this pipeline was found.

| Step | Status | Implementing file(s) |
|------|--------|----------------------|
| 1. Upload | **NOT FOUND** | — |
| 2. Extraction | **NOT FOUND** | — |
| 3. Compliance Score | **NOT FOUND** | — |
| 4. Chat Edit | **NOT FOUND** | — |
| 5. Generation | **NOT FOUND** | — |
| 6. Token Check | **NOT FOUND** | — |
| 7. Export | **NOT FOUND** | — |

**Closest unrelated matches (not this pipeline):**

- `scripts/push-live-theme.mjs` — uploads theme asset files to Shopify via Admin API (theme deploy, not document upload).
- `scripts/claude-translate.mjs` — locale translation via Claude API (i18n, not chat-edit pipeline).
- `design/lovable-export/`, `design/v0-export/` — static design reference exports for external tools.
- `docs/I18N.md` — mentions a "translation pipeline" for locales only.

---

## 4. Firestore / Storage security

| File | Present? |
|------|----------|
| `firestore.rules` | **No** |
| `storage.rules` | **No** |

No Firebase configuration files (`firebase.json`, `.firebaserc`) were found.

**Per-user isolation:** **None in this repository.** There is no Firestore or Firebase Storage layer in this codebase. Customer data and checkout are handled by Shopify (see `assets/configure-v2.js` redirect to `/cart/...?checkout` and Playwright smoke tests targeting Shopify checkout URLs).

---

## 5. Token / payment logic

### What "token" means in this repo

All token references found relate to **Shopify Admin API OAuth tokens**, not user credit/billing tokens:

| Location | Behavior |
|----------|----------|
| `scripts/lib/shopify-admin-gql.mjs` | Reads `SHOPIFY_ADMIN_TOKEN` / CLI tokens; refreshes via client-credentials OAuth; writes refreshed token back to `.env` |
| `scripts/shopify-refresh-admin-token.sh` | Shell wrapper to refresh and persist `SHOPIFY_ADMIN_TOKEN` |
| `scripts/sync-github-deploy-secrets.sh` | Pushes token to GitHub Actions secret `SHOPIFY_CLI_THEME_TOKEN` |
| `.github/workflows/deploy-theme.yml` | Resolves access token at deploy time (client credentials or secret fallback) |

### Payment / checkout

| Location | Behavior |
|----------|----------|
| `assets/configure-v2.js` | Builds cart URL and redirects to Shopify native checkout (`?checkout`); tracks `begin_checkout` analytics event |
| `assets/cart-api.js`, `assets/product-form.js` | Shopify cart interactions |
| `tests/e2e/checkout-smoke.spec.js` | E2E smoke for configure → Shopify checkout and PDP → cart → checkout |

**User credit token deduction:** **NOT FOUND.** No atomic or idempotent token-ledger, Stripe billing integration, or usage-metering code exists in this repository. Payment is delegated to Shopify Checkout.

**Atomicity / idempotency of Admin token refresh:** Token refresh in `shopify-admin-gql.mjs` is a single OAuth POST followed by a file write to `.env`. There is no transaction, idempotency key, or distributed lock. Retries on 401 re-fetch a new token once (`retry = false` on second attempt).

---

## 6. Vertex AI usage

**NOT FOUND.**

- No Vertex AI SDK imports or initialization in any file.
- No model name constants (e.g. `gemini-*`, `text-bison`) in codebase.
- No chat memory persistence to a database — no chat feature or AI memory layer exists in this theme repo.

**Related but distinct:** `scripts/claude-translate.mjs` uses the Claude API for locale translation (opened via grep reference; not Vertex AI). `assets/llms*.txt` and `scripts/generate-llms-assets.mjs` generate static LLM-discovery text files for SEO/GEO — not conversational AI memory.

---

## 7. Reconciliation: `CLAUDE.md` and `.cursor/rules/*.mdc` vs real tree

### `CLAUDE.md`

**NOT FOUND** anywhere in the repository.

The closest agent guide is **`AGENTS.md`** at repo root (Shopify theme instructions: locales, deploy, store IDs). Content describes a Shopify theme workflow, consistent with the actual tree — not an AI pipeline app.

### `.cursor/rules/*.mdc` files (4 total)

| File | `globs:` field | Reconciliation |
|------|----------------|----------------|
| `.cursor/rules/github-full-access.mdc` | *(none)* | N/A |
| `.cursor/rules/vercel-full-access.mdc` | *(none)* | N/A — rule correctly states no `.vercel/project.json` in this repo |
| `.cursor/rules/shopify-mcp.mdc` | `scripts/**/*`, `**/*.{liquid,json}` | Both patterns match existing paths/files (`scripts/` dir; liquid files in `layout/`, `sections/`, `snippets/`, `templates/`; json in `config/`, `locales/`, `templates/`, `sections/`) |
| `.cursor/rules/no-country-selector.mdc` | `snippets/language-selector.liquid`, `sections/header.liquid`, `assets/language-selector.js`, `scripts/build-locales.mjs`, `scripts/qa-commerce-debug.mjs` | **All five paths exist** |

### `globs:` values pointing at non-existent paths

**None.** Every explicit file path in `globs:` exists. Pattern globs (`scripts/**/*`, `**/*.{liquid,json}`) match existing directories and file types.

### Content mismatches (factual, not glob-related)

- `AGENTS.md` line 5 references store `fu03cn-1v.myshopify.com` and theme `196456219011`; `package.json` `theme:push:live` and `.cursor/rules/shopify-mcp.mdc` reference store `6mzhe1-yf.myshopify.com` and theme `184679596410`. Both store IDs appear in docs — ambiguous which is canonical live target without runtime verification.
- `vercel-full-access.mdc` applies Vercel deploy guidance; README and AGENTS.md confirm this repo is **not** a Vercel-linked project.

---

## 8. Build / test commands

Sources read: `package.json`, `.github/workflows/theme-check.yml`, `.github/workflows/deploy-theme.yml`, `playwright.config.js`.  
**No `Makefile` or `pyproject.toml` exists.**

Node engine: `>=20` (`.nvmrc` specifies `20`).

### Commands verified working during this audit (exit code 0)

| Command | Result |
|---------|--------|
| `npm run locales:build` | Wrote 449 locale keys; injected locale route map |
| `npm run locales:sync` | Synced missing keys (1 change in `nl.json`) |
| `npm run theme:check` | Shopify Theme Check passed with 4 warnings (no errors) |
| `npm run predeploy` | Ran `locales:build` + `locales:sync` + `theme:check` successfully |
| `npm run cms:seed:dry` | Dry-run CMS seed summary printed |
| `npm run geo:generate` | Wrote `assets/sitemap-ai.xml` and `assets/llms*.txt` files |

### Commands present but not fully verified / require external deps

| Command | Requirement | Audit result |
|---------|-------------|--------------|
| `npm run test:e2e` | Playwright browsers + live `LURAFI_URL` (default `https://www.lurafi.com`) | **Failed locally:** 6/6 tests failed — Playwright browser executable missing (`npx playwright install` required). Test file and config are present. |
| `npm run test:e2e:live` | Same as above with explicit live URL | Not run |
| `npm run theme:push:live` | Shopify CLI + live store credentials | Not run (would mutate live theme) |
| `npm run shopify:*` scripts | `.env` with Shopify tokens / OAuth | Not run |
| `npm run qa:*` scripts | Network access to production/staging URLs | Not run |
| `npm run locales:translate*` | Translation API provider credentials | Not run |

### CI workflows (`.github/workflows/`)

| Workflow | Trigger | Steps |
|----------|---------|-------|
| `theme-check.yml` | push/PR to `main` | `npm ci` → `locales:build` → `locales:sync` → `theme:check` |
| `deploy-theme.yml` | manual `workflow_dispatch` | `npm ci` → resolve Shopify token → `shopify theme push --allow-live` |

### Full `package.json` scripts inventory

```
theme:check, theme:push:live, locales:build, locales:sync, locales:translate,
locales:translate:claude, locales:translate:customers, predeploy, geo:generate,
cms:seed, cms:seed:dry, shopify:locales, shopify:markets:countries,
shopify:refresh-token, shopify:sync-github-secrets, shopify:publish:mitipi,
shopify:products:migrate, shopify:commerce:setup, shopify:approve-scopes,
qa:full, qa:mitipi, qa:mitipi:backend, qa:mitipi:browser, qa:mitipi:audit,
qa:i18n, qa:language, test:e2e, test:e2e:live
```

Install command used by CI: `npm ci` (not `pnpm`, despite presence of `pnpm-lock.yaml` and minimal `pnpm-workspace.yaml`).

---

## Summary

This repository is a **Shopify OS 2.0 storefront theme** with Node.js tooling for locales, QA, and deployment. The seven-step AI pipeline (Upload → Export), LangGraph, Vertex AI, Firestore/Storage rules, and user token billing logic **do not exist in this codebase**. Audit items 3–6 are uniformly **NOT FOUND** except for unrelated Shopify OAuth tokens and native Shopify checkout payment flow.
