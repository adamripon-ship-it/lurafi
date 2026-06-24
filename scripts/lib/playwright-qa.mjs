/**
 * Shared Playwright QA helpers — avoid networkidle hangs and shop.app noise.
 */

/** Prefer domcontentloaded; networkidle hangs when Shop Pay / analytics keep connections open. */
export const PAGE_GOTO_WAIT = 'domcontentloaded';

/** After navigation, wait for main content instead of network idle. */
export const PAGE_READY_SELECTOR = '[data-configure], .headline-hero, .site-header, main';

export function isBenignConsoleError(message) {
  const e = String(message || '');
  return (
    /shopify|monorail|cookie|CSP|analytics|pixel|web-pixel|favicon/i.test(e) ||
    /shop\.app|Shop Pay|preloads\.js|pay\/session/i.test(e) ||
    /Access-Control-Allow-Origin|blocked by CORS policy|preflight request/i.test(e) ||
    /cache-control is not allowed by Access-Control-Allow-Headers/i.test(e) ||
    /Failed to load resource/i.test(e) ||
    /\bX-Frame-Options\b|ALLOW-FROM/i.test(e) ||
    /^Failed to fetch\.?$/i.test(e.trim()) ||
    /network failure may have prevented|Error completing request/i.test(e) ||
    /serviceWorker.*sandbox|allow-same-origin/i.test(e) ||
    /\b401\b|\b403\b|\b404\b/.test(e)
  );
}

export function filterCriticalConsoleErrors(errors) {
  return errors.filter((msg) => !isBenignConsoleError(msg));
}

/** @param {import('playwright').Page} page */
export async function gotoStorefront(page, url, options = {}) {
  const { timeout = 60000, readySelector = PAGE_READY_SELECTOR } = options;
  const res = await page.goto(url, { waitUntil: PAGE_GOTO_WAIT, timeout });
  await page.locator(readySelector).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  return res;
}
