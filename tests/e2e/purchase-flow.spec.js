// Full purchase path on the live storefront (LURAFI_URL, default https://mitipi.eu):
//   1. configure page: pick a device colour, add one optional front cover, continue to Shopify
//      checkout and confirm both lines (KEVIN + cover) are in the order summary;
//   2. product page -> add to cart -> cart page quantity stepper and sticky checkout bar -> checkout;
//   3. every published locale: localized configure page and product URL resolve, checkout is reachable.
// Run:  LURAFI_URL=https://mitipi.eu npx playwright test tests/e2e/purchase-flow.spec.js
// Each checkout creates an abandoned checkout in Admin; run on demand, not on a schedule.
import { test, expect } from '@playwright/test';
import {
  BASE,
  CHECKOUT,
  configurePath,
  primary,
  productPath,
  published,
  readCheckoutText,
  waitForCheckout,
} from './lib/site.js';

const CHECKOUT_TIMEOUT = 90000;

test.describe('Purchase flow', () => {
  test('configure: device colour + optional cover -> checkout carries both lines', async ({ page }) => {
    test.setTimeout(CHECKOUT_TIMEOUT + 60000);
    await page.goto(`${BASE}${configurePath(primary)}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-configure]')).toBeVisible();
    await expect(page.locator('[data-plan="subscribe"]')).toHaveCount(0);

    // 1. Device colour: swatches are rendered by configure-v2.js from the buy product's variants.
    const swatches = page.locator('[data-configure-swatches] .configure-swatch');
    await expect(swatches.first()).toBeVisible({ timeout: 20000 });
    const swatchCount = await swatches.count();
    const swatch = swatches.nth(swatchCount > 1 ? 1 : 0);
    const colour = ((await swatch.getAttribute('title')) || '').trim();
    await swatch.click();
    await expect(swatch).toHaveClass(/is-selected/);
    if (colour) await expect(page.locator('[data-configure-summary-color]')).toContainText(new RegExp(colour, 'i'));

    // 2. Optional front cover: the first purchasable card (cards without a live variant are "soon").
    const cover = page
      .locator('[data-configure-covers] .configure-cover[data-cover-id]:not([data-cover-soon])')
      .first();
    const coverId = (await cover.count()) ? await cover.getAttribute('data-cover-id') : '';
    test.skip(!/^\d+$/.test(coverId || ''), 'no purchasable front cover is published on the configure page');
    await cover.scrollIntoViewIfNeeded();
    const coverName = ((await cover.locator('.configure-cover__name').textContent()) || '').trim();
    expect(coverName, 'cover card has a name').not.toBe('');
    await cover.locator('[data-cover-plus]').click();
    await expect(cover.locator('[data-cover-qty]')).toHaveText('1');
    await expect(cover).toHaveClass(/is-selected/);
    await expect(page.locator('[data-configure-summary-covers-row]')).toHaveClass(/has-covers/);
    await expect(page.locator('[data-configure-summary-covers]')).toContainText(coverName);

    // 3. Checkout with device + cover (configure-v2.js adds both lines, then opens /checkout).
    await page.locator('[data-configure-checkout]').first().click();
    await waitForCheckout(page, CHECKOUT_TIMEOUT);
    await expect(page).toHaveURL(CHECKOUT);
    await expect(page.locator('body')).not.toContainText(/almost ready|sold out|unavailable/i);
    if (/\/checkouts\//.test(page.url())) {
      const summary = await readCheckoutText(page);
      expect(summary, 'device line in the order summary').toMatch(/KEVIN/i);
      expect(summary, 'cover line in the order summary').toMatch(new RegExp(coverName, 'i'));
    }
  });

  test('product page -> cart quantity stepper + sticky checkout bar -> checkout', async ({ page, isMobile }) => {
    test.setTimeout(CHECKOUT_TIMEOUT + 60000);
    await page.goto(`${BASE}${productPath(primary)}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#ProductForm')).toBeVisible();
    await expect(page.locator('h1').first()).toContainText(/KEVIN/i);

    const add = page.locator('#ProductForm [name="add"]').first();
    await expect(add).toBeEnabled();
    await add.click();
    await page.waitForTimeout(1500); // drawer open or full-page add; the cart page is the source of truth
    await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded' });

    const qty = page.locator('[data-cart-qty-input]').first();
    await expect(qty).toBeVisible();
    const before = Number(await qty.inputValue());
    expect(before).toBeGreaterThan(0);
    await page.locator('[data-cart-qty-plus]').first().click();
    await expect(qty).toHaveValue(String(before + 1), { timeout: 15000 });
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 15000 });
    await page.locator('[data-cart-qty-minus]').first().click();
    await expect(qty).toHaveValue(String(before), { timeout: 15000 });
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 15000 });

    const anchor = page.locator('[data-cart-sticky-anchor]');
    await expect(anchor).toBeVisible();
    if (isMobile) {
      // The sticky bar shows only while the primary checkout button is off-screen, so the two never overlap.
      const sticky = page.locator('[data-cart-sticky]');
      await page.evaluate(() => window.scrollTo(0, 0));
      const anchorInView = await anchor.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= window.innerHeight;
      });
      if (!anchorInView) await expect(sticky).toBeVisible({ timeout: 5000 });
      await anchor.scrollIntoViewIfNeeded();
      await expect(sticky).toBeHidden({ timeout: 5000 });
    }

    await anchor.click();
    await waitForCheckout(page, CHECKOUT_TIMEOUT);
    await expect(page).toHaveURL(CHECKOUT);
  });

  for (const loc of published) {
    test(`localized configure -> checkout (${loc.code})`, async ({ page }) => {
      test.setTimeout(CHECKOUT_TIMEOUT + 60000);
      const res = await page.goto(`${BASE}${configurePath(loc)}`, { waitUntil: 'domcontentloaded' });
      expect(res?.status(), 'configure page status').toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', new RegExp(`^${loc.code}`, 'i'));
      await expect(page.locator('[data-configure]')).toBeVisible();
      await expect(page.locator('[data-plan="subscribe"]')).toHaveCount(0);

      const product = await page.request.get(`${BASE}${productPath(loc)}`, { maxRedirects: 0 });
      expect(product.status(), `localized product URL ${productPath(loc)}`).toBe(200);

      await page.locator('[data-configure-checkout]').first().click();
      await waitForCheckout(page, CHECKOUT_TIMEOUT);
      await expect(page).toHaveURL(CHECKOUT);
    });
  }
});
