#!/usr/bin/env node
/**
 * Replace the kevin-front-cover product media with transparent cut-outs and
 * re-attach one image per colour variant (the configure page reads
 * variant.image). Idempotent: run again to refresh.
 * Usage: node scripts/setup-cover-media.mjs
 */
import { readFileSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminGql } from './lib/shopify-admin-gql.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STORE = process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com';
const HANDLE = 'kevin-front-cover';
const COVERS = ['Red', 'Brown', 'Blue', 'White'].map((c) => ({ colour: c, file: `assets/kevin-front-cover-${c.toLowerCase()}-cutout.webp`, alt: `${c} front cover` }));
const gql = (query, variables, mutate = false) => adminGql({ store: STORE, query, variables, mutate });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { productByHandle: p } = await gql(`{ productByHandle(handle: "${HANDLE}") { id media(first: 20) { nodes { id } } variants(first: 10) { nodes { id title } } } }`);
if (!p) throw new Error('cover product not found');
if (p.media.nodes.length) {
  const r = await gql(`mutation($id: ID!, $m: [ID!]!) { productDeleteMedia(productId: $id, mediaIds: $m) { deletedMediaIds mediaUserErrors { message } } }`, { id: p.id, m: p.media.nodes.map((n) => n.id) }, true);
  if (r.productDeleteMedia.mediaUserErrors.length) throw new Error(JSON.stringify(r.productDeleteMedia.mediaUserErrors));
  console.log(`− removed ${r.productDeleteMedia.deletedMediaIds.length} media`);
}
const { stagedUploadsCreate: su } = await gql(`mutation($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { message } } }`,
  { input: COVERS.map((c) => ({ filename: basename(c.file), mimeType: 'image/webp', httpMethod: 'POST', resource: 'IMAGE', fileSize: String(statSync(join(ROOT, c.file)).size) })) }, true);
if (su.userErrors.length) throw new Error(JSON.stringify(su.userErrors));
const media = [];
for (let i = 0; i < COVERS.length; i++) {
  const t = su.stagedTargets[i]; const form = new FormData();
  for (const q of t.parameters) form.append(q.name, q.value);
  form.append('file', new Blob([readFileSync(join(ROOT, COVERS[i].file))]), basename(COVERS[i].file));
  const res = await fetch(t.url, { method: 'POST', body: form }); if (!res.ok) throw new Error(`upload failed ${res.status}`);
  media.push({ originalSource: t.resourceUrl, mediaContentType: 'IMAGE', alt: COVERS[i].alt });
}
const { productCreateMedia: pc } = await gql(`mutation($id: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $id, media: $media) { media { id alt } mediaUserErrors { message } } }`, { id: p.id, media }, true);
if (pc.mediaUserErrors.length) throw new Error(JSON.stringify(pc.mediaUserErrors));
let nodes = [];
for (let i = 0; i < 20; i++) { await sleep(3000); ({ productByHandle: { media: { nodes } } } = await gql(`{ productByHandle(handle: "${HANDLE}") { media(first: 20) { nodes { id alt status } } } }`)); if (nodes.every((n) => n.status === 'READY')) break; }
console.log(`+ ${nodes.length} media (${nodes.map((n) => n.status).join(',')})`);
const variantMedia = COVERS.map((c) => { const m = nodes.find((n) => n.alt === c.alt); const v = p.variants.nodes.find((x) => x.title === c.colour); return m && v ? { variantId: v.id, mediaIds: [m.id] } : null; }).filter(Boolean);
const r = await gql(`mutation($id: ID!, $vm: [ProductVariantAppendMediaInput!]!) { productVariantAppendMedia(productId: $id, variantMedia: $vm) { userErrors { message } } }`, { id: p.id, vm: variantMedia }, true);
if (r.productVariantAppendMedia.userErrors.length) throw new Error(JSON.stringify(r.productVariantAppendMedia.userErrors));
console.log(`✓ variant images attached: ${variantMedia.length}`);
