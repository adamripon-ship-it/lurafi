#!/usr/bin/env bash
# Push lurafi theme + run i18n Admin setup on a destination Shopify store.
#
# Usage:
#   SHOPIFY_STORE=new-store.myshopify.com ./scripts/migrate-to-store.sh
#   SHOPIFY_STORE=new-store.myshopify.com PUBLISH_THEME=1 ./scripts/migrate-to-store.sh
#
# Requires staff access on the destination store and Shopify CLI auth (see docs/MIGRATION.md).

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OLD_STORE="${OLD_SHOPIFY_STORE:-fu03cn-1v.myshopify.com}"
STORE="${SHOPIFY_STORE:-}"
PUBLISH="${PUBLISH:-true}"
PUBLISH_THEME="${PUBLISH_THEME:-0}"

if [[ -z "$STORE" ]]; then
  echo "Error: set SHOPIFY_STORE to the destination store hostname."
  echo "  Example: SHOPIFY_STORE=your-store.myshopify.com $0"
  exit 1
fi

if [[ "$STORE" == "$OLD_STORE" ]]; then
  echo "Error: SHOPIFY_STORE matches the current production store ($OLD_STORE)."
  echo "Set SHOPIFY_STORE to the NEW account's myshopify.com hostname."
  exit 1
fi

AUTH_SCOPES="read_themes,write_themes,read_locales,write_locales,read_translations,write_translations,read_content,write_content,read_online_store_pages,write_online_store_pages,read_markets,write_markets,read_products"
TOKEN="${SHOPIFY_ADMIN_TOKEN:-${SHOPIFY_CLI_THEME_TOKEN:-}}"
THEME_PASSWORD_ARGS=()
if [[ -n "${TOKEN}" ]]; then
  THEME_PASSWORD_ARGS=(--password "${TOKEN}")
  echo "Using SHOPIFY_ADMIN_TOKEN (no browser OAuth)."
else
  echo "No SHOPIFY_ADMIN_TOKEN — will use browser OAuth (shopify store auth)."
fi

echo "=== lurafi migration → $STORE ==="
echo ""
if [[ -z "${TOKEN}" ]]; then
  echo "Step 0: Authenticate (approve in browser if prompted)"
  echo "  shopify store auth --store $STORE --scopes $AUTH_SCOPES"
  echo ""
  shopify store auth --store "$STORE" --scopes "$AUTH_SCOPES"
else
  echo "Step 0: Verify token"
  shopify theme list -s "$STORE" "${THEME_PASSWORD_ARGS[@]}"
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
  shopify theme push -s "$STORE" "${THEME_PASSWORD_ARGS[@]}" --allow-live
else
  echo "Step 3: Push theme as UNPUBLISHED (safe default)"
  shopify theme push -s "$STORE" "${THEME_PASSWORD_ARGS[@]}" --unpublished
  echo ""
  echo "  → Publish when ready: Online Store → Themes, or:"
  echo "     shopify theme list -s $STORE"
  echo "     shopify theme publish -s $STORE --theme THEME_ID"
fi

echo ""
echo "Step 4: Admin locales, markets, pages, product translations"
SHOPIFY_STORE="$STORE" PUBLISH="$PUBLISH" "$ROOT/scripts/activate-locales.sh"

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
