# Lurafi — Shopify theme (mitipi.eu)

[![Theme Check](https://github.com/adamripon-ship-it/lurafi/actions/workflows/theme-check.yml/badge.svg)](https://github.com/adamripon-ship-it/lurafi/actions/workflows/theme-check.yml)

Shopify Online Store 2.0 theme for **[mitipi.eu](https://mitipi.eu/)** — Kevin Swiss presence simulator (Mitipi GmbH).

## Stack

- **Shopify** Markets + native translations (12 locales, subfolder URLs)
- **Liquid** sections/snippets, JSON templates
- **Theme locales** — `locales/*.json` (see `config/languages.json`)
- **Node scripts** — locale build, GEO assets, QA (not deployed to the theme)

## Quick start

```bash
npm ci
npm run theme:check
npm run locales:build
```

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/SHOPIFY.md](docs/SHOPIFY.md) | Store IDs, deploy flow, repo layout |
| [docs/I18N.md](docs/I18N.md) | Locales, Markets, translation pipeline |
| [docs/QA-LEARNINGS.md](docs/QA-LEARNINGS.md) | Production QA guardrails |

## Deploy to production

Store: `6mzhe1-yf.myshopify.com` · Live theme: **lurafi-deploy** `184679596410`

```bash
npm run theme:push:live
```

Or use GitHub Actions → **Deploy theme (manual)** after adding repository secrets (see [docs/SHOPIFY.md](docs/SHOPIFY.md)).

Post-deploy smoke (lightweight — do not hammer production):

```bash
node scripts/qa-mitipi-backend.mjs
curl -sI https://mitipi.eu/ | head -5
```

## Branching

- `main` — production-aligned theme (matches live after deploy)
- Use PRs; CI runs Theme Check on every pull request
- See [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md)

## Before deploy

```bash
npm run predeploy
```

## License

Proprietary — Lurafi / Kevin / Mitipi GmbH. All rights reserved.
