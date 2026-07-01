#!/usr/bin/env node
/**
 * Generate templates/page.{handle}.json from config/footer-pages-en.json
 * Usage: node scripts/build-footer-page-templates.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = JSON.parse(fs.readFileSync(path.join(root, 'config/footer-pages-en.json'), 'utf8'));

function toRichtext(text) {
  if (!text) return '';
  if (text.includes('<')) return text;
  return `<p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
}

function blockToShopify(block, index) {
  const id = `block_${index + 1}`;
  switch (block.type) {
    case 'richtext':
      return {
        id,
        type: 'richtext',
        settings: { title: block.title || '', body: toRichtext(block.body || '') },
      };
    case 'pillar':
      return {
        id,
        type: 'pillar',
        settings: { icon: block.icon || '', title: block.title || '', body: block.body || '' },
      };
    case 'step':
      return {
        id,
        type: 'step',
        settings: { number: block.number || String(index + 1), title: block.title || '', body: block.body || '' },
      };
    case 'quote':
      return {
        id,
        type: 'quote',
        settings: { quote: block.quote || '', source: block.source || '' },
      };
    case 'stat_row': {
      const settings = {};
      (block.stats || []).slice(0, 3).forEach((stat, i) => {
        settings[`stat_${i + 1}_value`] = stat.value || '';
        settings[`stat_${i + 1}_label`] = stat.label || '';
      });
      return { id, type: 'stat_row', settings };
    }
    case 'contact_row': {
      const settings = {};
      (block.contacts || []).slice(0, 4).forEach((contact, i) => {
        settings[`contact_${i + 1}_label`] = contact.label || '';
        settings[`contact_${i + 1}_value`] = contact.value || '';
        settings[`contact_${i + 1}_link`] = contact.link || '';
      });
      return { id, type: 'contact_row', settings };
    }
    case 'section_intro':
      return {
        id,
        type: 'section_intro',
        settings: {
          overline: block.overline || '',
          heading: block.heading || '',
          body: block.body || '',
          variant: block.variant || 'default',
        },
      };
    case 'media_split':
      return {
        id,
        type: 'media_split',
        settings: {
          image_asset: block.image_asset || '',
          image_alt: block.image_alt || '',
          title: block.title || '',
          body: block.body || '',
          reverse: Boolean(block.reverse),
        },
      };
    case 'image_pillar':
      return {
        id,
        type: 'image_pillar',
        settings: {
          image_asset: block.image_asset || '',
          image_alt: block.image_alt || '',
          title: block.title || '',
          body: block.body || '',
        },
      };
    case 'faq':
      return {
        id,
        type: 'faq',
        settings: {
          question: block.question || '',
          answer: toRichtext(block.answer || ''),
        },
      };
    default:
      return null;
  }
}

for (const [key, page] of Object.entries(pages)) {
  const blocks = {};
  const blockOrder = [];
  (page.blocks || []).forEach((block, index) => {
    const converted = blockToShopify(block, index);
    if (!converted) return;
    blocks[converted.id] = { type: converted.type, settings: converted.settings };
    blockOrder.push(converted.id);
  });

  const template = {
    sections: {
      editorial: {
        type: 'main-editorial-page',
        settings: {
          overline: page.overline || '',
          heading: page.heading || page.title || '',
          lede: page.lede || '',
          theme: page.theme || 'white',
          image_asset: page.image_asset || '',
          image_alt: page.image_alt || '',
          cta_heading: page.cta_heading || '',
          cta_subheading: page.cta_subheading || '',
          cta_primary: page.cta_primary || '',
          cta_primary_url: page.cta_primary_url || '',
          cta_secondary: page.cta_secondary || '',
          cta_secondary_url: page.cta_secondary_url || '',
        },
        blocks,
        block_order: blockOrder,
      },
    },
    order: ['editorial'],
  };

  const handle = page.handle || key;
  const outPath = path.join(root, 'templates', `page.${handle}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(template, null, 2)}\n`);
  console.log(`✓ templates/page.${handle}.json`);
}

console.log(`\nWrote ${Object.keys(pages).length} editorial page templates`);
