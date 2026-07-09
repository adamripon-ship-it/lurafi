#!/usr/bin/env node
/**
 * One-command provisioner for the mitipi.eu Shopify CMS backend.
 *
 * Chains the individual (already idempotent) setup scripts in dependency order,
 * with a preflight Admin-API reachability check, a dry-run default, and
 * per-step control. Safe to re-run: every step no-ops when its resource
 * already exists.
 *
 *   node scripts/provision-cms.mjs                 # DRY RUN — preflight + plan, no writes
 *   node scripts/provision-cms.mjs --apply         # execute all steps against Shopify
 *   node scripts/provision-cms.mjs --apply --only=metaobjects,i18n
 *   node scripts/provision-cms.mjs --apply --skip=markets,footer-pages
 *   node scripts/provision-cms.mjs --list          # print the step list and exit
 *
 * Auth: SHOPIFY_ADMIN_TOKEN (or SHOPIFY_CLIENT_ID/SECRET) + SHOPIFY_STORE in the
 * environment (.env locally, secrets in the provision-cms.yml workflow).
 * See scripts/lib/shopify-admin-gql.mjs.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminGql, getAdminToken } from './lib/shopify-admin-gql.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STORE = (process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com')
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const KEEP_GOING = argv.includes('--keep-going');
const LIST_ONLY = argv.includes('--list');
const onlyArg = (argv.find((a) => a.startsWith('--only=')) || '').split('=')[1];
const skipArg = (argv.find((a) => a.startsWith('--skip=')) || '').split('=')[1];
const ONLY = onlyArg ? new Set(onlyArg.split(',').map((s) => s.trim())) : null;
const SKIP = skipArg ? new Set(skipArg.split(',').map((s) => s.trim())) : new Set();

/**
 * Each step maps to an existing, idempotent script.
 * - dryArgs: a read-only / verify invocation used in dry-run mode.
 * - readonly: inherently safe, runs in both modes.
 * - noDry: no safe dry variant — dry-run only prints the command.
 * - consequential: changes outward-facing store config (flagged in logs).
 */
const STEPS = [
  {
    id: 'metaobjects',
    title: 'Metaobject definitions (faq_item, testimonial, spec_row, …)',
    run: 'node', args: ['scripts/setup-metaobjects.mjs'], dryArgs: ['scripts/setup-metaobjects.mjs', '--dry'],
  },
  {
    id: 'i18n',
    title: 'Enable + publish 5 locales and register Admin translations',
    run: 'bash', args: ['scripts/activate-locales.sh'], noDry: true, consequential: true,
  },
  {
    id: 'markets',
    title: 'Markets: countries + currencies (CH→CHF, EU→EUR/CZK)',
    run: 'node', args: ['scripts/setup-market-countries.mjs', '--apply'], dryArgs: ['scripts/setup-market-countries.mjs'], consequential: true,
  },
  {
    id: 'files',
    title: 'Upload content images to Shopify Files (config/files-manifest.json)',
    custom: 'files',
  },
  {
    id: 'navigation',
    title: 'Navigation menus (also writes header/footer group JSON)',
    run: 'node', args: ['scripts/setup-cms-navigation.mjs'], noDry: true, writesRepo: true,
  },
  {
    id: 'footer-templates',
    title: 'Build footer page templates (repo only)',
    run: 'node', args: ['scripts/build-footer-page-templates.mjs'], noDry: true, writesRepo: true,
  },
  {
    id: 'footer-pages',
    title: 'Sync footer editorial pages to Shopify',
    run: 'node', args: ['scripts/sync-footer-pages.mjs'], noDry: true,
  },
  {
    id: 'audit',
    title: 'Translation drift audit (verify, non-fatal)',
    run: 'node', args: ['scripts/audit-translations.mjs'], readonly: true, softFail: true,
  },
];

function selected() {
  return STEPS.filter((s) => (!ONLY || ONLY.has(s.id)) && !SKIP.has(s.id));
}

function sh(run, args) {
  const res = spawnSync(run, args, { cwd: ROOT, stdio: 'inherit', env: process.env });
  return res.status ?? 1;
}

function runFilesStep(apply) {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'config/files-manifest.json'), 'utf8'));
  const files = manifest.files || [];
  if (!apply) {
    console.log(`  DRY: would upload ${files.length} file(s) to Shopify Files:`);
    files.forEach((f) => console.log(`    • ${f.file}  (alt: "${f.alt}")`));
    return 0;
  }
  let bad = 0;
  for (const f of files) {
    console.log(`  ↑ ${f.file}`);
    const code = sh('node', ['scripts/upload-assets.mjs', '--alt', f.alt, f.file]);
    if (code !== 0) bad += 1;
  }
  return bad === 0 ? 0 : 1;
}

async function preflight() {
  const token = getAdminToken();
  console.log(`Store:  ${STORE}`);
  console.log(`Auth:   ${token ? 'SHOPIFY_ADMIN_TOKEN present' : 'no token — will try client credentials / CLI session'}`);
  try {
    const data = await adminGql({ store: STORE, query: '{ shop { name myshopifyDomain } }' });
    console.log(`Shop:   ${data?.shop?.name} (${data?.shop?.myshopifyDomain})\n`);
    return true;
  } catch (err) {
    console.error(`\n✗ Preflight failed — Admin API unreachable: ${err.message}`);
    console.error('  Set SHOPIFY_ADMIN_TOKEN (or SHOPIFY_CLIENT_ID/SECRET) + SHOPIFY_STORE and retry.\n');
    return false;
  }
}

async function main() {
  const steps = selected();
  console.log(`\n=== Provision CMS backend — ${APPLY ? 'APPLY' : 'DRY RUN'} ===\n`);

  if (LIST_ONLY) {
    STEPS.forEach((s, i) => console.log(`  ${i + 1}. ${s.id.padEnd(16)} ${s.title}${s.consequential ? '  [changes live store config]' : ''}`));
    return;
  }

  const ok = await preflight();
  if (!ok && APPLY) process.exit(2);
  if (!ok) console.log('(continuing dry run without a live connection)\n');

  const results = [];
  for (const step of steps) {
    const tag = step.consequential ? ' [live store config]' : '';
    console.log(`\n▶ ${step.id} — ${step.title}${tag}`);

    let code = 0;
    if (step.custom === 'files') {
      code = runFilesStep(APPLY);
    } else if (APPLY || step.readonly) {
      code = sh(step.run, step.args);
    } else if (step.dryArgs) {
      code = sh(step.run, step.dryArgs);
    } else {
      console.log(`  DRY: would run \`${step.run} ${step.args.join(' ')}\``);
    }

    const status = code === 0 ? 'ok' : step.softFail ? 'warn' : 'FAIL';
    results.push({ id: step.id, status });
    if (code !== 0 && !step.softFail && APPLY && !KEEP_GOING) {
      console.error(`\n✗ Step "${step.id}" failed (exit ${code}). Stopping. Re-run with --keep-going to continue past failures.`);
      summarize(results);
      process.exit(1);
    }
  }
  summarize(results);
  if (APPLY) {
    console.log('\nNext: commit any repo changes (navigation/footer templates) and deploy the theme.');
  } else {
    console.log('\nDry run only — re-run with --apply to execute against Shopify.');
  }
}

function summarize(results) {
  console.log('\n=== Summary ===');
  for (const r of results) {
    const mark = r.status === 'ok' ? '✓' : r.status === 'warn' ? '⚠' : '✗';
    console.log(`  ${mark} ${r.id} — ${r.status}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
