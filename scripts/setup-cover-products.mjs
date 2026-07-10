/**
 * Create the optional Kevin front-cover add-on products + the "Buy 3 Kevins,
 * save 15%" automatic discount, then print (and optionally wire into the theme)
 * the variant ids the configure page needs.
 *
 * Idempotent: safe to re-run. Products are keyed by handle; the discount by title.
 *
 * Usage:
 *   SHOPIFY_ADMIN_TOKEN=shpat_… node scripts/setup-cover-products.mjs           # create + print ids
 *   SHOPIFY_ADMIN_TOKEN=shpat_… node scripts/setup-cover-products.mjs --wire    # also patch the *.configure.json templates
 *
 * Needs an admin token (or SHOPIFY_CLIENT_ID/SECRET) with scopes:
 *   write_products, read_products, write_discounts, read_discounts, read_publications, write_publications
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

// Price per currency. Store base currency decides which is the variant's base
// price; the other is set as a Markets fixed price (best-effort).
const PRICE = { CHF: '29.00', EUR: '31.50' };
const KEVIN_HANDLE = process.env.KEVIN_PRODUCT_HANDLE || 'kevin';

// The 4 optional covers. Images are the owner-uploaded Shopify Files CDN URLs
// already used as swatch thumbnails in sections/main-configure.liquid.
const COVERS = [
  { key: 1, handle: 'kevin-cover-red',   title: 'Kevin Front Cover — Red',   color: 'Red',   sku: 'KEVIN-COVER-RED',   image: 'https://cdn.shopify.com/s/files/1/0943/9841/5226/files/download_24.png?v=1783616627' },
  { key: 2, handle: 'kevin-cover-brown', title: 'Kevin Front Cover — Brown', color: 'Brown', sku: 'KEVIN-COVER-BROWN', image: 'https://cdn.shopify.com/s/files/1/0943/9841/5226/files/download_25.png?v=1783616628' },
  { key: 3, handle: 'kevin-cover-blue',  title: 'Kevin Front Cover — Blue',  color: 'Blue',  sku: 'KEVIN-COVER-BLUE',  image: 'https://cdn.shopify.com/s/files/1/0943/9841/5226/files/download_29.png?v=1783616628' },
  { key: 4, handle: 'kevin-cover-white', title: 'Kevin Front Cover — White', color: 'White', sku: 'KEVIN-COVER-WHITE', image: 'https://cdn.shopify.com/s/files/1/0943/9841/5226/files/download_27.png?v=1783616628' },
];

const numericId = (gid) => String(gid || '').split('/').pop();

async function shopCurrency() {
  const { shop } = await adminGql({ store: STORE, query: `query { shop { currencyCode } }` });
  return shop.currencyCode;
}

async function findProduct(handle) {
  const { products } = await adminGql({
    store: STORE,
    query: `query($q: String!) {
      products(first: 1, query: $q) {
        nodes { id handle status variants(first: 1) { nodes { id price } } }
      }
    }`,
    variables: { q: `handle:${handle}` },
  });
  return products.nodes[0] || null;
}

async function createCover(cover, basePrice) {
  const { productSet } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($input: ProductSetInput!, $synchronous: Boolean!) {
      productSet(input: $input, synchronous: $synchronous) {
        product { id handle status variants(first: 1) { nodes { id price } } }
        userErrors { field message }
      }
    }`,
    variables: {
      synchronous: true,
      input: {
        handle: cover.handle,
        title: cover.title,
        status: 'ACTIVE',
        vendor: 'Mitipi',
        productType: 'Accessory',
        productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
        variants: [
          {
            price: basePrice,
            sku: cover.sku,
            optionValues: [{ optionName: 'Title', name: 'Default Title' }],
            inventoryPolicy: 'CONTINUE',
          },
        ],
      },
    },
  });
  if (productSet.userErrors?.length) {
    throw new Error(productSet.userErrors.map((e) => e.message).join('; '));
  }
  return productSet.product;
}

async function attachImage(productId, cover) {
  try {
    await adminGql({
      store: STORE,
      mutate: true,
      query: `mutation($id: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $id, media: $media) {
          mediaUserErrors { message }
        }
      }`,
      variables: {
        id: productId,
        media: [{ originalSource: cover.image, mediaContentType: 'IMAGE', alt: `${cover.color} front cover` }],
      },
    });
  } catch (e) {
    console.log(`  ⚠ image attach skipped for ${cover.handle}: ${e.message}`);
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

async function setForeignPrice(variantId, currency, amount) {
  // Best-effort: set a fixed price on any price list whose currency matches.
  try {
    const { priceLists } = await adminGql({
      store: STORE,
      query: `query { priceLists(first: 20) { nodes { id name currency } } }`,
    });
    const lists = priceLists.nodes.filter((l) => l.currency === currency);
    if (!lists.length) return false;
    for (const list of lists) {
      await adminGql({
        store: STORE,
        mutate: true,
        query: `mutation($priceListId: ID!, $prices: [PriceListPriceInput!]!) {
          priceListFixedPricesAdd(priceListId: $priceListId, prices: $prices) {
            userErrors { field message }
          }
        }`,
        variables: {
          priceListId: list.id,
          prices: [{ variantId, price: { amount, currencyCode: currency } }],
        },
      });
    }
    return true;
  } catch (e) {
    console.log(`  ⚠ ${currency} fixed price skipped: ${e.message}`);
    return false;
  }
}

async function ensureDiscount(kevinProductId) {
  const title = 'Buy 3 Kevins, save 15%';
  const { automaticDiscountNodes } = await adminGql({
    store: STORE,
    query: `query($q: String!) {
      automaticDiscountNodes(first: 5, query: $q) { nodes { id } }
    }`,
    variables: { q: `title:'${title}'` },
  });
  if (automaticDiscountNodes.nodes.length) {
    console.log(`✓ discount already exists (${automaticDiscountNodes.nodes[0].id})`);
    return;
  }
  const { discountAutomaticBasicCreate } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($d: DiscountAutomaticBasicInput!) {
      discountAutomaticBasicCreate(automaticBasicDiscount: $d) {
        automaticDiscountNode { id }
        userErrors { field message }
      }
    }`,
    variables: {
      d: {
        title,
        startsAt: '2020-01-01T00:00:00Z',
        customerGets: {
          value: { percentage: 0.15 },
          items: { products: { productsToAdd: [kevinProductId] } },
        },
        minimumRequirement: {
          quantity: { greaterThanOrEqualToQuantity: '3' },
        },
      },
    },
  });
  if (discountAutomaticBasicCreate.userErrors?.length) {
    throw new Error(discountAutomaticBasicCreate.userErrors.map((e) => e.message).join('; '));
  }
  console.log(`✓ created discount "${title}"`);
}

function wireTheme(ids) {
  const templates = ['page.configure.json', 'product.configure.json', 'index.configure.json'];
  for (const t of templates) {
    const p = join(ROOT, 'templates', t);
    const json = JSON.parse(readFileSync(p, 'utf8'));
    const s = (json.sections.main.settings ||= {});
    for (const c of COVERS) s[`cover_${c.key}_variant`] = ids[c.key];
    writeFileSync(p, JSON.stringify(json, null, 2) + '\n');
    console.log(`✓ wired variant ids into templates/${t}`);
  }
}

async function main() {
  console.log(`Auth: ${adminAuthMode()} → ${STORE}`);
  const currency = await shopCurrency();
  const basePrice = PRICE[currency] || PRICE.CHF;
  const foreign = currency === 'EUR' ? 'CHF' : 'EUR';
  console.log(`Store currency: ${currency} → base price ${basePrice}; ${foreign} fixed price ${PRICE[foreign]}\n`);

  const ids = {};
  for (const cover of COVERS) {
    let product = await findProduct(cover.handle);
    if (product) {
      console.log(`✓ ${cover.handle} exists (${product.id})`);
    } else {
      console.log(`→ creating ${cover.handle}…`);
      product = await createCover(cover, basePrice);
      await attachImage(product.id, cover);
      console.log(`✓ created ${cover.handle} (${product.id})`);
    }
    await publishOnlineStore(product.id);
    const variantId = product.variants.nodes[0].id;
    ids[cover.key] = numericId(variantId);
    if (PRICE[foreign]) await setForeignPrice(variantId, foreign, PRICE[foreign]);
  }

  // Discount targets the Kevin device product.
  const kevin = await findProduct(KEVIN_HANDLE);
  if (kevin) {
    await ensureDiscount(kevin.id);
  } else {
    console.log(`⚠ Kevin product "${KEVIN_HANDLE}" not found — set KEVIN_PRODUCT_HANDLE and re-run for the discount.`);
  }

  console.log('\n──────── COVER VARIANT IDS ────────');
  for (const c of COVERS) console.log(`  cover_${c.key}_variant  (${c.color})  = ${ids[c.key]}`);
  console.log('───────────────────────────────────');

  if (WIRE) {
    wireTheme(ids);
    console.log('\nNext: git add -A && git commit -m "Configure: wire live cover variant ids" && git push, then run the deploy workflow.');
  } else {
    console.log('\nPaste those 4 ids into Theme editor → Configure section → Cover 1–4 variant,');
    console.log('or re-run with --wire to write them into the *.configure.json templates automatically.');
  }
}

main().catch((e) => {
  console.error('\n✗', e.message || e);
  process.exit(1);
});
