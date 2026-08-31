#!/usr/bin/env node
/**
 * Ensure mitipi.eu checkout path is wired: kevin product, Online Store publish,
 * live theme product_buy=kevin, selling plan + shipping, theme republish (cache bust).
 *
 * Run: npm run shopify:checkout:ensure
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminGql } from './lib/shopify-admin-gql.mjs';
import { getLiveThemeConfig } from './lib/live-theme.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STORE = (process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com').replace(/^https?:\/\//, '').replace(/\/$/, '');

const COLORS = ['Grey', 'White', 'Burgundy', 'Espresso', 'Navy'];

async function productByHandle(handle) {
  const { products } = await adminGql({
    store: STORE,
    query: `query($q:String!){ products(first:1,query:$q){ nodes { id handle title variants(first:10){ nodes { id title } } } } }`,
    variables: { q: `handle:${handle}` },
  });
  return products.nodes[0];
}

async function ensureKevin() {
  const found = await productByHandle('kevin');
  if (found) {
    console.log(`✓ kevin exists (${found.variants.nodes.length} variants)`);
    return found;
  }

  console.log('→ Creating kevin product (5 colors)…');
  const { productSet } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($input: ProductSetInput!, $synchronous: Boolean!) {
      productSet(input: $input, synchronous: $synchronous) {
        product { id handle variants(first:10){ nodes { id title price } } }
        userErrors { field message }
      }
    }`,
    variables: {
      synchronous: true,
      input: {
        title: 'KEVIN® 3 House | Two-Device Bundle .Protection on Every Floor',
        handle: 'kevin',
        descriptionHtml:
          '<p>Kevin is Swiss AI presence simulation for your home. It uses light, shadow, and sound to make your home look and sound lived-in when you are away.</p>',
        vendor: 'Mitipi GmbH',
        productType: 'AI Presence Simulator',
        status: 'ACTIVE',
        tags: ['kevin', 'presence-simulator'],
        productOptions: [{ name: 'Color', values: COLORS.map((name) => ({ name })) }],
        variants: COLORS.map((color, i) => ({
          sku: `KEVIN-${color.toUpperCase()}`,
          price: '649.00',
          optionValues: [{ optionName: 'Color', name: color }],
          inventoryPolicy: 'CONTINUE',
          taxable: true,
        })),
      },
    },
  });
  if (productSet.userErrors?.length) {
    throw new Error(productSet.userErrors.map((e) => e.message).join('; '));
  }
  console.log(`✓ Created kevin (${productSet.product.variants.nodes.length} variants)`);
  return productSet.product;
}

async function publishProduct(productId, handle) {
  const { publications } = await adminGql({
    store: STORE,
    query: `{ publications(first:10){ nodes { id name } } }`,
  });
  const targets = publications.nodes.filter((p) => /online store|^shop$/i.test(p.name));
  if (!targets.length) throw new Error('No Online Store publication');

  const { publishablePublish } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($id:ID!,$input:[PublicationInput!]!){
      publishablePublish(id:$id,input:$input){ userErrors { message } }
    }`,
    variables: { id: productId, input: targets.map((p) => ({ publicationId: p.id })) },
  });
  if (publishablePublish.userErrors?.length) {
    throw new Error(publishablePublish.userErrors.map((e) => e.message).join('; '));
  }
  console.log(`✓ Published ${handle} → Online Store`);
}

async function ensureThemeProductBuy() {
  const { theme_id: themeId } = getLiveThemeConfig();
  const themeGid = `gid://shopify/OnlineStoreTheme/${themeId}`;
  const data = JSON.parse(readFileSync(join(ROOT, 'config/settings_data.json'), 'utf8'));
  data.current.product_buy = 'kevin';
  data.current.configure_page = data.current.configure_page || 'configure';

  const { themeFilesUpsert } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($themeId:ID!,$files:[OnlineStoreThemeFilesUpsertFileInput!]!){
      themeFilesUpsert(themeId:$themeId, files:$files){
        upsertedThemeFiles { filename }
        userErrors { field message }
      }
    }`,
    variables: {
      themeId: themeGid,
      files: [
        {
          filename: 'config/settings_data.json',
          body: { type: 'TEXT', value: `${JSON.stringify(data, null, 2)}\n` },
        },
      ],
    },
  });
  if (themeFilesUpsert.userErrors?.length) {
    throw new Error(themeFilesUpsert.userErrors.map((e) => e.message).join('; '));
  }
  console.log('✓ Live theme settings: product_buy → kevin');
}

async function republishLiveTheme() {
  const { theme_id: themeId, theme_name: themeName } = getLiveThemeConfig();
  const { themePublish } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($id:ID!){ themePublish(id:$id){ theme { name role } userErrors { message } } }`,
    variables: { id: `gid://shopify/OnlineStoreTheme/${themeId}` },
  });
  if (themePublish.userErrors?.length) {
    throw new Error(themePublish.userErrors.map((e) => e.message).join('; '));
  }
  console.log(`✓ themePublish ${themeName} (${themePublish.theme?.role})`);
}

async function main() {
  console.log(`\n=== Ensure checkout ready — ${STORE} ===\n`);

  const kevin = await ensureKevin();
  await publishProduct(kevin.id, 'kevin');

  const kevinPlus = await productByHandle('kevin-plus');
  if (kevinPlus) await publishProduct(kevinPlus.id, 'kevin-plus');
  else console.warn('⚠ kevin-plus missing — subscribe path unavailable');

  await ensureThemeProductBuy();
  await republishLiveTheme();

  console.log('\n→ Commerce setup (selling plan + shipping)…');
  const { spawnSync } = await import('node:child_process');
  const commerce = spawnSync('node', ['scripts/setup-mitipi-commerce.mjs'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  if (commerce.status !== 0) {
    console.warn('⚠ setup-mitipi-commerce exited non-zero — check Admin → Payments/Shipping');
  }

  console.log('\n→ Backend QA…');
  const backend = spawnSync('node', ['scripts/qa-mitipi-backend.mjs'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });

  console.log('\nDone. Smoke test (once):');
  console.log('  curl -sI https://mitipi.eu/products/kevin.json | head -3');
  console.log('  LURAFI_URL=https://mitipi.eu npx playwright test tests/e2e/checkout-smoke.spec.js\n');

  process.exit(backend.status ?? 0);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
