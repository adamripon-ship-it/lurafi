#!/usr/bin/env bash
# Connect to a Shopify store using a Theme Access / Admin API token (no browser OAuth).
#
# Usage:
#   ./scripts/auth-with-token.sh mitipi-2.myshopify.com
#   (reads SHOPIFY_ADMIN_TOKEN from .env if present)
#
# Get token: Dev Dashboard → lurafi → Settings → App automation token
#   or legacy custom app Admin API access token (shpat_...)
#   or Theme Access password (Online Store → Themes)

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib/shopify-env.sh
source "${ROOT}/scripts/lib/shopify-env.sh"

STORE="${1:-${SHOPIFY_STORE:-}}"
shopify_load_dotenv
TOKEN="$(shopify_theme_password)"

if [[ -z "${STORE}" ]]; then
  echo "Usage: SHOPIFY_ADMIN_TOKEN=... $0 mitipi-2.myshopify.com"
  exit 1
fi

STORE="${STORE#https://}"
STORE="${STORE%/}"

if [[ -z "${TOKEN}" ]]; then
  echo -n "Paste Admin API access token (input hidden): "
  read -rs TOKEN
  echo ""
fi

if shopify_token_is_placeholder "${TOKEN}"; then
  echo "Error: no valid token. Use a real shpat_ or atkn_ value, not a placeholder." >&2
  echo "Add to ${ROOT}/.env:" >&2
  echo "  SHOPIFY_STORE=${STORE}" >&2
  echo "  SHOPIFY_ADMIN_TOKEN=paste-your-token-here-once" >&2
  exit 1
fi

echo "Testing token against ${STORE}..."
shopify theme list -s "${STORE}" --password "${TOKEN}"

echo ""
echo "✓ Token works for ${STORE}"
echo ""
echo "Add to local .env (gitignored):"
echo "  SHOPIFY_STORE=${STORE}"
echo "  SHOPIFY_ADMIN_TOKEN=paste-your-token-here-once"
echo ""
echo "Optional alias (same value for theme push):"
echo "  SHOPIFY_THEME_PASSWORD=paste-your-token-here-once"
echo ""
echo "For GitHub Actions (production environment):"
echo "  gh secret set SHOPIFY_CLI_THEME_TOKEN --repo adamripon-ship-it/lurafi --env production"
echo "  gh secret set SHOPIFY_FLAG_STORE --repo adamripon-ship-it/lurafi --env production --body \"${STORE}\""
echo ""
echo "Push theme with:"
echo "  shopify theme push -s ${STORE} --password \"\$SHOPIFY_ADMIN_TOKEN\" --unpublished --theme lurafi-deploy"
