#!/usr/bin/env bash
# Publish lurafi-deploy and ensure Horizon is not still serving the storefront.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib/shopify-env.sh
source "${ROOT}/scripts/lib/shopify-env.sh"
shopify_load_dotenv
shopify_ensure_admin_token || true
shopify_load_dotenv

STORE="${SHOPIFY_STORE:-6mzhe1-yf.myshopify.com}"
STORE="${STORE#https://}"
STORE="${STORE%/}"
THEME_NAME="${SHOPIFY_THEME_NAME:-lurafi-deploy}"
TOKEN="$(shopify_require_theme_password)"

theme_id="$(shopify theme list -s "${STORE}" --password "${TOKEN}" --json 2>/dev/null | node -e "
  const rows=JSON.parse(require('fs').readFileSync(0,'utf8'));
  const t=rows.find(r=>r.name===process.argv[1]&&r.role!=='unpublished')||rows.filter(r=>r.name===process.argv[1]).pop();
  if(t) console.log(String(t.id).replace(/.*#/,''));
" "${THEME_NAME}" 2>/dev/null || true)"

if [[ -z "${theme_id}" ]]; then
  echo "Theme ${THEME_NAME} not found on ${STORE}" >&2
  exit 1
fi

echo "Publishing #${theme_id} (${THEME_NAME})…"
shopify theme publish -s "${STORE}" --theme "${theme_id}" --password "${TOKEN}" --force

horizon_id="$(curl -sS "https://${STORE}/admin/api/2025-01/themes.json" \
  -H "X-Shopify-Access-Token: ${TOKEN}" | node -e "
    const t=JSON.parse(require('fs').readFileSync(0,'utf8')).themes||[];
    const h=t.find(x=>/^horizon$/i.test(x.name)&&x.id!==Number(process.argv[1]));
    if(h) console.log(h.id);
  " "${theme_id}" 2>/dev/null || true)"

if [[ -n "${horizon_id}" ]]; then
  echo "Unpublishing Horizon (#${horizon_id}) so the storefront updates…"
  curl -sS -X PUT "https://${STORE}/admin/api/2025-01/themes/${horizon_id}.json" \
    -H "X-Shopify-Access-Token: ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"theme\":{\"id\":${horizon_id},\"role\":\"unpublished\"}}" >/dev/null
fi

echo "✓ Live: https://${STORE}/"
