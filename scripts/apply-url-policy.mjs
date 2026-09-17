#!/usr/bin/env node
/**
 * Apply config/url-policy.json product handles to Shopify and to this repo.
 *
 *   node scripts/apply-url-policy.mjs            # dry run: print the plan, change nothing
 *   node scripts/apply-url-policy.mjs --apply    # Admin API + repo files, then tell you what to run next
 *
 * What --apply does, per product in the policy:
 *   1. EN handle: productUpdate (Shopify keeps the old handle reachable only if a
 *      redirect exists, so step 3 creates one).
 *   2. Other locales: translationsRegister for key "handle" (translated handles).
 *   3. urlRedirectCreate old → new for every locale prefix and every legacy handle.
 *   4. Repo: config/languages.json (products.*.handle), config/product-kevin-plus.json,
 *      config/entity.json, config/settings_data.json (product_buy), the configure-url
 *      fallback and the smoke test default.
 * Afterwards run: npm run locales:build && npm run geo:generate && npm run theme:check,
 * then deploy so hreflang, sitemap and llms files carry the new URLs together.
 *
 * Needs SHOPIFY_ADMIN_TOKEN (or client credentials) like the other admin scripts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLocales, loadLanguagesConfig } from './i18n/registry.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--apply');
const policy = JSON.parse(fs.readFileSync(path.join(root, 'config/url-policy.json'), 'utf8'));
const lang = loadLanguagesConfig();
const slug = new RegExp(policy.rules.pattern);

function currentHandle(productKey, code) {
  const loc = getLocales().find((l) => l.code === code);
  if (loc?.primary) return productKey === 'kevin-plus' ? 'kevin-plus' : productKey;
  return loc?.products?.[productKey]?.handle || productKey;
}

const plan = [];
for (const [productKey, spec] of Object.entries(policy.products)) {
  for (const [code, target] of Object.entries(spec.targets)) {
    if (!slug.test(target)) throw new Error(`${productKey}/${code}: target "${target}" violates ${policy.rules.pattern}`);
    if (target.split('-').length > policy.rules.maxWords) throw new Error(`${productKey}/${code}: "${target}" exceeds ${policy.rules.maxWords} words`);
    if (!target.startsWith(`${policy.entityToken}-`) && target !== policy.entityToken) throw new Error(`${productKey}/${code}: "${target}" must start with the entity token`);
    const current = currentHandle(productKey, code);
    const loc = getLocales().find((l) => l.code === code);
    const prefix = loc?.urlPrefix || '';
    const legacy = Object.values(lang.legacyHandles?.[code] || {});
    plan.push({ productKey, code, prefix, current, target, changed: current !== target, redirectsFrom: current !== target ? [current, ...legacy.filter((h) => h.includes(productKey))] : [] });
  }
}

console.log(`URL policy plan (${APPLY ? 'APPLY' : 'dry run'}):`);
for (const p of plan) {
  const from = `${p.prefix}/products/${p.current}`;
  const to = `${p.prefix}/products/${p.target}`;
  console.log(p.changed ? `  ${p.code}: ${from} → ${to}  (301 from ${from})` : `  ${p.code}: ${to}  (already compliant)`);
}
const changes = plan.filter((p) => p.changed);
if (!changes.length) {
  console.log('Nothing to change.');
  process.exit(0);
}
if (!APPLY) {
  console.log('\nDry run only. Re-run with --apply to update Shopify (handles, translations, redirects) and the repo.');
  process.exit(0);
}

const { adminGql } = await import('./lib/shopify-admin-gql.mjs');
const STORE = (process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const gql = (query, variables, mutate = false) => adminGql({ store: STORE, query, variables, mutate });

for (const productKey of new Set(changes.map((c) => c.productKey))) {
  const enHandle = currentHandle(productKey, 'en');
  const { productByHandle } = await gql(`query($h: String!) { productByHandle(handle: $h) { id } }`, { h: enHandle });
  if (!productByHandle) throw new Error(`product ${enHandle} not found in Shopify`);
  const id = productByHandle.id;
  const { translatableResource } = await gql(`query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest } } }`, { id });
  const digest = Object.fromEntries(translatableResource.translatableContent.map((c) => [c.key, c.digest]));

  for (const c of changes.filter((x) => x.productKey === productKey)) {
    const loc = getLocales().find((l) => l.code === c.code);
    if (loc?.primary) {
      const r = await gql(`mutation($input: ProductUpdateInput!) { productUpdate(product: $input) { userErrors { field message } } }`, { input: { id, handle: c.target } }, true);
      if (r.productUpdate.userErrors.length) throw new Error(JSON.stringify(r.productUpdate.userErrors));
      console.log(`✓ EN handle → ${c.target}`);
    } else {
      const r = await gql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { message field } } }`,
        { id, t: [{ locale: loc.shopifyLocale || loc.code, key: 'handle', value: c.target, translatableContentDigest: digest.handle }] }, true);
      if (r.translationsRegister.userErrors.length) throw new Error(`${c.code}: ${JSON.stringify(r.translationsRegister.userErrors)}`);
      console.log(`✓ ${c.code} handle → ${c.target}`);
    }
    for (const oldHandle of c.redirectsFrom) {
      const from = `${c.prefix}/products/${oldHandle}`;
      const to = `${c.prefix}/products/${c.target}`;
      const r = await gql(`mutation($r: UrlRedirectInput!) { urlRedirectCreate(urlRedirect: $r) { userErrors { message field } } }`, { r: { path: from, target: to } }, true);
      if (r.urlRedirectCreate.userErrors.length) console.warn(`  ! redirect ${from}: ${JSON.stringify(r.urlRedirectCreate.userErrors)}`);
      else console.log(`  ✓ redirect ${from} → ${to}`);
    }
  }
}

// Repo side: keep every generator and fallback pointing at the new handles.
const write = (file, text) => fs.writeFileSync(path.join(root, file), text);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const langJson = JSON.parse(read('config/languages.json'));
for (const c of changes) {
  const loc = langJson.locales.find((l) => l.code === c.code);
  if (!loc) continue;
  loc.products = loc.products || {};
  loc.products[c.productKey] = loc.products[c.productKey] || {};
  loc.products[c.productKey].handle = c.target;
}
write('config/languages.json', JSON.stringify(langJson, null, 2) + '\n');
const enTarget = changes.find((c) => c.productKey === 'kevin-plus' && c.code === 'en')?.target;
if (enTarget) {
  const prod = JSON.parse(read('config/product-kevin-plus.json'));
  prod.handle = enTarget; prod.en.handle = enTarget;
  for (const c of changes.filter((x) => x.productKey === 'kevin-plus' && x.code !== 'en')) if (prod[c.code]) prod[c.code].handle = c.target;
  write('config/product-kevin-plus.json', JSON.stringify(prod, null, 2) + '\n');
  const entity = JSON.parse(read('config/entity.json'));
  entity.product.handle = enTarget;
  for (const c of changes.filter((x) => x.productKey === 'kevin-plus')) entity.product.handlesByLocale[c.code] = c.target;
  write('config/entity.json', JSON.stringify(entity, null, 2) + '\n');
  const settings = JSON.parse(read('config/settings_data.json'));
  settings.current.product_buy = enTarget;
  write('config/settings_data.json', JSON.stringify(settings, null, 2) + '\n');
  write('snippets/configure-url.liquid', read('snippets/configure-url.liquid').replaceAll("all_products['kevin-plus']", `all_products['${enTarget}']`));
  write('tests/e2e/checkout-smoke.spec.js', read('tests/e2e/checkout-smoke.spec.js').replace("|| 'kevin-plus'", `|| '${enTarget}'`));
}
console.log('\nRepo updated. Next: npm run locales:build && npm run geo:generate && npm run theme:check, then deploy.');
