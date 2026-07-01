#!/usr/bin/env node
/**
 * Bust Shopify homepage page cache (IndexController page_cache etag).
 *
 * theme push + theme publish update liquid/assets but the rendered homepage HTML
 * can stay stale until the Online Store template JSON is saved (Theme Editor → Save).
 * This script mimics that save via Admin GraphQL themeFilesUpsert + themePublish.
 *
 * Usage: node scripts/bust-homepage-page-cache.mjs [--verify]
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminGql } from './lib/shopify-admin-gql.mjs';
import { getLiveThemeConfig } from './lib/live-theme.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VERIFY = process.argv.includes('--verify');

function readJsonTemplate(rel) {
  let raw = readFileSync(join(ROOT, rel), 'utf8');
  raw = raw.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  return JSON.parse(raw);
}

function themeGid(themeId) {
  return `gid://shopify/OnlineStoreTheme/${themeId}`;
}

async function upsertThemeFiles(store, themeId, files) {
  const { themeFilesUpsert } = await adminGql({
    store,
    mutate: true,
    query: `
      mutation themeFilesUpsert($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: $themeId, files: $files) {
          upsertedThemeFiles { filename }
          userErrors { field message }
        }
      }
    `,
    variables: {
      themeId: themeGid(themeId),
      files: files.map(({ filename, value }) => ({
        filename,
        body: { type: 'TEXT', value },
      })),
    },
  });
  const upserted = themeFilesUpsert?.upsertedThemeFiles?.map((f) => f.filename) ?? [];
  if (!upserted.length) {
    throw new Error('themeFilesUpsert returned no files');
  }
  return upserted;
}

async function publishTheme(store, themeId) {
  const { themePublish } = await adminGql({
    store,
    mutate: true,
    query: `
      mutation themePublish($id: ID!) {
        themePublish(id: $id) {
          theme { id name role }
          userErrors { field message }
        }
      }
    `,
    variables: { id: themeGid(themeId) },
  });
  return themePublish?.theme;
}

async function main() {
  const { store, theme_id: themeId, theme_name: themeName } = getLiveThemeConfig();
  const bustAt = new Date().toISOString();

  console.log(`\n=== Bust homepage page cache ===`);
  console.log(`  Store:  ${store}`);
  console.log(`  Theme:  ${themeName} (#${themeId})`);
  console.log(`  Bust:   ${bustAt}\n`);

  const index = readJsonTemplate('templates/index.json');
  const hero = index.sections?.hero;
  if (!hero?.settings) {
    throw new Error('templates/index.json missing hero.settings');
  }
  hero.settings.deploy_cache_bust = bustAt;

  let themeLiquid = readFileSync(join(ROOT, 'layout/theme.liquid'), 'utf8');
  themeLiquid = themeLiquid.replace(
    /<!-- lurafi-head-v\d+[^>]*-->/,
    `<!-- lurafi-head-v18 hero-chips-v2 cache-bust=${bustAt} -->`,
  );

  const upserted = await upsertThemeFiles(store, themeId, [
    {
      filename: 'templates/index.json',
      value: `${JSON.stringify(index, null, 2)}\n`,
    },
    { filename: 'layout/theme.liquid', value: themeLiquid },
  ]);

  console.log(`  ✓ themeFilesUpsert: ${upserted.join(', ')}`);

  const published = await publishTheme(store, themeId);
  console.log(`  ✓ themePublish: ${published?.name} (${published?.role})`);

  console.log('\n  Waiting for storefront cache…');
  await new Promise((r) => setTimeout(r, 4000));

  if (VERIFY) {
    const { spawnSync } = await import('node:child_process');
    const verify = spawnSync('node', ['scripts/verify-live-storefront.mjs'], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    process.exit(verify.status ?? 1);
  }

  console.log('  Done. Run: npm run theme:verify:live');
}

main().catch((err) => {
  console.error(`\n✗ ${err.message || err}`);
  process.exit(1);
});
