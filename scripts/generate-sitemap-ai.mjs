#!/usr/bin/env node
/**
 * Generate assets/sitemap-ai.xml — AI/AEO/GEO sitemap with pages + LLM text assets.
 * Usage: node scripts/generate-sitemap-ai.mjs
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

function pageUrl(loc, pageKey, query = '') {
  const prefix = loc.urlPrefix || '';
  const handle = loc.pages?.[pageKey]?.handle || cfg.pages[pageKey].handle;
  return `https://${domain}${prefix}/pages/${handle}${query}`;
}

function hreflangLinks(getUrl) {
  return getLocales()
    .map((loc) => {
      const code = loc.code === 'en' ? 'en' : loc.code;
      const href = getUrl(loc);
      return `    <xhtml:link rel="alternate" hreflang="${code}" href="${href}"/>`;
    })
    .concat(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${getUrl(getLocales().find((l) => l.primary))}"/>`,
    )
    .join('\n');
}

function urlBlock(locUrl, hreflangFn, changefreq, priority) {
  return `  <url>
    <loc>${locUrl}</loc>
${hreflangFn ? hreflangLinks(hreflangFn) : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const urlBlocks = [];

const htmlRoutes = [
  { name: 'home', getUrl: (loc) => buildHomeUrl(domain, loc.code), changefreq: 'weekly', priority: '1.0' },
  {
    name: 'configure-buy',
    getUrl: (loc) => buildConfigureUrl(domain, loc.code, 'buy'),
    changefreq: 'weekly',
    priority: '0.9',
  },
  { name: 'llms', getUrl: (loc) => pageUrl(loc, 'llms'), changefreq: 'monthly', priority: '0.7' },
  { name: 'sitemap', getUrl: (loc) => pageUrl(loc, 'sitemap'), changefreq: 'monthly', priority: '0.7' },
];

for (const route of htmlRoutes) {
  for (const loc of getLocales()) {
    urlBlocks.push(urlBlock(route.getUrl(loc), route.getUrl, route.changefreq, route.priority));
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
  urlBlocks.push(urlBlock(locUrl, null, 'weekly', priority));
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
