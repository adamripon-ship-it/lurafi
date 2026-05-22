/**
 * Full-site browser QA for lurafi.ai
 * Run: node scripts/browser-qa.mjs
 */
import { chromium, devices } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = process.env.LURAFI_URL || 'https://lurafi.ai';
const issues = [];
const passes = [];
const screenshotDir = join(process.cwd(), 'scripts', 'qa-screenshots');

function pass(msg) {
  passes.push(msg);
  console.log(`  ✓ ${msg}`);
}
function fail(msg, detail) {
  const line = detail ? `${msg} — ${detail}` : msg;
  issues.push(line);
  console.log(`  ✗ ${line}`);
}

/** Detect CDN serving an old index vs current StoryBrand problem section. */
function problemHeadingLooksFresh(text) {
  if (!text || !String(text).trim()) return false;
  const t = String(text);
  if (/90\s*seconds|every\s+90/i.test(t)) return false;
  return /empty|should not look/i.test(t);
}

async function testViewport(browser, name, viewport, isMobile) {
  console.log(`\n=== ${name} (${viewport.width}×${viewport.height}) ===`);
  const context = await browser.newContext({
    viewport,
    extraHTTPHeaders: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    ...(isMobile ? devices['iPhone 13'] : {}),
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(e.message));

  async function loadHomeFresh() {
    const res = await page.goto(`${BASE}/?qa=${Date.now()}`, { waitUntil: 'networkidle', timeout: 60000 });
    return res;
  }

  let homeRes = await loadHomeFresh();
  if (!homeRes || homeRes.status() >= 400) fail(`Homepage HTTP ${homeRes?.status()}`, name);
  else pass(`Homepage loads (${homeRes.status()})`);

  async function waitForMotion() {
    await page
      .waitForFunction(
        () =>
          document.documentElement.classList.contains('motion-ready') ||
          document.documentElement.classList.contains('motion-reduced'),
        { timeout: 16000 }
      )
      .catch(() => {});
    return page.evaluate(() => ({
      motionReady: document.documentElement.classList.contains('motion-ready'),
      motionReduced: document.documentElement.classList.contains('motion-reduced'),
      hasThemeJs: !!document.querySelector('script[src*="theme.js"]'),
    }));
  }

  let motion = await waitForMotion();
  let problemHeading = await page.locator('#problem h2').textContent().catch(() => '');
  function homeLooksStale() {
    const motionBad = !motion.motionReady && !motion.motionReduced;
    const problemBad = Boolean(problemHeading && !problemHeadingLooksFresh(problemHeading));
    return motionBad || problemBad;
  }
  for (let attempt = 0; attempt < 4 && homeLooksStale(); attempt += 1) {
    await page.goto(`${BASE}/?qa=${Date.now()}&retry=${attempt}`, { waitUntil: 'networkidle', timeout: 60000 });
    motion = await waitForMotion();
    problemHeading = await page.locator('#problem h2').textContent().catch(() => '');
  }

  if ((motion.hasThemeJs && !motion.motionReady && !motion.motionReduced) || homeLooksStale()) {
    await page.waitForTimeout(800);
    motion = await waitForMotion();
    problemHeading = await page.locator('#problem h2').textContent().catch(() => '');
  }

  if (motion.motionReady || motion.motionReduced) {
    pass(`Page animations initialized (${motion.motionReduced ? 'motion-reduced' : 'motion-ready'})`);
  } else if (!motion.hasThemeJs) {
    fail('Cached HTML missing theme.js — Shopify page cache may be stale', name);
  } else {
    fail('motion-ready class missing after reload — animations may not run', name);
  }

  const heroAnimated = await page.locator('.hero-apple--animate').count();
  if (heroAnimated) pass('Hero entrance animation applied');
  else if (motion.motionReady || motion.motionReduced) {
    await page.waitForTimeout(500);
    if (await page.locator('.hero-apple--animate').count()) pass('Hero entrance animation applied (delayed)');
    else fail('Hero animation class missing', name);
  } else fail('Hero animation class missing', name);

  if (problemHeadingLooksFresh(problemHeading || '')) {
    pass(`StoryBrand problem copy live: "${(problemHeading || '').trim().slice(0, 40)}…"`);
  } else {
    fail('Problem section copy may be stale (CDN)', problemHeading?.trim());
  }

  const buyCount = await page.locator('a[href*="view=configure"]').count();
  if (buyCount > 0) pass(`${buyCount} configure link(s)`);
  else fail('No ?view=configure links', name);

  for (const id of ['problem', 'how-it-works', 'app', 'pricing']) {
    const el = page.locator(`#${id}`);
    if ((await el.count()) > 0) {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      pass(`Section #${id} scroll OK`);
    }
  }

  mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({ path: join(screenshotDir, `${name.toLowerCase()}-home.png`), fullPage: false });

  const brokenImgs = await page.evaluate(async () => {
    const bad = [];
    for (const img of document.images) {
      if (img.naturalWidth === 0 && img.complete) bad.push(img.src?.slice(0, 80));
    }
    return bad;
  });
  if (brokenImgs.length) fail(`Broken images: ${brokenImgs.join('; ')}`, name);
  else pass('No broken images');

  if (isMobile) {
    const menuBtn = page.locator('[data-menu-open]');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(500);
      if (await page.locator('#MobileNavPanel').isVisible()) pass('Mobile menu opens');
      else fail('Mobile menu not visible', name);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: join(screenshotDir, 'mobile-menu.png') });
  }

  const configurePage = await context.newPage();
  await configurePage.goto(`${BASE}/?view=configure&plan=buy`, { waitUntil: 'networkidle', timeout: 60000 });
  await configurePage.waitForTimeout(800);
  if (await configurePage.locator('[data-configure]').count()) {
    pass('Configure page OK');
    await configurePage.screenshot({ path: join(screenshotDir, `${name.toLowerCase()}-configure.png`) });
  } else fail('Configure page missing UI', name);

  const checkoutBtn = configurePage.locator('[data-configure-checkout]');
  if (await checkoutBtn.count()) pass('Configure checkout CTA present');
  await configurePage.close();

  const legacyPage = await context.newPage();
  await legacyPage.goto(`${BASE}/pages/configure?plan=buy`, { waitUntil: 'networkidle', timeout: 45000 });
  await legacyPage.waitForTimeout(2000);
  const legacyUrl = legacyPage.url();
  const hasConfigure = (await legacyPage.locator('[data-configure]').count()) > 0;
  if (hasConfigure || legacyUrl.includes('view=configure')) pass('Legacy /pages/configure resolves to configure');
  else if (legacyUrl.includes('404')) fail('/pages/configure shows 404', legacyUrl);
  else fail('/pages/configure did not redirect', legacyUrl);
  await legacyPage.close();

  const cartRes = await page.goto(`${BASE}/cart`, { waitUntil: 'networkidle', timeout: 45000 });
  if (cartRes && cartRes.status() < 400) pass('Cart page loads');
  else fail(`Cart HTTP ${cartRes?.status()}`, name);

  const critical = consoleErrors.filter(
    (e) =>
      !/shopify|monorail|cookie|CSP|analytics|pixel|web-pixel|401|403|404/i.test(e) &&
      !/Failed to load resource/i.test(e) &&
      !/\bX-Frame-Options\b|ALLOW-FROM/i.test(e) &&
      !/^Failed to fetch\.?$/i.test(e.trim()) &&
      !/serviceWorker.*sandbox|allow-same-origin/i.test(e)
  );
  if (critical.length) fail(`Console errors: ${critical.slice(0, 2).join(' | ')}`);
  else pass('No critical console errors');

  await context.close();
}

async function main() {
  console.log(`\nStorefront browser QA — ${BASE}\n`);
  const browser = await chromium.launch({ headless: true, args: ['--disable-http-cache'] });

  await testViewport(browser, 'Desktop', { width: 1440, height: 900 }, false);
  await testViewport(browser, 'Tablet', { width: 834, height: 1194 }, false);
  await testViewport(browser, 'Mobile', { width: 390, height: 844 }, true);

  await browser.close();

  console.log('\n--- Summary ---');
  console.log(`Passed: ${passes.length}`);
  console.log(`Issues: ${issues.length}`);
  if (issues.length) {
    issues.forEach((i, n) => console.log(`  ${n + 1}. ${i}`));
    process.exit(1);
  }
  console.log(`\nScreenshots: ${screenshotDir}`);
  console.log('\nAll browser checks passed.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
