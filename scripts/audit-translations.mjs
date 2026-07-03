#!/usr/bin/env node
/**
 * Translation drift audit — reports untranslated content per locale for
 * resources the content team owns in Admin (metaobjects, menus, theme
 * section overrides). Locale defaults in locales/*.json are covered by the
 * Git pipeline (locales:build/sync); this audits the Shopify-side layer.
 *
 *   node scripts/audit-translations.mjs
 *   node scripts/audit-translations.mjs --locales=nl,fr --types=METAOBJECT
 *
 * Requires SHOPIFY_ADMIN_TOKEN (read_translations) — see scripts/lib/shopify-admin-gql.mjs.
 */
import { adminGql } from './lib/shopify-admin-gql.mjs';

const args = process.argv.slice(2);
const locales = ((args.find((a) => a.startsWith('--locales=')) || '').split('=')[1] || 'nl,fr,de,cs')
  .split(',')
  .filter(Boolean);
const types = ((args.find((a) => a.startsWith('--types=')) || '').split('=')[1] || 'METAOBJECT,ONLINE_STORE_MENU')
  .split(',')
  .filter(Boolean);

let totalMissing = 0;

for (const resourceType of types) {
  const res = await adminGql({
    query: `query($resourceType: TranslatableResourceType!) {
      translatableResources(first: 100, resourceType: $resourceType) {
        nodes {
          resourceId
          translatableContent { key value }
        }
      }
    }`,
    variables: { resourceType },
  });
  const nodes = res?.data?.translatableResources?.nodes || [];
  if (!nodes.length) {
    console.log(`${resourceType}: no resources.`);
    continue;
  }

  for (const locale of locales) {
    const perLocale = await adminGql({
      query: `query($resourceType: TranslatableResourceType!, $locale: String!) {
        translatableResources(first: 100, resourceType: $resourceType) {
          nodes {
            resourceId
            translations(locale: $locale) { key value }
          }
        }
      }`,
      variables: { resourceType, locale },
    });
    const translated = new Map(
      (perLocale?.data?.translatableResources?.nodes || []).map((n) => [
        n.resourceId,
        new Set(n.translations.map((t) => t.key)),
      ]),
    );

    let missing = 0;
    for (const node of nodes) {
      const done = translated.get(node.resourceId) || new Set();
      for (const content of node.translatableContent) {
        if (!content.value) continue;
        if (!done.has(content.key)) missing += 1;
      }
    }
    totalMissing += missing;
    console.log(`${resourceType} / ${locale}: ${missing} untranslated field(s) across ${nodes.length} resource(s)`);
  }
}

if (totalMissing) {
  console.log(`\nTotal untranslated fields: ${totalMissing}`);
  if (args.includes('--ci')) process.exit(1);
} else {
  console.log('\nAll audited resources fully translated.');
}
