#!/usr/bin/env bash
# Connect to a Shopify store using a Theme Access / Admin API token (no browser OAuth).
#
# Usage:
#   SHOPIFY_ADMIN_TOKEN=shpat_xxx ./scripts/auth-with-token.sh mitipi-2.myshopify.com
#   ./scripts/auth-with-token.sh mitipi-2.myshopify.com   # prompts securely if token not in env
#
# Get token: New store Admin → Settings → Apps → Develop apps → create app
#   Scopes: read_themes, write_themes (+ read/write locales, translations, content, pages, markets, products for i18n script)
#   Install app → reveal Admin API access token once.

set -euo pipefail

STORE="${1:-${SHOPIFY_STORE:-}}"
TOKEN="${SHOPIFY_ADMIN_TOKEN:-${SHOPIFY_CLI_THEME_TOKEN:-}}"

if [[ -z "${STORE}" ]]; then
  echo "Usage: SHOPIFY_ADMIN_TOKEN=shpat_... $0 mitipi-2.myshopify.com"
  exit 1
fi

STORE="${STORE#https://}"
STORE="${STORE%/}"

if [[ -z "${TOKEN}" ]]; then
  echo -n "Paste Admin API access token (input hidden): "
  read -rs TOKEN
  echo ""
fi

if [[ -z "${TOKEN}" ]]; then
  echo "Error: no token provided."
  exit 1
fi

echo "Testing token against ${STORE}..."
shopify theme list -s "${STORE}" --password "${TOKEN}"

echo ""
echo "✓ Token works for ${STORE}"
echo ""
echo "Add to local .env (gitignored):"
echo "  SHOPIFY_STORE=${STORE}"
echo "  SHOPIFY_ADMIN_TOKEN=<your-token>"
echo ""
echo "For GitHub Actions (production environment):"
echo "  gh secret set SHOPIFY_CLI_THEME_TOKEN --repo adamripon-ship-it/lurafi --env production"
echo "  gh secret set SHOPIFY_FLAG_STORE --repo adamripon-ship-it/lurafi --env production --body \"${STORE}\""
echo ""
echo "Push theme with:"
echo "  shopify theme push -s ${STORE} --password \"\$SHOPIFY_ADMIN_TOKEN\" --unpublished"
