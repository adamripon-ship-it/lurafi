#!/usr/bin/env node
/**
 * Generate assets/sitemap-ai.xml from config/languages.json
 * Usage: node scripts/generate-sitemap-ai.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildConfigureUrl,
  buildHomeUrl,
  getLocales,
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
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${getUrl(getLocales().find((l) => l.primary))}"/>`)
    .join('\n');
}

const routes = [
  { name: 'home', getUrl: (loc) => buildHomeUrl(domain, loc.code) },
  { name: 'configure-buy', getUrl: (loc) => buildConfigureUrl(domain, loc.code, 'buy') },
  { name: 'configure-sub', getUrl: (loc) => buildConfigureUrl(domain, loc.code, 'subscribe') },
  { name: 'llms', getUrl: (loc) => pageUrl(loc, 'llms') },
  { name: 'sitemap', getUrl: (loc) => pageUrl(loc, 'sitemap') },
];

const urlBlocks = [];
for (const route of routes) {
  for (const loc of getLocales()) {
    const locUrl = route.getUrl(loc);
    urlBlocks.push(`  <url>
    <loc>${locUrl}</loc>
${hreflangLinks(route.getUrl)}
    <changefreq>${route.name === 'home' || route.name.startsWith('configure') ? 'weekly' : 'monthly'}</changefreq>
    <priority>${route.name === 'home' ? '1.0' : route.name.startsWith('configure') ? '0.9' : '0.6'}</priority>
  </url>`);
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlBlocks.join('\n')}
</urlset>
`;

const outPath = path.join(root, 'assets/sitemap-ai.xml');
fs.writeFileSync(outPath, xml);
console.log(`Wrote ${outPath} (${urlBlocks.length} URLs)`);
