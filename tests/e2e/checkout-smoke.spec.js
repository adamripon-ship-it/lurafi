// Critical-path E2E smoke test for the lurafi storefront.
// Covers: configure (buy + subscribe) -> Shopify checkout, and PDP -> cart -> checkout.
//
// Run:  LURAFI_URL=https://lurafi.com npx playwright test
// CI :  npm run test:e2e
import { test, expect } from '@playwright/test';

const BASE = (process.env.LURAFI_URL || 'https://lurafi.com').replace(/\/$/, '');
const CHECKOUT = /\/checkouts\//;

test.describe('Critical purchase path', () => {
  // PRIMARY flow: configurator -> checkout (the main money path on this theme)
  for (const plan of ['buy', 'subscribe']) {
    test(`configure (${plan}) reaches Shopify checkout`, async ({ page }) => {
      await page.goto(`${BASE}/pages/configure?plan=${plan}`, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('[data-configure]')).toBeVisible();

      if (plan === 'subscribe') {
        const subCard = page.locator('[data-plan="subscribe"]');
        await expect(subCard).toBeEnabled(); // needs Kevin+ + selling plan assigned
        await subCard.click();
      }

      const cta = page.locator('[data-configure-checkout]').first();
      await expect(cta).toBeVisible();

      await Promise.all([
        page.waitForURL(CHECKOUT, { timeout: 45000 }),
        cta.click(),
      ]);

      await expect(page).toHaveURL(CHECKOUT);
      if (plan === 'subscribe') {
        expect(page.url()).toMatch(/selling_plan=/);
      }
      await expect(page.locator('body')).not.toContainText(/almost ready|sold out|unavailable/i);
    });
  }

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
