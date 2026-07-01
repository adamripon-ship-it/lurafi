#!/usr/bin/env node
/** Unpublish kevin-plus from Online Store (buy-only storefront). */
import { adminGql } from './lib/shopify-admin-gql.mjs';

const STORE = (process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com').replace(/^https?:\/\//, '').replace(/\/$/, '');

async function main() {
  const { publications, products } = await adminGql({
    store: STORE,
    query: `query {
      publications(first: 10) { nodes { id name } }
      products(first: 1, query: "handle:kevin-plus") { nodes { id handle title status } }
    }`,
  });

  const product = products.nodes[0];
  if (!product) {
    console.log('kevin-plus product not found — nothing to unpublish');
    return;
  }

  const targets = publications.nodes.filter((p) => /online store|^shop$/i.test(p.name));
  if (!targets.length) throw new Error('No Online Store publication found');

  const { publishableUnpublish } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($id: ID!, $input: [PublicationInput!]!) {
      publishableUnpublish(id: $id, input: $input) {
        publishable { ... on Product { id handle } }
        userErrors { message }
      }
    }`,
    variables: {
      id: product.id,
      input: targets.map((p) => ({ publicationId: p.id })),
    },
  });

  console.log(`✓ Unpublished ${product.handle} from ${targets.map((t) => t.name).join(', ')}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
