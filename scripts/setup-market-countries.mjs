#!/usr/bin/env node
/**
 * Verify (default) or apply Shopify Markets country/currency config from config/languages.json.
 *
 * Apply: CH market → CHF; EU market → EUR base + local currencies (CZ → CZK, etc.)
 * Verify: countries present in enabled markets with expected currency codes.
 *
 * Usage:
 *   node scripts/setup-market-countries.mjs           # verify, exit 1 on gaps
 *   node scripts/setup-market-countries.mjs --apply   # apply then verify
 *   SHOPIFY_STORE=6mzhe1-yf.myshopify.com npm run shopify:markets:countries
 */
import { getPublishedCountries } from './i18n/registry.mjs';
import { adminGql } from './lib/shopify-admin-gql.mjs';
import { loadDotenv } from './lib/load-dotenv.mjs';

loadDotenv();

const STORE = process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com';
const APPLY = process.argv.includes('--apply');
const PRESENTMENT = ['CHF', 'CZK', 'EUR'];
const expected = getPublishedCountries();

const MARKETS_QUERY = `query MarketsState {
  shop { currencyCode enabledPresentmentCurrencies }
  markets(first: 20) {
    nodes {
      id
      name
      enabled
      handle
      currencySettings { baseCurrency { currencyCode } localCurrencies }
      regions(first: 100) {
        nodes {
          ... on MarketRegionCountry { code currency { currencyCode } }
        }
      }
    }
  }
}`;

/** @param {Awaited<ReturnType<typeof fetchMarketsState>>} data */
function countryCurrencyMap(data) {
  const map = new Map();
  for (const market of data.markets?.nodes || []) {
    if (!market.enabled) continue;
    for (const region of market.regions?.nodes || []) {
      if (!region?.code) continue;
      map.set(region.code, region.currency?.currencyCode || null);
    }
  }
  return map;
}

async function fetchMarketsState() {
  return adminGql({ store: STORE, query: MARKETS_QUERY });
}

/** @param {Awaited<ReturnType<typeof fetchMarketsState>>} data */
function findMarketByCountry(data, code) {
  for (const market of data.markets?.nodes || []) {
    if (!market.enabled) continue;
    const hit = (market.regions?.nodes || []).some((r) => r?.code === code);
    if (hit) return market;
  }
  return null;
}

async function applyMarketSettings(data) {
  const chMarket =
    data.markets?.nodes?.find((m) => m.handle === 'ch' || m.name === 'Switzerland') ||
    findMarketByCountry(data, 'CH');
  const euMarket =
    data.markets?.nodes?.find((m) => m.handle === 'european-union' || m.name === 'European Union') ||
    findMarketByCountry(data, 'DE');

  if (!chMarket?.id) {
    throw new Error('Switzerland market not found — create CH market in Admin first');
  }
  if (!euMarket?.id) {
    throw new Error('European Union market not found — add EU countries in Admin first');
  }

  console.log(`→ ${chMarket.name}: base CHF, local currencies off`);
  await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($id: ID!, $input: MarketUpdateInput!) {
      marketUpdate(id: $id, input: $input) {
        userErrors { message field code }
      }
    }`,
    variables: {
      id: chMarket.id,
      input: { currencySettings: { baseCurrency: 'CHF', localCurrencies: false } },
    },
  });

  console.log(`→ ${euMarket.name}: base EUR, local currencies on (CZ → CZK, etc.)`);
  await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($id: ID!, $input: MarketUpdateInput!) {
      marketUpdate(id: $id, input: $input) {
        userErrors { message field code }
      }
    }`,
    variables: {
      id: euMarket.id,
      input: { currencySettings: { baseCurrency: 'EUR', localCurrencies: true } },
    },
  });

  const missing = expected.filter((row) => !findMarketByCountry(data, row.code));
  for (const row of missing) {
    const host = euMarket.id;
    console.log(`→ Adding ${row.code} to ${euMarket.name}`);
    await adminGql({
      store: STORE,
      mutate: true,
      query: `mutation($marketId: ID!, $regions: [MarketRegionCreateInput!]!) {
        marketRegionsCreate(marketId: $marketId, regions: $regions) {
          userErrors { message field code }
        }
      }`,
      variables: {
        marketId: host,
        regions: [{ countryCode: row.code }],
      },
    });
  }
}

/** @param {Awaited<ReturnType<typeof fetchMarketsState>>} data */
function verify(data) {
  const liveByCountry = countryCurrencyMap(data);
  const presentment = new Set(data.shop?.enabledPresentmentCurrencies || []);

  console.log(`Store: ${STORE}`);
  console.log(`Shop currency: ${data.shop?.currencyCode}`);
  console.log(`Presentment: ${[...presentment].sort().join(', ')}`);
  console.log('');

  let hasGap = false;

  for (const need of PRESENTMENT) {
    if (!presentment.has(need)) {
      hasGap = true;
      console.log(`✗ Presentment currency ${need} not enabled`);
    }
  }

  for (const row of expected) {
    const live = liveByCountry.get(row.code);
    if (!live) {
      hasGap = true;
      console.log(`✗ ${row.code} — not in any enabled market region`);
      continue;
    }
    const ok = !row.currency || live === row.currency;
    console.log(
      `${ok ? '✓' : '✗'} ${row.code} — ${live}${row.currency ? ` (expected ${row.currency})` : ''}`,
    );
    if (!ok) hasGap = true;
  }

  console.log('');
  console.log('Markets:');
  for (const m of data.markets?.nodes || []) {
    const codes = (m.regions?.nodes || []).map((r) => r.code).filter(Boolean);
    const cur = m.currencySettings?.baseCurrency?.currencyCode;
    const local = m.currencySettings?.localCurrencies;
    console.log(
      `  ${m.name} (${m.enabled ? 'on' : 'off'}) — ${codes.length} countries` +
        (cur ? `, base ${cur}${local ? ', local on' : ''}` : ''),
    );
  }

  return hasGap;
}

async function main() {
  let data = await fetchMarketsState();

  if (APPLY) {
    console.log('Applying market currency settings from config/languages.json…\n');
    await applyMarketSettings(data);
    data = await fetchMarketsState();
  }

  const hasGap = verify(data);
  if (hasGap) {
    if (!APPLY) {
      console.log('');
      console.log('Run with --apply to set CH→CHF and EU→EUR+local (CZ→CZK):');
      console.log('  node scripts/setup-market-countries.mjs --apply');
    }
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
