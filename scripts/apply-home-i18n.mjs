#!/usr/bin/env node
/**
 * Apply owner-authored non-English copy to the locale files:
 *   config/home-{de,fr,cs}.json  → locales/{lang}.json  under "home"
 *   config/i18n/{nl,de,fr,cs}.json → locales/{lang}.json (any top-level keys, deep-merged)
 * NL homepage copy (config/home-nl.json) is merged by build-locales.mjs instead,
 * because locales/nl.json is regenerated from that script.
 * Idempotent. Run after `npm run locales:build && npm run locales:sync`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const merge = (t, s) => { for (const [k, v] of Object.entries(s)) { if (v && typeof v === 'object' && !Array.isArray(v)) { t[k] = merge(t[k] && typeof t[k] === 'object' ? t[k] : {}, v); } else t[k] = v; } return t; };
for (const lang of ['nl', 'de', 'fr', 'cs']) {
  const lp = path.join(root, `locales/${lang}.json`);
  const loc = JSON.parse(fs.readFileSync(lp, 'utf8'));
  let n = 0;
  if (lang !== 'nl') { const hp = path.join(root, `config/home-${lang}.json`); if (fs.existsSync(hp)) { loc.home = merge(loc.home || {}, JSON.parse(fs.readFileSync(hp, 'utf8'))); n++; } }
  const ip = path.join(root, `config/i18n/${lang}.json`); if (fs.existsSync(ip)) { merge(loc, JSON.parse(fs.readFileSync(ip, 'utf8'))); n++; }
  fs.writeFileSync(lp, JSON.stringify(loc, null, 2) + '\n');
  console.log(`✓ ${lang}.json ← ${n} source file(s)`);
}
