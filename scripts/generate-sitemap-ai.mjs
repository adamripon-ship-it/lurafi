#!/usr/bin/env node
/**
 * Generate assets/sitemap-ai.xml — AI/AEO/GEO sitemap with pages + LLM text assets.
 * Usage: node scripts/generate-sitemap-ai.mjs
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
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

function pageUrl(loc, pageKey, query = '') {
  const prefix = loc.urlPrefix || '';
  const handle = loc.pages?.[pageKey]?.handle || cfg.pages[pageKey].handle;
  return `https://${domain}${prefix}/pages/${handle}${query}`;
}

/** Every hreflang code the storefront publishes for a locale (region-coded set from config/languages.json). */
function hreflangLinks(getUrl) {
  return getLocales()
    .filter((loc) => loc.publish !== false)
    .flatMap((loc) => {
      const href = getUrl(loc);
      const codes = loc.hreflang && loc.hreflang.length ? loc.hreflang : [loc.code];
      return codes.map((code) => `    <xhtml:link rel="alternate" hreflang="${code}" href="${href}"/>`);
    })
    .concat(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${getUrl(getLocales().find((l) => l.primary))}"/>`,
    )
    .join('\n');
}

const today = new Date().toISOString().slice(0, 10);

/** Last content change for a route = newest git commit touching its source files (falls back to today). */
function lastmodFor(files) {
  let best = '';
  for (const f of files) {
    try {
      const d = execSync(`git log -1 --format=%cI -- ${JSON.stringify(f)}`, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim()
        .slice(0, 10);
      if (d && d > best) best = d;
    } catch {
      /* not a git checkout */
    }
  }
  return best || today;
}

function urlBlock(locUrl, hreflangFn, changefreq, priority, lastmod = today) {
  return `  <url>
    <loc>${locUrl}</loc>
    <lastmod>${lastmod}</lastmod>
${hreflangFn ? hreflangLinks(hreflangFn) : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/** Source files whose git history dates each route's content. */
const localePageSources = (k) => [
  'config/footer-pages-en.json',
  `templates/page.${k}.json`,
  ...getLocales().filter((l) => !l.primary).map((l) => `config/i18n/pages-${l.code}.json`),
];

const urlBlocks = [];

const htmlRoutes = [
  { name: 'home', getUrl: (loc) => buildHomeUrl(domain, loc.code), changefreq: 'weekly', priority: '1.0', sources: ['templates/index.json', 'config/home-en.json', 'locales/en.default.json'] },
  {
    name: 'configure-buy',
    getUrl: (loc) => buildConfigureUrl(domain, loc.code, 'buy'),
    changefreq: 'weekly',
    priority: '0.9',
    sources: ['sections/main-configure.liquid', 'config/product-kevin-plus.json'],
  },
  { name: 'llms', getUrl: (loc) => pageUrl(loc, 'llms'), changefreq: 'monthly', priority: '0.7', sources: ['sections/main-llms.liquid', 'config/entity.json'] },
  { name: 'sitemap', getUrl: (loc) => pageUrl(loc, 'sitemap'), changefreq: 'monthly', priority: '0.7', sources: ['sections/main-sitemap.liquid', 'config/languages.json'] },
  // Every editorial page, localised handle per language (config/languages.json).
  ...['features', 'how-it-works', 'the-kevin-app', 'pricing', 'about-kevin', 'press', 'careers', 'setup-guide', 'contact']
    .filter((k) => cfg.pages[k])
    .map((k) => ({ name: k, getUrl: (loc) => pageUrl(loc, k), changefreq: 'monthly', priority: k === 'pricing' || k === 'features' ? '0.8' : '0.6', sources: localePageSources(k) })),
  // The product page, localised handle per language.
  {
    name: 'product-kevin-plus',
    getUrl: (loc) => `https://${domain}${loc.urlPrefix || ''}/products/${loc.products?.['kevin-plus']?.handle || 'kevin-plus'}`,
    changefreq: 'weekly',
    priority: '0.9',
    sources: ['config/product-kevin-plus.json', 'sections/main-product.liquid'],
  },
];

for (const route of htmlRoutes) {
  const lastmod = lastmodFor(route.sources || []);
  for (const loc of getLocales().filter((l) => l.publish !== false)) {
    urlBlocks.push(urlBlock(route.getUrl(loc), route.getUrl, route.changefreq, route.priority, lastmod));
  }
}

/** Machine-readable LLM + discovery assets (listed for crawlers that read sitemap-ai.xml). */
const assetFiles = new Set([
  cfg.discovery?.aiSitemap || 'sitemap-ai.xml',
  cfg.discovery?.llmsShort || 'llms.txt',
  cfg.discovery?.llmsFull || 'llms-full.txt',
]);

// GEO knowledge files (Markdown) — structured facts for AI/LLM ingestion.
const knowledgeFiles = ['kevin.md', 'kevin-product.md', 'kevin-specs.md', 'kevin-faq.md', 'kevin-company.md'];
for (const md of knowledgeFiles) assetFiles.add(md);

for (const loc of getLlmAssetLocales()) {
  if (loc.primary) continue;
  assetFiles.add(llmsShortFilename(loc.code));
  assetFiles.add(llmsFullFilename(loc.code));
}

for (const file of [...assetFiles].sort()) {
  const locUrl = buildThemeAssetUrl(file, domain);
  let priority = '0.75';
  if (file.endsWith('.md')) priority = '0.9';
  else if (file.endsWith('.txt')) priority = '0.85';
  const sources = file.endsWith('.md') ? [`assets/${file}`] : ['config/entity.json', 'config/llms', 'config/languages.json'];
  urlBlocks.push(urlBlock(locUrl, null, 'weekly', priority, lastmodFor(sources)));
}

/** Shopify native sitemap (reference entry for crawlers merging indexes). */
urlBlocks.push(urlBlock(`https://${domain}/sitemap.xml`, null, 'daily', '0.95'));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlBlocks.join('\n')}
</urlset>
`;

const outPath = path.join(root, 'assets/sitemap-ai.xml');
fs.writeFileSync(outPath, xml);
console.log(`Wrote ${outPath} (${urlBlocks.length} URLs, ${assetFiles.size} LLM/discovery assets)`);
