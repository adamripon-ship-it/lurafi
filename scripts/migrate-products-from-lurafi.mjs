#!/usr/bin/env node
/**
 * Create kevin + kevin-plus on destination store from lurafi.ai product JSON.
 * Requires write_products on installed lurafi app (version approved on store).
 */
import { adminGql, adminAuthMode } from './lib/shopify-admin-gql.mjs';

const SOURCE = process.env.LURAFI_SOURCE_STORE || 'https://lurafi.ai';
const STORE = (process.env.SHOPIFY_STORE || 'mitipi-2.myshopify.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const HANDLES = ['kevin', 'kevin-plus'];

async function fetchProduct(handle) {
  const res = await fetch(`${SOURCE}/products/${handle}.json`);
  if (!res.ok) throw new Error(`Failed to fetch ${handle}: HTTP ${res.status}`);
  return (await res.json()).product;
}

async function productExists(handle) {
  const { products } = await adminGql({
    store: STORE,
    query: `query($q: String!) { products(first: 1, query: $q) { nodes { id handle } } }`,
    variables: { q: `handle:${handle}` },
  });
  return products.nodes[0] || null;
}

/** @param {import('./migrate-products-from-lurafi.mjs').ProductJson} product */
async function createProductWithVariants(product) {
  const optionName = product.options?.[0]?.name || 'Color';
  const optionValues = product.variants.map((v) => ({ name: v.title }));

  const { productCreate } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($product: ProductCreateInput!) {
      productCreate(product: $product) {
        product {
          id handle
          options { id name optionValues { id name } }
          variants(first: 5) { nodes { id title } }
        }
        userErrors { field message }
      }
    }`,
    variables: {
      product: {
        title: product.title,
        handle: product.handle,
        descriptionHtml: product.body_html || '',
        vendor: product.vendor || 'Lurafi',
        productType: product.product_type || 'AI Presence Simulator',
        status: 'ACTIVE',
        tags: product.tags || '',
        productOptions: [{ name: optionName, values: optionValues }],
      },
    },
  });

  if (productCreate.userErrors?.length) {
    throw new Error(productCreate.userErrors.map((e) => e.message).join('; '));
  }

  const created = productCreate.product;
  const option = created.options.find((o) => o.name === optionName) || created.options[0];
  const valueIdByName = Object.fromEntries(option.optionValues.map((ov) => [ov.name, ov.id]));

  const variants = product.variants.map((v) => ({
    price: v.price,
    sku: v.sku || undefined,
    optionValues: [{ optionId: option.id, name: v.title }],
  }));

  if (variants.length <= 1) return created;

  const { productVariantsBulkCreate } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!, $strategy: ProductVariantsBulkCreateStrategy) {
      productVariantsBulkCreate(productId: $productId, variants: $variants, strategy: $strategy) {
        productVariants { id title }
        userErrors { field message }
      }
    }`,
    variables: {
      productId: created.id,
      variants,
      strategy: 'REMOVE_STANDALONE_VARIANT',
    },
  });

  if (productVariantsBulkCreate.userErrors?.length) {
    throw new Error(productVariantsBulkCreate.userErrors.map((e) => e.message).join('; '));
  }

  return created;
}

async function main() {
  console.log(`Auth: ${adminAuthMode()} → ${STORE}`);
  for (const handle of HANDLES) {
    const existing = await productExists(handle);
    if (existing) {
      console.log(`✓ ${handle} already exists (${existing.id})`);
      continue;
    }
    console.log(`→ Creating ${handle} from ${SOURCE}…`);
    const src = await fetchProduct(handle);
    const created = await createProductWithVariants(src);
    console.log(`✓ Created ${created.handle} (${created.id})`);
  }
  console.log('\nNext: attach selling plan to kevin-plus in Admin (Subscriptions).');
}

main().catch((err) => {
  const msg = String(err.message || err);
  if (msg.includes('write_products') || msg.includes('ACCESS_DENIED')) {
    console.error('\n⚠ Store has not approved write_products yet.');
    console.error('  1. admin.shopify.com → Mitipi → Settings → Apps → lurafi → Update/Approve permissions');
    console.error('  2. Or dev.shopify.com → lurafi → Home → Install app → mitipi-2');
    console.error('  3. Run: ./scripts/shopify-refresh-admin-token.sh');
    console.error('  4. Re-run: npm run shopify:products:migrate');
    console.error('\nOr Products → Import → scripts/data/products-import.csv');
  } else {
    console.error(msg);
  }
  process.exit(1);
});
