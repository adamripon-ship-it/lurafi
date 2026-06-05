#!/usr/bin/env node
/**
 * Copy missing keys from en.default.json into other locale files (English fallback).
 * Run after build-locales.mjs when new keys are added.
 *
 * Never overwrites existing non-empty translations.
 * Skips home.* keys managed by build-locales (NL) and duplicate home.hero.* callout keys.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPublishedLocales } from './i18n/registry.mjs';
import {
  HERO_DUPLICATE_HOME_SUFFIXES,
  LOCALE_NATIVE_STRINGS,
  localeCodeFromFile,
  shouldSkipSyncKey,
} from './i18n/locale-overrides.mjs';

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

function stripHeroDuplicateHomeKeys(flat) {
  let removed = 0;
  for (const key of Object.keys(flat)) {
    if (!key.startsWith('home.hero.')) continue;
    const suffix = key.slice('home.hero.'.length);
    if (HERO_DUPLICATE_HOME_SUFFIXES.has(suffix)) {
      delete flat[key];
      removed++;
    }
  }
  return removed;
}

function applyNativeStrings(file, flat, enFlat) {
  const code = localeCodeFromFile(file);
  const overrides = LOCALE_NATIVE_STRINGS[code];
  if (!overrides) return 0;

  let changed = 0;
  for (const [key, nativeVal] of Object.entries(overrides)) {
    const current = flat[key];
    const enVal = enFlat[key];
    const isLanguageLabel = key === 'language.label';

    if (isLanguageLabel && current && current !== enVal) continue;
    if (!isLanguageLabel && current !== undefined && current !== '' && current !== enVal) continue;
    if (current === nativeVal) continue;

    flat[key] = nativeVal;
    changed++;
  }
  return changed;
}

const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.default.json'), 'utf8'));
const enFlat = flatten(en);

for (const file of fs.readdirSync(localesDir)) {
  if (!file.endsWith('.json') || file === 'en.default.json' || file.endsWith('.schema.json')) continue;
  if (!publishedLocaleFiles.has(file)) continue;
  const p = path.join(localesDir, file);
  const before = fs.readFileSync(p, 'utf8');
  const flat = flatten(JSON.parse(before));
  let added = 0;

  added += stripHeroDuplicateHomeKeys(flat);

  for (const [key, val] of Object.entries(enFlat)) {
    if (shouldSkipSyncKey(file, key)) continue;
    if (flat[key] !== undefined && flat[key] !== '') continue;
    if (flat[key] === val) continue;
    flat[key] = val;
    added++;
  }

  for (const key of Object.keys(flat)) {
    if (key.startsWith('language.') && enFlat[key] === undefined) {
      delete flat[key];
      added++;
    }
  }

  added += applyNativeStrings(file, flat, enFlat);

  const after = JSON.stringify(unflatten(flat), null, 2) + '\n';
  if (added && before !== after) {
    fs.writeFileSync(p, after);
    console.log(`✓ ${file}: ${added} change(s)`);
  }
}
