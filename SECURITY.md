# Security

## Reporting

Email **hello@lurafi.ai** with subject `Security — Lurafi theme`. Do not open public issues for undisclosed vulnerabilities.

## Secrets

Never commit:

- Shopify Admin API tokens or Theme Access passwords
- `DEEPL_API_KEY` or other translation API keys
- `.env` files
- Customer or order data exports

Use GitHub Actions secrets for CI deploy (`SHOPIFY_CLI_THEME_TOKEN`, `SHOPIFY_FLAG_STORE`).

## Live store

Production: [lurafi.ai](https://lurafi.ai/) on Shopify store `fu03cn-1v.myshopify.com`. Deploy via `./scripts/deploy-live.sh` or the manual **Deploy theme** GitHub Action.
