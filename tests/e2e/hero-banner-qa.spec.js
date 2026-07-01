import { test, expect } from '@playwright/test';

test.describe('mitipi.eu hero banner QA', () => {
  test('static full-page hero', async ({ page }) => {
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
    await page.waitForFunction(
      () => document.querySelector('.hero-apple')?.classList.contains('hero-apple--animate') ||
        document.documentElement.classList.contains('motion-reduced'),
      { timeout: 15000 }
    );

    await expect(page.locator('[data-hero-slider]')).toHaveCount(0);
    await expect(page.locator('[data-hero-slider-dots]')).toHaveCount(0);
    await expect(page.locator('[data-product-rotator]')).toHaveCount(0);
    await expect(page.locator('.hero-banner')).toHaveCount(1);
    await expect(page.locator('.hero-slider__copy')).toHaveCount(0);

    const hero = page.locator('.hero-apple');
    const heroBox = await hero.boundingBox();
    expect(heroBox).toBeTruthy();
    expect(heroBox.height).toBeGreaterThanOrEqual(600);

    await expect(page.locator('#HeroHeading')).toBeVisible();
    await expect(page.locator('#HeroHeading')).toContainText(/deter burglaries/i);

    const heroLede = page.locator('.hero-banner .hero-banner__lede');
    await expect(heroLede).toBeVisible();
    await expect(heroLede).toContainText(/simulates human presence/i);

    const productImg = page.locator('.hero-banner .hero-banner__product-image');
    await expect(productImg).toBeVisible();
    const ledeBox = await heroLede.boundingBox();
    const imgBox = await productImg.boundingBox();
    expect(ledeBox).toBeTruthy();
    expect(imgBox).toBeTruthy();
    expect(ledeBox.y + ledeBox.height).toBeLessThan(imgBox.y - 8);
    expect(imgBox.y + imgBox.height).toBeLessThanOrEqual(heroBox.y + heroBox.height + 8);
    expect(imgBox.width).toBeGreaterThan(80);
    expect(imgBox.height).toBeGreaterThan(80);

    await expect(page.locator('.hero-banner .hero-context-card')).toHaveCount(4);
    await expect(page.locator('.hero-context-card__body').first()).toBeVisible();
    await expect(page.locator('.hero-context-card__body').first()).toContainText(/9 W|window/i);

    const filteredErrors = consoleErrors.filter(
      (e) =>
        !/favicon/i.test(e) &&
        !/chrome-extension/i.test(e) &&
        !/Failed to load resource.*404/i.test(e) &&
        !/Content Security Policy/i.test(e)
    );
    expect(filteredErrors, `console errors: ${filteredErrors.join('; ')}`).toEqual([]);
  });
});
