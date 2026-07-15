/**
 * Provision Kevin device + front-cover pricing across Shopify markets.
 *
 * Price matrix (owner-set):
 *   Device (kevin-plus)     EUR 649.95  · CHF 549.00 · CZK 15745.00
 *   Front cover (4 colours) EUR  31.50  · CHF  29.00
 *
 *   - EUR is the base currency → serves the Ireland, Netherlands, France and
 *     Germany markets (all EUR) via the variant price.
 *   - CHF is a fixed price on the Switzerland (CHF) price list.
 *   - CZK is a fixed price on the Czech Republic (CZK) price list, if one exists.
 *
 * Auth is durable and non-interactive: scripts/lib/shopify-admin-gql.mjs reads a
 * custom-app Admin API token from SHOPIFY_ADMIN_TOKEN (which does not expire), or
 * mints one from SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET. No MCP, no re-auth.
 *
 * Usage:
 *   SHOPIFY_ADMIN_TOKEN=shpat_... SHOPIFY_STORE=mitipi-2.myshopify.com \
 *     node scripts/provision-pricing.mjs [--dry-run]
 *
 * Idempotent: re-running with the same targets makes no further changes.
 */
import { adminGql, adminAuthMode } from './lib/shopify-admin-gql.mjs';

const STORE = (process.env.SHOPIFY_STORE || 'mitipi-2.myshopify.com')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');
const DRY = process.argv.includes('--dry-run') || process.env.DRY_RUN === '1';

// Price matrix. base = EUR (the shop's base currency); the rest are fixed
// prices keyed by the presentment currency of a market price list.
const PRODUCTS = [
  { key: 'device', handle: process.env.DEVICE_HANDLE || 'kevin-plus', base: '649.95', fixed: { CHF: '549.00', CZK: '15745.00' } },
  { key: 'cover', handle: process.env.COVER_HANDLE || 'kevin-front-cover', base: '31.50', fixed: { CHF: '29.00' } },
];

const log = (...a) => console.log(...a);
const gql = (query, variables, mutate = false) =>
  adminGql({ store: STORE, query, variables, mutate });

async function findProduct(handle) {
  const data = await gql(
    `query P($q: String!) {
       products(first: 1, query: $q) {
         nodes { id title handle variants(first: 100) { nodes { id title price } } }
       }
     }`,
    { q: `handle:${handle}` },
  );
  return data.products.nodes[0] || null;
}

async function setBasePrice(product, price) {
  const stale = product.variants.nodes.filter((v) => v.price !== price);
  if (!stale.length) {
    log(`  = base EUR already ${price} on all ${product.variants.nodes.length} variant(s).`);
    return;
  }
  if (DRY) {
    log(`  ~ [dry-run] would set base EUR ${price} on ${stale.length} variant(s).`);
    return;
  }
  const r = await gql(
    `mutation SetBase($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
       productVariantsBulkUpdate(productId: $productId, variants: $variants) {
         productVariants { id price }
         userErrors { field message }
       }
     }`,
    { productId: product.id, variants: stale.map((v) => ({ id: v.id, price })) },
    true,
  );
  log(`  ✓ base EUR → ${price} on ${r.productVariantsBulkUpdate.productVariants.length} variant(s).`);
}

async function setFixedPrices(priceListId, listName, currency, product, amount) {
  if (DRY) {
    log(`  ~ [dry-run] would set ${currency} ${amount} on "${listName}" for ${product.variants.nodes.length} variant(s).`);
    return;
  }
  const prices = product.variants.nodes.map((v) => ({
    variantId: v.id,
    price: { amount, currencyCode: currency },
  }));
  const r = await gql(
    `mutation AddFixed($priceListId: ID!, $prices: [PriceListPriceInput!]!) {
       priceListFixedPricesAdd(priceListId: $priceListId, prices: $prices) {
         prices { variant { id } price { amount currencyCode } }
         userErrors { field message }
       }
     }`,
    { priceListId, prices },
    true,
  );
  log(`  ✓ ${currency} → ${amount} on "${listName}" for ${r.priceListFixedPricesAdd.prices.length} variant(s).`);
}

async function main() {
  log(`Store: ${STORE}  (auth: ${adminAuthMode()})${DRY ? '  [DRY RUN]' : ''}`);

  const shop = await gql(`query Shop { shop { name currencyCode } }`);
  log(`Shop: ${shop.shop.name} — base currency ${shop.shop.currencyCode}`);
  if (shop.shop.currencyCode !== 'EUR') {
    log(`! Shop base currency is ${shop.shop.currencyCode}, not EUR. The "base" prices ` +
      `below will be set in ${shop.shop.currencyCode}. If EUR is a market override, move ` +
      `the euro prices onto an EUR price list instead.`);
  }

  // Resolve products.
  const resolved = [];
  for (const p of PRODUCTS) {
    const product = await findProduct(p.handle);
    if (!product) {
      log(`! Product not found for handle "${p.handle}" — skipping.`);
      continue;
    }
    resolved.push({ ...p, product });
    log(`Product: ${product.title} [${p.handle}] — ${product.variants.nodes.length} variant(s).`);
  }

  // 1) Base EUR prices (Ireland / Netherlands / France / Germany).
  log('\n— Base EUR prices —');
  for (const r of resolved) {
    log(`${r.product.title}:`);
    await setBasePrice(r.product, r.base);
  }

  // Introspect markets + price lists.
  const markets = await gql(
    `query Markets { markets(first: 50) { nodes {
       id name handle status currencySettings { baseCurrency { currencyCode } }
     } } }`,
  );
  log('\nMarkets:');
  for (const m of markets.markets.nodes) {
    log(`  - ${m.name} [${m.handle}] ${m.currencySettings?.baseCurrency?.currencyCode || '?'} ${m.status} ${m.id}`);
  }

  const priceLists = await gql(
    `query PriceLists { priceLists(first: 50) { nodes { id name currency } } }`,
  );
  log('Price lists:');
  for (const p of priceLists.priceLists.nodes) log(`  - ${p.name} ${p.currency} ${p.id}`);

  // 2) Fixed prices per currency price list (CHF for Switzerland, CZK for Czechia).
  log('\n— Fixed market prices —');
  for (const currency of ['CHF', 'CZK']) {
    const list = priceLists.priceLists.nodes.find((p) => p.currency === currency);
    if (!list) {
      log(`! No ${currency} price list found. Its market (${currency === 'CHF' ? 'Switzerland' : 'Czech Republic'}) ` +
        `must exist with currency ${currency} (Admin → Settings → Markets). Re-run once it exists.`);
      continue;
    }
    for (const r of resolved) {
      const amount = r.fixed[currency];
      if (!amount) continue;
      log(`${r.product.title} → ${currency}:`);
      await setFixedPrices(list.id, list.name, currency, r.product, amount);
    }
  }

  log('\nDone.');
}

main().catch((err) => {
  console.error('provision-pricing failed:', err.message);
  process.exitCode = 1;
});
