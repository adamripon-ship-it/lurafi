#!/usr/bin/env node
/**
 * One-command QA report: backend + compare + writes scripts/qa-mitipi-report.json
 * Run: node scripts/qa-mitipi-report.mjs
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { adminGql } from './lib/shopify-admin-gql.mjs';

const ROOT = join(import.meta.dirname, '..');
const STORE = (process.env.SHOPIFY_STORE || '6mzhe1-yf.myshopify.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const OLD = 'https://lurafi.ai';
const NEW = process.env.NEW_URL || `https://${STORE}`;

const report = {
  generatedAt: new Date().toISOString(),
  store: STORE,
  compareUrl: NEW,
  backend: { pass: [], warn: [], fail: [] },
  compare: [],
  storefront: { locales: [] },
};

function run(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    timeout: 600000,
  });
  return { ok: r.status === 0, stdout: r.stdout || '', stderr: r.stderr || '', code: r.status };
}

async function backend() {
  const data = await adminGql({
    store: STORE,
    query: `query {
      shop { name email primaryDomain { url } currencyCode }
      shopLocales { locale published }
      themes(first: 15) { nodes { name role } }
      products(first: 5, query: "handle:kevin OR handle:kevin-plus") { nodes { handle title } }
      pages(first: 20) { nodes { handle } }
    }`,
  });
  report.backend.pass.push(`Shop: ${data.shop.name} (${data.shop.email})`);
  report.backend.pass.push(`Primary domain: ${data.shop.primaryDomain.url}`);
  const live = data.themes.nodes.find((t) => t.role === 'MAIN');
  if (live?.name?.toLowerCase().includes('lurafi')) report.backend.pass.push(`Live theme: ${live.name}`);
  else report.backend.fail.push(`Live theme: ${live?.name}`);
  const pub = data.shopLocales.filter((l) => l.published).length;
  if (pub >= 12) report.backend.pass.push(`${pub} locales published`);
  else report.backend.warn.push(`${pub} locales published`);
  for (const h of ['kevin', 'kevin-plus']) {
    if (data.products.nodes.some((p) => p.handle === h)) report.backend.pass.push(`Product ${h}`);
    else report.backend.fail.push(`Missing product ${h}`);
  }
  for (const h of ['configure', 'sitemap', 'llms']) {
    if (data.pages.nodes.some((p) => p.handle === h)) report.backend.pass.push(`Page ${h}`);
    else report.backend.fail.push(`Missing page ${h}`);
  }
}

async function compare() {
  const checks = [
    { name: 'hero', path: '/', need: 'Make Home Look Alive' },
    { name: 'configure', path: '/pages/configure?plan=buy', need: 'data-configure' },
    { name: 'kevin', path: '/products/kevin.json', need: '"handle":"kevin"' },
  ];
  for (const c of checks) {
    const [o, n] = await Promise.all([
      fetch(OLD + c.path).then((r) => r.text().then((t) => ({ s: r.status, t }))),
      fetch(NEW + c.path).then((r) => r.text().then((t) => ({ s: r.status, t }))),
    ]);
    const row = {
      check: c.name,
      old: o.s,
      new: n.s,
      oldOk: o.t.includes(c.need),
      newOk: n.t.includes(c.need),
    };
    report.compare.push(row);
  }
}

async function localeHttp() {
  const codes = ['en', 'nl', 'de', 'fr'];
  for (const code of codes) {
    const base = code === 'en' ? NEW : `${NEW}/${code}`;
    const res = await fetch(base + '/');
    report.storefront.locales.push({ code, status: res.status, ok: res.ok });
  }
}

async function main() {
  await backend();
  await compare();
  await localeHttp();
  mkdirSync(join(ROOT, 'scripts'), { recursive: true });
  const out = join(ROOT, 'scripts', 'qa-mitipi-report.json');
  writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`Wrote ${out}`);
  const fails = report.backend.fail.length + report.compare.filter((c) => !c.newOk).length;
  process.exit(fails ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
