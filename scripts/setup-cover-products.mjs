/**
 * Create the optional Kevin Front Cover product — ONE product with FOUR colour
 * variants (Red / Brown / Blue / White), 29.00 CHF · 31.50 EUR each — then print
 * (and optionally wire into the theme) the 4 variant ids the configure page needs.
 *
 * The device (Kevin, Grey, cover included) is a separate product that already
 * exists. No discount.
 *
 * Idempotent: safe to re-run. The cover product is keyed by handle.
 *
 * Usage:
 *   SHOPIFY_ADMIN_TOKEN=shpat_… node scripts/setup-cover-products.mjs           # create + print ids
 *   SHOPIFY_ADMIN_TOKEN=shpat_… node scripts/setup-cover-products.mjs --wire    # also patch the *.configure.json templates
 *
 * Needs an admin token (or SHOPIFY_CLIENT_ID/SECRET) with scopes:
 *   write_products, read_products, read_publications, write_publications
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminGql, adminAuthMode } from './lib/shopify-admin-gql.mjs';

const STORE = (process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WIRE = process.argv.includes('--wire');

const HANDLE = 'kevin-front-cover';
const TITLE = 'Kevin Front Cover';
// Price per currency. Store base currency decides which is the variant base
// price; the other is set as a Markets fixed price (best-effort).
const PRICE = { CHF: '29.00', EUR: '31.50' };

// The 4 colour variants → configure cover_1..4. Images are the owner-uploaded
// Shopify Files CDN URLs already used as swatch thumbnails in main-configure.
const VARIANTS = [
  { key: 1, colour: 'Red',   sku: 'KEVIN-COVER-RED',   image: 'https://cdn.shopify.com/s/files/1/0943/9841/5226/files/download_24.png?v=1783616627' },
  { key: 2, colour: 'Brown', sku: 'KEVIN-COVER-BROWN', image: 'https://cdn.shopify.com/s/files/1/0943/9841/5226/files/download_25.png?v=1783616628' },
  { key: 3, colour: 'Blue',  sku: 'KEVIN-COVER-BLUE',  image: 'https://cdn.shopify.com/s/files/1/0943/9841/5226/files/download_29.png?v=1783616628' },
  { key: 4, colour: 'White', sku: 'KEVIN-COVER-WHITE', image: 'https://cdn.shopify.com/s/files/1/0943/9841/5226/files/download_27.png?v=1783616628' },
];

const numericId = (gid) => String(gid || '').split('/').pop();

async function shopCurrency() {
  const { shop } = await adminGql({ store: STORE, query: `query { shop { currencyCode } }` });
  return shop.currencyCode;
}

async function findCoverProduct() {
  const { products } = await adminGql({
    store: STORE,
    query: `query($q: String!) {
      products(first: 1, query: $q) {
        nodes {
          id handle status
          variants(first: 10) { nodes { id sku selectedOptions { name value } } }
        }
      }
    }`,
    variables: { q: `handle:${HANDLE}` },
  });
  return products.nodes[0] || null;
}

async function createCoverProduct(basePrice) {
  const { productSet } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($input: ProductSetInput!, $synchronous: Boolean!) {
      productSet(input: $input, synchronous: $synchronous) {
        product {
          id handle status
          variants(first: 10) { nodes { id sku selectedOptions { name value } } }
        }
        userErrors { field message }
      }
    }`,
    variables: {
      synchronous: true,
      input: {
        handle: HANDLE,
        title: TITLE,
        status: 'ACTIVE',
        vendor: 'Mitipi',
        productType: 'Accessory',
        productOptions: [{ name: 'Colour', values: VARIANTS.map((v) => ({ name: v.colour })) }],
        variants: VARIANTS.map((v) => ({
          price: basePrice,
          sku: v.sku,
          optionValues: [{ optionName: 'Colour', name: v.colour }],
          inventoryPolicy: 'CONTINUE',
        })),
      },
    },
  });
  if (productSet.userErrors?.length) {
    throw new Error(productSet.userErrors.map((e) => e.message).join('; '));
  }
  return productSet.product;
}

async function attachImages(productId) {
  try {
    await adminGql({
      store: STORE,
      mutate: true,
      query: `mutation($id: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $id, media: $media) { mediaUserErrors { message } }
      }`,
      variables: {
        id: productId,
        media: VARIANTS.map((v) => ({ originalSource: v.image, mediaContentType: 'IMAGE', alt: `${v.colour} front cover` })),
      },
    });
  } catch (e) {
    console.log(`  ⚠ image attach skipped: ${e.message}`);
  }
}

async function publishOnlineStore(productId) {
  const { publications } = await adminGql({
    store: STORE,
    query: `query { publications(first: 10) { nodes { id name } } }`,
  });
  const targets = publications.nodes.filter((p) => /online store|^shop$/i.test(p.name));
  if (!targets.length) return;
  await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) { userErrors { message } }
    }`,
    variables: { id: productId, input: targets.map((p) => ({ publicationId: p.id })) },
  });
}

async function setForeignPrices(variantIdByColour, currency, amount) {
  // Best-effort: fixed price on any price list whose currency matches.
  try {
    const { priceLists } = await adminGql({
      store: STORE,
      query: `query { priceLists(first: 20) { nodes { id currency } } }`,
    });
    const lists = priceLists.nodes.filter((l) => l.currency === currency);
    if (!lists.length) {
      console.log(`  ⚠ no ${currency} price list found — set ${currency} ${amount} in Admin → Markets if needed.`);
      return;
    }
    const prices = VARIANTS.map((v) => ({
      variantId: variantIdByColour[v.colour],
      price: { amount, currencyCode: currency },
    }));
    for (const list of lists) {
      await adminGql({
        store: STORE,
        mutate: true,
        query: `mutation($priceListId: ID!, $prices: [PriceListPriceInput!]!) {
          priceListFixedPricesAdd(priceListId: $priceListId, prices: $prices) { userErrors { field message } }
        }`,
        variables: { priceListId: list.id, prices },
      });
    }
    console.log(`✓ set ${currency} ${amount} on ${lists.length} price list(s)`);
  } catch (e) {
    console.log(`  ⚠ ${currency} fixed price skipped: ${e.message}`);
  }
}

function colourMap(product) {
  const map = {};
  for (const node of product.variants.nodes) {
    const opt = node.selectedOptions.find((o) => o.name === 'Colour');
    if (opt) map[opt.value] = node.id;
  }
  return map;
}

function wireTheme(ids) {
  const templates = ['page.configure.json', 'product.configure.json', 'index.configure.json'];
  for (const t of templates) {
    const p = join(ROOT, 'templates', t);
    const json = JSON.parse(readFileSync(p, 'utf8'));
    const s = (json.sections.main.settings ||= {});
    for (const v of VARIANTS) s[`cover_${v.key}_variant`] = ids[v.key];
    writeFileSync(p, JSON.stringify(json, null, 2) + '\n');
    console.log(`✓ wired variant ids into templates/${t}`);
  }
}

async function main() {
  console.log(`Auth: ${adminAuthMode()} → ${STORE}`);
  const currency = await shopCurrency();
  const basePrice = PRICE[currency] || PRICE.CHF;
  const foreign = currency === 'EUR' ? 'CHF' : 'EUR';
  console.log(`Store currency: ${currency} → base ${basePrice}; ${foreign} fixed ${PRICE[foreign]}\n`);

  let product = await findCoverProduct();
  if (product) {
    console.log(`✓ "${TITLE}" exists (${product.id})`);
  } else {
    console.log(`→ creating "${TITLE}" with 4 colour variants…`);
    product = await createCoverProduct(basePrice);
    await attachImages(product.id);
    console.log(`✓ created (${product.id})`);
  }
  await publishOnlineStore(product.id);

  const gidByColour = colourMap(product);
  const ids = {};
  for (const v of VARIANTS) ids[v.key] = numericId(gidByColour[v.colour]);
  await setForeignPrices(gidByColour, foreign, PRICE[foreign]);

  console.log('\n──────── COVER VARIANT IDS ────────');
  for (const v of VARIANTS) console.log(`  cover_${v.key}_variant  (${v.colour})  = ${ids[v.key]}`);
  console.log('───────────────────────────────────');

  if (WIRE) {
    wireTheme(ids);
    console.log('\nNext: commit + push the templates, then run the deploy workflow.');
  } else {
    console.log('\nPaste those 4 ids into Theme editor → Configure → Cover 1–4 variant,');
    console.log('or re-run with --wire to write them into the *.configure.json templates.');
  }
}

main().catch((e) => {
  console.error('\n✗', e.message || e);
  process.exit(1);
});
