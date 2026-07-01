#!/usr/bin/env bash
# Republish live theme + bust Shopify homepage page cache (no file push).
# Use after partial theme push when storefront HTML is stale.
set -euo pipefail
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
