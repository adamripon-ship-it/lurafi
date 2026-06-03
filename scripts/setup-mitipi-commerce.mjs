#!/usr/bin/env node
/**
 * Kevin+ monthly selling plan + basic shipping zone for mitipi-2.
 */
import { adminGql } from './lib/shopify-admin-gql.mjs';

const STORE = (process.env.SHOPIFY_STORE || 'mitipi-2.myshopify.com').replace(/^https?:\/\//, '').replace(/\/$/, '');

async function getKevinPlus() {
  const { products } = await adminGql({
    store: STORE,
    query: `query {
      products(first: 1, query: "handle:kevin-plus") {
        nodes { id handle sellingPlanGroups(first: 3) { nodes { id name } } }
      }
    }`,
  });
  return products.nodes[0];
}

async function createSellingPlan(productId) {
  const { sellingPlanGroupCreate } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($input: SellingPlanGroupInput!, $resources: SellingPlanGroupResourceInput) {
      sellingPlanGroupCreate(input: $input, resources: $resources) {
        sellingPlanGroup { id name sellingPlans(first: 3) { nodes { id name } } }
        userErrors { field message }
      }
    }`,
    variables: {
      input: {
        name: 'Kevin+ Monthly',
        merchantCode: 'kevin-plus-monthly',
        options: ['Billing'],
        sellingPlansToCreate: [
          {
            name: 'Monthly',
            options: 'Every month',
            category: 'SUBSCRIPTION',
            billingPolicy: {
              recurring: { interval: 'MONTH', intervalCount: 1 },
            },
            deliveryPolicy: {
              recurring: { interval: 'MONTH', intervalCount: 1 },
            },
          },
        ],
      },
      resources: { productIds: [productId] },
    },
  });
  if (sellingPlanGroupCreate.userErrors?.length) {
    throw new Error(sellingPlanGroupCreate.userErrors.map((e) => e.message).join('; '));
  }
  return sellingPlanGroupCreate.sellingPlanGroup;
}

async function ensureShippingProfile() {
  const { deliveryProfiles, shop } = await adminGql({
    store: STORE,
    query: `query {
      shop { currencyCode }
      deliveryProfiles(first: 5) { nodes { id name default profileLocationGroups { locationGroup { id } } } }
    }`,
  });

  const general = deliveryProfiles.nodes.find((p) => p.default) || deliveryProfiles.nodes[0];
  if (!general) {
    console.log('⚠ No delivery profile — add shipping in Admin → Settings → Shipping');
    return;
  }

  const { deliveryProfileUpdate } = await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($id: ID!, $profile: DeliveryProfileInput!) {
      deliveryProfileUpdate(id: $id, profile: $profile) {
        profile { id name }
        userErrors { field message }
      }
    }`,
    variables: {
      id: general.id,
      profile: {
        name: general.name || 'General Profile',
        locationGroupsToUpdate: [
          {
            id: general.profileLocationGroups?.[0]?.locationGroup?.id,
            zonesToCreate: [
              {
                name: 'Europe',
                countries: [
                  { code: 'CH', includeAllProvinces: true },
                  { code: 'DE', includeAllProvinces: true },
                  { code: 'FR', includeAllProvinces: true },
                  { code: 'NL', includeAllProvinces: true },
                  { code: 'AT', includeAllProvinces: true },
                  { code: 'IT', includeAllProvinces: true },
                  { code: 'ES', includeAllProvinces: true },
                  { code: 'GB', includeAllProvinces: true },
                ],
                methodDefinitionsToCreate: [
                  {
                    name: 'Standard shipping',
                    rateDefinition: {
                      price: { amount: 0, currencyCode: shop.currencyCode },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  });

  if (deliveryProfileUpdate.userErrors?.length) {
    const msg = deliveryProfileUpdate.userErrors.map((e) => e.message).join('; ');
    if (/already|duplicate|exists|another zone/i.test(msg)) {
      console.log('✓ Shipping zones already configured');
      return;
    }
    throw new Error(`deliveryProfileUpdate: ${msg}`);
  }
  console.log('✓ Shipping profile updated (free standard to major EU markets)');
}

async function checkPayments() {
  try {
    const data = await adminGql({
      store: STORE,
      query: `query {
        shopifyPaymentsAccount { activated shopifyPaymentsSetupComplete }
        shop { enabledPresentmentCurrencies }
      }`,
    });
    if (data.shopifyPaymentsAccount?.activated) {
      console.log('✓ Shopify Payments activated');
    } else {
      console.log('⚠ Shopify Payments not active — complete in Admin → Settings → Payments');
    }
  } catch {
    console.log('⚠ Could not read payment status — check Admin → Settings → Payments');
  }
}

async function main() {
  console.log(`Store: ${STORE}\n`);

  const product = await getKevinPlus();
  if (!product) throw new Error('kevin-plus product missing');

  if (product.sellingPlanGroups?.nodes?.length) {
    console.log(`✓ Selling plan already on kevin-plus (${product.sellingPlanGroups.nodes[0].name})`);
  } else {
    console.log('→ Creating Kevin+ Monthly selling plan…');
    const group = await createSellingPlan(product.id);
    const plan = group.sellingPlans?.nodes?.[0];
    console.log(`✓ ${group.name} → ${plan?.name} (${plan?.id})`);
  }

  await ensureShippingProfile();
  await checkPayments();
}

main().catch((e) => {
  const msg = e.message || String(e);
  if (/already exists in another zone/i.test(msg)) {
    console.log('✓ Shipping zones already present in store');
    process.exit(0);
  }
  console.error(msg);
  process.exit(1);
});
