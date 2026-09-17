#!/usr/bin/env node
/**
 * Generate assets/llms*.txt (short + full, one pair per published locale) from
 * config/llms/{short,full}.<locale>.md templates and config/entity.json.
 *
 * Templates hold the prose in each language; this script only fills the
 * placeholders (URLs for that locale, price, dates, discovery links) so every
 * file stays consistent with the entity model. A locale without its own
 * template falls back to the English one with that locale's URLs.
 *
 * Usage: node scripts/generate-llms-assets.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildConfigureUrl,
  buildHomeUrl,
  buildThemeAssetUrl,
  getLocales,
  getLlmAssetLocales,
  llmsFullFilename,
  llmsShortFilename,
  loadLanguagesConfig,
} from './i18n/registry.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = loadLanguagesConfig();
const domain = cfg.domain;
const entity = JSON.parse(fs.readFileSync(path.join(root, 'config/entity.json'), 'utf8'));

const PAGE_KEYS = ['features', 'how-it-works', 'the-kevin-app', 'pricing', 'about-kevin', 'press', 'careers', 'setup-guide', 'contact'];
const KNOWLEDGE_FILES = ['kevin.md', 'kevin-product.md', 'kevin-specs.md', 'kevin-faq.md', 'kevin-company.md'];

/** Locale-formatted price: en €579.95 · nl € 579,95 · fr/de/cs 579,95 € (symbol placement per language). */
function money(amount, currency, code = 'en') {
  const symbol = { EUR: '€', CHF: 'CHF', CZK: 'Kč' }[currency] || currency;
  const n = Number(amount).toFixed(2);
  if (code === 'en') return `${symbol}${n}`;
  const decimal = n.replace('.', ',');
  return code === 'nl' ? `${symbol} ${decimal}` : `${decimal} ${symbol}`;
}

function localeOf(code) {
  return getLocales().find((l) => l.code === code);
}

function pageUrlFor(code, pageKey) {
  const loc = localeOf(code);
  const prefix = loc?.urlPrefix || '';
  const handle = loc?.pages?.[pageKey]?.handle || cfg.pages[pageKey].handle;
  return `https://${domain}${prefix}/pages/${handle}`;
}

function pageTitleFor(code, pageKey) {
  const loc = localeOf(code);
  return loc?.pages?.[pageKey]?.title || cfg.pages[pageKey].title;
}

function productUrlFor(code) {
  const loc = localeOf(code);
  const prefix = loc?.urlPrefix || '';
  const handle = loc?.products?.[entity.product.handle]?.handle || entity.product.handle;
  return `https://${domain}${prefix}/products/${handle}`;
}

function placeholders(code) {
  const loc = localeOf(code);
  const shortFile = llmsShortFilename(code);
  const fullFile = llmsFullFilename(code);
  const pages = PAGE_KEYS.filter((k) => cfg.pages[k]).map((k) => `- ${pageTitleFor(code, k)}: ${pageUrlFor(code, k)}`).join('\n');
  const localeLinks = getLocales()
    .filter((l) => l.publish !== false && l.code !== code)
    .map((l) => `- ${l.nativeName} (${l.code}): ${buildHomeUrl(domain, l.code)} · ${buildConfigureUrl(domain, l.code, 'buy')} · ${buildThemeAssetUrl(llmsFullFilename(l.code), domain)}`)
    .join('\n');
  const knowledge = KNOWLEDGE_FILES.map((f) => `- ${f}: ${buildThemeAssetUrl(f, domain)}`).join('\n');
  return {
    UPDATED: entity.updated,
    HOME: buildHomeUrl(domain, code),
    BUY: buildConfigureUrl(domain, code, 'buy'),
    PRODUCT: productUrlFor(code),
    SHORT: buildThemeAssetUrl(shortFile, domain),
    FULL: buildThemeAssetUrl(fullFile, domain),
    SITEMAP_AI: buildThemeAssetUrl(cfg.discovery?.aiSitemap || 'sitemap-ai.xml', domain),
    SITEMAP: `https://${domain}/sitemap.xml`,
    HUMAN_SITEMAP: pageUrlFor(code, 'sitemap'),
    LLM_PAGE: pageUrlFor(code, 'llms'),
    PAGES: pages,
    LOCALE_LINKS: localeLinks || '- (none)',
    KNOWLEDGE: knowledge,
    PRICE: money(entity.product.price.amount, entity.product.price.currency, code),
    COVER_PRICE: money(entity.product.covers.price.amount, entity.product.covers.price.currency, code),
    EMAIL: entity.organization.email,
    LANG: loc?.nativeName || code,
  };
}

function render(template, values) {
  const out = template.replace(/\{\{([A-Z_]+)\}\}/g, (m, key) => (key in values ? values[key] : m));
  const leftover = out.match(/\{\{[A-Z_]+\}\}/g);
  if (leftover) throw new Error(`Unrendered placeholders: ${[...new Set(leftover)].join(', ')}`);
  return out.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

function templateFor(kind, code) {
  const own = path.join(root, `config/llms/${kind}.${code}.md`);
  const en = path.join(root, `config/llms/${kind}.en.md`);
  const file = fs.existsSync(own) ? own : en;
  return { text: fs.readFileSync(file, 'utf8'), native: file === own };
}

let written = 0;
for (const loc of getLlmAssetLocales()) {
  const values = placeholders(loc.code);
  const short = templateFor('short', loc.code);
  const full = templateFor('full', loc.code);
  fs.writeFileSync(path.join(root, 'assets', llmsShortFilename(loc.code)), render(short.text, values));
  fs.writeFileSync(path.join(root, 'assets', llmsFullFilename(loc.code)), render(full.text, values));
  written += 2;
  console.log(`✓ ${llmsShortFilename(loc.code)} + ${llmsFullFilename(loc.code)}${short.native && full.native ? '' : ' (English template, localised URLs)'}`);
}
console.log(`Wrote ${written} LLM files from config/llms/ (entity updated ${entity.updated})`);
