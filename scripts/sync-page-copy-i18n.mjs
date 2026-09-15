#!/usr/bin/env node
/**
 * Sync sub-page copy to Shopify for every published locale.
 *
 *  1. Page resources (gid://shopify/Page/…): title + handle translations from
 *     config/languages.json, SEO metafields (global.title_tag / description_tag)
 *     from config/footer-pages-en.json `seo`, then translated meta_title /
 *     meta_description from config/i18n/pages-<lang>.json `seo`.
 *  2. Theme content (OnlineStoreTheme <live theme id>): the editorial section
 *     settings and blocks of templates/page.<handle>.json, mapped by block index
 *     from config/i18n/pages-<lang>.json. Run AFTER the theme has been pushed,
 *     because Shopify re-keys translatable content when the EN value changes.
 *  3. URL redirects for previous localized handles (languages.json legacyHandles).
 *
 * Usage: node scripts/sync-page-copy-i18n.mjs [--theme <id>] [--dry-run] [--only features,pricing]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminGql } from './lib/shopify-admin-gql.mjs';
import { getAlternateLocales, loadLanguagesConfig } from './i18n/registry.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const STORE = (process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const themeArg = args.indexOf('--theme');
const THEME_ID = themeArg > -1 ? args[themeArg + 1] : JSON.parse(fs.readFileSync(path.join(root, 'config/live-theme.json'), 'utf8')).theme_id;
const onlyArg = args.indexOf('--only');
const ONLY = onlyArg > -1 ? args[onlyArg + 1].split(',') : null;
const THEME_ONLY = args.includes('--theme-only'); // skip page handles/metafields/redirects (global writes)

const en = JSON.parse(fs.readFileSync(path.join(root, 'config/footer-pages-en.json'), 'utf8'));
const langCfg = loadLanguagesConfig();
const locales = getAlternateLocales();
const i18n = Object.fromEntries(locales.map((l) => [l.code, JSON.parse(fs.readFileSync(path.join(root, `config/i18n/pages-${l.code}.json`), 'utf8'))]));

const gql = (query, variables, mutate = false) => adminGql({ store: STORE, query, variables, mutate });

async function translatable(id) {
  const r = await gql(`query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest value } } }`, { id });
  return r.translatableResource?.translatableContent || [];
}
async function register(id, locale, entries, label) {
  const t = entries.filter((e) => e.value != null && e.value !== '' && e.digest);
  if (!t.length) return 0;
  if (DRY) { console.log(`  [dry] ${label} ${locale}: ${t.length} keys`); return t.length; }
  for (let i = 0; i < t.length; i += 100) {
    const r = await gql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { message field } } }`,
      { id, t: t.slice(i, i + 100).map(({ locale: l, key, value, digest }) => ({ locale: l, key, value, translatableContentDigest: digest })) }, true);
    const errs = r.translationsRegister.userErrors;
    if (errs.length) throw new Error(`${label} ${locale}: ${JSON.stringify(errs)}`);
  }
  console.log(`  ✓ ${label} ${locale}: ${t.length} keys`);
  return t.length;
}

// Map i18n block (by index) to the theme setting names used in the template.
function blockValues(enBlock, trBlock) {
  const out = {};
  if (!trBlock) return out;
  const copy = (k, v) => { if (v != null && v !== '') out[k] = v; };
  switch (enBlock.type) {
    case 'stat_row': (trBlock.stats || []).forEach(([v, l], i) => { copy(`stat_${i + 1}_value`, v); copy(`stat_${i + 1}_label`, l); }); break;
    case 'contact_row': (trBlock.contacts || []).forEach(([l, v], i) => { copy(`contact_${i + 1}_label`, l); copy(`contact_${i + 1}_value`, v); }); break;
    case 'faq': copy('question', trBlock.question); copy('answer', trBlock.answer ? (trBlock.answer.includes('<') ? trBlock.answer : `<p>${trBlock.answer.replace(/\n\n/g, '</p><p>')}</p>`) : null); break;
    case 'richtext': copy('title', trBlock.title); copy('body', trBlock.body ? (trBlock.body.includes('<') ? trBlock.body : `<p>${trBlock.body.replace(/\n\n/g, '</p><p>')}</p>`) : null); break;
    default: for (const k of ['overline', 'heading', 'body', 'title', 'image_alt', 'quote', 'source', 'number']) copy(k, trBlock[k]);
  }
  return out;
}

async function main() {
  const { pages } = await gql(`query { pages(first: 100) { nodes { id handle title } } }`);
  const byHandle = Object.fromEntries(pages.nodes.map((p) => [p.handle, p]));
  const themeId = `gid://shopify/OnlineStoreTheme/${THEME_ID}`;
  const themeContent = await translatable(themeId);
  console.log(`Theme ${THEME_ID}: ${themeContent.length} translatable keys`);

  for (const [key, page] of Object.entries(en)) {
    if (ONLY && !ONLY.includes(key)) continue;
    const handle = page.handle || key;
    const node = byHandle[handle];
    if (!node) { console.warn(`! page ${handle} not found in Shopify`); continue; }
    console.log(`\n# ${handle} (${node.id})`);

    // 1a. SEO metafields (EN)
    if (page.seo && !DRY && !THEME_ONLY) {
      const r = await gql(`mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { message field } } }`, { m: [
        { ownerId: node.id, namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: page.seo.title },
        { ownerId: node.id, namespace: 'global', key: 'description_tag', type: 'single_line_text_field', value: page.seo.description },
      ] }, true);
      if (r.metafieldsSet.userErrors.length) throw new Error(JSON.stringify(r.metafieldsSet.userErrors));
      console.log('  ✓ EN meta title/description');
    }
    // 1b. Page translations: title, handle, meta_title, meta_description
    if (!THEME_ONLY) {
    const pageContent = await translatable(node.id);
    const digest = Object.fromEntries(pageContent.map((c) => [c.key, c.digest]));
    for (const loc of locales) {
      const tr = i18n[loc.code][key] || {};
      const pageCfg = loc.pages?.[key] || {};
      await register(node.id, loc.shopifyLocale || loc.code, [
        { locale: loc.shopifyLocale || loc.code, key: 'title', value: pageCfg.title, digest: digest.title },
        { locale: loc.shopifyLocale || loc.code, key: 'handle', value: pageCfg.handle === handle ? null : pageCfg.handle, digest: digest.handle }, // Shopify rejects a translated handle equal to the default
        { locale: loc.shopifyLocale || loc.code, key: 'meta_title', value: tr.seo?.title, digest: digest.meta_title },
        { locale: loc.shopifyLocale || loc.code, key: 'meta_description', value: tr.seo?.description, digest: digest.meta_description },
      ], 'page');
    }
    }

    // 2. Theme content for this page's editorial section
    const prefix = `section.page.${handle}.json.editorial.`;
    const keys = themeContent.filter((c) => c.key.startsWith(prefix));
    if (!keys.length) { console.warn(`  ! no theme keys for ${prefix} — push the theme first`); continue; }
    for (const loc of locales) {
      const tr = i18n[loc.code][key];
      if (!tr) continue;
      const values = { overline: tr.overline, heading: tr.heading, lede: tr.lede, image_alt: tr.image_alt, cta_heading: tr.cta_heading, cta_subheading: tr.cta_subheading, cta_primary: tr.cta_primary, cta_secondary: tr.cta_secondary };
      (page.blocks || []).forEach((b, i) => { for (const [k, v] of Object.entries(blockValues(b, tr.blocks?.[i]))) values[`block_${i + 1}.${k}`] = v; });
      const entries = keys.map((c) => {
        const setting = c.key.slice(prefix.length).replace(/:[^:]+$/, '');
        return { locale: loc.shopifyLocale || loc.code, key: c.key, value: values[setting], digest: c.digest };
      });
      const missing = keys.filter((c) => values[c.key.slice(prefix.length).replace(/:[^:]+$/, '')] == null).map((c) => c.key.slice(prefix.length));
      if (missing.length) console.log(`  · ${loc.code} untranslated (kept EN): ${missing.join(', ')}`);
      await register(themeId, loc.shopifyLocale || loc.code, entries, 'theme');
    }
  }

  if (THEME_ONLY) { console.log('\n--theme-only: skipped page handles, metafields and redirects.'); return; }

  // 2b. Pages without editorial copy (configure, sitemap, llms): title + handle only
  for (const pageKey of Object.keys(langCfg.pages)) {
    if (en[pageKey]) continue;
    if (ONLY && !ONLY.includes(pageKey)) continue;
    const node = byHandle[langCfg.pages[pageKey].handle];
    if (!node) continue;
    console.log(`\n# ${node.handle} (${node.id}) title/handle only`);
    const digest = Object.fromEntries((await translatable(node.id)).map((c) => [c.key, c.digest]));
    for (const loc of locales) {
      const pageCfg = loc.pages?.[pageKey] || {};
      const lc = loc.shopifyLocale || loc.code;
      await register(node.id, lc, [
        { locale: lc, key: 'title', value: pageCfg.title, digest: digest.title },
        { locale: lc, key: 'handle', value: pageCfg.handle === node.handle ? null : pageCfg.handle, digest: digest.handle },
      ], 'page');
    }
  }

  // 3. Redirects for previous localized handles
  const legacy = langCfg.legacyHandles || {};
  const { urlRedirects } = await gql(`query { urlRedirects(first: 250) { nodes { path target } } }`);
  const existing = new Set(urlRedirects.nodes.map((r) => r.path));
  for (const [code, map] of Object.entries(legacy)) {
    const loc = langCfg.locales.find((l) => l.code === code);
    for (const [pageKey, oldHandle] of Object.entries(map)) {
      const newHandle = loc.pages?.[pageKey]?.handle;
      if (!newHandle || newHandle === oldHandle) continue;
      const from = `${loc.urlPrefix}/pages/${oldHandle}`;
      const to = `${loc.urlPrefix}/pages/${newHandle}`;
      if (existing.has(from)) continue;
      if (DRY) { console.log(`  [dry] redirect ${from} → ${to}`); continue; }
      const r = await gql(`mutation($r: UrlRedirectInput!) { urlRedirectCreate(urlRedirect: $r) { userErrors { message field } } }`, { r: { path: from, target: to } }, true);
      if (r.urlRedirectCreate.userErrors.length) console.warn('  ! redirect', from, JSON.stringify(r.urlRedirectCreate.userErrors)); else console.log(`  ✓ redirect ${from} → ${to}`);
    }
  }
  console.log('\nDone.');
}
main().catch((e) => { console.error(e); process.exit(1); });
