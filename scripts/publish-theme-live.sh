#!/usr/bin/env bash
# Republish live theme + bust Shopify homepage page cache (no file push).
# Use after partial theme push when storefront HTML is stale.
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

echo "Republishing ${THEME_NAME} (#${THEME_ID}) on ${STORE} + busting homepage cache…"
node "${ROOT}/scripts/bust-homepage-page-cache.mjs"

sleep 2
node "${ROOT}/scripts/verify-live-storefront.mjs"
