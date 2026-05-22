#!/usr/bin/env node
/**
 * Native Shopify multi-language setup for Lurafi (12 locales).
 *
 * - Enables + publishes locales from config/languages.json
 * - Ensures market web presence with alternateLocales
 * - Creates utility pages if missing
 * - Registers Admin translations (pages + products) via translationsRegister
 *
 * Prerequisite:
 *   shopify store auth --store fu03cn-1v.myshopify.com \
 *     --scopes read_locales,write_locales,read_translations,write_translations,\
 * read_content,write_content,read_online_store_pages,write_online_store_pages,\
 * read_markets,write_markets,read_products
 *
 * Usage:
 *   node scripts/setup-shopify-i18n.mjs
 *   node scripts/setup-shopify-i18n.mjs --publish=false
 *   SHOPIFY_STORE=your-store.myshopify.com node scripts/setup-shopify-i18n.mjs
 */
import { execFileSync } from 'node:child_process';
import {
  getAlternateLocales,
  getPrimaryLocale,
  loadLanguagesConfig,
} from './i18n/registry.mjs';

const STORE = process.env.SHOPIFY_STORE || 'fu03cn-1v.myshopify.com';
const publish =
  process.argv.includes('--publish=false') || process.argv.includes('--draft')
    ? false
    : true;

/** @param {string} query @param {Record<string, unknown>} [variables] @param {boolean} [mutate] */
function gql(query, variables, mutate = false) {
  const args = ['store', 'execute', '-s', STORE, '--json', '--query', query];
  if (mutate) args.push('--allow-mutations');
  if (variables) args.push('--variables', JSON.stringify(variables));
  const out = execFileSync('shopify', args, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const jsonStart = out.indexOf('{');
  if (jsonStart === -1) throw new Error(`No JSON in CLI output:\n${out}`);
  const data = JSON.parse(out.slice(jsonStart));
  const errKey = Object.keys(data).find((k) => data[k]?.userErrors?.length);
  if (errKey && data[errKey].userErrors.length) {
    const msgs = data[errKey].userErrors.map((e) => e.message).join('; ');
    throw new Error(`${errKey}: ${msgs}`);
  }
  return data;
}

function ensureLocales() {
  const { shopLocales } = gql('query { shopLocales { locale primary published name } }');
  const existing = Object.fromEntries(shopLocales.map((l) => [l.locale, l]));
  const targets = getAlternateLocales();

  for (const loc of targets) {
    const code = loc.shopifyLocale || loc.code;
    let row = existing[code];
    if (!row) {
      console.log(`→ Enabling ${code}…`);
      gql(
        `mutation { shopLocaleEnable(locale: "${code}") { shopLocale { locale published } userErrors { message } } }`,
        undefined,
        true,
      );
      row = { locale: code, published: false };
    }
    const shouldPublish = loc.publish !== false && publish;
    if (shouldPublish && !row.published) {
      console.log(`→ Publishing ${code}…`);
      gql(
        `mutation { shopLocaleUpdate(locale: "${code}", shopLocale: { published: true }) { shopLocale { locale published } userErrors { message } } }`,
        undefined,
        true,
      );
    } else if (!shouldPublish && row.published) {
      console.log(`→ Unpublishing ${code} (draft mode)…`);
      gql(
        `mutation { shopLocaleUpdate(locale: "${code}", shopLocale: { published: false }) { shopLocale { locale published } userErrors { message } } }`,
        undefined,
        true,
      );
    }
  }

  const { shopLocales: updated } = gql('query { shopLocales { locale published primary } }');
  console.log(
    '✓ Locales:',
    updated.map((l) => `${l.locale}${l.published ? '' : ' (draft)'}`).join(', '),
  );
}

function ensureWebPresence() {
  const cfg = loadLanguagesConfig();
  const alternates = getAlternateLocales().map((l) => l.shopifyLocale || l.code);
  const { shop, markets } = gql(`
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
    gql(
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
    gql(
      `mutation($marketId: ID!, $domainId: ID!, $wp: MarketWebPresenceCreateInput!) {
        marketWebPresenceCreate(marketId: $marketId, webPresence: $wp) {
          userErrors { message }
          market { webPresences(first: 1) { nodes { rootUrls { locale url } } } }
        }
      }`,
      {
        marketId: market.id,
        domainId: shop.primaryDomain.id,
        wp: { defaultLocale: primary, alternateLocales: alternates, domainId: shop.primaryDomain.id },
      },
      true,
    );
  }
  console.log('✓ Web presence updated');
}

/** @param {string} resourceId @param {string} locale @param {{ handle?: string, title?: string, body?: string, body_html?: string, meta_title?: string, meta_description?: string }} fields */
function registerTranslations(resourceId, locale, fields) {
  const { translatableResource } = gql(
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
  gql(
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
  const { pages } = gql('query { pages(first: 50) { nodes { id handle title templateSuffix } } }');
  const byHandle = Object.fromEntries(pages.nodes.map((p) => [p.handle, p]));

  for (const key of pageKeys) {
    const enSpec = cfg.pages[key];
    let page = byHandle[enSpec.handle];
    if (!page) {
      console.log(`→ Creating page "${enSpec.handle}"…`);
      const { pageCreate } = gql(
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
      registerTranslations(page.id, code, {
        handle: spec.handle,
        title: spec.title,
        body_html: spec.body,
      });
    }
  }
}

async function ensureProducts() {
  const { products } = gql(`
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
      registerTranslations(product.id, code, copy);
    }
  }
}

function summary() {
  const cfg = loadLanguagesConfig();
  const { shopLocales, shop, markets } = gql(`
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
  console.log(`Setting up Shopify i18n on ${STORE} (publish=${publish})…\n`);
  ensureLocales();
  ensureWebPresence();
  await ensurePages();
  await ensureProducts();
  summary();
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
