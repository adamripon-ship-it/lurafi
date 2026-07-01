/**
 * Marketing view test: hero personas, homepage sections, viewports.
 * Run: LURAFI_URL=https://mitipi.eu node scripts/marketing-view-test.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { filterCriticalConsoleErrors, gotoStorefront } from './lib/playwright-qa.mjs';

const BASE = process.env.LURAFI_URL || 'https://mitipi.eu';
const outDir = join(process.cwd(), 'scripts', 'qa-screenshots', 'marketing-view');
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

const SECTIONS = [
  { id: 'problem', text: 'When your home looks empty' },
  { id: 'how-it-works', text: 'Plug' },
  { id: 'app', text: 'Protection' },
  { id: 'personas', text: 'Who Kevin' },
  { id: 'pricing', text: 'Own Kevin' },
];

async function runViewport(browser, name, width, height) {
  console.log(`\n=== ${name} (${width}×${height}) ===`);
  mkdirSync(outDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width, height },
    extraHTTPHeaders: { 'Cache-Control': 'no-cache' },
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });

  await gotoStorefront(page, `${BASE}/?viewtest=${Date.now()}`);

  const hero = page.locator('.hero-banner');
  if (!(await hero.isVisible({ timeout: 15000 }))) {
    fail('Hero banner not visible', name);
    await context.close();
    return;
  }
  pass('Static hero banner visible');

  if ((await page.locator('[data-hero-slider]').count()) > 0) {
    fail('Slider markup still present', name);
  } else {
    pass('No carousel markup');
  }

  const tag = hero.locator('.hero-banner__eyebrow');
  const headline = hero.locator('#HeroHeading');
  const tagText = (await tag.textContent()) || '';
  const headText = (await headline.textContent()) || '';
  if (!tagText.toLowerCase().includes('for every home')) {
    fail('Hero eyebrow tag', tagText);
  } else pass(`Hero tag: "${tagText.trim()}"`);
  if (!headText.toLowerCase().includes('deter burglaries')) {
    fail('Hero headline', headText.trim());
  } else pass(`Hero headline OK`);

  await page.screenshot({
    path: join(outDir, `${name.toLowerCase()}-hero-banner.png`),
    fullPage: false,
  });

  for (const sec of SECTIONS) {
    const el = page.locator(`#${sec.id}`);
    if ((await el.count()) === 0) {
      fail(`Missing #${sec.id}`, name);
      continue;
    }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const text = (await el.textContent()) || '';
    if (!text.includes(sec.text)) {
      fail(`#${sec.id} copy`, `missing "${sec.text}"`);
    } else pass(`#${sec.id} StoryBrand copy OK`);
    await page.screenshot({
      path: join(outDir, `${name.toLowerCase()}-${sec.id}.png`),
      fullPage: false,
    });
  }

  const broken = await page.evaluate(() => {
    const bad = [];
    for (const img of document.images) {
      if (img.naturalWidth === 0 && img.complete) bad.push(img.src.split('/').pop()?.slice(0, 60));
    }
    return bad;
  });
  if (broken.length) fail(`Broken images (${broken.length})`, broken.join(', '));
  else pass('All images loaded');

  const critical = filterCriticalConsoleErrors(consoleErrors);
  if (critical.length) fail('Console errors', critical.slice(0, 2).join(' | '));
  else pass('No critical console errors');

  await context.close();
}

async function expectCount(locator, n, label, viewport) {
  const count = await locator.count();
  if (count === n) pass(`${label}`);
  else fail(label, `${count} on ${viewport}`);
}

async function main() {
  console.log(`\nMarketing view test — ${BASE}\n`);
  const browser = await chromium.launch({ headless: true });

  await runViewport(browser, 'Desktop', 1440, 900);
  await runViewport(browser, 'Mobile', 390, 844);

  await browser.close();

  console.log('\n--- Summary ---');
  console.log(`Passed: ${passes.length}`);
  console.log(`Issues: ${issues.length}`);
  if (issues.length) {
    issues.forEach((i, n) => console.log(`  ${n + 1}. ${i}`));
    process.exit(1);
  }
  console.log(`\nScreenshots: ${outDir}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
