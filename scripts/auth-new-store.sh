#!/usr/bin/env bash
# Authenticate Shopify CLI to a NEW store (not the old fu03cn-1v production store).
#
# Usage:
#   ./scripts/auth-new-store.sh your-new-store.myshopify.com
#   SHOPIFY_STORE=your-new-store.myshopify.com ./scripts/auth-new-store.sh
#
# Opens your browser once — approve access for the lurafi theme migration scopes.

set -euo pipefail

OLD_STORE="${OLD_SHOPIFY_STORE:-fu03cn-1v.myshopify.com}"
STORE="${1:-${SHOPIFY_STORE:-}}"

SCOPES="read_themes,write_themes,read_locales,write_locales,read_translations,write_translations,read_content,write_content,read_online_store_pages,write_online_store_pages,read_markets,write_markets,read_products"

if [[ -z "${STORE}" ]]; then
  echo "Usage: $0 YOUR-NEW-STORE.myshopify.com"
  echo ""
  echo "Example:"
  echo "  $0 lurafi-prod.myshopify.com"
  echo ""
  echo "Find your store URL: Shopify Admin → Settings → Domains (ends in .myshopify.com)"
  exit 1
fi

# Normalize: strip https:// and trailing slash
STORE="${STORE#https://}"
STORE="${STORE%/}"
if [[ "${STORE}" != *".myshopify.com" ]]; then
  echo "Error: expected a *.myshopify.com hostname, got: ${STORE}"
  exit 1
fi

if [[ "${STORE}" == "${OLD_STORE}" ]]; then
  echo "Error: ${STORE} is the OLD production store."
  echo "Pass your NEW account's myshopify.com hostname instead."
  exit 1
fi

echo "=== Shopify CLI auth → NEW store ==="
echo "  Store:  ${STORE}"
echo "  Old:    ${OLD_STORE} (unchanged — still in CLI config if previously authed)"
echo ""
echo "Before continuing:"
echo "  1. Log into https://${STORE}/admin with the account that OWNS this store"
echo "  2. If you use adam.ripon@surfstr.com, add it under Settings → Users and permissions"
echo "  3. If browser shows 'Unauthorized Access', run: shopify auth logout && shopify auth login"
echo "     then re-run this script while logged into the correct Shopify account"
echo ""
echo "Alternative (no browser): SHOPIFY_ADMIN_TOKEN=shpat_... ./scripts/auth-with-token.sh ${STORE}"
echo ""
echo "A browser window will open. Log in to the NEW Shopify account and approve."
echo ""

shopify store auth --store "${STORE}" --scopes "${SCOPES}"

echo ""
echo "Verifying connection..."
shopify theme list -s "${STORE}"

echo ""
echo "✓ Connected to ${STORE}"
echo ""
echo "Next:"
echo "  export SHOPIFY_STORE=${STORE}"
echo "  echo 'SHOPIFY_STORE=${STORE}' >> .env   # optional, gitignored"
echo "  ./scripts/verify-access.sh"
