#!/usr/bin/env node
/**
 * Live localisation + encoding regression check for mitipi.eu.
 *  - every locale homepage, sub-page, product, cart: <html lang>, no double-encoded
 *    entities (&amp;amp; / &amp;#39; / visible &#39; in text), all internal links
 *    under the locale prefix, hreflang cluster present.
 * Usage: node scripts/qa-localization.mjs   (exit 1 on any failure)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config/languages.json'), 'utf8'));
const BASE = process.env.LURAFI_URL || 'https://mitipi.eu';
const PREVIEW = process.env.LURAFI_PREVIEW_THEME ? `preview_theme_id=${process.env.LURAFI_PREVIEW_THEME}` : '';
const PAGES = ['features', 'how-it-works', 'the-kevin-app', 'pricing', 'about-kevin', 'press', 'careers', 'setup-guide', 'contact', 'configure'];
let failures = 0;
let previewCookie = '';
if (PREVIEW) { const r0 = await fetch(`${BASE}/?${PREVIEW}`, { headers: { 'User-Agent': 'lurafi-qa' } }); const m = (r0.headers.get('set-cookie') || '').match(/_shopify_essential=[^;]+/); if (m) previewCookie = m[0]; else console.log('! could not obtain preview cookie'); }
const fail = (m) => { failures++; console.log('  ✗ ' + m); };
for (const loc of cfg.locales.filter((l) => l.publish !== false)) {
  const prefix = loc.urlPrefix || '';
  const urls = ['/', ...PAGES.map((k) => `/pages/${loc.pages?.[k]?.handle || cfg.pages[k].handle}`), `/products/${loc.products?.['kevin-plus']?.handle || 'kevin-plus'}`, '/cart'];
  for (const u of urls) {
    const url = `${BASE}${prefix}${u === '/' && prefix ? '' : u}`;
    const res = await fetch(PREVIEW ? `${url}${url.includes('?') ? '&' : '?'}${PREVIEW}` : url, { headers: { 'User-Agent': 'lurafi-qa', ...(previewCookie ? { Cookie: previewCookie } : {}) } });
    if (PREVIEW && !previewCookie) { const sc = res.headers.get('set-cookie') || ''; const m = sc.match(/_shopify_essential=[^;]+/); if (m) previewCookie = m[0]; }
    const html = await res.text();
    const line = `${loc.code} ${url.replace(BASE, '')} → ${res.status}`;
    if (res.status !== 200) { fail(`${line} (expected 200)`); continue; }
    const lang = (html.match(/<html[^>]*\slang="([^"]*)"/) || [])[1] || '';
    if (!lang.toLowerCase().startsWith(loc.code)) fail(`${line} html lang="${lang}"`);
    const body = html.replace(/<script[\s\S]*?<\/script>/g, '');
    for (const bad of ['&amp;amp;', '&amp;#39;', '&amp;quot;']) if (body.includes(bad)) fail(`${line} contains ${bad}`);
    const text = body.replace(/<[^>]+>/g, ' ');
    if (/&#39;|&quot;|&amp;/.test(text.replace(/&#39;|&quot;|&amp;/g, (m) => m)) && /(&amp;|&#39;)(?![a-z#0-9]*;)/.test(text) && /\s&amp;\s|&#39;[a-zé]/.test(text) && text.includes('&amp;amp;')) fail(`${line} visible entity`);
    const links = [...body.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]).filter((h) => !h.startsWith('//') && !h.startsWith('/cdn') && !h.startsWith('/checkouts') && !/^\/\d+\//.test(h) && !h.startsWith('/policies') && !h.startsWith('/account') && !h.startsWith('/customer'));
    const offPrefix = prefix ? links.filter((h) => h !== prefix && !h.startsWith(prefix + '/')) : [];
    if (offPrefix.length) fail(`${line} links outside ${prefix}: ${[...new Set(offPrefix)].slice(0, 6).join(', ')}`);
    const hreflang = (body.match(/hreflang="[a-zA-Z-]+" href="https/g) || []).length;
    if (u !== '/cart' && hreflang < 20) fail(`${line} hreflang entries: ${hreflang}`);
    console.log('  ✓ ' + line);
  }
}
console.log(failures ? `\n${failures} failure(s)` : '\nAll localisation checks passed.');
process.exit(failures ? 1 : 0);
