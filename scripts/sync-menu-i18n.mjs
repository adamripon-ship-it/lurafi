#!/usr/bin/env node
/** Translate Shopify navigation menu item titles from config/i18n/menus.json. Usage: node scripts/sync-menu-i18n.mjs */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { adminGql } from './lib/shopify-admin-gql.mjs';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const STORE = process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com';
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config/i18n/menus.json'), 'utf8')); // { menuHandle: { "EN title": { nl, de, fr, cs } } }
const gql = (query, variables, mutate=false) => adminGql({ store: STORE, query, variables, mutate });
// Menu items are translatable as LINK resources (MenuItem gids are not accepted by translatableResource).
const { menus } = await gql(`{ menus(first: 20) { nodes { handle items { title } } } }`);
const wanted = {}; // EN title → translations (merged across menus; identical titles share a translation)
for (const menu of menus.nodes) for (const item of menu.items) { const tr = cfg[menu.handle]?.[item.title]; if (tr) wanted[item.title] = tr; else console.log(`· ${menu.handle}: no translation for "${item.title}"`); }
let cursor = null, done = 0;
do {
  const { translatableResources } = await gql(`query($c: String) { translatableResources(first: 100, after: $c, resourceType: LINK) { pageInfo { hasNextPage endCursor } nodes { resourceId translatableContent { key value digest } } } }`, { c: cursor });
  for (const n of translatableResources.nodes) {
    const c = n.translatableContent.find((x) => x.key === 'title'); const tr = c && wanted[c.value]; if (!tr) continue;
    const t = Object.entries(tr).map(([locale, value]) => ({ locale, key: 'title', value, translatableContentDigest: c.digest }));
    const r = await gql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { message } } }`, { id: n.resourceId, t }, true);
    if (r.translationsRegister.userErrors.length) throw new Error(JSON.stringify(r.translationsRegister.userErrors));
    console.log(`✓ ${c.value} → ${Object.values(tr).join(' / ')}`); done++;
  }
  cursor = translatableResources.pageInfo.hasNextPage ? translatableResources.pageInfo.endCursor : null;
} while (cursor);
console.log(`${done} links translated`);
