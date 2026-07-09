#!/usr/bin/env node
/**
 * Asset audit — finds orphaned and oversized media in assets/.
 *
 * An asset is "used" when its exact filename appears anywhere in
 * sections/, snippets/, templates/, layout/, config/, or another asset
 * (CSS url(), JS string). Media only — locale/text/config assets are exempt.
 *
 *   node scripts/audit-assets.mjs            # report
 *   node scripts/audit-assets.mjs --ci       # exit 1 on orphans/oversized (CI guard)
 *   node scripts/audit-assets.mjs --delete   # remove orphans (asks git to stage deletions)
 *   node scripts/audit-assets.mjs --max-kb=350
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = path.join(import.meta.dirname, '..');
const args = process.argv.slice(2);
const ci = args.includes('--ci');
const doDelete = args.includes('--delete');
const maxKb = Number((args.find((a) => a.startsWith('--max-kb=')) || '').split('=')[1] || 350);

const MEDIA_EXT = /\.(png|jpe?g|webp|avif|gif|svg|mp4|webm|glb)$/i;
// Video / 3D are inherently large — the size budget targets images. Still
// orphan-checked, just exempt from the KB cap.
const SIZE_EXEMPT_EXT = /\.(mp4|webm|mov|m4v|glb)$/i;
const SEARCH_DIRS = ['sections', 'snippets', 'templates', 'layout', 'config'];
const SEARCH_ASSET_EXT = /\.(css|js|liquid)$/i;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

let haystack = '';
for (const dir of SEARCH_DIRS) {
  for (const f of walk(path.join(root, dir))) haystack += fs.readFileSync(f, 'utf8');
}
for (const f of walk(path.join(root, 'assets'))) {
  if (SEARCH_ASSET_EXT.test(f)) haystack += fs.readFileSync(f, 'utf8');
}

const orphans = [];
const oversized = [];
for (const f of fs.readdirSync(path.join(root, 'assets'))) {
  if (!MEDIA_EXT.test(f)) continue;
  const kb = fs.statSync(path.join(root, 'assets', f)).size / 1024;
  if (!haystack.includes(f)) orphans.push({ f, kb });
  else if (kb > maxKb && !SIZE_EXEMPT_EXT.test(f)) oversized.push({ f, kb });
}

const fmt = ({ f, kb }) => `  ${kb.toFixed(0).padStart(6)} KB  ${f}`;
if (orphans.length) {
  console.log(`Orphaned media (${orphans.length}, ${(orphans.reduce((s, o) => s + o.kb, 0) / 1024).toFixed(1)} MB):`);
  orphans.sort((a, b) => b.kb - a.kb).forEach((o) => console.log(fmt(o)));
}
if (oversized.length) {
  console.log(`\nOversized used media (> ${maxKb} KB — compress or re-derive):`);
  oversized.sort((a, b) => b.kb - a.kb).forEach((o) => console.log(fmt(o)));
}
if (!orphans.length && !oversized.length) console.log('Assets clean: no orphans, none oversized.');

if (doDelete && orphans.length) {
  for (const { f } of orphans) fs.unlinkSync(path.join(root, 'assets', f));
  try {
    execSync(`git -C ${JSON.stringify(root)} add -A assets`, { stdio: 'inherit' });
  } catch {
    /* not a git checkout — deletions still applied */
  }
  console.log(`\nDeleted ${orphans.length} orphaned assets.`);
}

if (ci && (orphans.length || oversized.length)) process.exit(1);
