# Agent guide — lurafi theme

## Project

Shopify OS 2.0 theme for **lurafi.ai** (Kevin). Store: `fu03cn-1v.myshopify.com`, live theme `196456219011`.

## Before changing code

1. Read `config/languages.json` for locale URLs and handles.
2. Use `{{ 'key' | t }}` with `| t: default:` only when needed for theme-editor fallbacks.
3. Run `npm run locales:build && npm run locales:sync` after locale key changes.

## Deploy

- Theme push: `npm run theme:push:live` or push `locales/*` after JSON changes.
- Admin locales/pages: `./scripts/activate-locales.sh` (not in theme zip).

## GitHub

Use `gh` and `git` with account **adamripon-ship-it**. Open PRs to `main`; do not force-push `main`.

## Do not

- Commit secrets or paste tokens in chat.
- Edit the plan file in `.cursor/plans/`.
- Hardcode EN/NL-only language lists — use `localization.available_languages`.
