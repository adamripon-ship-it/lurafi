/**
 * Commerce QA: mobile menu, cart drawer, configure language selector.
 * Logs to debug session 11faae via ingest endpoint.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = process.env.LURAFI_URL || 'https://mitipi.eu';
const LOG_PATH = '/Users/adam/lurafi/.cursor/debug-11faae.log';
const ENDPOINT = 'http://127.0.0.1:7263/ingest/dae70615-580c-448e-a7ca-4c14c98c300c';
const SESSION = '11faae';

function log(hypothesisId, location, message, data, runId = 'qa-pre') {
  const entry = {
    sessionId: SESSION,
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
    runId,
  };
  const line = JSON.stringify(entry) + '\n';
  writeFileSync(LOG_PATH, line, { flag: 'a' });
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': SESSION },
    body: JSON.stringify(entry),
  }).catch(() => {});
}

async function probe(page, hypothesisId, location, message, data) {
  log(hypothesisId, location, message, data);
}

async function mobileSuite(browser) {
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();

  await page.goto(`${BASE}/?qa=${Date.now()}`, { waitUntil: 'networkidle', timeout: 60000 });

  const headerLang = await page.evaluate(() => {
    const el = document.querySelector('.site-header__lang [data-language-select]');
    if (!el) return { present: false };
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el.closest('.site-header__lang') || el);
    return {
      present: true,
      visible: r.width > 0 && r.height > 0 && style.display !== 'none',
      rect: { w: r.width, h: r.height, top: r.top },
      optionCount: el.options?.length || 0,
    };
  });
  await probe(page, 'A', 'mobile:header-lang', 'header language selector', headerLang);

  const mobileCountryCheck = await page.evaluate(() => ({
    countrySelects: document.querySelectorAll('[data-country-select]').length,
    countryCodeInputs: document.querySelectorAll('select[name="country_code"]').length,
  }));
  if (mobileCountryCheck.countrySelects > 0 || mobileCountryCheck.countryCodeInputs > 0) {
    throw new Error('Country selector markup detected in mobile header');
  }

  const menuBtn = page.locator('[data-menu-open]');
  await menuBtn.click();
  await page.waitForTimeout(500);

  const drawerLang = await page.evaluate(() => {
    const panel = document.getElementById('MobileNavPanel');
    const el = document.querySelector('.mobile-nav__lang [data-language-select]');
    const panelOpen = document.getElementById('MobileNav')?.getAttribute('data-open') === 'true';
    if (!el) return { present: false, panelOpen };
    const r = el.getBoundingClientRect();
    const langBlock = document.querySelector('.mobile-nav__lang');
    const blockStyle = langBlock ? getComputedStyle(langBlock) : null;
    return {
      present: true,
      panelOpen,
      blockDisplay: blockStyle?.display,
      visible: r.width > 0 && r.height > 0,
      rect: { w: r.width, h: r.height },
      optionCount: el.options?.length || 0,
    };
  });
  await probe(page, 'B', 'mobile:drawer-lang', 'drawer language selector', drawerLang);

  await page.locator('.mobile-nav [data-cart-drawer-open]').click();
  await page.waitForTimeout(400);
  const cartFromDrawer = await page.evaluate(() => ({
    hidden: document.getElementById('CartDrawer')?.hidden,
    bodyClass: document.body.classList.contains('cart-drawer-open'),
  }));
  await probe(page, 'D', 'mobile:cart-from-drawer', 'cart from drawer link', cartFromDrawer);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.locator('.site-header [data-cart-drawer-open]').first().click();
  await page.waitForTimeout(600);
  const cartDrawer = await page.evaluate(() => {
    const d = document.getElementById('CartDrawer');
    return {
      hidden: d?.hidden,
      ariaHidden: d?.getAttribute('aria-hidden'),
      hasPanel: !!d?.querySelector('[data-cart-drawer-panel]'),
      bodyClass: document.body.classList.contains('cart-drawer-open'),
    };
  });
  await probe(page, 'D', 'mobile:cart-drawer', 'cart drawer state', cartDrawer);

  await context.close();
}

async function configureSuite(browser) {
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();
  const url = `${BASE}/pages/configure?plan=buy&qa=${Date.now()}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);

  await page.waitForTimeout(300);
  const cfgLang = await page.evaluate(() => {
    const el = document.querySelector('.configure-nav__tools [data-language-select]');
    const tools = document.querySelector('.configure-nav__tools');
    if (!el) return { present: false, toolsHtml: tools?.innerHTML?.slice(0, 80) };
    const r = el.getBoundingClientRect();
    const toolsStyle = tools ? getComputedStyle(tools) : null;
    return {
      present: true,
      visible: r.width > 0 && r.height > 0 && toolsStyle?.display !== 'none',
      rect: { w: r.width, h: r.height },
      optionCount: el.options?.length || 0,
      returnTo: document.querySelector('#ConfigureLanguageForm [data-language-return-to]')?.value,
      url: location.pathname + location.search,
      hasPlanInReturnTo: (document.querySelector('#ConfigureLanguageForm [data-language-return-to]')?.value || '').includes('plan='),
    };
  });
  await probe(page, 'C', 'configure:lang', 'configure language selector', cfgLang);

  const localizationFields = await page.evaluate(() => ({
    localizationForms: document.querySelectorAll('form[action*="localization"]').length,
    languageSelects: document.querySelectorAll('[data-language-select]').length,
    countrySelects: document.querySelectorAll('[data-country-select]').length,
    badFormActions: Array.from(document.querySelectorAll('form[action*="localization"]'))
      .map((form) => form.getAttribute('action'))
      .filter((action) => action && action !== '/localization'),
  }));
  await probe(page, 'F', 'configure:localization', 'language controls only', localizationFields);

  if (localizationFields.countrySelects > 0) {
    throw new Error(
      `Country selector must not exist (found ${localizationFields.countrySelects} [data-country-select])`,
    );
  }
  if (localizationFields.badFormActions.length > 0) {
    throw new Error(
      `Localization form action must be /localization (found: ${localizationFields.badFormActions.join(', ')})`,
    );
  }

  const headerCountryCheck = await page.evaluate(() => ({
    countrySelects: document.querySelectorAll('[data-country-select]').length,
    countryCodeInputs: document.querySelectorAll('select[name="country_code"]').length,
  }));
  await probe(page, 'F', 'home:localization', 'no country selector on home', headerCountryCheck);
  if (headerCountryCheck.countrySelects > 0 || headerCountryCheck.countryCodeInputs > 0) {
    throw new Error('Country selector markup detected on homepage');
  }

  const checkout = page.locator('[data-configure-checkout]');
  await probe(page, 'E', 'configure:checkout', 'checkout CTA', {
    count: await checkout.count(),
    visible: await checkout.isVisible().catch(() => false),
  });

  await context.close();
}

async function main() {
  writeFileSync(LOG_PATH, '');
  const browser = await chromium.launch({ headless: true });
  await mobileSuite(browser);
  await configureSuite(browser);
  await browser.close();
  console.log('QA commerce debug complete. Log:', LOG_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
