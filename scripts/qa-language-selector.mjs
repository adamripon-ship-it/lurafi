/**
 * Fullstack QA for language selector on lurafi storefront.
 * Usage: LURAFI_URL=https://www.lurafi.com node scripts/qa-language-selector.mjs
 */
import { chromium, devices } from 'playwright'

const BASE = process.env.LURAFI_URL || 'https://www.lurafi.com'
const LOCALES = ['en', 'nl', 'fr', 'de', 'cs']
const PREFIX = { en: '', nl: '/nl', fr: '/fr', de: '/de', cs: '/cs' }

function withCacheBust(path = '/') {
  const hashIndex = path.indexOf('#')
  const pathPart = hashIndex === -1 ? path : path.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : path.slice(hashIndex)
  const join = pathPart.includes('?') ? '&' : '?'
  return `${BASE}${pathPart}${join}qa=${Date.now()}${hash}`
}

function fail(message) {
  console.error('FAIL:', message)
  process.exitCode = 1
}

async function pageSnapshot(page) {
  return page.evaluate(() => {
    const select = document.querySelector('[data-language-select]')
    const form = select?.closest('form')
    return {
      url: location.href,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      lang: document.documentElement.lang,
      title: document.title,
      selectorCount: document.querySelectorAll('[data-language-select]').length,
      formCount: document.querySelectorAll('form[action*="localization"]').length,
      countrySelects: document.querySelectorAll('[data-country-select]').length,
      countryCodeInputs: document.querySelectorAll('select[name="country_code"]').length,
      selectedLocale: select?.value || null,
      optionValues: select ? Array.from(select.options).map((o) => o.value) : [],
      returnTo: form?.querySelector('[data-language-return-to]')?.value || null,
      formAction: form?.getAttribute('action') || null,
      formFields: form
        ? Array.from(form.querySelectorAll('input,select')).map((el) => ({
            name: el.name,
            value: (el.value || '').slice(0, 120),
          }))
        : [],
      consoleErrors: window.__qaConsoleErrors || [],
    }
  })
}

async function switchLanguage(page, locale, selector = '#HeaderLanguageSelector') {
  const before = page.url()
  const hasSelector = await page.locator(selector).count()
  if (!hasSelector) {
    throw new Error(`Missing language selector ${selector} at ${before}`)
  }
  await page.selectOption(selector, locale)
  await Promise.race([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 25000 }),
    page.waitForTimeout(4000),
  ]).catch(() => {})
  await page.waitForTimeout(500)
  return { before, after: page.url(), ...(await pageSnapshot(page)) }
}

async function testDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()
  const matrix = []

  await page.addInitScript(() => {
    window.__qaConsoleErrors = []
    window.addEventListener('error', (e) => window.__qaConsoleErrors.push(String(e.message)))
  })

  await page.goto(withCacheBust('/#pricing'), { waitUntil: 'networkidle', timeout: 60000 })
  const home = await pageSnapshot(page)
  matrix.push({ test: 'desktop/en/#pricing render', pass: home.optionValues.length === 5 && home.countrySelects === 0, ...home })

  for (const locale of ['nl', 'fr', 'de', 'cs']) {
    const result = await switchLanguage(page, locale)
    const expectedPrefix = PREFIX[locale]
    const pass =
      (result.pathname === expectedPrefix || result.pathname === `${expectedPrefix}/`) &&
      result.formAction === '/localization' &&
      result.countrySelects === 0 &&
      result.optionValues.length === 5
    matrix.push({ test: `desktop/switch-to-${locale}`, pass, ...result })
  }

  const backEn = await switchLanguage(page, 'en')
  matrix.push({
    test: 'desktop/switch-back-en',
    pass: (backEn.pathname === '/' || backEn.pathname === '') && backEn.hash.startsWith('#pricing'),
    ...backEn,
  })

  // return_to rewrite before submit
  await page.goto(withCacheBust('/nl#pricing'), { waitUntil: 'networkidle' })
  const returnToCheck = await page.evaluate(() => {
    const form = document.querySelector('#HeaderLanguageForm')
    const select = form?.querySelector('[data-language-select]')
    const input = form?.querySelector('[data-language-return-to]')
    const before = input?.value
    select.value = 'fr'
    select.dispatchEvent(new Event('change', { bubbles: true }))
    return { before, during: input?.value, submitting: form?.dataset?.submitting }
  })
  matrix.push({
    test: 'desktop/return_to-hash-fr-from-nl',
    pass: returnToCheck.during === '/fr#pricing' || returnToCheck.during?.includes('#pricing'),
    ...returnToCheck,
  })

  await context.close()
  return matrix
}

async function testMobile(browser) {
  const context = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await context.newPage()
  const matrix = []

  await page.goto(withCacheBust('/'), { waitUntil: 'networkidle', timeout: 60000 })

  const headerHidden = await page.evaluate(() => {
    const el = document.querySelector('.site-header__lang [data-language-select]')
    if (!el) return { pass: false, reason: 'missing header select' }
    const r = el.getBoundingClientRect()
    const style = getComputedStyle(el.closest('.site-header__lang') || el)
    return {
      pass: r.width > 0 && r.height > 0 && style.display !== 'none',
      rect: { w: r.width, h: r.height },
      optionCount: el.options.length,
    }
  })
  matrix.push({ test: 'mobile/header-visible', ...headerHidden })

  await page.locator('[data-menu-open]').click()
  await page.waitForTimeout(600)

  const drawer = await page.evaluate(() => {
    const el = document.querySelector('.mobile-nav__lang [data-language-select]')
    const panelOpen = document.getElementById('MobileNav')?.getAttribute('data-open') === 'true'
    if (!el) return { pass: false, panelOpen, reason: 'missing drawer select' }
    const r = el.getBoundingClientRect()
    return {
      pass: panelOpen && r.width > 0 && r.height > 0 && el.options.length === 5,
      panelOpen,
      rect: { w: r.width, h: r.height },
      optionCount: el.options.length,
      countrySelects: document.querySelectorAll('[data-country-select]').length,
    }
  })
  matrix.push({ test: 'mobile/drawer-selector', ...drawer })

  const switchResult = await switchLanguage(page, 'de', '#MobileNavLanguageSelector')
  matrix.push({
    test: 'mobile/switch-de',
    pass: switchResult.pathname === '/de' || switchResult.pathname === '/de/',
    ...switchResult,
  })

  await context.close()
  return matrix
}

async function testConfigure(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()
  const matrix = []

  await page.goto(withCacheBust('/pages/configure?plan=buy'), { waitUntil: 'networkidle', timeout: 60000 })
  const cfg = await pageSnapshot(page)
  matrix.push({
    test: 'configure/en-present',
    pass: cfg.selectorCount >= 1 && cfg.countrySelects === 0,
    ...cfg,
  })

  const toNl = await switchLanguage(page, 'nl', '#ConfigureLanguageSelector')
  const passConfigure =
    toNl.pathname?.includes('kevin-configureren') &&
    ((toNl.search || '').includes('plan=buy') || toNl.returnTo?.includes('plan=buy'))
  matrix.push({ test: 'configure/switch-nl-keeps-plan', pass: passConfigure, ...toNl })

  await context.close()
  return matrix
}

async function main() {
  console.log('Language selector QA against', BASE)
  const browser = await chromium.launch({ headless: true })

  const results = [
    ...(await testDesktop(browser)),
    ...(await testMobile(browser)),
    ...(await testConfigure(browser)),
  ]

  await browser.close()

  let passed = 0
  let failed = 0
  for (const row of results) {
    const status = row.pass ? 'PASS' : 'FAIL'
    if (row.pass) passed++
    else failed++
    console.log(`[${status}] ${row.test}`)
    if (!row.pass) {
      console.log('  ', JSON.stringify(row, null, 2).split('\n').slice(0, 12).join('\n  '))
      fail(row.test)
    }
  }

  console.log(`\nSummary: ${passed} passed, ${failed} failed (${results.length} total)`)
  if (failed > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
