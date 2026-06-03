#!/usr/bin/env bash
# Enable all locales, market web presences, and Admin translations from config/languages.json.
# See scripts/setup-shopify-i18n.mjs

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib/shopify-env.sh
source "${ROOT}/scripts/lib/shopify-env.sh"
shopify_load_dotenv

STORE="${SHOPIFY_STORE:-fu03cn-1v.myshopify.com}"
PUBLISH="${PUBLISH:-true}"
TOKEN="$(shopify_theme_password)"

if [[ -n "${TOKEN}" ]] && ! shopify_token_is_placeholder "${TOKEN}"; then
  echo "Using SHOPIFY_ADMIN_TOKEN for Admin GraphQL (no shopify store auth)."
  export SHOPIFY_ADMIN_TOKEN="${TOKEN}"
else
  echo "No SHOPIFY_ADMIN_TOKEN — setup-shopify-i18n uses shopify store execute (requires prior store auth)."
  echo "  shopify store auth --store ${STORE} \\"
  echo "    --scopes read_locales,write_locales,read_translations,write_translations,\\"
  echo "read_content,write_content,read_online_store_pages,write_online_store_pages,\\"
  echo "read_markets,write_markets,read_products"
  echo "  Or add SHOPIFY_ADMIN_TOKEN to .env and re-run."
  echo ""
fi

export SHOPIFY_STORE="${STORE}"

if [[ "${PUBLISH}" == "false" ]]; then
  node "${ROOT}/scripts/setup-shopify-i18n.mjs" --publish=false
else
  node "${ROOT}/scripts/setup-shopify-i18n.mjs"
fi
