# Live theme config (config/live-theme.json). Source after shopify-env.sh.
# shellcheck shell=bash

live_theme_config_path() {
  echo "${LURAFI_ROOT:-$(shopify_env_root)}/config/live-theme.json"
}

live_theme_field() {
  local field="$1"
  node -e "
    const c = JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'));
    const v = c[process.argv[2]];
    if (v == null) process.exit(1);
    console.log(v);
  " "$(live_theme_config_path)" "${field}"
}

live_theme_store() {
  live_theme_field store | sed 's|^https://||; s|/$||'
}

live_theme_id() {
  live_theme_field theme_id
}

live_theme_name() {
  live_theme_field theme_name
}

live_storefront_url() {
  live_theme_field storefront_url | sed 's|/$||'
}
