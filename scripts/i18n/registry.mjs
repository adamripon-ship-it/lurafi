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

export function getPublishedLocales() {
  return loadLanguagesConfig().locales.filter((l) => l.publish !== false);
}

export function getAlternateLocales() {
  return getPublishedLocales().filter((l) => !l.primary);
}

export function getLocale(code) {
  return loadLanguagesConfig().locales.find((l) => l.code === code || l.shopifyLocale === code);
}

export function getLanguageLabels() {
  const labels = {};
  for (const l of getLocales()) {
    const flag = l.flag ? `${l.flag} ` : '';
    labels[l.code] = `${flag}${l.label}`;
  }
  return labels;
}

/** Locale URL prefixes and configure page paths for language-switch return_to rewriting. */
export function getLocaleRouteMap() {
  const cfg = loadLanguagesConfig();
  const defaultConfigure = cfg.pages?.configure?.handle || 'configure';
  const routes = {};
  for (const loc of getPublishedLocales()) {
    const prefix = loc.urlPrefix || '';
    const configureHandle = loc.pages?.configure?.handle || defaultConfigure;
    routes[loc.code] = {
      prefix,
      configurePath: `${prefix}/pages/${configureHandle}`.replace('//', '/'),
    };
  }
  return routes;
}

export function getPublishedCountries() {
  const cfg = loadLanguagesConfig();
  if (cfg.countries?.length) {
    const order = cfg.publishedCountries || cfg.countries.map((c) => c.code);
    const byCode = Object.fromEntries(cfg.countries.map((c) => [c.code, c]));
    return order.filter((code) => byCode[code]).map((code) => byCode[code]);
  }
  return (cfg.publishedCountries || []).map((code) => ({ code, currency: null, label: code }));
}

/** ISO country codes in storefront display order. */
export function getPublishedCountryCodes() {
  return getPublishedCountries().map((c) => c.code);
}

export function getCountryCurrency(code) {
  const row = getPublishedCountries().find((c) => c.code === code);
  return row?.currency || null;
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

/** Canonical HTTPS URL for a theme asset (llms.txt, sitemap-ai.xml, …). */
export function buildThemeAssetUrl(filename, domain) {
  const cfg = loadLanguagesConfig();
  const host = domain || cfg.domain;
  const base = cfg.discovery?.assetCdnPath || '/cdn/shop/t/1/assets';
  const name = String(filename).replace(/^\//, '');
  return `https://${host}${base}/${name}`;
}

export function getLlmAssetLocales() {
  return getLocales().filter((l) => l.publish !== false && l.llmAssets);
}

export function llmsShortFilename(localeCode) {
  const loc = getLocale(localeCode);
  if (!loc || loc.primary) return loadLanguagesConfig().discovery?.llmsShort || 'llms.txt';
  return `llms.${loc.code}.txt`;
}

export function llmsFullFilename(localeCode) {
  const loc = getLocale(localeCode);
  if (!loc || loc.primary) return loadLanguagesConfig().discovery?.llmsFull || 'llms-full.txt';
  return `llms-full.${loc.code}.txt`;
}
