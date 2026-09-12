// Critical-path E2E smoke test for the lurafi storefront.
// Covers: configure (buy) -> Shopify checkout, and PDP -> cart -> checkout.
//
// Run:  LURAFI_URL=https://mitipi.eu npx playwright test
// CI :  npm run test:e2e
import { test, expect } from '@playwright/test';

const BASE = (process.env.LURAFI_URL || 'https://mitipi.eu').replace(/\/$/, '');
/** Shopify hosted checkout, Shop Pay hop, or cart permalink handoff */
const CHECKOUT = /\/checkouts\/|shop\.app\/checkout/;
const CART_CHECKOUT = /\/cart\/\d+:\d+(\?checkout|$)/;

async function waitForCheckout(page, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const url = page.url();
    if (CHECKOUT.test(url)) return;
    if (CART_CHECKOUT.test(url)) {
      await page.waitForURL(CHECKOUT, { timeout: Math.max(5000, deadline - Date.now()) }).catch(() => {});
      if (CHECKOUT.test(page.url())) return;
    }
    await page.waitForTimeout(500);
  }
  throw new Error(`Checkout not reached (last URL: ${page.url()})`);
}

test.describe('Critical purchase path', () => {
  test('configure (buy) reaches Shopify checkout', async ({ page }) => {
    test.setTimeout(120000); // waitForCheckout allows 90s (Shop Pay / Cloudflare hops)
    await page.goto(`${BASE}/pages/configure?plan=buy`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('[data-configure]')).toBeVisible();
    await expect(page.locator('[data-plan="subscribe"]')).toHaveCount(0);

    const cta = page.locator('[data-configure-checkout]').first();
    await expect(cta).toBeVisible();

    await cta.click();
    await waitForCheckout(page, 90000);

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
    test.setTimeout(120000);
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
      .locator(
        '[name="checkout"], a[href="/checkout"], a[href*="/checkout"], [data-cart-drawer-footer] a[href*="checkout"], [data-buy-now]'
      )
      .first();
    if (!(await checkoutBtn.isVisible().catch(() => false))) {
      await page.goto(`${BASE}/cart`, { waitUntil: 'domcontentloaded' });
    }
    const checkoutBtnFinal = page
      .locator('[name="checkout"], a[href="/checkout"], a[href*="/checkout"]')
      .first();
    await expect(checkoutBtnFinal).toBeVisible({ timeout: 15000 });

    await Promise.all([
      checkoutBtnFinal.click(),
      waitForCheckout(page, 90000),
    ]);
    await expect(page).toHaveURL(CHECKOUT);
  });
});
