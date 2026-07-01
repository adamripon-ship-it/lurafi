#!/usr/bin/env bash
# Republish live theme only (no file push). Use after partial pushes or when storefront shows stale HTML.
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
TOKEN="$(shopify_require_theme_password)"

echo "Republishing ${THEME_NAME} (#${THEME_ID}) on ${STORE}…"
shopify theme publish \
  -s "${STORE}" \
  --theme "${THEME_ID}" \
  --password "${TOKEN}" \
  --force

sleep 2
node "${ROOT}/scripts/verify-live-storefront.mjs"
