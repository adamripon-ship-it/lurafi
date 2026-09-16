#!/usr/bin/env node
/**
 * Replace the kevin-plus product media with the gallery defined in
 * config/product-media-kevin-plus.json, then register alt-text translations
 * (MediaImage `alt` is translatable) so the configure gallery is localised.
 * Usage: node scripts/setup-device-media.mjs [--keep-existing]
 * Needs write_products + write_files.
 */
import { readFileSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminGql } from './lib/shopify-admin-gql.mjs';
import { getAlternateLocales } from './i18n/registry.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STORE = process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com';
const cfg = JSON.parse(readFileSync(join(ROOT, 'config/product-media-kevin-plus.json'), 'utf8'));
const KEEP = process.argv.includes('--keep-existing');
const gql = (query, variables, mutate = false) => adminGql({ store: STORE, query, variables, mutate });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { productByHandle: product } = await gql(`query($h: String!) { productByHandle(handle: $h) { id media(first: 50) { nodes { id alt } } } }`, { h: cfg.handle });
if (!product) throw new Error(`product ${cfg.handle} not found`);

if (!KEEP && product.media.nodes.length) {
  const r = await gql(`mutation($id: ID!, $m: [ID!]!) { productDeleteMedia(productId: $id, mediaIds: $m) { deletedMediaIds mediaUserErrors { message } } }`, { id: product.id, m: product.media.nodes.map((n) => n.id) }, true);
  if (r.productDeleteMedia.mediaUserErrors.length) throw new Error(JSON.stringify(r.productDeleteMedia.mediaUserErrors));
  console.log(`− removed ${r.productDeleteMedia.deletedMediaIds.length} existing media`);
}

const { stagedUploadsCreate } = await gql(`mutation($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } } }`,
  { input: cfg.media.map((m) => ({ filename: basename(m.file), mimeType: 'image/webp', httpMethod: 'POST', resource: 'IMAGE', fileSize: String(statSync(join(ROOT, m.file)).size) })) }, true);
if (stagedUploadsCreate.userErrors.length) throw new Error(JSON.stringify(stagedUploadsCreate.userErrors));
const media = [];
for (let n = 0; n < cfg.media.length; n++) {
  const t = stagedUploadsCreate.stagedTargets[n];
  const form = new FormData();
  for (const p of t.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([readFileSync(join(ROOT, cfg.media[n].file))]), basename(cfg.media[n].file));
  const res = await fetch(t.url, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`upload ${cfg.media[n].file} failed: HTTP ${res.status}`);
  media.push({ originalSource: t.resourceUrl, mediaContentType: 'IMAGE', alt: cfg.media[n].alt.en });
  console.log(`  ↑ ${cfg.media[n].file}`);
}
const { productCreateMedia } = await gql(`mutation($id: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $id, media: $media) { media { id alt status } mediaUserErrors { field message } } }`, { id: product.id, media }, true);
if (productCreateMedia.mediaUserErrors.length) throw new Error(JSON.stringify(productCreateMedia.mediaUserErrors));
console.log(`+ created ${productCreateMedia.media.length} media`);

// Wait until processed, then translate alt per locale.
let nodes = [];
for (let i = 0; i < 20; i++) {
  await sleep(3000);
  ({ productByHandle: { media: { nodes } } } = await gql(`query($h: String!) { productByHandle(handle: $h) { media(first: 50) { nodes { id alt status } } } }`, { h: cfg.handle }));
  if (nodes.every((n) => n.status === 'READY')) break;
}
console.log(`media status: ${nodes.map((n) => n.status).join(',')}`);
const locales = getAlternateLocales();
for (const m of cfg.media) {
  const node = nodes.find((n) => n.alt === m.alt.en); if (!node) { console.warn(`! no media for "${m.alt.en}"`); continue; }
  const { translatableResource } = await gql(`query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest } } }`, { id: node.id });
  const digest = translatableResource?.translatableContent.find((c) => c.key === 'alt')?.digest;
  if (!digest) { console.warn(`! alt not translatable on ${node.id}`); continue; }
  const t = locales.filter((l) => m.alt[l.code]).map((l) => ({ locale: l.shopifyLocale || l.code, key: 'alt', value: m.alt[l.code], translatableContentDigest: digest }));
  const r = await gql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { message } } }`, { id: node.id, t }, true);
  if (r.translationsRegister.userErrors.length) throw new Error(JSON.stringify(r.translationsRegister.userErrors));
  console.log(`  ✓ alt translated: ${m.alt.en}`);
}
