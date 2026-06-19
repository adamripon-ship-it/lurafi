#!/usr/bin/env node
/**
 * Seed theme section settings from config/home-en.json + locales/en.default.json.
 * Writes templates/index.json, sections/header-group.json (header settings only).
 *
 * Optional one-time bootstrap: npm run cms:seed -- --write --include-blocks
 * Default deploy keeps templates/index.json settings empty so locale fallbacks work for all languages.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const WRITE = process.argv.includes('--write');
const INCLUDE_BLOCKS = process.argv.includes('--include-blocks');

function readJson(rel) {
  let raw = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  raw = raw.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  return JSON.parse(raw);
}

function writeJson(rel, data) {
  const full = path.join(ROOT, rel);
  fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`  wrote ${rel}`);
}

const homeEn = readJson('config/home-en.json');
const enLocale = readJson('locales/en.default.json');
const index = readJson('templates/index.json');

/** Map home-en section id → flat settings keys for index.json */
function homeSectionToSettings(sectionId, data) {
  if (!data || typeof data !== 'object') return {};
  const out = {};
  for (const [key, val] of Object.entries(data)) {
    if (val == null) continue;
    if (typeof val === 'string') out[key] = val;
    else if (typeof val === 'boolean' || typeof val === 'number') out[key] = val;
  }
  return out;
}

/** Seed homepage section settings from home-en.json */
for (const [sectionId, sec] of Object.entries(index.sections)) {
  const seed = homeSectionToSettings(sectionId, homeEn[sectionId]);
  sec.settings = { ...sec.settings, ...seed };
  if (sectionId === 'app') {
    sec.settings.enable_animations = sec.settings.enable_animations ?? true;
  }
}

/** Spec row blocks from spec_row locale keys */
const specRows = [
  ['dimensions_label', 'dimensions_value'],
  ['power_label', 'power_value'],
  ['connectivity_label', 'connectivity_value'],
  ['privacy_label', 'privacy_value'],
  ['storage_label', 'storage_value'],
  ['placement_label', 'placement_value'],
];

function buildSpecBlocks() {
  const blocks = {};
  const blockOrder = [];
  const sr = enLocale.spec_row || {};
  specRows.forEach(([labelKey, valueKey], i) => {
    const id = `spec_row_${i + 1}`;
    blocks[id] = {
      type: 'spec_row',
      settings: {
        label: sr[labelKey] || '',
        value: sr[valueKey] || '',
      },
    };
    blockOrder.push(id);
  });
  return { blocks, block_order: blockOrder };
}

/** Proof quote blocks from home-en proof section */
function buildProofBlocks() {
  const p = homeEn.proof || {};
  const blocks = {};
  const blockOrder = [];
  for (let i = 1; i <= 3; i++) {
    const id = `quote_${i}`;
    blocks[id] = {
      type: 'quote',
      settings: {
        text: p[`quote_${i}`] || '',
        author_name: p[`author_${i}_name`] || '',
        author_location: p[`author_${i}_location`] || '',
      },
    };
    blockOrder.push(id);
  }
  return { blocks, block_order: blockOrder };
}

if (INCLUDE_BLOCKS) {
  const specs = buildSpecBlocks();
  index.sections.specs.blocks = specs.blocks;
  index.sections.specs.block_order = specs.block_order;

  const proof = buildProofBlocks();
  index.sections.proof.blocks = proof.blocks;
  index.sections.proof.block_order = proof.block_order;
}

/** Header group settings from locales */
const headerGroup = readJson('sections/header-group.json');
const h = enLocale.header || {};
headerGroup.sections.header.settings = {
  ...headerGroup.sections.header.settings,
  cta_label: h.buy_now || 'Buy Now',
  cta_label_mobile: h.buy || 'Buy',
};

/** Footer group settings from locales */
const footerGroup = readJson('sections/footer-group.json');
const f = enLocale.footer || {};
footerGroup.sections.footer.settings = {
  note: f.note || '',
  column_product_title: f.product || '',
  column_company_title: f.company || '',
  column_support_title: f.support || '',
  column_shop_title: f.where_to_buy || '',
  support_email: 'hello@lurafi.ai',
  press_email: 'press@lurafi.ai',
  careers_email: 'hello@lurafi.ai',
};

/** Hero sticky CTA from home hero */
index.sections.hero.settings.sticky_cta_label =
  index.sections.hero.settings.sticky_cta_label ||
  homeEn.hero?.cta_primary_label ||
  'Buy Kevin';
index.sections.hero.settings.sticky_cta_enabled = true;

/** CTA URLs */
index.sections.cta.settings.primary_cta_url = index.sections.cta.settings.primary_cta_url || '';
index.sections.cta.settings.secondary_cta_url =
  index.sections.cta.settings.secondary_cta_url || '#how-it-works';

console.log('CMS seed summary');
console.log(`  homepage sections: ${Object.keys(index.sections).length}`);
console.log(`  hero headline: ${index.sections.hero.settings.headline?.slice(0, 40)}…`);
console.log(`  pricing buy_features: ${(index.sections.pricing.settings.buy_features || '').slice(0, 50)}…`);
if (INCLUDE_BLOCKS) {
  console.log(`  specs blocks: ${index.sections.specs.block_order?.length || 0}`);
  console.log(`  proof blocks: ${index.sections.proof.block_order?.length || 0}`);
}

if (WRITE) {
  writeJson('templates/index.json', index);
  writeJson('sections/header-group.json', headerGroup);
  writeJson('sections/footer-group.json', footerGroup);
  console.log('\nDone. Review diff, then theme:push:live when ready.');
  console.log('Navigation menus: create in Admin → Navigation and assign in Header/Footer Customize.');
} else {
  console.log('\nDry run — pass --write to update files. Add --include-blocks for specs/proof blocks.');
}
