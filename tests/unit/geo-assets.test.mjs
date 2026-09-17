// Offline guards for the SEO / GEO layer: the entity model, registry, generated
// LLM and sitemap assets, structured-data snippets and the URL policy must agree.
// Run: npm run test:unit  (node --test tests/unit)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const json = (f) => JSON.parse(read(f));

const entity = json('config/entity.json');
const lang = json('config/languages.json');
const policy = json('config/url-policy.json');
const published = lang.locales.filter((l) => l.publish !== false);

test('entity model agrees with the locale registry', () => {
  assert.deepEqual(entity.locales, published.map((l) => l.code));
  assert.deepEqual(entity.organization.checkoutMarkets, lang.publishedCountries);
  for (const loc of published) {
    const expected = loc.primary ? entity.product.handle : loc.products?.[entity.product.handle]?.handle;
    assert.equal(entity.product.handlesByLocale[loc.code], expected, `product handle for ${loc.code}`);
  }
  assert.match(entity.updated, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(json('config/settings_data.json').current.product_buy, entity.product.handle, 'theme setting product_buy');
  assert.equal(json('config/settings_data.json').current.seo_last_reviewed, entity.updated, 'seo_last_reviewed matches entity.updated');
});

test('product copy pushed to Shopify carries no retired subscription messaging', () => {
  const prod = json('config/product-kevin-plus.json');
  for (const code of entity.locales) {
    const entry = prod[code];
    assert.ok(entry, `product copy for ${code}`);
    assert.doesNotMatch(entry.meta_title + entry.meta_description, /abonnement|abo\b|subscription|předplatn/i, `${code} product meta`);
    assert.match(entry.meta_title, /KEVIN/i);
    const reg = lang.locales.find((l) => l.code === code)?.products?.['kevin-plus'];
    if (reg) assert.equal(reg.meta_title, entry.meta_title, `${code} registry meta_title mirrors product config`);
  }
});

test('structured data snippets mirror the entity model', () => {
  const sd = read('snippets/structured-data.liquid');
  assert.ok(sd.includes(`"legalName": "${entity.organization.legalName}"`));
  assert.ok(sd.includes(entity.organization.registerId));
  assert.ok(sd.includes(`"foundingDate": "${entity.organization.foundingDate}"`));
  assert.ok(sd.includes(entity.organization.address.streetAddress));
  for (const url of entity.organization.sameAs) assert.ok(sd.includes(url), `sameAs ${url}`);
  const offers = read('snippets/structured-data-offers.liquid');
  const shipCsv = (file) => read(file).match(/assign lurafi_ship_countries_csv = '([^']*)'/)?.[1].split(',') || [];
  assert.deepEqual(shipCsv('snippets/structured-data-offers.liquid'), entity.organization.shippingCountries, 'offer shipping countries mirror entity');
  assert.deepEqual(shipCsv('snippets/structured-data.liquid'), entity.organization.shippingCountries, 'organization areaServed mirrors entity');
  for (const cc of entity.organization.checkoutMarkets) assert.ok(entity.organization.shippingCountries.includes(cc), `checkout market ${cc} ships`);
  assert.ok(offers.includes('"shippingDestination"') && offers.includes('"addressCountry": {{ cc | json }}'));
  assert.ok(offers.includes(`"merchantReturnDays": ${entity.product.returnDays}`));
  assert.ok(offers.includes(`"value": ${entity.product.warrantyYears}, "unitCode": "ANN"`));
  assert.ok(sd.includes('"dateModified"'), 'freshness published as dateModified');
  assert.ok(read('sections/main-editorial-page.liquid').includes('"@type": "FAQPage"'), 'editorial FAQ blocks emit FAQPage');
});

/**
 * Liquid → JSON for a JSON-LD block: keep the first branch of every if/unless/case, drop the
 * other branches, unroll loops once, render outputs as "x", then drop trailing commas.
 */
function resolveLiquid(src) {
  let t = src;
  t = t.replace(/\{%-?\s*render 'structured-data-offers'[^%]*%\}/g, '"offers": []');
  t = t.replace(/\{%-?\s*(if|unless) [^%]*?%\}\s*,\s*\{%-?\s*end(if|unless)\s*-?%\}/g, '');
  const tokens = t.split(/(\{%-?[\s\S]*?-?%\})/);
  const stack = [];
  let skipDepth = null;
  let out = '';
  for (const tok of tokens) {
    const m = tok.match(/^\{%-?\s*(\w+)/);
    if (!m) {
      if (skipDepth === null) out += tok;
      continue;
    }
    const tag = m[1];
    if (['if', 'unless', 'for', 'case'].includes(tag)) {
      stack.push({ tag, branch: 0 });
    } else if (['else', 'elsif', 'when'].includes(tag) && stack.length) {
      const top = stack[stack.length - 1];
      top.branch += 1;
      const firstWhen = tag === 'when' && top.branch === 1;
      if (!firstWhen && skipDepth === null) skipDepth = stack.length;
    } else if (['endif', 'endunless', 'endfor', 'endcase'].includes(tag)) {
      if (skipDepth === stack.length) skipDepth = null;
      stack.pop();
    }
  }
  out = out.replace(/\{\{-?[^}]*?-?\}\}/g, '"x"');
  out = out.replace(/,(\s*[}\]])/g, '$1');
  return out;
}

function liquidJsonBlocks(file) {
  const src = read(file);
  return [...src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => resolveLiquid(m[1]));
}

test('every JSON-LD block is structurally valid JSON once Liquid is resolved', () => {
  for (const file of ['snippets/structured-data.liquid', 'snippets/structured-data-product.liquid', 'sections/main-editorial-page.liquid', 'sections/lp-faq.liquid']) {
    const blocks = liquidJsonBlocks(file);
    assert.ok(blocks.length > 0, `${file} has JSON-LD`);
    for (const b of blocks) {
      let parsed;
      try { parsed = JSON.parse(b); } catch (e) { assert.fail(`${file}: ${e.message}\n${b}`); }
      assert.ok(parsed['@type'] || parsed['@graph'], `${file}: @type present`);
    }
  }
  const offers = liquidJsonBlocks('snippets/structured-data-offers.liquid');
  const inner = resolveLiquid(read('snippets/structured-data-offers.liquid'));
  const wrapped = JSON.parse(`{${inner.slice(inner.indexOf('"offers"'))}}`);
  assert.equal(wrapped.offers[0]['@type'], 'Offer');
  assert.ok(offers.length === 0, 'offers snippet is a fragment, not a script block');
});

test('generated LLM files are complete, dated and free of legacy domains', () => {
  const short = read('assets/llms.txt');
  const full = read('assets/llms-full.txt');
  for (const txt of [short, full]) {
    assert.ok(txt.includes(`Last reviewed: ${entity.updated}`), 'freshness line');
    assert.ok(txt.includes('€579.95'), 'price');
    assert.doesNotMatch(txt, /\{\{[A-Z_]+\}\}/, 'no unrendered placeholders');
    assert.doesNotMatch(txt, /lurafi\.(ai|com)/, 'no legacy domain');
    assert.ok(txt.includes(entity.organization.email));
  }
  assert.ok(full.includes('3-year Swiss warranty') && full.includes('30-day returns'));
  assert.ok(full.includes('| Specification | Value |'), 'spec table');
  for (const loc of published) {
    const shortFile = loc.primary ? 'assets/llms.txt' : `assets/llms.${loc.code}.txt`;
    const fullFile = loc.primary ? 'assets/llms-full.txt' : `assets/llms-full.${loc.code}.txt`;
    const s = read(shortFile);
    const f = read(fullFile);
    const home = `https://${lang.domain}${loc.urlPrefix || '/'}`;
    assert.ok(s.includes(home), `${shortFile} links its home ${home}`);
    assert.ok(s.includes(`/products/${entity.product.handlesByLocale[loc.code]}`), `${shortFile} links the localised product URL`);
    assert.doesNotMatch(s + f, /\{\{[A-Z_]+\}\}/, `${loc.code}: placeholders rendered`);
    assert.ok(f.includes(entity.updated), `${fullFile} dated`);
    if (!loc.primary) {
      assert.ok(fs.existsSync(path.join(root, `config/llms/full.${loc.code}.md`)), `native full template for ${loc.code}`);
      assert.ok(fs.existsSync(path.join(root, `config/llms/short.${loc.code}.md`)), `native short template for ${loc.code}`);
    }
  }
});

test('AI sitemap lists every locale route with lastmod and the full hreflang set', () => {
  const xml = read('assets/sitemap-ai.xml');
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  const opens = (xml.match(/<url>/g) || []).length;
  const closes = (xml.match(/<\/url>/g) || []).length;
  assert.equal(opens, closes, 'balanced <url> elements');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const u of locs) assert.ok(u.startsWith(`https://${lang.domain}/`) || u === `https://${lang.domain}/`, `on-domain: ${u}`);
  assert.equal(locs.length, new Set(locs).size, 'no duplicate URLs');
  for (const loc of published) {
    const prefix = loc.urlPrefix || '';
    assert.ok(locs.includes(`https://${lang.domain}${prefix || '/'}`), `home ${loc.code}`);
    assert.ok(locs.some((u) => u.startsWith(`https://${lang.domain}${prefix}/pages/${loc.pages?.configure?.handle || lang.pages.configure.handle}`)), `configure ${loc.code}`);
    assert.ok(locs.includes(`https://${lang.domain}${prefix}/products/${entity.product.handlesByLocale[loc.code]}`), `product ${loc.code}`);
    for (const code of loc.hreflang || [loc.code]) assert.ok(xml.includes(`hreflang="${code}"`), `hreflang ${code}`);
  }
  assert.ok(xml.includes('hreflang="x-default"'));
  assert.equal((xml.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length, opens, 'every URL has a lastmod');
});

test('robots.txt keeps the AI files crawlable and points at both sitemaps', () => {
  const robots = read('templates/robots.txt.liquid');
  assert.ok(robots.includes("Sitemap: https://{{ shop.domain }}/sitemap.xml"));
  assert.ok(robots.includes("Sitemap: https:{{ 'sitemap-ai.xml' | asset_url }}"));
  assert.ok(robots.includes('Allow: /cdn/shop/t/*/assets/llms.txt'));
  assert.doesNotMatch(robots, /Disallow: \/pages/);
  assert.ok(robots.includes('Disallow: /search'));
});

test('URL policy targets follow the naming rules', () => {
  const re = new RegExp(policy.rules.pattern);
  for (const [key, spec] of Object.entries(policy.products)) {
    for (const [code, handle] of Object.entries(spec.targets)) {
      assert.match(handle, re, `${key}/${code}`);
      assert.ok(handle.split('-').length <= policy.rules.maxWords, `${key}/${code} word count`);
      assert.ok(handle.startsWith(`${policy.entityToken}-`), `${key}/${code} starts with the entity token`);
      assert.ok(entity.locales.includes(code), `${key}: locale ${code} is published`);
    }
  }
  for (const loc of published) {
    for (const [pageKey, page] of Object.entries(loc.pages || lang.pages)) assert.match(page.handle, re, `${loc.code} page ${pageKey}`);
  }
});

test('hreflang route table in the theme matches the registry', () => {
  const snippet = read('snippets/seo-hreflang.liquid');
  for (const loc of published) {
    assert.ok(snippet.includes(`assign lurafi_hreflang_${loc.code} = '${(loc.hreflang || [loc.code]).join('|')}'`), `hreflang codes ${loc.code}`);
    const pages = Object.keys(lang.pages).map((k) => (loc.primary ? lang.pages[k].handle : loc.pages[k].handle)).join('|');
    assert.ok(snippet.includes(`assign lurafi_pages_${loc.code} = '${pages}'`), `page handles ${loc.code}`);
    assert.ok(snippet.includes(`assign lurafi_products_${loc.code} = '${entity.product.handlesByLocale[loc.code]}'`), `product handle ${loc.code}`);
  }
});

test('locale files carry the LLM page strings in every published language', () => {
  const en = json('locales/en.default.json');
  const keys = ['answer_first', 'offer_heading', 'offer_terms', 'offer_included', 'spec_heading', 'pages_heading', 'faq_heading', 'knowledge_heading', 'updated'];
  for (const k of keys) assert.ok(en.llms_page?.[k], `en llms_page.${k}`);
  assert.ok(en.pages?.editorial?.reviewed_on, 'en pages.editorial.reviewed_on');
  for (const loc of published.filter((l) => !l.primary)) {
    const j = json(`locales/${loc.code}.json`);
    for (const k of ['answer_first', 'offer_included', 'spec_heading', 'updated']) {
      assert.ok(j.llms_page?.[k], `${loc.code} llms_page.${k}`);
      assert.notEqual(j.llms_page[k], en.llms_page[k], `${loc.code} llms_page.${k} is translated`);
    }
    assert.ok(j.pages?.editorial?.reviewed_on && j.pages.editorial.reviewed_on !== en.pages.editorial.reviewed_on, `${loc.code} reviewed_on translated`);
  }
  assert.doesNotMatch(en.sitemap.lede, /Lurafi/, 'brand name in sitemap lede');
});
