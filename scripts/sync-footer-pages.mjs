#!/usr/bin/env node
/**
 * Create/update footer editorial pages in Shopify Admin from config/footer-pages-en.json
 * Usage: npm run cms:footer-pages
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAlternateLocales } from './i18n/registry.mjs';
import { adminGql } from './lib/shopify-admin-gql.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const STORE = (process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');

const footerPages = JSON.parse(fs.readFileSync(path.join(root, 'config/footer-pages-en.json'), 'utf8'));

async function registerTranslations(resourceId, locale, fields) {
  const { translatableResource } = await adminGql({
    store: STORE,
    query: `query($id: ID!) {
      translatableResource(resourceId: $id) {
        translatableContent { key digest locale }
      }
    }`,
    variables: { id: resourceId },
  });
  const digests = Object.fromEntries(
    (translatableResource?.translatableContent || []).map((row) => [row.key, row.digest]),
  );
  const translations = [];
  for (const [key, value] of Object.entries(fields)) {
    const digest = digests[key];
    if (!digest || value == null || value === '') continue;
    translations.push({ locale, key, value, translatableContentDigest: digest });
  }
  if (!translations.length) return;
  await adminGql({
    store: STORE,
    mutate: true,
    query: `mutation($id: ID!, $t: [TranslationInput!]!) {
      translationsRegister(resourceId: $id, translations: $t) {
        userErrors { message field }
      }
    }`,
    variables: { id: resourceId, t: translations },
  });
}

async function listPages() {
  const { pages } = await adminGql({
    store: STORE,
    query: `query { pages(first: 100) { nodes { id handle title templateSuffix } } }`,
  });
  return Object.fromEntries(pages.nodes.map((p) => [p.handle, p]));
}

async function ensurePage(spec) {
  const byHandle = await listPages();
  const handle = spec.handle;
  const templateSuffix = handle;
  let page = byHandle[handle];

  if (!page) {
    console.log(`→ Creating page /pages/${handle}…`);
    const { pageCreate } = await adminGql({
      store: STORE,
      mutate: true,
      query: `mutation($page: PageCreateInput!) {
        pageCreate(page: $page) {
          page { id handle title templateSuffix }
          userErrors { message field }
        }
      }`,
      variables: {
        page: {
          title: spec.title,
          handle,
          templateSuffix,
          body: `<p>${(spec.lede || '').replace(/</g, '&lt;')}</p>`,
        },
      },
    });
    page = pageCreate.page;
  } else if (page.templateSuffix !== templateSuffix) {
    console.log(`→ Updating template for /pages/${handle} → page.${templateSuffix}`);
    await adminGql({
      store: STORE,
      mutate: true,
      query: `mutation($id: ID!, $page: PageUpdateInput!) {
        pageUpdate(id: $id, page: $page) {
          page { id handle templateSuffix }
          userErrors { message field }
        }
      }`,
      variables: {
        id: page.id,
        page: { templateSuffix },
      },
    });
  } else {
    console.log(`✓ Page /pages/${handle} exists`);
  }

  return page;
}

async function main() {
  console.log(`Footer pages sync — ${STORE}\n`);

  for (const [key, spec] of Object.entries(footerPages)) {
    const page = await ensurePage(spec);

    for (const loc of getAlternateLocales()) {
      const locSpec = loc.pages?.[key];
      if (!locSpec) continue;
      const code = loc.shopifyLocale || loc.code;
      console.log(`→ ${code} translations: /pages/${spec.handle} → ${locSpec.handle || spec.handle}`);
      try {
        await registerTranslations(page.id, code, {
          handle: locSpec.handle || spec.handle,
          title: locSpec.title || spec.title,
          body_html: locSpec.body || `<p>${spec.lede || ''}</p>`,
        });
      } catch (err) {
        console.warn(`⚠ ${code} translation skipped for ${spec.handle}: ${err.message}`);
      }
    }
  }

  console.log('\nDone. Next: npm run cms:navigation && push theme templates');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
