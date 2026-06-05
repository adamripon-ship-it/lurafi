#!/usr/bin/env node
/**
 * Copy missing keys from en.default.json into other locale files (English fallback).
 * Run after build-locales.mjs when new keys are added.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPublishedLocales } from './i18n/registry.mjs';

const localesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'locales');
const publishedLocaleFiles = new Set(
  getPublishedLocales()
    .filter((l) => !l.primary)
    .map((l) => `${l.shopifyLocale || l.code}.json`),
);

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, key));
    else out[key] = v;
  }
  return out;
}

function unflatten(flat) {
  const out = {};
  for (const [key, val] of Object.entries(flat)) {
    const parts = key.split('.');
    let cur = out;
    parts.forEach((p, i) => {
      if (i === parts.length - 1) cur[p] = val;
      else cur = cur[p] || (cur[p] = {});
    });
  }
  return out;
}

const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.default.json'), 'utf8'));
const enFlat = flatten(en);

for (const file of fs.readdirSync(localesDir)) {
  if (!file.endsWith('.json') || file === 'en.default.json' || file.endsWith('.schema.json')) continue;
  if (!publishedLocaleFiles.has(file)) continue;
  const p = path.join(localesDir, file);
  const flat = flatten(JSON.parse(fs.readFileSync(p, 'utf8')));
  let added = 0;
  for (const [key, val] of Object.entries(enFlat)) {
    const isLanguageKey = key.startsWith('language.');
    if (isLanguageKey || flat[key] === undefined || flat[key] === '') {
      if (isLanguageKey && flat[key] === val) continue;
      if (!isLanguageKey && flat[key] !== undefined && flat[key] !== '') continue;
      flat[key] = val;
      added++;
    }
  }
  for (const key of Object.keys(flat)) {
    if (key.startsWith('language.') && enFlat[key] === undefined) {
      delete flat[key];
      added++;
    }
  }
  if (added) {
    fs.writeFileSync(p, JSON.stringify(unflatten(flat), null, 2) + '\n');
    console.log(`✓ ${file}: +${added} keys`);
  }
}
