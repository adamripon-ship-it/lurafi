#!/usr/bin/env node
/**
 * Register shop policy translations (body) from config/i18n/policies/<lang>.json.
 * Titles are localised by Shopify itself. Usage: node scripts/sync-policy-translations.mjs [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminGql } from './lib/shopify-admin-gql.mjs';
import { getAlternateLocales } from './i18n/registry.mjs';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const STORE = process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com';
const DRY = process.argv.includes('--dry-run');
const gql = (query, variables, mutate = false) => adminGql({ store: STORE, query, variables, mutate });
const { shop } = await gql(`{ shop { shopPolicies { id type } } }`);
for (const loc of getAlternateLocales()) {
  const file = path.join(root, `config/i18n/policies/${loc.code}.json`);
  if (!fs.existsSync(file)) { console.log(`· ${loc.code}: no file`); continue; }
  const items = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const item of items) {
    const policy = shop.shopPolicies.find((p) => p.type === item.type); if (!policy || !item.body) continue;
    const { translatableResource } = await gql(`query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest } } }`, { id: policy.id });
    const digest = translatableResource.translatableContent.find((c) => c.key === 'body')?.digest; if (!digest) continue;
    if (DRY) { console.log(`[dry] ${loc.code} ${item.type} (${item.body.length} chars)`); continue; }
    const r = await gql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { message } } }`, { id: policy.id, t: [{ locale: loc.shopifyLocale || loc.code, key: 'body', value: item.body, translatableContentDigest: digest }] }, true);
    if (r.translationsRegister.userErrors.length) throw new Error(`${loc.code} ${item.type}: ${JSON.stringify(r.translationsRegister.userErrors)}`);
    console.log(`✓ ${loc.code} ${item.type}`);
  }
}
