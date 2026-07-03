#!/usr/bin/env node
/**
 * Upload local media to Shopify Files (CDN) so the content team can pick them
 * in the Theme Editor. Staged upload → fileCreate, with alt text.
 *
 *   node scripts/upload-assets.mjs assets/kevin-hero-product-front.webp
 *   node scripts/upload-assets.mjs --alt "Kevin presence simulator" path/to/file.jpg [more files…]
 *
 * Requires SHOPIFY_ADMIN_TOKEN (write_files scope) — see scripts/lib/shopify-admin-gql.mjs.
 */
import fs from 'fs';
import path from 'path';
import { adminGql } from './lib/shopify-admin-gql.mjs';

const args = process.argv.slice(2);
const altIdx = args.indexOf('--alt');
const alt = altIdx >= 0 ? args[altIdx + 1] : '';
const files = args.filter((a, i) => a !== '--alt' && i !== altIdx + 1);

if (!files.length) {
  console.error('Usage: node scripts/upload-assets.mjs [--alt "Alt text"] <file> [file…]');
  process.exit(1);
}

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

async function stagedUpload(filePath) {
  const name = path.basename(filePath);
  const mime = MIME[path.extname(name).toLowerCase()];
  if (!mime) throw new Error(`Unsupported extension: ${name}`);
  const size = fs.statSync(filePath).size;
  const isVideo = mime.startsWith('video/');

  const staged = await adminGql({
    mutate: true,
    query: `mutation($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    variables: {
      input: [
        {
          filename: name,
          mimeType: mime,
          httpMethod: 'POST',
          resource: isVideo ? 'VIDEO' : 'IMAGE',
          fileSize: String(size),
        },
      ],
    },
  });
  const target = staged?.data?.stagedUploadsCreate?.stagedTargets?.[0];
  const stagedErrors = staged?.data?.stagedUploadsCreate?.userErrors;
  if (!target) throw new Error(`stagedUploadsCreate failed: ${JSON.stringify(stagedErrors)}`);

  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([fs.readFileSync(filePath)], { type: mime }), name);
  const uploadRes = await fetch(target.url, { method: 'POST', body: form });
  if (!uploadRes.ok) throw new Error(`upload failed (${uploadRes.status}) for ${name}`);

  return { resourceUrl: target.resourceUrl, isVideo, name };
}

for (const file of files) {
  const { resourceUrl, isVideo, name } = await stagedUpload(file);
  const created = await adminGql({
    mutate: true,
    query: `mutation($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files { id alt fileStatus preview { image { url } } }
        userErrors { field message }
      }
    }`,
    variables: {
      files: [
        {
          originalSource: resourceUrl,
          alt: alt || name.replace(/[-_]/g, ' ').replace(/\.\w+$/, ''),
          contentType: isVideo ? 'VIDEO' : 'IMAGE',
        },
      ],
    },
  });
  const payload = created?.data?.fileCreate;
  if (payload?.userErrors?.length) throw new Error(`${name}: ${JSON.stringify(payload.userErrors)}`);
  console.log(`✓ ${name} → ${payload?.files?.[0]?.id} (${payload?.files?.[0]?.fileStatus})`);
}
