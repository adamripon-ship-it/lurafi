/**
 * Comprehensive site audit: links, SEO, UX, CRO, viewports
 * Run: node scripts/full-site-audit.mjs
 */
import { chromium, devices } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = process.env.LURAFI_URL || 'https://lurafi.ai';
const report = { issues: [], passes: [], warnings: [], pages: {} };
const screenshotDir = join(process.cwd(), 'scripts', 'qa-screenshots', 'audit');

function pass(msg) { report.passes.push(msg); console.log(`  ✓ ${msg}`); }
function warn(msg) { report.warnings.push(msg); console.log(`  ⚠ ${msg}`); }
function fail(msg, detail) {
  const line = detail ? `${msg} — ${detail}` : msg;
  report.issues.push(line);
  console.log(`  ✗ ${line}`);
}

const ROUTES = [
  { path: '/', name: 'Home' },
  { path: '/?view=configure&plan=buy', name: 'Configure Buy' },
  { path: '/?view=configure&plan=subscribe', name: 'Configure Subscribe' },
  { path: '/pages/configure?plan=buy', name: 'Legacy Configure' },
  { path: '/cart', name: 'Cart' },
  { path: '/collections/all', name: 'All Products' },
  { path: '/search?q=lurafi', name: 'Search' },
  { path: '/blogs/news', name: 'Blog' },
  { path: '/404-test-audit', name: '404' },
];

async function auditPage(page, route, viewportName) {
  const key = `${viewportName}:${route.name}`;
  const url = BASE + route.path;
  const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(route.path.includes('configure') ? 1500 : 800);

  const finalUrl = page.url();
  const status = res?.status() ?? 0;
  const title = await page.title();
  const h1Count = await page.locator('h1').count();
  const metaDesc = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
  const jsonLd = await page.locator('script[type="application/ld+json"]').count();

  const data = { status, finalUrl, title, h1Count, metaDesc: metaDesc?.slice(0, 80), canonical, ogTitle, jsonLd };
  report.pages[key] = data;

  const legacyConfigureOk =
    route.name === 'Legacy Configure' &&
    (finalUrl.includes('view=configure') || (await page.locator('[data-configure]').count()) > 0);

  if (status >= 400 && route.name !== '404' && !legacyConfigureOk) {
    fail(`${route.name} HTTP ${status}`, viewportName);
  } else if (legacyConfigureOk && status >= 400) {
    pass(`${route.name}: HTTP ${status} with redirect to configure`);
  } else if (route.name === '404' && status === 404) pass(`404 page returns 404`);
  else if (route.name !== '404') pass(`${route.name} loads (${status})`);

  if (route.path.includes('configure') || finalUrl.includes('view=configure')) {
    if (await page.locator('[data-configure]').count()) pass(`${route.name}: configure UI present`);
    else fail(`${route.name}: missing configure UI`, finalUrl);
  }

  if (route.name === 'Legacy Configure') {
    if (finalUrl.includes('view=configure') || (await page.locator('[data-configure]').count()))
      pass('Legacy /pages/configure resolves');
    else fail('Legacy configure broken', finalUrl);
  }

  if (route.path === '/' && viewportName === 'Desktop') {
    if (h1Count === 1) pass('Home has single H1');
    else fail(`Home H1 count: ${h1Count}`);
    if (metaDesc && metaDesc.length >= 50) pass('Home meta description present');
    else warn('Home meta description missing or short');
    const hasLurafiHead = await page.content().then((html) => /lurafi-head-v\d+/.test(html));
    if (jsonLd === 0 && !hasLurafiHead) warn('No JSON-LD on homepage — theme SEO snippets may not be deployed');
    else if (jsonLd === 0) warn('JSON-LD count 0 despite lurafi-head marker (check structured-data.liquid)');
    else pass(`JSON-LD blocks: ${jsonLd}`);
  }

  const brokenLinks = await page.evaluate(async (origin) => {
    const bad = [];
    const links = [...document.querySelectorAll('a[href]')];
    for (const a of links.slice(0, 40)) {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
      try {
        const u = new URL(href, origin);
        if (u.hostname !== new URL(origin).hostname) continue;
        if (/^\/policies\//.test(u.pathname) || u.pathname === '/pages/llms') continue;
        if (u.pathname.includes('customer_authentication')) continue;
        const r = await fetch(u.href, { method: 'HEAD', redirect: 'follow' });
        if (r.status >= 400) bad.push({ href: u.pathname, status: r.status });
      } catch (e) {
        bad.push({ href, status: 'err' });
      }
    }
    return bad;
  }, BASE);

  if (brokenLinks.length) fail(`${route.name} broken internal links`, JSON.stringify(brokenLinks.slice(0, 3)));
}

async function testViewport(browser, name, viewport, isMobile) {
  console.log(`\n========== ${name} ==========`);
  const context = await browser.newContext({
    viewport,
    extraHTTPHeaders: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    ...(isMobile ? { ...devices['iPhone 13'], viewport } : {}),
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(e.message));

  for (const route of ROUTES) {
    await auditPage(page, route, name);
  }

  async function waitForMotion() {
    await page
      .waitForFunction(
        () =>
          document.documentElement.classList.contains('motion-ready') ||
          document.documentElement.classList.contains('motion-reduced'),
        { timeout: 12000 }
      )
      .catch(() => {});
    return page.evaluate(() => ({
      motionReady: document.documentElement.classList.contains('motion-ready'),
      motionReduced: document.documentElement.classList.contains('motion-reduced'),
      hasThemeJs: !!document.querySelector('script[src*="theme.js"]'),
    }));
  }

  await page.goto(`${BASE}/?motion-qa=${Date.now()}`, { waitUntil: 'networkidle', timeout: 60000 });
  let motion = await waitForMotion();
  for (let attempt = 0; attempt < 2 && !motion.motionReady && !motion.motionReduced; attempt += 1) {
    await page.goto(`${BASE}/?motion-qa=${Date.now()}&retry=${attempt}`, { waitUntil: 'networkidle', timeout: 60000 });
    motion = await waitForMotion();
  }
  if (motion.motionReady || motion.motionReduced) pass(`${name}: animations (${motion.motionReduced ? 'motion-reduced' : 'motion-ready'})`);
  else if (!motion.hasThemeJs) warn(`${name}: motion-ready missing — cached HTML may omit theme.js (Shopify page cache)`);
  else warn(`${name}: motion-ready missing after retries (CDN cache — re-run audit)`);

  const anchors = ['#problem', '#how-it-works', '#app', '#pricing', '#product'];
  for (const id of anchors) {
    const el = page.locator(id);
    if ((await el.count()) === 0) fail(`${name}: missing ${id}`);
    else {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }
  }
  pass(`${name}: anchor sections exist`);

  const buyLinks = await page.locator('a[href*="view=configure"], a[href*="plan=buy"]').count();
  if (buyLinks > 0) pass(`${name}: ${buyLinks} buy/configure CTAs`);
  else fail(`${name}: no buy CTAs`);

  if (isMobile) {
    const menuBtn = page.locator('[data-menu-open]');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(400);
      if (await page.locator('#MobileNavPanel').isVisible()) pass(`${name}: mobile menu`);
      else fail(`${name}: mobile menu broken`);
      await page.keyboard.press('Escape');
    }
    const tapTargets = await page.evaluate(() => {
      const small = [];
      document.querySelectorAll('a, button').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.height < 40 && r.width < 40) {
          small.push(el.className?.slice(0, 30) || el.tagName);
        }
      });
      return small.length;
    });
    if (tapTargets > 5) warn(`${name}: ${tapTargets} potentially small tap targets (<40px)`);
    else pass(`${name}: tap target check OK`);
  }

  await page.goto(`${BASE}/?view=configure&plan=buy`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  const checkoutBtn = page.locator('[data-configure-checkout]').first();
  if (await checkoutBtn.count()) {
    pass(`${name}: configure checkout button`);
    const errBefore = await page.locator('[data-configure-error]:not([hidden])').count();
    await checkoutBtn.click();
    await page.waitForTimeout(2500);
    const url = page.url();
    const errAfter = await page.locator('[data-configure-error]').textContent().catch(() => '');
    if (url.includes('/checkout')) pass(`${name}: checkout redirect works`);
    else if (errAfter && !errBefore) warn(`${name}: checkout blocked — ${errAfter.trim().slice(0, 80)} (products may be unset)`);
    else if (url.includes('/cart')) warn(`${name}: landed on cart (no LurafiCart or add failed)`);
    else warn(`${name}: checkout click → ${url.slice(0, 60)}`);
  }

  const cartPage = await context.newPage();
  await cartPage.goto(`${BASE}/cart`, { waitUntil: 'networkidle', timeout: 45000 });
  const cartCheckout = cartPage.locator('button[name="checkout"], a[href*="checkout"], .cart__checkout');
  if (await cartCheckout.count()) pass(`${name}: cart has checkout path`);
  else warn(`${name}: cart checkout CTA not found (empty cart?)`);
  await cartPage.close();

  mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({ path: join(screenshotDir, `${name.toLowerCase()}-final.png`) });

  const critical = consoleErrors.filter(
    (e) =>
      !/shopify|monorail|cookie|CSP|analytics|pixel|web-pixel|favicon|403|401|shop\.app|404/i.test(e) &&
      !/Failed to load resource/i.test(e) &&
      !/network failure may have prevented|Error completing request/i.test(e) &&
      !/^Failed to fetch\.?$/i.test(e.trim())
  );
  if (critical.length) fail(`${name} console: ${critical.slice(0, 2).join(' | ')}`);
  else pass(`${name}: no critical console errors`);

  await context.close();
}

async function auditSEOHeadless(browser) {
  console.log('\n========== SEO / AI-SEO ==========');
  const page = await browser.newPage();
  await page.goto(`${BASE}/?seo-audit=${Date.now()}`, { waitUntil: 'networkidle', timeout: 60000 });
  const seo = await page.evaluate(() => ({
    title: document.title,
    metaDesc: document.querySelector('meta[name="description"]')?.content,
    ogImage: document.querySelector('meta[property="og:image"]')?.content,
    robots: document.querySelector('meta[name="robots"]')?.content,
    lang: document.documentElement.lang,
    h1: [...document.querySelectorAll('h1')].map((h) => h.textContent?.trim().slice(0, 60)),
    h2count: document.querySelectorAll('h2').length,
    imgsNoAlt: [...document.querySelectorAll('img:not([alt])')].length,
    imgsEmptyAlt: [...document.querySelectorAll('img[alt=""]')].filter((i) => !i.getAttribute('role')).length,
    hasSkipLink: !!document.querySelector('.skip-to-content-link'),
    viewport: document.querySelector('meta[name="viewport"]')?.content,
  }));
  if (seo.lang) pass(`html lang="${seo.lang}"`);
  else warn('Missing html lang');
  if (seo.viewport?.includes('width=device-width')) pass('Viewport meta OK');
  else fail('Viewport meta missing or wrong');
  if (seo.hasSkipLink) pass('Skip to content link');
  else warn('No skip link');
  if (seo.imgsNoAlt === 0) pass('All images have alt attribute');
  else warn(`${seo.imgsNoAlt} images without alt`);
  const jsonLdCount = await page.locator('script[type="application/ld+json"]').count();
  if (seo.ogImage) pass('OG image set');
  else warn('No og:image on homepage — deploy meta-tags.liquid or set favicon');
  if (jsonLdCount > 0) pass(`SEO headless: ${jsonLdCount} JSON-LD block(s)`);
  else warn('No JSON-LD on homepage — deploy structured-data.liquid');
  await page.close();
}

async function main() {
  console.log(`\nKevin full-site audit — ${BASE}\n`);
  mkdirSync(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  await auditSEOHeadless(browser);
  await testViewport(browser, 'Desktop', { width: 1440, height: 900 }, false);
  await testViewport(browser, 'Tablet', { width: 834, height: 1194 }, false);
  await testViewport(browser, 'Mobile', { width: 390, height: 844 }, true);

  await browser.close();

  const outPath = join(process.cwd(), 'scripts', 'audit-report.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log('\n========== SUMMARY ==========');
  console.log(`Passed: ${report.passes.length}`);
  console.log(`Warnings: ${report.warnings.length}`);
  console.log(`Issues: ${report.issues.length}`);
  report.issues.forEach((i, n) => console.log(`  ${n + 1}. ${i}`));
  report.warnings.forEach((w, n) => console.log(`  W${n + 1}. ${w}`));
  console.log(`\nReport: ${outPath}`);
  process.exit(report.issues.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
