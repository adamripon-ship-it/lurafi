#!/usr/bin/env node
/**
 * Verify Shopify Markets includes config/languages.json published countries.
 * Currency per country is set in Admin → Settings → Markets (not in theme code).
 *
 * Usage: SHOPIFY_STORE=6mzhe1-yf.myshopify.com node scripts/setup-market-countries.mjs
 */
import { getPublishedCountries } from './i18n/registry.mjs';
import { adminGql } from './lib/shopify-admin-gql.mjs';

const STORE = process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com';
const expected = getPublishedCountries();

async function main() {
  const data = await adminGql({
    store: STORE,
    query: `query {
      shop { currencyCode enabledPresentmentCurrencies }
      localization { availableCountries { isoCode name currency { isoCode } } }
      markets(first: 5) {
        nodes {
          id
          name
          enabled
          currencySettings { baseCurrency { currencyCode } }
          regions(first: 50) {
            nodes {
              ... on MarketRegionCountry { code }
            }
          }
        }
      }
    }`,
  });

  const available = new Map(
    (data.localization?.availableCountries || []).map((c) => [
      c.isoCode,
      c.currency?.isoCode,
    ]),
  );

  console.log(`Store: ${STORE}`);
  console.log(`Shop currency: ${data.shop?.currencyCode}`);
  console.log(`Presentment: ${(data.shop?.enabledPresentmentCurrencies || []).join(', ')}`);
  console.log('');

  let hasGap = false;
  for (const row of expected) {
    const live = available.get(row.code);
    if (!live) {
      hasGap = true;
      console.log(`✗ ${row.code} — not in localization.availableCountries (enable in Markets)`);
      continue;
    }
    const ok = !row.currency || live === row.currency;
    console.log(
      `${ok ? '✓' : '⚠'} ${row.code} — ${live}${row.currency ? ` (expected ${row.currency})` : ''}`,
    );
    if (!ok) hasGap = true;
  }

  console.log('');
  console.log('Markets:');
  for (const m of data.markets?.nodes || []) {
    const codes = (m.regions?.nodes || []).map((r) => r.code).filter(Boolean);
    console.log(`  ${m.name} (${m.enabled ? 'on' : 'off'}) — ${codes.join(', ') || 'no regions'}`);
  }

  if (hasGap) {
    console.log('');
    console.log('Admin steps (required for correct CHF/CZK/EUR at checkout):');
    console.log('  1. Settings → Markets → Primary market → Manage countries');
    console.log('  2. Add Switzerland (CH) if missing; set country currency CHF');
    console.log('  3. Czech Republic → CZK; Germany, France, Ireland, Netherlands → EUR');
    console.log('  4. Settings → Markets → Currencies — enable CHF, CZK, EUR presentment');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
