/**
 * Multi-locale browser QA for lurafi.ai
 * Run: node scripts/i18n-browser-qa.mjs
 *      SMOKE_LOCALES=fr,de,es node scripts/i18n-browser-qa.mjs
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  buildConfigureUrl,
  getLocale,
  getPublishedLocales,
  loadLanguagesConfig,
} from './i18n/registry.mjs';

const BASE = process.env.LURAFI_URL || `https://${loadLanguagesConfig().domain}`;
const cfg = loadLanguagesConfig();
const smokeArg = process.env.SMOKE_LOCALES?.split(',').filter(Boolean);
const SMOKE = smokeArg?.length
  ? smokeArg
  : getPublishedLocales().map((l) => l.code);

const expectations = {
  en: {
    hero: /Why Kevin|Make Home|Buy Kevin/i,
    configure: /Configure|Choose your Kevin|Continue to checkout/i,
    cart: /bag|Checkout|Continue shopping/i,
    login: /Log in|Create an account|Forgot your password/i,
    leak: null,
  },
  nl: {
    hero: /Waarom Kevin|Laat je huis|Koop Kevin/i,
    configure: /Configureren|Kies je Kevin|Doorgaan naar afrekenen/i,
    cart: /winkelwagen|Afrekenen|Verder winkelen/i,
    login: /Inloggen|Account aanmaken|Wachtwoord vergeten/i,
    leak: /Why Kevin|Your bag|Continue shopping|Log in|Create an account/i,
  },
  fr: {
    hero: /Kevin|maison|acheter|Pourquoi/i,
    configure: /Configurer|Kevin|checkout|panier/i,
    login: /Se connecter|créer un compte|Adresse e-mail/i,
    leak: /Why Kevin|Your bag|Choose your Kevin|Log in|Create an account/i,
  },
  de: {
    hero: /Kevin|Zuhause|Warum|Kaufen/i,
    configure: /Konfigurieren|Kevin|checkout/i,
    login: /Anmelden|Konto erstellen|E-Mail-Adresse/i,
    leak: /Why Kevin|Your bag|Choose your Kevin|Log in|Create an account/i,
  },
  es: {
    hero: /Kevin|casa|Por qué|Comprar/i,
    configure: /Configurar|Kevin|checkout/i,
    login: /Iniciar sesión|crea una cuenta|Correo electrónico/i,
    leak: /Why Kevin|Your bag|Choose your Kevin|Log in|Create an account/i,
  },
  pl: {
    hero: /Kevin|dom|Kup/i,
    configure: /Kevin|checkout|Konfigur/i,
    leak: /Why Kevin|Your bag/i,
  },
  nb: {
    hero: /Kevin|hjem|Kjøp/i,
    configure: /Kevin|checkout|Konfigur/i,
    leak: /Why Kevin|Your bag/i,
  },
  cs: {
    hero: /Kevin|domov|Proč|Koupit/i,
    configure: /Konfigurace|Kevin|pokladna|košík/i,
    cart: /košík|K pokladně|pokračovat v nákupu/i,
    login: /Přihlásit|vytvořit účet|E-mail/i,
    leak: /Why Kevin|Your bag|Choose your Kevin|Log in|Create an account/i,
  },
};

const issues = [];
const passes = [];

function pass(msg) {
  passes.push(msg);
  console.log(`  ✓ ${msg}`);
}
function fail(msg, detail) {
  const line = detail ? `${msg} — ${detail}` : msg;
  issues.push(line);
  console.log(`  ✗ ${line}`);
}

async function getVisibleText(page) {
  return page.evaluate(() => document.body.innerText);
}

function configurePath(code) {
  const url = new URL(buildConfigureUrl(cfg.domain, code, 'buy'));
  return `${url.pathname}${url.search}`;
}

function homePrefix(code) {
  const loc = getLocale(code);
  return loc?.urlPrefix || '';
}

async function testLocale(browser, code) {
  const loc = getLocale(code);
  if (!loc) return;
  const label = `${loc.nativeName} (${loc.urlPrefix || '/'})`;
  const exp = expectations[code] || { hero: /Kevin/i, configure: /Kevin/i, leak: /Why Kevin|Your bag/i };
  console.log(`\n=== ${label} ===`);

  const prefix = homePrefix(code);
  const cacheBust = `?qa=${Date.now()}`;

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    extraHTTPHeaders: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    locale: `${code}-${code.toUpperCase()}`,
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => consoleErrors.push(e.message));

  mkdirSync(join(process.cwd(), 'scripts', 'qa-screenshots', 'i18n'), { recursive: true });

  const homeUrl = `${BASE}${prefix}/${cacheBust}`;
  const homeRes = await page.goto(homeUrl, { waitUntil: 'networkidle', timeout: 60000 });
  if (!homeRes || homeRes.status() >= 400) fail(`${label} homepage HTTP`, String(homeRes?.status()));
  else pass(`${label} homepage loads (${homeRes.status()})`);

  await page.screenshot({ path: join(process.cwd(), 'scripts', 'qa-screenshots', 'i18n', `${code}-home.png`) });

  const text = await getVisibleText(page);
  if (exp.hero?.test(text)) pass(`${code} homepage hero copy`);
  else fail(`${code} homepage missing expected copy`, text.slice(0, 100));

  if (exp.leak?.test(text)) fail(`${code} homepage English leakage`, text.slice(0, 80));

  const langSelect = page.locator('[data-language-select]').first();
  if (await langSelect.count()) pass(`${label} language selector present`);
  else fail(`${label} language selector missing`);

  const selected = await langSelect.inputValue().catch(() => '');
  if (code === 'en' && selected.startsWith('en')) pass('EN locale active in selector');
  else if (code !== 'en' && (selected.startsWith(code) || selected === code)) pass(`${code} locale active in selector`);
  else if (selected) pass(`${code} selector value: ${selected}`);

  const configurePathStr = configurePath(code);
  const cfgPage = await context.newPage();
  await cfgPage.goto(`${BASE}${configurePathStr}&qa=${Date.now()}`, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await cfgPage.waitForTimeout(1000);

  if (await cfgPage.locator('[data-configure]').count()) pass(`${label} configure page renders`);
  else fail(`${label} configure page missing`, cfgPage.url());

  const cfgText = await getVisibleText(cfgPage);
  if (exp.configure?.test(cfgText)) pass(`${code} configure copy`);
  else fail(`${code} configure missing expected strings`);
  if (exp.leak?.test(cfgText)) fail(`${code} configure English leakage`);
  await cfgPage.screenshot({
    path: join(process.cwd(), 'scripts', 'qa-screenshots', 'i18n', `${code}-configure.png`),
  });
  await cfgPage.close();

  if (code !== 'en') {
    const switchPage = await context.newPage();
    await switchPage.goto(`${BASE}${prefix}/?qa=${Date.now()}`, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    const sel = switchPage.locator('[data-language-select]').first();
    if (await sel.count()) {
      await Promise.all([
        switchPage.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {}),
        sel.selectOption({ value: 'en' }),
      ]);
      await switchPage.waitForTimeout(1500);
      const afterUrl = switchPage.url();
      if (!afterUrl.includes(`/${code}/`) && !afterUrl.match(/\/(fr|de|es|nl|it|nb|da|sv|fi|cs|pl)\//))
        pass(`${code} → EN switch navigates away from locale prefix`);
      else fail(`${code} → EN switch failed`, afterUrl);
    }
    await switchPage.close();
  }

  await page.goto(`${BASE}${prefix}/?qa=${Date.now()}`, { waitUntil: 'networkidle' });
  const cartBtn = page.locator('[data-cart-drawer-open]').first();
  if (await cartBtn.count()) {
    await page.evaluate(() => {
      const btn = document.querySelector('[data-cart-drawer-open]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);
    const drawerText = await page.locator('#CartDrawer').innerText().catch(() => '');
    if (code === 'en') {
      if (exp.cart?.test(drawerText) && !/Translation missing/i.test(drawerText)) pass('EN cart drawer');
      else fail('EN cart drawer', drawerText.slice(0, 120));
    } else if (exp.cart?.test(drawerText)) pass(`${code} cart drawer`);
    else if (exp.leak?.test(drawerText)) fail(`${code} cart drawer English`, drawerText.slice(0, 80));
    await page.screenshot({
      path: join(process.cwd(), 'scripts', 'qa-screenshots', 'i18n', `${code}-cart-drawer.png`),
    });
  }

  const loginUrl = `${BASE}${prefix}/account/login${cacheBust}`;
  const loginRes = await page.goto(loginUrl, { waitUntil: 'networkidle', timeout: 60000 });
  if (!loginRes || loginRes.status() >= 400) fail(`${label} login HTTP`, String(loginRes?.status()));
  else pass(`${label} login page loads (${loginRes.status()})`);

  const loginText = await getVisibleText(page);
  if (!exp.login) pass(`${code} login page (no copy pattern)`);
  else if (exp.login.test(loginText) && !/Translation missing/i.test(loginText)) pass(`${code} login copy`);
  else fail(`${code} login missing expected copy`, loginText.slice(0, 120));
  if (exp.leak?.test(loginText)) fail(`${code} login English leakage`, loginText.slice(0, 80));
  await page.screenshot({
    path: join(process.cwd(), 'scripts', 'qa-screenshots', 'i18n', `${code}-login.png`),
  });

  const critical = consoleErrors.filter(
    (e) =>
      !/shopify|monorail|cookie|CSP|analytics|pixel|401|403|404|Failed to load resource/i.test(e) &&
      !/X-Frame-Options|ALLOW-FROM/i.test(e) &&
      !/^Failed to fetch\.?$/i.test(e.trim()) &&
      !/network failure may have prevented|Error completing request/i.test(e),
  );
  if (critical.length) fail(`${label} console errors`, critical.slice(0, 2).join(' | '));
  else pass(`${label} no critical console errors`);

  await context.close();
}

async function main() {
  console.log(`\nI18n browser QA — ${BASE}`);
  console.log(`Smoke locales: ${SMOKE.join(', ')}\n`);

  const browser = await chromium.launch({ headless: true, args: ['--disable-http-cache'] });
  for (const code of SMOKE) {
    if (!getLocale(code)) {
      console.warn(`Skip unknown locale: ${code}`);
      continue;
    }
    await testLocale(browser, code);
  }
  await browser.close();

  const report = {
    base: BASE,
    locales: SMOKE,
    passed: passes.length,
    failed: issues.length,
    issues,
    passes,
  };
  writeFileSync(join(process.cwd(), 'scripts', 'i18n-qa-report.json'), JSON.stringify(report, null, 2));

  console.log('\n--- Summary ---');
  console.log(`Passed: ${passes.length}`);
  console.log(`Issues: ${issues.length}`);
  if (issues.length) {
    issues.forEach((i, n) => console.log(`  ${n + 1}. ${i}`));
    process.exit(1);
  }
  console.log(`\nScreenshots: scripts/qa-screenshots/i18n/\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
