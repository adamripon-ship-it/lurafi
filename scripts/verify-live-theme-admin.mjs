#!/usr/bin/env node
/** Ensure Shopify Admin MAIN theme matches config/live-theme.json */
import { getLiveThemeConfig, liveThemeStore } from './lib/live-theme.mjs';
import { adminGql } from './lib/shopify-admin-gql.mjs';

const { theme_id: expectedId, theme_name: expectedName } = getLiveThemeConfig();

async function main() {
  const { themes } = await adminGql({
    store: liveThemeStore(),
    query: `query { themes(first: 30) { nodes { id name role } } }`,
  });

  const main = themes.nodes.find((t) => t.role === 'MAIN');
  const actualId = main?.id?.replace(/.*\//, '') || '';

  console.log(`\n=== Admin live theme check ===\n`);
  console.log(`  Config: ${expectedName} (#${expectedId})`);

  if (!main) {
    console.log('  ✗ No MAIN theme found in Admin\n');
    process.exit(1);
  }

  console.log(`  Admin MAIN: ${main.name} (#${actualId})`);

  if (actualId !== expectedId) {
    console.log(
      `\n  ✗ Mismatch — mitipi.eu serves the MAIN theme. Either:\n` +
        `    • Update config/live-theme.json to theme_id "${actualId}", or\n` +
        `    • Run npm run theme:publish:live to publish ${expectedName}\n`,
    );
    process.exit(1);
  }

  console.log('\n  ✓ Admin MAIN theme matches config\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
