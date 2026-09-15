#!/usr/bin/env node
/**
 * Sync product copy (title, description, SEO, handle) for kevin-plus from
 * config/product-kevin-plus.json: EN via productUpdate, other locales via
 * translationsRegister (title, body_html, handle, meta_title, meta_description).
 * Usage: node scripts/sync-product-copy.mjs [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminGql } from './lib/shopify-admin-gql.mjs';
import { getAlternateLocales } from './i18n/registry.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const STORE = (process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const DRY = process.argv.includes('--dry-run');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'config/product-kevin-plus.json'), 'utf8'));
const gql = (query, variables, mutate = false) => adminGql({ store: STORE, query, variables, mutate });

async function main() {
  const { productByHandle: p } = await gql(`{ productByHandle(handle: "${cfg.handle}") { id } }`);
  if (!p) throw new Error(`product ${cfg.handle} not found`);
  const en = cfg.en;
  if (DRY) console.log('[dry] productUpdate', en.title);
  else {
    const r = await gql(`mutation($input: ProductUpdateInput!) { productUpdate(product: $input) { userErrors { field message } } }`,
      { input: { id: p.id, title: en.title, descriptionHtml: en.body_html, seo: { title: en.meta_title, description: en.meta_description } } }, true);
    if (r.productUpdate.userErrors.length) throw new Error(JSON.stringify(r.productUpdate.userErrors));
    console.log('✓ EN product title/description/SEO');
  }
  const { translatableResource } = await gql(`query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest } } }`, { id: p.id });
  const digest = Object.fromEntries(translatableResource.translatableContent.map((c) => [c.key, c.digest]));
  for (const loc of getAlternateLocales()) {
    const tr = cfg[loc.code]; if (!tr) continue;
    const t = ['title', 'body_html', 'handle', 'meta_title', 'meta_description']
      .filter((k) => tr[k] && digest[k])
      .map((k) => ({ locale: loc.shopifyLocale || loc.code, key: k, value: tr[k], translatableContentDigest: digest[k] }));
    if (DRY) { console.log(`[dry] ${loc.code}: ${t.map((x) => x.key).join(',')}`); continue; }
    const r = await gql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { message field } } }`, { id: p.id, t }, true);
    if (r.translationsRegister.userErrors.length) throw new Error(`${loc.code}: ${JSON.stringify(r.translationsRegister.userErrors)}`);
    console.log(`✓ ${loc.code}: ${t.map((x) => x.key).join(', ')}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
