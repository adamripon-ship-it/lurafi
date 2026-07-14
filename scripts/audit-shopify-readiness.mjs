/**
 * Backend readiness audit for the mitipi.eu Shopify store.
 * Reports ✅ ready / ⚠️ check / ❌ not-ready across the settings that gate a
 * working purchase: products + publication, payments, markets + pricing,
 * shipping, taxes, checkout, and legal policies.
 *
 * Read-only — it changes nothing. Run:
 *   SHOPIFY_ADMIN_TOKEN=shpat_… node scripts/audit-shopify-readiness.mjs
 *   (optional) SHOPIFY_STORE=mitipi-2.myshopify.com
 *
 * Needs a token with read scopes: read_products, read_publications,
 * read_markets, read_price_lists, read_shipping, read_legal_policies (or the
 * broad Admin API read set).
 */
import { adminGql, adminAuthMode } from './lib/shopify-admin-gql.mjs';

const STORE = (process.env.SHOPIFY_STORE || 'mitipi-2.myshopify.com')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');
const DEVICE_HANDLE = process.env.KEVIN_PRODUCT_HANDLE || 'kevin-plus';
const COVER_HANDLE = 'kevin-front-cover';

const results = [];
const add = (status, area, detail) => results.push({ status, area, detail });
const q = (query, variables) => adminGql({ store: STORE, query, variables });

async function check(area, fn) {
  try {
    await fn();
  } catch (e) {
    add('⚠️', area, `could not read (${(e.message || e).slice(0, 120)})`);
  }
}

async function shopBasics() {
  const { shop } = await q(`query {
    shop { name myshopifyDomain currencyCode plan { displayName partnerDevelopment }
      taxesIncluded taxShipping contactEmail
      billingAddress { countryCodeV2 }
      paymentSettings { supportedDigitalWallets } }
  }`);
  add('✅', 'Store', `${shop.name} · ${shop.myshopifyDomain} · ${shop.plan.displayName} plan · base ${shop.currencyCode}`);
  add(shop.contactEmail ? '✅' : '⚠️', 'Contact email', shop.contactEmail || 'none set');
  add('ℹ️', 'Taxes', `taxesIncluded=${shop.taxesIncluded} · taxShipping=${shop.taxShipping} (confirm DE/EU + CH rates in Admin → Settings → Taxes)`);
  const wallets = shop.paymentSettings?.supportedDigitalWallets || [];
  add(wallets.length ? '✅' : '⚠️', 'Digital wallets', wallets.length ? wallets.join(', ') : 'none — verify a card provider is active in Admin → Settings → Payments');
  if (shop.plan.partnerDevelopment) add('⚠️', 'Plan', 'partner/development store — real payments may be disabled until a paid plan is chosen');
}

async function productCheck(handle, label) {
  const { productByIdentifier: p } = await q(`query($h: String!) {
    productByIdentifier(identifier: { handle: $h }) {
      title status onlineStoreUrl
      variants(first: 12) { nodes { title availableForSale price inventoryPolicy } }
      resourcePublicationsV2(first: 12) { nodes { isPublished publication { name } } }
    }
  }`, { h: handle });
  if (!p) { add('❌', label, `product handle "${handle}" not found`); return; }
  add(p.status === 'ACTIVE' ? '✅' : '❌', `${label} status`, p.status);
  const onOnline = (p.resourcePublicationsV2?.nodes || []).some(n => n.isPublished && /online store/i.test(n.publication.name));
  add(onOnline ? '✅' : '❌', `${label} Online Store`, onOnline ? 'published' : `NOT published (onlineStoreUrl=${p.onlineStoreUrl || 'null'}) — needs publishablePublish`);
  const sellable = (p.variants?.nodes || []).filter(v => v.availableForSale).length;
  const total = (p.variants?.nodes || []).length;
  add(sellable === total && total > 0 ? '✅' : sellable > 0 ? '⚠️' : '❌', `${label} sellable`, `${sellable}/${total} variants availableForSale`);
}

async function marketsCheck() {
  const { markets } = await q(`query { markets(first: 20) { nodes { name enabled primary currencySettings { baseCurrency { currencyCode } } } } }`);
  for (const m of markets.nodes) {
    add(m.enabled ? '✅' : '⚠️', `Market: ${m.name}`, `${m.currencySettings.baseCurrency.currencyCode}${m.primary ? ' (primary)' : ''} · ${m.enabled ? 'enabled' : 'disabled'}`);
  }
}

async function priceListsCheck() {
  const { priceLists } = await q(`query { priceLists(first: 30) { nodes { name currency fixedPricesCount } } }`);
  if (!priceLists.nodes.length) { add('⚠️', 'Price lists', 'none — CHF (and any fixed market prices) rely on auto-conversion'); return; }
  for (const pl of priceLists.nodes) add('✅', `Price list: ${pl.name}`, `${pl.currency} · ${pl.fixedPricesCount} fixed prices`);
}

async function shippingCheck() {
  const { deliveryProfiles } = await q(`query {
    deliveryProfiles(first: 5) { nodes { name
      profileLocationGroups { locationGroupZones(first: 30) { nodes {
        zone { name }
        methodDefinitions(first: 10) { nodes { name active } }
      } } } } }
  }`);
  let zones = 0, methods = 0;
  for (const prof of deliveryProfiles.nodes) {
    for (const plg of prof.profileLocationGroups || []) {
      for (const z of plg.locationGroupZones?.nodes || []) {
        zones++;
        methods += (z.methodDefinitions?.nodes || []).filter(m => m.active).length;
      }
    }
  }
  add(zones > 0 && methods > 0 ? '✅' : '❌', 'Shipping', `${zones} zone(s), ${methods} active rate(s) — confirm they cover EU + Switzerland with the free-delivery rate`);
}

async function policiesCheck() {
  const { shop } = await q(`query { shop {
    refundPolicy { url } privacyPolicy { url } termsOfService { url } shippingPolicy { url }
  } }`);
  const map = { 'Refund policy': shop.refundPolicy, 'Privacy policy': shop.privacyPolicy, 'Terms of service': shop.termsOfService, 'Shipping policy': shop.shippingPolicy };
  for (const [name, pol] of Object.entries(map)) add(pol && pol.url ? '✅' : '❌', name, pol && pol.url ? pol.url : 'not set — add in Admin → Settings → Policies');
}

async function main() {
  console.log(`\n=== mitipi.eu Shopify backend readiness ===`);
  console.log(`Auth: ${adminAuthMode()} → ${STORE}\n`);
  await check('Store', shopBasics);
  await check('Device product', () => productCheck(DEVICE_HANDLE, 'Device (Kevin)'));
  await check('Cover product', () => productCheck(COVER_HANDLE, 'Covers'));
  await check('Markets', marketsCheck);
  await check('Price lists', priceListsCheck);
  await check('Shipping', shippingCheck);
  await check('Taxes', async () => {}); // reported inside shopBasics
  await check('Policies', policiesCheck);

  const order = { '❌': 0, '⚠️': 1, 'ℹ️': 2, '✅': 3 };
  results.sort((a, b) => order[a.status] - order[b.status]);
  console.log('──────────────────────────────────────────');
  for (const r of results) console.log(`${r.status}  ${r.area}: ${r.detail}`);
  console.log('──────────────────────────────────────────');
  const bad = results.filter(r => r.status === '❌').length;
  const warn = results.filter(r => r.status === '⚠️').length;
  console.log(`\n${bad} blocker(s), ${warn} to check, ${results.filter(r => r.status === '✅').length} ready.`);
  console.log(bad ? 'Not ready — resolve the ❌ items above.\n' : 'No hard blockers found. Review ⚠️ items.\n');
}

main().catch((e) => { console.error('\n✗', e.message || e); process.exit(1); });
