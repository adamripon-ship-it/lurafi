/**
 * Attach the KEVIN 3 device photos to the device product (kevin-plus) so the
 * configure gallery, cart and checkout all read product media from Shopify.
 *
 * Idempotent: images are keyed by alt text; already-present ones are skipped.
 * Order = gallery order (first image becomes the featured image).
 *
 * Usage: SHOPIFY_ADMIN_TOKEN=shpat_… node scripts/setup-device-media.mjs
 * Needs write_products + write_files.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { basename, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminGql, adminAuthMode } from './lib/shopify-admin-gql.mjs';

const STORE = (process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HANDLE = process.env.DEVICE_HANDLE || 'kevin-plus';

const IMAGES = [
  { file: 'assets/kevin-front-cover-grey-v2-cutout.webp', alt: 'KEVIN 3 with Grey front cover' }, // transparent cut-out (Vision subject mask)
  { file: 'assets/kevin-hero-product-front.webp', alt: 'KEVIN 3 front, angled' },
  { file: 'assets/kevin-hero-product-top.webp', alt: 'KEVIN 3 top view with light array' },
  { file: 'assets/kevin-hero-product-back.webp', alt: 'KEVIN 3 back' },
];

const gql = (query, variables, mutate = false) => adminGql({ store: STORE, query, variables, mutate });

async function main() {
  console.log(`Auth: ${adminAuthMode()} → ${STORE}`);
  const { productByHandle: product } = await gql(`query($h: String!) { productByHandle(handle: $h) { id title media(first: 20) { nodes { id alt } } } }`, { h: HANDLE });
  if (!product) throw new Error(`product ${HANDLE} not found`);
  const have = new Set(product.media.nodes.map((m) => m.alt));
  const todo = IMAGES.filter((i) => !have.has(i.alt) && existsSync(join(ROOT, i.file)));
  console.log(`${product.title}: ${product.media.nodes.length} media present, ${todo.length} to upload`);
  if (!todo.length) return;

  // 1) staged uploads
  const { stagedUploadsCreate } = await gql(`mutation($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } } }`,
    { input: todo.map((i) => ({ filename: basename(i.file), mimeType: i.file.endsWith('.webp') ? 'image/webp' : i.file.endsWith('.png') ? 'image/png' : 'image/jpeg', httpMethod: 'POST', resource: 'IMAGE', fileSize: String(statSync(join(ROOT, i.file)).size) })) }, true);
  if (stagedUploadsCreate.userErrors.length) throw new Error(JSON.stringify(stagedUploadsCreate.userErrors));

  const media = [];
  for (let n = 0; n < todo.length; n++) {
    const t = stagedUploadsCreate.stagedTargets[n];
    const form = new FormData();
    for (const p of t.parameters) form.append(p.name, p.value);
    form.append('file', new Blob([readFileSync(join(ROOT, todo[n].file))]), basename(todo[n].file));
    const res = await fetch(t.url, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`upload ${todo[n].file} failed: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    media.push({ originalSource: t.resourceUrl, mediaContentType: 'IMAGE', alt: todo[n].alt });
    console.log(`  ↑ ${todo[n].file}`);
  }

  // 2) attach in order
  const { productCreateMedia } = await gql(`mutation($id: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $id, media: $media) { media { id alt status } mediaUserErrors { field message } } }`, { id: product.id, media }, true);
  if (productCreateMedia.mediaUserErrors.length) throw new Error(JSON.stringify(productCreateMedia.mediaUserErrors));
  console.log(`✓ attached ${productCreateMedia.media.length} image(s):`, productCreateMedia.media.map((m) => `${m.alt} [${m.status}]`).join(', '));
}

main().catch((e) => { console.error('setup-device-media failed:', e.message); process.exitCode = 1; });
