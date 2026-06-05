#!/usr/bin/env node
/** Admin/backend checklist for mitipi-2 migration QA */
import { getPublishedLocales } from './i18n/registry.mjs';
import { adminGql } from './lib/shopify-admin-gql.mjs';

const STORE = (process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const report = { pass: [], warn: [], fail: [] };

function ok(m) {
  report.pass.push(m);
  console.log(`  ✓ ${m}`);
}
function caution(m) {
  report.warn.push(m);
  console.log(`  ⚠ ${m}`);
}
function bad(m) {
  report.fail.push(m);
  console.log(`  ✗ ${m}`);
}

async function main() {
  console.log(`\n=== Shopify backend: ${STORE} ===\n`);

  const { shop, shopLocales, themes, products, pages } = await adminGql({
    store: STORE,
    query: `query {
      shop {
        name email myshopifyDomain currencyCode primaryDomain { url host }
        plan { displayName }
      }
      shopLocales { locale primary published }
      themes(first: 20) { nodes { id name role } }
      products(first: 10, query: "handle:kevin OR handle:kevin-plus") {
        nodes { id handle title status sellingPlanGroups(first:1) { nodes { name } } }
      }
      pages(first: 30) { nodes { handle title templateSuffix } }
    }`,
  });

  ok(`Shop: ${shop.name} (${shop.email})`);
  ok(`Domain: ${shop.primaryDomain.url}`);
  ok(`Currency: ${shop.currencyCode}`);

  const live = themes.nodes.find((t) => t.role === 'MAIN');
  if (live?.name?.toLowerCase().includes('lurafi')) ok(`Live theme: ${live.name}`);
  else bad(`Live theme is "${live?.name || 'unknown'}" — expected lurafi-deploy`);

  const horizonLive = themes.nodes.find((t) => /^horizon$/i.test(t.name) && t.role === 'MAIN');
  if (horizonLive) bad('Horizon is still MAIN — storefront may show wrong theme');

  const expectedLocales = getPublishedLocales().map((l) => l.shopifyLocale || l.code);
  const published = shopLocales.filter((l) => l.published);
  const missing = expectedLocales.filter((code) => !published.some((l) => l.locale === code));
  if (!missing.length) ok(`${published.length} published locales (${expectedLocales.join(', ')})`);
  else bad(`Missing published locales: ${missing.join(', ')} (have ${published.map((l) => l.locale).join(', ')})`);

  const handles = ['kevin', 'kevin-plus'];
  for (const h of handles) {
    const p = products.nodes.find((x) => x.handle === h);
    if (p) {
      const plans = p.sellingPlanGroups?.nodes?.length || 0;
      if (h === 'kevin-plus' && plans === 0) caution(`Product ${h} exists but no selling plan groups`);
      else ok(`Product ${h}: ${p.title} (${p.status})${plans ? `, ${plans} plan group(s)` : ''}`);
    } else bad(`Missing product handle: ${h}`);
  }

  for (const h of ['configure', 'sitemap', 'llms']) {
    const p = pages.nodes.find((x) => x.handle === h);
    if (p) ok(`Page /pages/${h}`);
    else bad(`Missing page: ${h}`);
  }

  caution('Verify shipping + payments manually in Admin → Settings');

  console.log(`\n--- Summary: ${report.pass.length} pass, ${report.warn.length} warn, ${report.fail.length} fail ---\n`);
  if (report.fail.length) process.exit(1);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
