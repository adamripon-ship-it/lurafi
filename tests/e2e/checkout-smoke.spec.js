// Critical-path E2E smoke test for the lurafi storefront.
// Covers: configure (buy) -> Shopify checkout, and PDP -> cart -> checkout.
//
// Run:  LURAFI_URL=https://mitipi.eu npx playwright test
// CI :  npm run test:e2e
import { test, expect } from '@playwright/test';

const BASE = (process.env.LURAFI_URL || 'https://mitipi.eu').replace(/\/$/, '');
const CHECKOUT = /\/checkouts\//;

test.describe('Critical purchase path', () => {
  test('configure (buy) reaches Shopify checkout', async ({ page }) => {
    await page.goto(`${BASE}/pages/configure?plan=buy`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-configure]')).toBeVisible();
    await expect(page.locator('[data-plan="subscribe"]')).toHaveCount(0);

    const cta = page.locator('[data-configure-checkout]').first();
    await expect(cta).toBeVisible();

    await cta.click();
    await page.waitForURL(CHECKOUT, { timeout: 60000 });

    await expect(page).toHaveURL(CHECKOUT);
    await expect(page.locator('body')).not.toContainText(/almost ready|sold out|unavailable/i);
  });

  test('configure ignores legacy subscribe plan param', async ({ page }) => {
    await page.goto(`${BASE}/pages/configure?plan=subscribe`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-configure]')).toBeVisible();
    await expect(page.locator('[data-plan="subscribe"]')).toHaveCount(0);
  });

  // SECONDARY flow: product detail -> add to cart -> checkout
  test('product detail -> add to cart -> checkout', async ({ page }) => {
    await page.goto(`${BASE}/products/kevin`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#ProductForm')).toBeVisible();

    const variant = page.locator('[data-variant-select]');
    if (await variant.count()) await variant.first().selectOption({ index: 0 });

    await page.locator('#ProductForm button[type="submit"], #ProductForm [name="add"]').first().click();

    await page.waitForTimeout(1500);
    const drawerOpen = await page.evaluate(() =>
      document.body.classList.contains('cart-drawer-open') ||
      !document.getElementById('CartDrawer')?.hidden
    );
    if (!drawerOpen) {
      await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded' });
    }

    const checkoutBtn = page
      .locator('[name="checkout"], a[href*="/checkout"], [data-cart-drawer-footer] a[href*="checkout"]')
      .first();
    await expect(checkoutBtn).toBeVisible();

    await Promise.all([
      page.waitForURL(CHECKOUT, { timeout: 45000 }),
      checkoutBtn.click(),
    ]);
    await expect(page).toHaveURL(CHECKOUT);
  });
});
