#!/usr/bin/env bash
# Push theme to the configured live theme, republish (bust Shopify page cache), verify storefront.
#
# Usage:
#   ./scripts/deploy-theme-live.sh              # full theme push
#   ./scripts/deploy-theme-live.sh --only "sections/hero.liquid"   # partial push + publish + verify
#
# Config: config/live-theme.json (single source of truth for theme ID / storefront URL)
set -euo pipefail

# Safety: pushing to the LIVE theme requires explicit consent. Use the
# preview flow for day-to-day work (docs/CMS-BACKEND-PLAN.md §6).
ALLOW_LIVE=0
for arg in "$@"; do
  [[ "$arg" == "--yes-live" ]] && ALLOW_LIVE=1
done
[[ "${LURAFI_ALLOW_LIVE:-}" == "1" ]] && ALLOW_LIVE=1
if [[ "$ALLOW_LIVE" != "1" ]]; then
  echo "REFUSED: this deploys to the LIVE theme. Re-run with --yes-live" >&2
  echo "(or LURAFI_ALLOW_LIVE=1). For staging, push to a preview theme:" >&2
  echo "  shopify theme push --theme <preview-theme-id>" >&2
  exit 2
fi
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LURAFI_ROOT="${ROOT}"
# shellcheck source=scripts/lib/shopify-env.sh
source "${ROOT}/scripts/lib/shopify-env.sh"
# shellcheck source=scripts/lib/live-theme.sh
source "${ROOT}/scripts/lib/live-theme.sh"

shopify_load_dotenv
shopify_ensure_admin_token || true
shopify_load_dotenv

STORE="$(live_theme_store)"
THEME_ID="$(live_theme_id)"
THEME_NAME="$(live_theme_name)"
TOKEN="$(shopify_require_theme_password)"
STOREFRONT="$(live_storefront_url)"

echo "=== Deploy live theme ==="
echo "  Store:     ${STORE}"
echo "  Theme:     ${THEME_NAME} (#${THEME_ID})"
echo "  Storefront: ${STOREFRONT}"
echo ""

if node "${ROOT}/scripts/verify-live-theme-admin.mjs" 2>/dev/null; then
  :
else
  echo "⚠ Admin theme check failed (token missing or MAIN theme mismatch). Continuing push…" >&2
fi

echo "→ Pushing theme files…"
shopify theme push \
  -s "${STORE}" \
  --theme "${THEME_ID}" \
  --password "${TOKEN}" \
  --allow-live \
  "$@"

echo ""
echo "→ Republishing theme + busting homepage page cache…"
"${ROOT}/scripts/publish-theme-live.sh"

echo ""
echo "→ Verifying storefront…"
node "${ROOT}/scripts/verify-live-storefront.mjs"

echo "✓ Deploy complete — ${STOREFRONT}"
