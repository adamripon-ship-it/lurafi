#!/usr/bin/env bash
# Refresh SHOPIFY_ADMIN_TOKEN using Dev Dashboard client credentials (new Shopify UI).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib/shopify-env.sh
source "${ROOT}/scripts/lib/shopify-env.sh"
shopify_load_dotenv

STORE="${SHOPIFY_STORE:-6mzhe1-yf.myshopify.com}"
STORE="${STORE#https://}"
STORE="${STORE%/}"
ID="${SHOPIFY_CLIENT_ID:-}"
SECRET="${SHOPIFY_CLIENT_SECRET:-}"

if [[ -z "${ID}" || -z "${SECRET}" ]]; then
  echo "Add SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET to .env (Dev Dashboard → lurafi → Settings)." >&2
  exit 1
fi

RESP="$(curl -sS -X POST "https://${STORE}/admin/oauth/access_token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=${ID}" \
  -d "client_secret=${SECRET}")"

if [[ "${RESP}" == \<!* ]]; then
  echo "✗ OAuth returned HTML instead of JSON — store may be deactivated or the lurafi app is not installed on ${STORE}." >&2
  echo "  1. Log in: https://admin.shopify.com/store/6mzhe1-yf (owner account)" >&2
  echo "  2. Reactivate the store if Shopify shows a billing / paused notice." >&2
  echo "  3. Run: npm run shopify:approve-scopes  then re-run this script." >&2
  exit 1
fi

TOKEN="$(node -e "const j=JSON.parse(process.argv[1]); if(!j.access_token){console.error(JSON.stringify(j)); process.exit(1)}; console.log(j.access_token)" "${RESP}")"

ENV_FILE="${ROOT}/.env"
if grep -q '^SHOPIFY_ADMIN_TOKEN=' "${ENV_FILE}" 2>/dev/null; then
  sed -i '' "s|^SHOPIFY_ADMIN_TOKEN=.*|SHOPIFY_ADMIN_TOKEN=${TOKEN}|" "${ENV_FILE}"
else
  printf '\nSHOPIFY_ADMIN_TOKEN=%s\n' "${TOKEN}" >> "${ENV_FILE}"
fi

echo "✓ Updated SHOPIFY_ADMIN_TOKEN in .env (valid ~24 hours)."
