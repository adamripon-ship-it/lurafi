import { test, expect } from '@playwright/test';

const FOOTER_PAGE_HANDLES = [
  'features',
  'how-it-works',
  'the-kevin-app',
  'pricing',
  'about-kevin',
  'press',
  'careers',
  'setup-guide',
  'contact',
];

test.describe('Footer editorial pages', () => {
  test('footer links point to dedicated /pages/* URLs, not homepage anchors', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const footer = page.locator('.site-footer-apple__grid');
    await expect(footer).toBeVisible();

    for (const handle of FOOTER_PAGE_HANDLES) {
      const link = footer.locator(`a[href*="/pages/${handle}"]`).first();
      await expect(link, `missing footer link for /pages/${handle}`).toBeVisible();
      const href = await link.getAttribute('href');
      expect(href).toMatch(new RegExp(`/pages/${handle.replace(/-/g, '\\-')}`));
      expect(href).not.toMatch(/#(problem|product|how-it-works|app|pricing)/);
    }

    await footer.locator('a[href*="/pages/features"]').first().click();
    await page.waitForURL(/\/pages\/features/);
    await expect(page.locator('.editorial-page')).toBeVisible();
    await expect(page.locator('#EditorialPageHeading')).toBeVisible();
    await expect(page.locator('#problem')).toHaveCount(0);
    await expect(page.locator('#how-it-works')).toHaveCount(0);
    await expect(page.locator('.hero-apple')).toHaveCount(0);
  });

  test('column titles use translated labels, not admin menu names', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const grid = page.locator('.site-footer-apple__grid');
    await expect(grid.locator('h4').filter({ hasText: 'Footer —' })).toHaveCount(0);
    await expect(grid.locator('h4').filter({ hasText: /^Product$/ })).toHaveCount(1);
  });
});
