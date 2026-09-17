// SEO / GEO smoke test on the live storefront (LURAFI_URL, default https://mitipi.eu).
// For every published locale the home, configure, product, pricing and LLM pages must answer 200 with the
// right <html lang>, a query-free canonical, the full region-coded hreflang cluster (+ x-default), meta
// description, Open Graph tags and a valid JSON-LD graph (Organization, WebSite, Product with offers,
// BreadcrumbList, FAQPage where FAQ blocks exist). robots.txt, sitemap.xml, sitemap-ai.xml and the
// llms*.txt files must resolve and be dated. Everything is driven by config/languages.json + config/entity.json.
// Passes only once this theme version is live: structured data and the AI files are served by the theme.
// Run:  LURAFI_URL=https://mitipi.eu npx playwright test tests/e2e/seo-smoke.spec.js --project=chromium
import { test, expect } from '@playwright/test';
import { BASE, entity, homePath, normalizeUrl, pagePath, productPath, published } from './lib/site.js';

async function readHead(page) {
  return page.evaluate(() => {
    const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || '';
    const prop = (p) => document.querySelector(`meta[property="${p}"]`)?.getAttribute('content') || '';
    const ld = [];
    for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        ld.push(JSON.parse(s.textContent));
      } catch (e) {
        ld.push({ __invalid: `${e.message}: ${s.textContent.slice(0, 160)}` });
      }
    }
    return {
      lang: document.documentElement.getAttribute('lang') || '',
      title: document.title,
      description: meta('description'),
      robots: meta('robots'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
      hreflang: Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map((l) => ({
        code: l.getAttribute('hreflang'),
        href: l.getAttribute('href'),
      })),
      og: {
        title: prop('og:title'),
        description: prop('og:description'),
        image: prop('og:image'),
        url: prop('og:url'),
        locale: prop('og:locale'),
      },
      ld,
    };
  });
}

/** Flatten JSON-LD documents (including @graph) into typed nodes. */
function nodesOf(ld) {
  const out = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(walk);
    if (node['@type']) out.push(node);
    if (node['@graph']) walk(node['@graph']);
  };
  walk(ld);
  return out;
}
const ofType = (nodes, type) =>
  nodes.filter((n) => (Array.isArray(n['@type']) ? n['@type'] : [n['@type']]).includes(type));

for (const loc of published) {
  const pages = [
    { key: 'home', path: homePath(loc), types: ['Organization', 'WebSite', 'Product', 'WebPage'] },
    { key: 'configure', path: pagePath(loc, 'configure'), types: ['WebPage', 'BreadcrumbList'] },
    { key: 'product', path: productPath(loc), types: ['Product', 'BreadcrumbList'] },
    { key: 'pricing', path: pagePath(loc, 'pricing'), types: ['WebPage', 'BreadcrumbList', 'FAQPage'] },
    { key: 'llms', path: pagePath(loc, 'llms'), types: [] },
  ];

  test.describe(`SEO ${loc.code}`, () => {
    for (const p of pages) {
      test(`${p.key}: ${p.path}`, async ({ page }) => {
        const res = await page.goto(`${BASE}${p.path}`, { waitUntil: 'domcontentloaded' });
        expect(res?.status(), 'status').toBe(200);
        const head = await readHead(page);
        expect(head.lang.toLowerCase(), 'html lang').toMatch(new RegExp(`^${loc.code}`));

        if (p.key === 'llms') {
          // Plain-text page (layout none): answer-first block, freshness date, localized AI file links.
          const text = await page.locator('body').innerText();
          expect(text).toMatch(/KEVIN/);
          expect(text, 'freshness date on the LLM page').toContain(entity.updated);
          expect(text).toMatch(/llms-full\.txt/);
          expect(text).not.toMatch(/ranslation missing/);
          return;
        }

        expect(head.title.length, 'title').toBeGreaterThan(10);
        expect(head.description.length, 'meta description').toBeGreaterThan(50);
        expect(head.description.length, 'meta description length').toBeLessThan(320);
        expect(head.robots, 'indexable').not.toMatch(/noindex/i);

        expect(head.canonical.startsWith(`${BASE}${loc.urlPrefix || ''}`), `canonical on locale: ${head.canonical}`).toBe(true);
        expect(head.canonical, 'canonical has no query string').not.toMatch(/\?/);

        const codes = new Set(head.hreflang.map((x) => x.code));
        for (const other of published) {
          for (const code of other.hreflang || [other.code]) expect(codes.has(code), `hreflang ${code}`).toBe(true);
        }
        expect(codes.has('x-default'), 'x-default alternate').toBe(true);
        for (const alt of head.hreflang) {
          expect(alt.href.startsWith(BASE), `alternate on this domain: ${alt.href}`).toBe(true);
        }
        const self = head.hreflang.find((x) => x.code === loc.code);
        expect(normalizeUrl(self?.href), 'self alternate equals canonical').toBe(normalizeUrl(head.canonical));

        expect(head.og.title, 'og:title').not.toBe('');
        expect(head.og.description, 'og:description').not.toBe('');
        expect(head.og.image, 'og:image absolute https').toMatch(/^https:\/\//);
        expect(head.og.locale, 'og:locale').toBe(loc.ogLocale);
        expect(normalizeUrl(head.og.url), 'og:url equals canonical').toBe(normalizeUrl(head.canonical));

        const invalid = head.ld.filter((x) => x.__invalid).map((x) => x.__invalid);
        expect(invalid, 'JSON-LD parses').toEqual([]);
        const nodes = nodesOf(head.ld);
        for (const type of p.types) expect(ofType(nodes, type).length, `JSON-LD ${type}`).toBeGreaterThan(0);

        if (p.key === 'home') {
          const org = ofType(nodes, 'Organization')[0];
          expect(org.legalName).toBe(entity.organization.legalName);
          expect(org.sameAs).toEqual(expect.arrayContaining(entity.organization.sameAs));
          const webPage = ofType(nodes, 'WebPage')[0];
          expect(webPage.dateModified, 'freshness as dateModified').toBe(entity.updated);
        }
        if (p.key === 'home' || p.key === 'product') {
          const product = ofType(nodes, 'Product')[0];
          const offers = Array.isArray(product.offers) ? product.offers : [product.offers].filter(Boolean);
          expect(offers.length, 'Product has offers').toBeGreaterThan(0);
          expect(Number(offers[0].price), 'offer price').toBeGreaterThan(0);
          expect(offers[0].priceCurrency, 'offer currency').toMatch(/^[A-Z]{3}$/);
          expect(offers[0].availability, 'offer availability').toMatch(/schema\.org\//);
        }
        if (p.key === 'pricing') {
          const faq = ofType(nodes, 'FAQPage')[0];
          expect(faq.mainEntity?.length, 'FAQPage questions').toBeGreaterThan(0);
        }
      });
    }
  });
}

test.describe('Discovery files', () => {
  test('robots.txt lists both sitemaps and keeps the AI files crawlable', async ({ request }) => {
    const res = await request.get(`${BASE}/robots.txt`);
    expect(res.status()).toBe(200);
    const txt = await res.text();
    expect(txt).toContain(`Sitemap: ${BASE}/sitemap.xml`);
    expect(txt).toMatch(/Sitemap: https:\/\/[^\n]*sitemap-ai\.xml/);
    expect(txt).toContain('Allow: /cdn/shop/t/*/assets/llms.txt');
    expect(txt).not.toMatch(/Disallow: \/pages/);
  });

  test('sitemap.xml is the Shopify sitemap index with products and pages', async ({ request }) => {
    const res = await request.get(`${BASE}/sitemap.xml`);
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('<sitemapindex');
    expect(xml).toMatch(/sitemap_products_1\.xml/);
    expect(xml).toMatch(/sitemap_pages_1\.xml/);
  });

  test('llms.txt, llms-full.txt, per-locale files and sitemap-ai.xml resolve from the theme CDN', async ({ page, request }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll('link[rel="alternate"][type="text/plain"]')).map((l) => l.href),
    );
    const short = links.find((u) => /\/llms\.txt/.test(u));
    expect(short, 'llms.txt linked from <head>').toBeTruthy();
    expect(links.find((u) => /\/llms-full\.txt/.test(u)), 'llms-full.txt linked from <head>').toBeTruthy();

    const assetBase = short.replace(/llms\.txt.*$/, '');
    const files = [
      'llms.txt',
      'llms-full.txt',
      'sitemap-ai.xml',
      ...published.filter((l) => !l.primary && l.llmAssets !== false).flatMap((l) => [`llms.${l.code}.txt`, `llms-full.${l.code}.txt`]),
    ];
    for (const file of files) {
      const res = await request.get(`${assetBase}${file}`);
      expect(res.status(), file).toBe(200);
      const body = await res.text();
      if (file.endsWith('.txt')) {
        expect(body, `${file} names the product`).toMatch(/KEVIN/);
        expect(body, `${file} carries the review date`).toContain(entity.updated);
        expect(body, `${file} has no unrendered placeholders`).not.toMatch(/\{\{[A-Z_]+\}\}/);
        expect(body, `${file} has no legacy domain`).not.toMatch(/lurafi\.(ai|com)/);
      } else {
        expect(body).toContain('<urlset');
        expect(body).toContain('hreflang="x-default"');
        expect(body).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
      }
    }
  });
});
