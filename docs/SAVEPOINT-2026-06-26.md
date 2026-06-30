# Save point — 2026-06-26 (mitipi.eu live sync)

Use this to restore the theme codebase and redeploy the version that matched **live mitipi.eu** after the GitHub sync on **26 June 2026**.

## Labels (for the team)

| Field | Value |
|-------|--------|
| **Name** | `2026-06-26-mitipi-live-sync` |
| **Git tag** | `savepoint/2026-06-26-mitipi-live-sync` |
| **Backup branch** | `backup/2026-06-26-mitipi-live-sync` |
| **Commit** | `20aa6d8d50a0a2b3ab2ad258a22d3d596281db34` |
| **GitHub** | https://github.com/adamripon-ship-it/lurafi/commit/20aa6d8 |
| **Repo** | `adamripon-ship-it/lurafi` |
| **Live site** | https://mitipi.eu |
| **Shopify store** | `6mzhe1-yf.myshopify.com` (Mitipi GmbH) |
| **Live theme** | `lurafi-deploy` — ID `184679596410` |
| **Last commit message** | `feat(cms): navigation menus and per-locale editor UX (#20)` |
| **Theme package version** | `2.1.0` (`package.json`) |

## What this save point includes

- Full OS 2.0 theme on `main` at the commit above
- CMS navigation + per-locale Theme Editor UX (PR #20)
- Locales: en, nl, fr, de, cs
- Verified in sync with live Shopify theme on 2026-06-26 (61 code files exact match)

## What it does **not** include

- Shopify Admin data (products, menus, prices, checkout) — restore separately in Admin
- Local `.env` secrets — never in git
- Unmerged branch `fix/qa-playwright-stability` (QA script tweaks only)

## Restore code only (local)

```bash
git fetch origin
git checkout savepoint/2026-06-26-mitipi-live-sync
# or
git checkout backup/2026-06-26-mitipi-live-sync
npm ci
npm run predeploy
```

## Restore live mitipi.eu from this save point

```bash
git checkout savepoint/2026-06-26-mitipi-live-sync
npm ci
npm run predeploy
npm run theme:push:live
```

Confirm: `node scripts/qa-mitipi-backend.mjs` and `curl -sI https://mitipi.eu/ | head -5`

## Create a working branch from this save point

```bash
git fetch origin
git checkout -b restore/from-2026-06-26 savepoint/2026-06-26-mitipi-live-sync
```

## Related docs

- [QA-LEARNINGS.md](./QA-LEARNINGS.md) — do not run `qa:full` back-to-back on production
- [ACCESS-SETUP.md](./ACCESS-SETUP.md) — GitHub + Shopify credentials
