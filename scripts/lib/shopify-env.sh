# Shared Shopify env + token helpers for bash scripts.
# Source from repo scripts: source "$(dirname "$0")/lib/shopify-env.sh"

shopify_env_root() {
  if [[ -n "${LURAFI_ROOT:-}" ]]; then
    echo "$LURAFI_ROOT"
    return
  fi
  local lib_dir
  lib_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  echo "$(cd "${lib_dir}/../.." && pwd)"
}

shopify_load_dotenv() {
  local root
  root="$(shopify_env_root)"
  if [[ -f "${root}/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "${root}/.env"
    set +a
  fi
}

# Refresh SHOPIFY_ADMIN_TOKEN from Dev Dashboard client credentials when ID+secret exist.
shopify_ensure_admin_token() {
  shopify_load_dotenv
  local token
  token="$(shopify_theme_password)"
  if ! shopify_token_is_placeholder "${token}"; then
    return 0
  fi
  if [[ -z "${SHOPIFY_CLIENT_ID:-}" || -z "${SHOPIFY_CLIENT_SECRET:-}" ]]; then
    return 1
  fi
  local refresh="${LURAFI_ROOT:-$(shopify_env_root)}/scripts/shopify-refresh-admin-token.sh"
  if [[ -x "${refresh}" ]]; then
    "${refresh}" >/dev/null
    shopify_load_dotenv
  fi
}

# Theme Access password / Admin API token (same flag for shopify theme * --password)
shopify_theme_password() {
  printf '%s' "${SHOPIFY_ADMIN_TOKEN:-${SHOPIFY_CLI_THEME_TOKEN:-${SHOPIFY_THEME_PASSWORD:-}}}"
}

shopify_token_is_placeholder() {
  local token="$1"
  if [[ -z "${token}" ]]; then
    return 0
  fi
  case "${token}" in
    paste_token_here | your-token | shpat_xxx | shpat_... | atkn_...)
      return 0
      ;;
  esac
  if [[ "${token}" == *"paste"* ]] || [[ "${token}" == *"..."* ]]; then
    return 0
  fi
  if [[ ${#token} -lt 20 ]]; then
    return 0
  fi
  return 1
}

shopify_require_theme_password() {
  shopify_load_dotenv
  local token
  token="$(shopify_theme_password)"
  if shopify_token_is_placeholder "${token}"; then
    echo "Error: set a real Admin API or app automation token in .env (not a placeholder)." >&2
    echo "  SHOPIFY_ADMIN_TOKEN=...  (Dev Dashboard → lurafi → Settings → App automation token)" >&2
    echo "  Or Theme Access password from Admin → Online Store → Themes." >&2
    return 1
  fi
  printf '%s' "${token}"
}
