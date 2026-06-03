#!/usr/bin/env bash
# Push lurafi theme + run i18n Admin setup on a destination Shopify store.
#
# Usage:
#   SHOPIFY_STORE=new-store.myshopify.com ./scripts/migrate-to-store.sh
#   SHOPIFY_STORE=new-store.myshopify.com PUBLISH_THEME=1 ./scripts/migrate-to-store.sh
#
# Auth (pick one):
#   A) SHOPIFY_ADMIN_TOKEN in .env — skips browser OAuth (recommended for mitipi-2)
#   B) shopify store auth — interactive; fails with Unauthorized Access if wrong Shopify login

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=scripts/lib/shopify-env.sh
source "${ROOT}/scripts/lib/shopify-env.sh"
shopify_load_dotenv

OLD_STORE="${OLD_SHOPIFY_STORE:-fu03cn-1v.myshopify.com}"
STORE="${SHOPIFY_STORE:-}"
PUBLISH="${PUBLISH:-true}"
PUBLISH_THEME="${PUBLISH_THEME:-0}"
THEME_NAME="${SHOPIFY_THEME_NAME:-lurafi-deploy}"
TOKEN="$(shopify_theme_password)"

if [[ -z "$STORE" ]]; then
  echo "Error: set SHOPIFY_STORE to the destination store hostname."
  echo "  Example: SHOPIFY_STORE=mitipi-2.myshopify.com $0"
  exit 1
fi

if [[ "$STORE" == "$OLD_STORE" ]]; then
  echo "Error: SHOPIFY_STORE matches the current production store ($OLD_STORE)."
  echo "Set SHOPIFY_STORE to the NEW account's myshopify.com hostname."
  exit 1
fi

AUTH_SCOPES="read_themes,write_themes,read_locales,write_locales,read_translations,write_translations,read_content,write_content,read_online_store_pages,write_online_store_pages,read_markets,write_markets,read_products"

theme_cli() {
  local -a args=("$@")
  if [[ -n "${TOKEN}" ]] && ! shopify_token_is_placeholder "${TOKEN}"; then
    shopify "${args[@]}" --password "${TOKEN}"
  else
    shopify "${args[@]}"
  fi
}

echo "=== lurafi migration → $STORE ==="
echo ""

if [[ -n "${TOKEN}" ]] && ! shopify_token_is_placeholder "${TOKEN}"; then
  echo "Step 0: Token auth (SHOPIFY_ADMIN_TOKEN) — skipping shopify store auth"
  echo "  Verifying with: shopify theme list -s ${STORE} --password [REDACTED]"
  theme_cli theme list -s "$STORE"
else
  echo "Step 0: Theme CLI (no SHOPIFY_ADMIN_TOKEN in .env)"
  if theme_cli theme list -s "$STORE" >/dev/null 2>&1; then
    echo "  Theme CLI OK — skipping shopify store auth (Admin steps need token or store auth)"
    theme_cli theme list -s "$STORE"
  else
    echo "  Theme CLI failed — trying browser OAuth (or add SHOPIFY_ADMIN_TOKEN to .env)"
    echo "    ./scripts/auth-with-token.sh ${STORE}"
    echo ""
    shopify store auth --store "$STORE" --scopes "$AUTH_SCOPES"
    theme_cli theme list -s "$STORE"
  fi
fi

echo ""
echo "Step 1: Build locale JSON from sources"
npm run locales:build
npm run locales:sync

echo ""
echo "Step 2: Theme Check"
npm run theme:check

echo ""
if [[ "$PUBLISH_THEME" == "1" ]]; then
  echo "Step 3: Push theme to LIVE (main) on $STORE"
  theme_cli theme push -s "$STORE" --allow-live --theme "$THEME_NAME"
else
  echo "Step 3: Push theme as UNPUBLISHED (safe default), name: ${THEME_NAME}"
  theme_cli theme push -s "$STORE" --unpublished --theme "$THEME_NAME"
  echo ""
  echo "  → Publish when ready: Online Store → Themes, or:"
  echo "     shopify theme list -s $STORE --password \"\$SHOPIFY_ADMIN_TOKEN\""
  echo "     shopify theme publish -s $STORE --theme THEME_ID --password \"\$SHOPIFY_ADMIN_TOKEN\""
fi

echo ""
echo "Step 4: Admin locales, markets, pages, product translations"
if ! SHOPIFY_STORE="$STORE" PUBLISH="$PUBLISH" SHOPIFY_ADMIN_TOKEN="${TOKEN}" "$ROOT/scripts/activate-locales.sh"; then
  echo ""
  echo "WARN: Step 4 did not complete — Admin API needs SHOPIFY_ADMIN_TOKEN in .env or:"
  echo "  shopify store auth --store ${STORE} --scopes ${AUTH_SCOPES}"
  echo "  Then: SHOPIFY_STORE=${STORE} ./scripts/activate-locales.sh"
fi

echo ""
echo "=== Automated steps complete ==="
echo ""
echo "Manual steps still required (see docs/MIGRATION.md):"
echo "  • Create/import products with handles: kevin, kevin-plus"
echo "  • Attach selling plan to kevin-plus (Kevin+ subscription)"
echo "  • Payments, shipping, taxes, navigation menus"
echo "  • Connect domain lurafi.com when QA passes"
echo ""
echo "Re-run locale script after products exist:"
echo "  SHOPIFY_STORE=$STORE ./scripts/activate-locales.sh"
