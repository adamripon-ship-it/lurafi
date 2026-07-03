import { test, expect } from '@playwright/test';

test.describe('mitipi.eu hero banner QA', () => {
  test('static product hero — focus layout with dual CTAs', async ({ page }) => {
    test.setTimeout(90000);
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto('/?qa=hero', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(
      () => document.documentElement.classList.contains('motion-ready') || document.documentElement.classList.contains('motion-reduced'),
      { timeout: 20000 }
    );
    await page.locator('.hero-banner .hero-banner__product-image').waitFor({ state: 'visible', timeout: 15000 });

    await expect(page.locator('[data-hero-slider]')).toHaveCount(0);
    await expect(page.locator('.hero-banner[data-hero-layout="focus-v4"]')).toHaveCount(1);
    await expect(page.locator('#HeroHeading')).toBeVisible();
    await expect(page.locator('.hero-banner__lede')).toContainText(/no cameras/i);
    await expect(page.locator('.hero-banner__eyebrow')).toHaveCount(0);
    await expect(page.locator('.hero-banner__trust')).toHaveCount(1);
    await expect(page.locator('.hero-banner__trust-item')).toHaveCount(3);
    await expect(page.locator('.hero-banner__chips')).toHaveCount(0);
    await expect(page.locator('.hero-spec-chip')).toHaveCount(0);
    await expect(page.locator('.hero-context-card')).toHaveCount(0);

    await expect(page.locator('.hero-banner__cta--primary')).toHaveCount(1);
    await expect(page.locator('.hero-banner__cta--secondary')).toHaveCount(1);
    await expect(page.locator('.hero-banner__product-stage')).toHaveCount(1);

    const productImg = page.locator('.hero-banner__product-image');
    const productBox = await productImg.boundingBox();
    expect(productBox).toBeTruthy();
    expect(productBox.height).toBeGreaterThan(120);

    const sticky = page.locator('[data-sticky-cta]');
    if (await sticky.count()) {
      await expect(sticky).toBeHidden();
    }

    const filteredErrors = consoleErrors.filter(
      (e) =>
        !/favicon/i.test(e) &&
        !/chrome-extension/i.test(e) &&
        !/Failed to load resource.*404/i.test(e) &&
        !/Content Security Policy/i.test(e)
    );
    expect(filteredErrors, `console errors: ${filteredErrors.join('; ')}`).toEqual([]);
  });

  test('mechanism scroll-stage renders the window motif', async ({ page }) => {
    await page.goto('/?qa=hero#how-it-works', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('.nf-mech').waitFor({ state: 'attached', timeout: 15000 });

    await expect(page.locator('.nf-window')).toHaveCount(1);
    await expect(page.locator('.nf-window__silhouette')).toHaveCount(1);
    await expect(page.locator('.nf-mech .nf-soundbars')).toHaveCount(1);
    await expect(page.locator('.nf-mech__phase')).toHaveCount(3);
  });

  test('nightfall narrative sections render image-free', async ({ page }) => {
    await page.goto('/?qa=hero', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Section presence + anchors
    await expect(page.locator('.problem-bento')).toHaveCount(1);
    await expect(page.locator('.nf-glyph')).toHaveCount(3);
    await expect(page.locator('#product .nf-ticker')).toHaveCount(1);
    await expect(page.locator('.nf-jammer__col')).toHaveCount(2);
    await expect(page.locator('.nf-phone')).toHaveCount(1);
    await expect(page.locator('#proof .trust-badges')).toHaveCount(1);
    await expect(page.locator('.nf-quote')).toHaveCount(1);
    await expect(page.locator('.lp-specs-full')).toHaveCount(1);
    await expect(page.locator('#faq')).toHaveCount(1);
    expect(await page.locator('.faq-item').count()).toBeGreaterThanOrEqual(5);
    for (const anchor of ['#problem', '#how-it-works', '#product', '#app', '#pricing']) {
      await expect(page.locator(anchor)).toHaveCount(1);
    }

    // The image-free guarantee: the hero product photo is the ONLY image in main content.
    expect(await page.locator('#MainContent img').count()).toBeLessThanOrEqual(1);
  });

  test('nightfall dark theme scoped to homepage only', async ({ page }) => {
    await page.goto('/?qa=hero', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('body')).toHaveClass(/nightfall/);
    await expect(page.locator('link[href*="nightfall.css"]')).toHaveCount(1);

    // Header must stay dark after scrolling past the hero on nightfall pages.
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.waitForTimeout(400);
    await expect(page.locator('.site-header')).toHaveAttribute('data-theme', 'dark');

    // Configure view on the index template must NOT be nightfall.
    await page.goto('/?view=configure', { waitUntil: 'domcontentloaded', timeout: 60000 });
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).not.toMatch(/nightfall/);
  });

  test('homepage title and OG title carry product keywords', async ({ page }) => {
    await page.goto('/?qa=hero', { waitUntil: 'domcontentloaded', timeout: 60000 });

    await expect(page).toHaveTitle(/Kevin/);
    const title = await page.title();
    expect(title.trim()).not.toMatch(/^Mitipi GmbH$/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Kevin/);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', /Kevin/);
  });

  test('stats keep server-rendered values before scroll (no zero flash)', async ({ page }) => {
    await page.goto('/?qa=hero', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(
      () => document.documentElement.classList.contains('motion-ready') || document.documentElement.classList.contains('motion-reduced'),
      { timeout: 20000 }
    );

    // Below-fold count-up stats must keep their real values until they enter the viewport.
    const stats = page.locator('.stats-grid-4 [data-countup]');
    expect(await stats.count()).toBeGreaterThan(0);
    for (const value of await stats.allTextContents()) {
      expect(value.trim()).not.toMatch(/^0\D*$/);
    }
  });
});
