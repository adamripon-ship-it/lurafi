#!/usr/bin/env node
/**
 * Full QA: backend Admin API + HTTP storefront + Playwright (browser, audit, i18n) + checkout.
 * Run: LURAFI_URL=https://mitipi.eu node scripts/qa-full.mjs
 *
 * Production guardrail: do not run back-to-back on mitipi.eu — triggers Cloudflare/Shopify 429 and
 * false failures. Wait ≥30 min between full runs on live domain. See docs/QA-LEARNINGS.md.
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const LURAFI = (process.env.LURAFI_URL || 'https://mitipi.eu').replace(/\/$/, '');
const STORE = (process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const OLD = process.env.OLD_URL || 'https://lurafi.ai';

const suites = [];

function runSuite(name, cmd, args, env = {}) {
  console.log(`\n${'='.repeat(60)}\n▶ ${name}\n${'='.repeat(60)}\n`);
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    timeout: 900000,
    maxBuffer: 20 * 1024 * 1024,
  });
  const out = (r.stdout || '') + (r.stderr || '');
  if (out.trim()) process.stdout.write(out);
  const row = { name, ok: r.status === 0, exitCode: r.status ?? 1 };
  suites.push(row);
  console.log(row.ok ? `\n✓ ${name} passed\n` : `\n✗ ${name} failed (exit ${row.exitCode})\n`);
  return row.ok;
}

async function httpChecks() {
  console.log(`\n${'='.repeat(60)}\n▶ HTTP storefront checks (${LURAFI})\n${'='.repeat(60)}\n`);
  const paths = [
    { path: '/', need: 'Make Home Look Alive', name: 'Home' },
    { path: '/products/kevin', name: 'Kevin PDP', status: 200 },
    { path: '/products/kevin-plus', name: 'Kevin+ PDP', status: 200 },
    { path: '/products/kevin.json', need: '"handle":"kevin"', name: 'kevin JSON' },
    { path: '/products/kevin-plus.json', need: '"handle":"kevin-plus"', name: 'kevin-plus JSON' },
    { path: '/pages/configure?plan=subscribe', need: '"sellingPlans"', name: 'Configure subscribe plans' },
    { path: '/pages/configure?plan=buy', need: 'data-configure', name: 'Configure buy' },
    { path: '/pages/sitemap', name: 'Sitemap page', status: 200 },
    { path: '/pages/llms', name: 'LLMs page', status: 200 },
    { path: '/robots.txt', need: 'Sitemap', name: 'robots.txt' },
    { path: '/cart', name: 'Cart', status: 200 },
  ];
  let fails = 0;
  for (const c of paths) {
    const res = await fetch(`${LURAFI}${c.path}`, { redirect: 'follow' });
    const text = await res.text();
    let ok = res.ok;
    if (c.status) ok = res.status === c.status;
    if (c.need) ok = ok && text.includes(c.need);
    const line = `${c.name}: ${res.status}${ok ? ' ✓' : ' ✗'}`;
    console.log(line);
    if (!ok) fails++;
  }
  suites.push({ name: 'HTTP storefront', ok: fails === 0, exitCode: fails ? 1 : 0 });
  return fails === 0;
}

async function cmsStructureChecks() {
  console.log(`\n${'='.repeat(60)}\n▶ CMS structure checks (${LURAFI})\n${'='.repeat(60)}\n`);
  const res = await fetch(`${LURAFI}/`, { redirect: 'follow' });
  const html = await res.text();
  const checks = [
    { name: 'Header nav present', ok: html.includes('site-nav') && html.includes('site-nav__link') },
    { name: 'Footer grid present', ok: html.includes('site-footer-apple__grid') },
    { name: 'Hero headline present', ok: html.includes('Make Home Look Alive') || html.includes('headline-hero') },
    { name: 'Pricing section anchor', ok: html.includes('id="pricing"') },
    { name: 'Specs table present', ok: html.includes('lp-specs__table') },
    { name: 'Sticky CTA markup', ok: html.includes('sticky-cta') || html.includes('data-sticky-cta') },
  ];
  let fails = 0;
  for (const c of checks) {
    console.log(`${c.name}: ${c.ok ? '✓' : '✗'}`);
    if (!c.ok) fails++;
  }
  suites.push({ name: 'CMS structure', ok: fails === 0, exitCode: fails ? 1 : 0 });
  return fails === 0;
}

function ensureSubscribeCommerce() {
  console.log('Ensuring kevin-plus selling plan (required for subscribe checkout)…');
  const r = spawnSync('node', ['scripts/setup-mitipi-commerce.mjs'], {
    cwd: ROOT,
    env: { ...process.env, SHOPIFY_STORE: STORE },
    encoding: 'utf8',
    timeout: 120000,
  });
  const out = (r.stdout || '') + (r.stderr || '');
  if (out.trim()) process.stdout.write(out);
  if (r.status !== 0) {
    console.warn('⚠ setup-mitipi-commerce failed — subscribe checkout may fail\n');
  }
}

async function checkoutSmoke() {
  console.log(`\n${'='.repeat(60)}\n▶ Checkout smoke (buy + subscribe)\n${'='.repeat(60)}\n`);
  ensureSubscribeCommerce();
  const { chromium } = await import('playwright');
  const results = [];
  // Subscribe first — needs selling plan; also avoids buy-then-subscribe rate limits.
  for (const plan of ['subscribe', 'buy']) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`${LURAFI}/pages/configure?plan=${plan}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('[data-configure]').first().waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(800);
    if (plan === 'subscribe') {
      const subCard = page.locator('[data-plan="subscribe"]');
      if (await subCard.isEnabled()) await subCard.click();
      await page.waitForTimeout(400);
    }
    const btn = page.locator('[data-configure-checkout]').first();
    await btn.click();
    try {
      await page.waitForURL(/\/checkouts\//, { timeout: 60000 });
    } catch {
      /* cart permalink may stop at /cart/...?checkout under Shopify rate limits */
    }
    const url = page.url();
    const atCheckout = /\/checkouts\//i.test(url);
    const hasSellingPlan = /selling_plan=/i.test(url);
    let ok = false;
    if (plan === 'buy') {
      ok = atCheckout;
    } else {
      // Shopify checkout URLs omit selling_plan; plan is attached on the cart line item.
      ok = atCheckout || (/\/cart\/[^?]+\?checkout/.test(url) && hasSellingPlan);
    }
    const note = plan === 'subscribe' && !atCheckout && ok ? ' (cart permalink; plan attached)' : '';
    console.log(`${plan}: ${ok ? '✓' : '✗'}${note} → ${url.slice(0, 90)}`);
    results.push({ plan, ok, url });
    await browser.close();
    if (plan === 'subscribe') await new Promise((r) => setTimeout(r, 8000));
  }
  const ok = results.every((r) => r.ok);
  suites.push({ name: 'Checkout smoke', ok, exitCode: ok ? 0 : 1 });
  return ok;
}

async function main() {
  if (/mitipi\.eu/i.test(LURAFI) && !process.env.QA_FULL_SKIP_PROD_WARN) {
    console.warn(
      '⚠ qa:full on production — run at most once per 30 min on mitipi.eu (see docs/QA-LEARNINGS.md)\n'
    );
  }
  console.log(`\nFull QA — storefront: ${LURAFI} | Admin: ${STORE}\n`);

  runSuite('Backend (Admin API)', 'node', ['scripts/qa-mitipi-backend.mjs'], { SHOPIFY_STORE: STORE });
  await httpChecks();
  await cmsStructureChecks();
  runSuite('Compare lurafi.ai → lurafi.com', 'node', ['scripts/qa-compare-stores.mjs'], {
    OLD_URL: OLD,
    NEW_URL: LURAFI,
  });
  runSuite('QA report JSON', 'node', ['scripts/qa-mitipi-report.mjs'], {
    NEW_URL: LURAFI,
    SHOPIFY_STORE: STORE,
  });
  runSuite('Browser QA (desktop/tablet/mobile)', 'node', ['scripts/browser-qa.mjs'], { LURAFI_URL: LURAFI });
  runSuite('Full-site audit', 'node', ['scripts/full-site-audit.mjs'], { LURAFI_URL: LURAFI });
  runSuite('i18n browser QA', 'node', ['scripts/i18n-browser-qa.mjs'], {
    LURAFI_URL: LURAFI,
    SMOKE_LOCALES: process.env.SMOKE_LOCALES || 'en,nl,fr,de,es',
  });
  await checkoutSmoke();

  const report = {
    generatedAt: new Date().toISOString(),
    lurafiUrl: LURAFI,
    shopifyStore: STORE,
    suites,
    passed: suites.filter((s) => s.ok).length,
    failed: suites.filter((s) => !s.ok).length,
  };
  const outPath = join(ROOT, 'scripts', 'qa-full-report.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n${'='.repeat(60)}\nFULL QA SUMMARY\n${'='.repeat(60)}`);
  for (const s of suites) console.log(`${s.ok ? '✓' : '✗'} ${s.name}`);
  console.log(`\n${report.passed}/${suites.length} suites passed`);
  console.log(`Report: ${outPath}\n`);
  process.exit(report.failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
