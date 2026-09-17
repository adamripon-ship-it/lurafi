// Shared helpers for the live-site e2e suites. Everything is driven by the locale registry
// (config/languages.json) and the entity model (config/entity.json): no hardcoded locale lists.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
export const registry = JSON.parse(fs.readFileSync(path.join(root, 'config/languages.json'), 'utf8'));
export const entity = JSON.parse(fs.readFileSync(path.join(root, 'config/entity.json'), 'utf8'));

export const BASE = (process.env.LURAFI_URL || `https://${registry.domain}`).replace(/\/$/, '');
export const published = registry.locales.filter((l) => l.publish !== false);
export const primary = published.find((l) => l.primary) || published[0];

/** Shopify hosted checkout or the Shop Pay hop. */
export const CHECKOUT = /\/checkouts\/|shop\.app\/checkout/;
/** Cart permalink handoff (one or more `variant:qty` pairs) that Shopify turns into a checkout. */
const CART_CHECKOUT = /\/cart\/\d+:\d+(,\d+:\d+)*(\?|$)/;

export const prefix = (loc) => loc.urlPrefix || '';
export const pageHandle = (loc, key) => loc.pages?.[key]?.handle || registry.pages[key].handle;
export const pagePath = (loc, key) => `${prefix(loc)}/pages/${pageHandle(loc, key)}`;
export const configurePath = (loc, plan = 'buy') => `${pagePath(loc, 'configure')}?plan=${plan}`;
export const productPath = (loc) => `${prefix(loc)}/products/${entity.product.handlesByLocale[loc.code]}`;
export const homePath = (loc) => prefix(loc) || '/';

/** Strip a trailing slash so `https://x/nl` and `https://x/nl/` compare equal. */
export const normalizeUrl = (u) => String(u || '').replace(/\/$/, '');

export async function waitForCheckout(page, timeoutMs = 90000) {
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

/** Shopify checkout collapses the order summary on narrow viewports; open it before reading the page text. */
export async function readCheckoutText(page) {
  const toggle = page
    .locator('button[aria-controls*="order-summary" i], button:has-text("order summary"), button:has-text("Show order")')
    .first();
  if (await toggle.isVisible().catch(() => false)) {
    const expanded = await toggle.getAttribute('aria-expanded');
    if (expanded !== 'true') await toggle.click().catch(() => {});
    await page.waitForTimeout(500);
  }
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ');
}
