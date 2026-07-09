#!/usr/bin/env bash
# Open Shopify OAuth so 6mzhe1-yf (lurafi.com) approves lurafi app scopes.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib/shopify-env.sh
source "${ROOT}/scripts/lib/shopify-env.sh"
shopify_load_dotenv

STORE="${SHOPIFY_STORE:-6mzhe1-yf.myshopify.com}"
STORE="${STORE#https://}"
STORE="${STORE%/}"
CLIENT_ID="${SHOPIFY_CLIENT_ID:-}"

if [[ -z "${CLIENT_ID}" ]]; then
  echo "Set SHOPIFY_CLIENT_ID in .env (Dev Dashboard → lurafi → Settings)." >&2
  exit 1
fi

# Scopes this repo needs (comma-separated, no spaces).
# The metaobjects / files / navigation scopes are required by the CMS
# provisioning workflow (scripts/provision-cms.mjs) — without them the
# metaobjects, files, and navigation steps fail with access denied.
SCOPES="read_products,write_products,read_themes,write_themes,read_locales,write_locales,read_translations,write_translations,read_content,write_content,read_online_store_pages,write_online_store_pages,read_markets,write_markets,write_inventory,read_inventory,read_metaobjects,write_metaobjects,read_metaobject_definitions,write_metaobject_definitions,read_files,write_files,read_online_store_navigation,write_online_store_navigation"

# Must match a redirect URL on the active app version. fullaccess uses example.com — fix in Dev Dashboard when you can.
REDIRECT_URI="${SHOPIFY_OAUTH_REDIRECT_URI:-https://example.com}"

ENCODED_SCOPE="$(node -e "console.log(encodeURIComponent(process.argv[1]))" "${SCOPES}")"
ENCODED_REDIRECT="$(node -e "console.log(encodeURIComponent(process.argv[1]))" "${REDIRECT_URI}")"

URL="https://${STORE}/admin/oauth/authorize?client_id=${CLIENT_ID}&scope=${ENCODED_SCOPE}&redirect_uri=${ENCODED_REDIRECT}&state=lurafi-scope-$(date +%s)"

echo "Open this URL while logged into ${STORE} as the store owner (mma@surfstr.com):"
echo ""
echo "${URL}"
echo ""
echo "You may land on 'Example Domain' after Approve — that is OK (bad App URL on the app version)."
echo "Close that tab; scopes are still granted."
echo ""
echo "After you approve, run:"
echo "  ./scripts/shopify-refresh-admin-token.sh"
echo "  npm run shopify:products:migrate"
echo ""

if [[ "$(uname -s)" == "Darwin" ]]; then
  open "${URL}" 2>/dev/null || true
fi
