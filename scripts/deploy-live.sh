#!/usr/bin/env bash
# Deploy theme to live on fu03cn-1v.myshopify.com (lurafi.ai)
set -euo pipefail
cd "$(dirname "$0")/.."
STORE="fu03cn-1v.myshopify.com"

echo "Step 1: Authorize theme access (approve in browser when prompted)"
shopify store auth --store "$STORE" --scopes read_themes,write_themes

echo "Step 2: Push all theme files to live theme"
node scripts/push-live-theme.mjs

echo "Live: https://lurafi.ai/  Dutch: https://lurafi.ai/nl/"
