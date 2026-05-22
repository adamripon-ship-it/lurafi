#!/usr/bin/env node
/**
 * Push local theme files to the live theme via Admin REST API.
 * Requires: shopify store auth --store fu03cn-1v.myshopify.com --scopes read_themes,write_themes
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const STORE = process.env.SHOPIFY_STORE || 'fu03cn-1v.myshopify.com';
const API_VERSION = '2025-01';
const CONFIG_PATH = path.join(
  process.env.HOME || '',
  'Library/Preferences/shopify-cli-store-nodejs/config.json'
);

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.cursor',
  'scripts',
  '.shopify',
  'playwright-report',
  'test-results'
]);

function getToken() {
  if (process.env.SHOPIFY_ADMIN_TOKEN) return process.env.SHOPIFY_ADMIN_TOKEN;
  const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const key = Object.keys(raw).find((k) => k.includes('fu03cn'));
  if (!key) throw new Error('No store auth in config. Run: shopify store auth --store fu03cn-1v.myshopify.com --scopes read_themes,write_themes');
  const session = raw[key].myshopify.com.sessionsByUserId;
  const userId = Object.keys(session)[0];
  return session[userId].accessToken;
}

function collectFiles(dir, base = dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...collectFiles(full, base));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

async function api(token, method, endpoint, body) {
  const res = await fetch(`https://${STORE}/admin/api/${API_VERSION}${endpoint}`, {
    method,
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(json.errors || json.error || res.statusText);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

async function main() {
  const token = getToken();
  const { themes } = await api(token, 'GET', '/themes.json');
  const live = themes.find((t) => t.role === 'main');
  if (!live) throw new Error('No live (main) theme found');
  console.log(`Live theme: ${live.name} (id ${live.id})`);

  const files = collectFiles(ROOT).filter(
    (f) =>
      !f.startsWith('.') &&
      !f.endsWith('.md') &&
      f !== 'package.json' &&
      f !== 'package-lock.json' &&
      !f.includes('audit-report')
  );

  let ok = 0;
  let fail = 0;
  for (const key of files) {
    const full = path.join(ROOT, key);
    const value = fs.readFileSync(full, 'utf8');
    try {
      await api(token, 'PUT', `/themes/${live.id}/assets.json`, { asset: { key, value } });
      ok++;
      if (ok % 25 === 0) console.log(`  uploaded ${ok}/${files.length}...`);
    } catch (e) {
      fail++;
      console.error(`  FAIL ${key}:`, e.message || e);
      if (e.status === 403) {
        console.error('\nMissing read_themes/write_themes. Run:\n  shopify store auth --store fu03cn-1v.myshopify.com --scopes read_themes,write_themes\n');
        process.exit(1);
      }
    }
  }
  console.log(`Done. ${ok} uploaded, ${fail} failed.`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
