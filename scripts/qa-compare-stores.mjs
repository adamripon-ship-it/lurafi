#!/usr/bin/env node
/** Compare key signals between old (lurafi.ai) and new (mitipi-2) storefronts */
const OLD = process.env.OLD_URL || 'https://lurafi.ai';
const NEW = process.env.NEW_URL || 'https://mitipi-2.myshopify.com';

const checks = [
  { name: 'Home hero', path: '/', includes: ['Make Home Look Alive', 'hero-apple'] },
  { name: 'Configure buy', path: '/?view=configure&plan=buy', includes: ['data-configure'] },
  { name: 'Product kevin JSON', path: '/products/kevin.json', includes: ['"handle":"kevin"'] },
  { name: 'Product kevin-plus JSON', path: '/products/kevin-plus.json', includes: ['"handle":"kevin-plus"'] },
];

async function fetchText(base, path) {
  const res = await fetch(`${base}${path}`, { redirect: 'follow' });
  const text = await res.text();
  return { status: res.status, text, url: res.url };
}

async function main() {
  console.log(`\nCompare ${OLD} → ${NEW}\n`);
  let fails = 0;
  for (const c of checks) {
    const [o, n] = await Promise.all([fetchText(OLD, c.path), fetchText(NEW, c.path)]);
    const oldOk = c.includes.every((s) => o.text.includes(s));
    const newOk = c.includes.every((s) => n.text.includes(s));
    const line = `${c.name}: old=${o.status}${oldOk ? '✓' : '✗'} new=${n.status}${newOk ? '✓' : '✗'}`;
    console.log(line);
    if (!newOk) fails++;
    if (oldOk && !newOk) console.log(`  → gap on new store`);
  }
  console.log(fails ? `\n${fails} check(s) missing on new store.\n` : '\nNew store matches old on sampled checks.\n');
  process.exit(fails ? 1 : 0);
}

main();
