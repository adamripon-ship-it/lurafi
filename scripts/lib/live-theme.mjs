import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(root, 'config/live-theme.json');

let cached;

/** @returns {{ store: string, theme_id: string, theme_name: string, storefront_url: string, storefront_markers: string[] }} */
export function getLiveThemeConfig() {
  if (!cached) {
    cached = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  return cached;
}

export function liveThemeId() {
  return getLiveThemeConfig().theme_id;
}

export function liveThemeStore() {
  return getLiveThemeConfig().store.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export function liveStorefrontUrl() {
  return getLiveThemeConfig().storefront_url.replace(/\/$/, '');
}
