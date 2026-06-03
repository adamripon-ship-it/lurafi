#!/usr/bin/env node
/**
 * Native Shopify multi-language setup for Lurafi (12 locales).
 *
 * - Enables + publishes locales from config/languages.json
 * - Ensures market web presence with alternateLocales
 * - Creates utility pages if missing
 * - Registers Admin translations (pages + products) via translationsRegister
 *
 * Prerequisite (one of):
 *   SHOPIFY_ADMIN_TOKEN in .env (recommended — no browser OAuth)
 *   shopify store auth --store STORE --scopes read_locales,write_locales,...
 *
 * Usage:
 *   node scripts/setup-shopify-i18n.mjs
 *   node scripts/setup-shopify-i18n.mjs --publish=false
 *   SHOPIFY_STORE=mitipi-2.myshopify.com node scripts/setup-shopify-i18n.mjs
 */
import {
  getAlternateLocales,
  getPrimaryLocale,
  loadLanguagesConfig,
} from './i18n/registry.mjs';
import { adminAuthMode, adminGql } from './lib/shopify-admin-gql.mjs';

const STORE = process.env.SHOPIFY_STORE || 'fu03cn-1v.myshopify.com';
const publish =
  process.argv.includes('--publish=false') || process.argv.includes('--draft')
    ? false
    : true;

/** @param {string} query @param {Record<string, unknown>} [variables] @param {boolean} [mutate] */
async function gql(query, variables, mutate = false) {
  return adminGql({ store: STORE, query, variables, mutate });
}

async function ensureLocales() {
  const { shopLocales } = await gql('query { shopLocales { locale primary published name } }');
  const existing = Object.fromEntries(shopLocales.map((l) => [l.locale, l]));
  const targets = getAlternateLocales();

  for (const loc of targets) {
    const code = loc.shopifyLocale || loc.code;
    let row = existing[code];
    if (!row) {
      console.log(`→ Enabling ${code}…`);
      await gql(
        `mutation { shopLocaleEnable(locale: "${code}") { shopLocale { locale published } userErrors { message } } }`,
        undefined,
        true,
      );
      row = { locale: code, published: false };
    }
    const shouldPublish = loc.publish !== false && publish;
    if (shouldPublish && !row.published) {
      console.log(`→ Publishing ${code}…`);
      await gql(
        `mutation { shopLocaleUpdate(locale: "${code}", shopLocale: { published: true }) { shopLocale { locale published } userErrors { message } } }`,
        undefined,
        true,
      );
    } else if (!shouldPublish && row.published) {
      console.log(`→ Unpublishing ${code} (draft mode)…`);
      await gql(
        `mutation { shopLocaleUpdate(locale: "${code}", shopLocale: { published: false }) { shopLocale { locale published } userErrors { message } } }`,
        undefined,
        true,
      );
    }
  }

  const { shopLocales: updated } = await gql('query { shopLocales { locale published primary } }');
  console.log(
    '✓ Locales:',
    updated.map((l) => `${l.locale}${l.published ? '' : ' (draft)'}`).join(', '),
  );
}

async function ensureWebPresence() {
  const cfg = loadLanguagesConfig();
  const alternates = getAlternateLocales().map((l) => l.shopifyLocale || l.code);
  const { shop, markets } = await gql(`
    query {
      shop { primaryDomain { id host } }
      markets(first: 1) { nodes { id webPresences(first: 3) { nodes { id rootUrls { locale url } } } } }
    }
  `);
  const market = markets.nodes[0];
  const wp = market?.webPresences?.nodes?.[0];
  const roots = wp?.rootUrls || [];
  const hasAll = alternates.every((code) =>
    roots.some((r) => r.locale === code || r.locale.startsWith(`${code}-`)),
  );
  if (hasAll && roots.length >= alternates.length) {
    console.log('✓ Web presence URLs on', shop.primaryDomain.host);
    for (const r of roots) console.log(`    ${r.locale}: ${r.url}`);
    return;
  }

  const primary = getPrimaryLocale().shopifyLocale || 'en';
  console.log(`→ Updating market web presence (${primary} + ${alternates.join(', ')})…`);
  if (wp?.id) {
    await gql(
      `mutation($webPresenceId: ID!, $wp: MarketWebPresenceUpdateInput!) {
        marketWebPresenceUpdate(webPresenceId: $webPresenceId, webPresence: $wp) {
          userErrors { message }
          market { webPresences(first: 1) { nodes { rootUrls { locale url } } } }
        }
      }`,
      {
        webPresenceId: wp.id,
        wp: { defaultLocale: primary, alternateLocales: alternates },
      },
      true,
    );
  } else {
    await gql(
      `mutation($marketId: ID!, $wp: MarketWebPresenceCreateInput!) {
        marketWebPresenceCreate(marketId: $marketId, webPresence: $wp) {
          userErrors { message }
          market { webPresences(first: 1) { nodes { rootUrls { locale url } } } }
        }
      }`,
      {
        marketId: market.id,
        wp: {
          defaultLocale: primary,
          alternateLocales: alternates,
          domainId: shop.primaryDomain.id,
        },
      },
      true,
    );
  }
  console.log('✓ Web presence updated');
}

/** @param {string} resourceId @param {string} locale @param {{ handle?: string, title?: string, body?: string, body_html?: string, meta_title?: string, meta_description?: string }} fields */
async function registerTranslations(resourceId, locale, fields) {
  const { translatableResource } = await gql(
    `query($id: ID!) {
      translatableResource(resourceId: $id) {
        translatableContent { key digest }
      }
    }`,
    { id: resourceId },
  );
  const digests = Object.fromEntries(
    translatableResource.translatableContent.map((c) => [c.key, c.digest]),
  );
  const translations = [];
  for (const [key, value] of Object.entries(fields)) {
    if (!value) continue;
    const digest = digests[key];
    if (!digest) continue;
    translations.push({
      locale,
      key,
      value,
      translatableContentDigest: digest,
    });
  }
  if (!translations.length) return;
  await gql(
    `mutation($id: ID!, $t: [TranslationInput!]!) {
      translationsRegister(resourceId: $id, translations: $t) {
        userErrors { message field }
        translations { key value locale }
      }
    }`,
    { id: resourceId, t: translations },
    true,
  );
}

async function ensurePages() {
  const cfg = loadLanguagesConfig();
  const pageKeys = ['configure', 'sitemap', 'llms'];
  const { pages } = await gql('query { pages(first: 50) { nodes { id handle title templateSuffix } } }');
  const byHandle = Object.fromEntries(pages.nodes.map((p) => [p.handle, p]));

  for (const key of pageKeys) {
    const enSpec = cfg.pages[key];
    let page = byHandle[enSpec.handle];
    if (!page) {
      console.log(`→ Creating page "${enSpec.handle}"…`);
      const { pageCreate } = await gql(
        `mutation($page: PageCreateInput!) {
          pageCreate(page: $page) {
            page { id handle templateSuffix }
            userErrors { message field }
          }
        }`,
        {
          page: {
            title: enSpec.title,
            handle: enSpec.handle,
            templateSuffix: key === 'configure' ? 'configure' : key,
            body: enSpec.body,
          },
        },
        true,
      );
      page = pageCreate.page;
    }

    for (const loc of getAlternateLocales()) {
      const spec = loc.pages?.[key];
      if (!spec) continue;
      const code = loc.shopifyLocale || loc.code;
      console.log(`→ ${code} translations: /pages/${enSpec.handle} → ${loc.urlPrefix}/pages/${spec.handle}`);
      await registerTranslations(page.id, code, {
        handle: spec.handle,
        title: spec.title,
        body_html: spec.body,
      });
    }
  }
}

async function ensureProducts() {
  const { products } = await gql(`
    query {
      products(first: 20, query: "title:Kevin") {
        nodes { id title handle }
      }
    }
  `);
  const kevin = products.nodes.find((p) => /^kevin$/i.test(p.handle) || p.title === 'Kevin');
  const kevinPlus = products.nodes.find(
    (p) => /kevin\+|kevin-plus/i.test(p.handle) || /kevin\+/i.test(p.title),
  );
  if (!kevin) {
    console.warn('⚠ Kevin product not found — skip product translations');
    return;
  }

  const map = [
    [kevin, 'kevin'],
    [kevinPlus, 'kevin-plus'],
  ].filter(([p]) => p);

  for (const [product, slot] of map) {
    for (const loc of getAlternateLocales()) {
      const copy = loc.products?.[slot];
      if (!copy) continue;
      const code = loc.shopifyLocale || loc.code;
      console.log(`→ ${code} product translations: ${product.title}`);
      await registerTranslations(product.id, code, copy);
    }
  }
}

async function summary() {
  const cfg = loadLanguagesConfig();
  const { shopLocales, shop, markets } = await gql(`
    query {
      shopLocales { locale published primary }
      shop { primaryDomain { host } }
      markets(first: 1) { nodes { webPresences(first: 1) { nodes { rootUrls { locale url } } } } }
    }
  `);
  const host = shop.primaryDomain.host;
  console.log('\n── Summary ──');
  console.log('Store:', STORE);
  console.log('Domain:', host);
  console.log('Locales:', shopLocales.map((l) => l.locale + (l.published ? '' : ' (draft)')).join(', '));
  const roots = markets.nodes[0]?.webPresences?.nodes[0]?.rootUrls || [];
  for (const r of roots) console.log(`  ${r.locale}: ${r.url}`);
  console.log('\nSample configure URLs:');
  for (const loc of [getPrimaryLocale(), ...getAlternateLocales().slice(0, 3)]) {
    const prefix = loc.urlPrefix || '';
    const handle = loc.pages?.configure?.handle || cfg.pages.configure.handle;
    console.log(`  ${loc.code}: https://${host}${prefix}/pages/${handle}?plan=buy`);
  }
}

async function main() {
  console.log(`Setting up Shopify i18n on ${STORE} (publish=${publish}, auth=${adminAuthMode()})…\n`);
  await ensureLocales();
  await ensureWebPresence();
  await ensurePages();
  await ensureProducts();
  await summary();
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
