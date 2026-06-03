#!/usr/bin/env node
/**
 * Create kevin + kevin-plus via productSet (needs write_products on store install).
 */
import { adminGql, adminAuthMode } from './lib/shopify-admin-gql.mjs';

const SOURCE = process.env.LURAFI_SOURCE_STORE || 'https://lurafi.ai';
const STORE = (process.env.SHOPIFY_STORE || 'mitipi-2.myshopify.com').replace(/^https?:\/\//, '').replace(/\/$/, '');

async function fetchProduct(handle) {
  const res = await fetch(`${SOURCE}/products/${handle}.json`);
  if (!res.ok) throw new Error(`Failed to fetch ${handle}: HTTP ${res.status}`);
  return (await res.json()).product;
}

function productSetInput(product) {
  const optionName = product.options?.[0]?.name || 'Color';
  return {
    title: product.title,
    handle: product.handle,
    descriptionHtml: product.body_html || '',
    vendor: product.vendor || 'Lurafi',
    productType: product.product_type || 'AI Presence Simulator',
    status: 'ACTIVE',
    tags: product.tags || '',
    productOptions: [
      {
        name: optionName,
        values: product.variants.map((v) => ({ name: v.title })),
      },
    ],
    variants: product.variants.map((v) => ({
      sku: v.sku || undefined,
      price: v.price,
      optionValues: [{ optionName, name: v.title }],
    })),
  };
}

async function exists(handle) {
  const { products } = await adminGql({
    store: STORE,
    query: `query($q: String!) { products(first: 1, query: $q) { nodes { id handle } } }`,
    variables: { q: `handle:${handle}` },
  });
  return products.nodes[0];
}

async function create(handle) {
  const src = await fetchProduct(handle);
  const { productSet } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($input: ProductSetInput!, $synchronous: Boolean!) {
      productSet(input: $input, synchronous: $synchronous) {
        product { id handle title }
        userErrors { field message }
      }
    }`,
    variables: { input: productSetInput(src), synchronous: true },
  });
  if (productSet.userErrors?.length) {
    throw new Error(productSet.userErrors.map((e) => e.message).join('; '));
  }
  return productSet.product;
}

async function publishToStorefront(productId, handle) {
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
      publishablePublish(id: $id, input: $input) {
        userErrors { message }
      }
    }`,
    variables: { id: productId, input: targets.map((p) => ({ publicationId: p.id })) },
  });
  console.log(`✓ Published ${handle} to Online Store`);
}

async function main() {
  console.log(`Auth: ${adminAuthMode()} → ${STORE}`);
  for (const handle of ['kevin', 'kevin-plus']) {
    const found = await exists(handle);
    if (found) {
      console.log(`✓ ${handle} (${found.id})`);
      continue;
    }
    console.log(`→ productSet ${handle}…`);
    const p = await create(handle);
    console.log(`✓ ${p.handle} (${p.id})`);
    await publishToStorefront(p.id, p.handle);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
