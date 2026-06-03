#!/usr/bin/env bash
# Verify GitHub, Shopify CLI, and Cloudflare access for lurafi migration.
# Usage: ./scripts/verify-access.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; }

echo "=== lurafi access verification ==="
echo ""

# --- GitHub ---
echo "## GitHub (adamripon-ship-it/lurafi)"
if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    ACCOUNT=$(gh auth status 2>&1 | sed -n 's/.*account \([^ ]*\).*/\1/p' | head -1)
    ok "gh logged in as ${ACCOUNT:-unknown}"
    if gh repo view adamripon-ship-it/lurafi >/dev/null 2>&1; then
      ok "Repo access: adamripon-ship-it/lurafi"
    else
      fail "Cannot access repo adamripon-ship-it/lurafi"
    fi
    SECRETS=$(gh secret list --repo adamripon-ship-it/lurafi --env production 2>/dev/null | wc -l | tr -d ' ')
    if [[ "${SECRETS}" -gt 0 ]]; then
      ok "production environment secrets: ${SECRETS} configured"
      gh secret list --repo adamripon-ship-it/lurafi --env production 2>/dev/null | sed 's/^/    /'
    else
      warn "No secrets in GitHub environment 'production' (need SHOPIFY_CLI_THEME_TOKEN, SHOPIFY_FLAG_STORE)"
    fi
  else
    fail "gh not logged in — run: gh auth login"
  fi
else
  fail "gh CLI not installed"
fi
echo ""

# --- Shopify ---
echo "## Shopify CLI"
OLD_STORE="${OLD_SHOPIFY_STORE:-fu03cn-1v.myshopify.com}"
NEW_STORE="${SHOPIFY_STORE:-${NEW_SHOPIFY_STORE:-}}"

if command -v shopify >/dev/null 2>&1; then
  ok "shopify CLI $(shopify version 2>/dev/null | head -1 || echo installed)"
  SHOPIFY_CFG="${HOME}/Library/Preferences/shopify-cli-store-nodejs/config.json"
  if [[ -f "${SHOPIFY_CFG}" ]]; then
    STORES=$(node -e "
      const j=require('${SHOPIFY_CFG}');
      console.log(Object.keys(j).filter(k=>k.includes('myshopify')||k.includes('fu03cn')).join('\n'));
    " 2>/dev/null || true)
    if [[ -n "${STORES}" ]]; then
      ok "Authenticated store session(s) in CLI config"
      echo "${STORES}" | sed 's/^/    /'
    else
      warn "No store sessions found in CLI config"
    fi
  else
    warn "Shopify CLI config not found at ${SHOPIFY_CFG}"
  fi

  if [[ -n "${NEW_STORE}" ]]; then
    echo "  Target store (SHOPIFY_STORE): ${NEW_STORE}"
  else
    warn "Set SHOPIFY_STORE to your NEW store (e.g. export SHOPIFY_STORE=xxx.myshopify.com)"
  fi
  echo "  Old production reference: ${OLD_STORE}"
  echo ""
  echo "  Auth command (run in your terminal — opens browser):"
  echo "    shopify store auth --store YOUR-STORE.myshopify.com \\"
  echo "      --scopes read_themes,write_themes,read_locales,write_locales,read_translations,write_translations,\\"
  echo "read_content,write_content,read_online_store_pages,write_online_store_pages,read_markets,write_markets,read_products"
else
  fail "shopify CLI not installed — run: npm ci (in repo root)"
fi
echo ""

# --- Cloudflare ---
echo "## Cloudflare (lurafi.com DNS)"
if [[ -f "${ROOT}/.env" ]] && grep -q 'CLOUDFLARE_API_TOKEN' "${ROOT}/.env" 2>/dev/null; then
  ok ".env contains CLOUDFLARE_API_TOKEN"
elif [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  ok "CLOUDFLARE_API_TOKEN set in shell"
else
  warn "No CLOUDFLARE_API_TOKEN (optional for CLI; use dashboard or add to .env)"
fi

if command -v wrangler >/dev/null 2>&1; then
  if wrangler whoami >/dev/null 2>&1; then
    ok "wrangler logged in"
    wrangler whoami 2>/dev/null | sed 's/^/    /'
  else
    warn "wrangler installed but not logged in — run: wrangler login"
  fi
else
  warn "wrangler not installed (optional — DNS can be done in Cloudflare dashboard)"
fi

if dig +short lurafi.com NS 2>/dev/null | grep -q cloudflare; then
  ok "lurafi.com uses Cloudflare nameservers"
  dig +short lurafi.com NS 2>/dev/null | sed 's/^/    /'
else
  warn "lurafi.com NS lookup did not show Cloudflare (check domain)"
fi
echo ""

# --- Local .env ---
echo "## Local .env"
if [[ -f "${ROOT}/.env" ]]; then
  ok ".env exists (gitignored)"
else
  warn "No .env — copy .env.example to .env for local tokens"
fi
echo ""

echo "=== Next steps ==="
echo "1. Complete docs/ACCESS-SETUP.md with your NEW Shopify store URL"
echo "2. Run shopify store auth for the NEW store (browser)"
echo "3. Add GitHub production secrets for deploy workflow"
echo "4. Cloudflare: grey-cloud A + CNAME per docs/CLOUDFLARE-DNS.md (after Shopify QA)"
echo "5. Re-run: SHOPIFY_STORE=your-new-store.myshopify.com ./scripts/verify-access.sh"
