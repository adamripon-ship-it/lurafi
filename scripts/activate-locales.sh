#!/usr/bin/env bash
# Enable all locales, market web presences, and Admin translations from config/languages.json.
# See scripts/setup-shopify-i18n.mjs

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STORE="${SHOPIFY_STORE:-fu03cn-1v.myshopify.com}"
PUBLISH="${PUBLISH:-true}"

echo "Authenticate once (if needed):"
echo "  shopify store auth --store ${STORE} \\"
echo "    --scopes read_locales,write_locales,read_translations,write_translations,\\"
echo "read_content,write_content,read_online_store_pages,write_online_store_pages,\\"
echo "read_markets,write_markets,read_products"
echo ""

if [[ "${PUBLISH}" == "false" ]]; then
  node "${ROOT}/scripts/setup-shopify-i18n.mjs" --publish=false
else
  node "${ROOT}/scripts/setup-shopify-i18n.mjs"
fi
