import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const configPath = path.join(root, 'config/languages.json');

/** @typedef {{ code: string, shopifyLocale: string, label: string, nativeName: string, ogLocale: string, urlPrefix: string, primary?: boolean, publish?: boolean, llmAssets?: boolean, pages?: Record<string, { handle: string, title: string, body: string }>, products?: Record<string, { body_html?: string, meta_title?: string, meta_description?: string }> }} LocaleConfig */

/** @type {{ primary: string, domain: string, glossary: string[], locales: LocaleConfig[], pages: Record<string, { handle: string, title: string, body: string }> }} */
let cached;

export function loadLanguagesConfig() {
  if (!cached) {
    cached = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  return cached;
}

export function getLocales() {
  return loadLanguagesConfig().locales;
}

export function getPrimaryLocale() {
  return loadLanguagesConfig().locales.find((l) => l.primary) || loadLanguagesConfig().locales[0];
}

export function getAlternateLocales() {
  return loadLanguagesConfig().locales.filter((l) => !l.primary);
}

export function getLocale(code) {
  return loadLanguagesConfig().locales.find((l) => l.code === code || l.shopifyLocale === code);
}

export function getLanguageLabels() {
  const labels = {};
  for (const l of getLocales()) {
    labels[l.code] = l.label;
  }
  return labels;
}

export function localeUrlPrefix(code) {
  const loc = getLocale(code);
  if (!loc || !loc.urlPrefix) return '';
  return loc.urlPrefix.startsWith('/') ? loc.urlPrefix : `/${loc.urlPrefix}`;
}

export function buildConfigureUrl(domain, localeCode, plan = 'buy') {
  const loc = getLocale(localeCode);
  const prefix = localeUrlPrefix(localeCode);
  const handle = loc?.pages?.configure?.handle || loadLanguagesConfig().pages.configure.handle;
  const base = `https://${domain}${prefix}/pages/${handle}`;
  return `${base}?plan=${plan}`;
}

export function buildHomeUrl(domain, localeCode) {
  const prefix = localeUrlPrefix(localeCode);
  return `https://${domain}${prefix || '/'}`;
}
