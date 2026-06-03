#!/usr/bin/env node
import { adminGql } from './lib/shopify-admin-gql.mjs';

const STORE = (process.env.SHOPIFY_STORE || 'mitipi-2.myshopify.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const HANDLES = ['kevin', 'kevin-plus'];

async function main() {
  const { publications, products } = await adminGql({
    store: STORE,
    query: `query {
      publications(first: 10) { nodes { id name } }
      products(first: 5, query: "handle:kevin OR handle:kevin-plus") { nodes { id handle } }
    }`,
  });

  const targets = publications.nodes.filter((p) =>
    /online store|^shop$/i.test(p.name),
  );
  if (!targets.length) throw new Error('No Online Store publication found');

  for (const product of products.nodes) {
    const { publishablePublish } = await adminGql({
      store: STORE,
      mutate: true,
      query: `mutation($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) {
          publishable { ... on Product { id handle } }
          userErrors { message }
        }
      }`,
      variables: {
        id: product.id,
        input: targets.map((p) => ({ publicationId: p.id })),
      },
    });
    if (publishablePublish.userErrors?.length) {
      throw new Error(publishablePublish.userErrors.map((e) => e.message).join('; '));
    }
    console.log(`✓ Published ${product.handle} → ${targets.map((t) => t.name).join(', ')}`);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
