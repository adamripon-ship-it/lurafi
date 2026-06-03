#!/usr/bin/env bash
# Sync mitipi-2 deploy credentials to GitHub Actions environment "production".
# Usage: ./scripts/sync-github-deploy-secrets.sh
#
# Sets (from .env when present):
#   SHOPIFY_FLAG_STORE
#   SHOPIFY_CLI_THEME_TOKEN  (refreshed via client credentials when ID+secret exist)
#   SHOPIFY_CLIENT_ID        (optional — enables auto-refresh in deploy-theme.yml)
#   SHOPIFY_CLIENT_SECRET    (optional)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib/shopify-env.sh
source "${ROOT}/scripts/lib/shopify-env.sh"
shopify_load_dotenv

REPO="${GITHUB_REPOSITORY:-adamripon-ship-it/lurafi}"
ENV_NAME="${GITHUB_ENV_NAME:-production}"
STORE="${SHOPIFY_STORE:-mitipi-2.myshopify.com}"
STORE="${STORE#https://}"
STORE="${STORE%/}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: gh CLI required." >&2
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "Error: run gh auth login" >&2
  exit 1
fi

if [[ -n "${SHOPIFY_CLIENT_ID:-}" && -n "${SHOPIFY_CLIENT_SECRET:-}" ]]; then
  "${ROOT}/scripts/shopify-refresh-admin-token.sh" >/dev/null
  shopify_load_dotenv
fi

TOKEN="$(shopify_theme_password)"
if shopify_token_is_placeholder "${TOKEN}"; then
  echo "Error: no SHOPIFY_ADMIN_TOKEN in .env. Run ./scripts/shopify-refresh-admin-token.sh" >&2
  exit 1
fi

echo "Testing theme API on ${STORE}…"
shopify theme list -s "${STORE}" --password "${TOKEN}" >/dev/null
echo "✓ Token works for theme list"

echo "Updating GitHub environment secrets (${REPO} → ${ENV_NAME})…"
gh secret set SHOPIFY_FLAG_STORE --repo "${REPO}" --env "${ENV_NAME}" --body "${STORE}"
printf '%s' "${TOKEN}" | gh secret set SHOPIFY_CLI_THEME_TOKEN --repo "${REPO}" --env "${ENV_NAME}"

if [[ -n "${SHOPIFY_CLIENT_ID:-}" && -n "${SHOPIFY_CLIENT_SECRET:-}" ]]; then
  gh secret set SHOPIFY_CLIENT_ID --repo "${REPO}" --env "${ENV_NAME}" --body "${SHOPIFY_CLIENT_ID}"
  printf '%s' "${SHOPIFY_CLIENT_SECRET}" | gh secret set SHOPIFY_CLIENT_SECRET --repo "${REPO}" --env "${ENV_NAME}"
  echo "✓ SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET (deploy workflow will refresh token each run)"
fi

echo ""
echo "Configured secrets:"
gh secret list --repo "${REPO}" --env "${ENV_NAME}"
echo ""
echo "Deploy: GitHub → Actions → Deploy theme (manual) → theme_id 184679596410"
