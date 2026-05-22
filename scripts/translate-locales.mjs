#!/usr/bin/env node
/**
 * Generate locales/*.json from en.default.json via DeepL or LibreTranslate.
 *
 * Usage:
 *   node scripts/build-locales.mjs
 *   DEEPL_API_KEY=xxx node scripts/translate-locales.mjs
 *   node scripts/translate-locales.mjs --locale fr,de
 *   node scripts/translate-locales.mjs --skip-existing
 *
 * Preserves: Kevin, Kevin+, Lurafi, Shopify, CHF, Mitipi, {{ }}, | pipe lists
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLocales, loadLanguagesConfig } from './i18n/registry.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = path.join(root, 'locales');
const glossary = loadLanguagesConfig().glossary || [];

const DEEPL_TARGET = {
  nl: 'NL',
  fr: 'FR',
  de: 'DE',
  es: 'ES',
  it: 'IT',
  nb: 'NB',
  da: 'DA',
  sv: 'SV',
  fi: 'FI',
  cs: 'CS',
  pl: 'PL',
};

const LIBRE_TARGET = {
  nl: 'nl',
  fr: 'fr',
  de: 'de',
  es: 'es',
  it: 'it',
  nb: 'nb',
  da: 'da',
  sv: 'sv',
  fi: 'fi',
  cs: 'cs',
  pl: 'pl',
};

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

function protectGlossary(text) {
  let out = text;
  const placeholders = [];
  glossary.forEach((term, i) => {
    const ph = `__GLOSS${i}__`;
    if (out.includes(term)) {
      placeholders.push({ ph, term });
      out = out.split(term).join(ph);
    }
  });
  return { text: out, placeholders };
}

function restoreGlossary(text, placeholders) {
  let out = text;
  for (const { ph, term } of placeholders) {
    out = out.split(ph).join(term);
  }
  return out;
}

async function translateDeepL(text, targetLang, apiKey) {
  const { text: protectedText, placeholders } = protectGlossary(text);
  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      auth_key: apiKey,
      text: protectedText,
      source_lang: 'EN',
      target_lang: targetLang,
      tag_handling: 'xml',
    }),
  });
  if (!res.ok) throw new Error(`DeepL ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return restoreGlossary(data.translations[0].text, placeholders);
}

async function translateLibre(text, targetLang) {
  const { text: protectedText, placeholders } = protectGlossary(text);
  const res = await fetch('https://libretranslate.com/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: protectedText,
      source: 'en',
      target: targetLang,
      format: 'text',
    }),
  });
  if (!res.ok) throw new Error(`LibreTranslate ${res.status}`);
  const data = await res.json();
  return restoreGlossary(data.translatedText, placeholders);
}

async function translateGoogle(text, targetLang) {
  const { text: protectedText, placeholders } = protectGlossary(text);
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'en');
  url.searchParams.set('tl', targetLang);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', protectedText);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google translate ${res.status}`);
  const data = await res.json();
  const translated = data[0].map((part) => part[0]).join('');
  return restoreGlossary(translated, placeholders);
}

async function translateDeepLBatch(texts, targetLang, apiKey) {
  const protectedList = texts.map((t) => protectGlossary(t));
  const body = new URLSearchParams();
  body.set('auth_key', apiKey);
  body.set('source_lang', 'EN');
  body.set('target_lang', targetLang);
  for (const p of protectedList) body.append('text', p.text);
  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`DeepL ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.translations.map((tr, i) => restoreGlossary(tr.text, protectedList[i].placeholders));
}

async function translateBatch(strings, localeCode, apiKey) {
  const deepl = DEEPL_TARGET[localeCode];
  const google = LIBRE_TARGET[localeCode];
  if (apiKey && deepl) {
    try {
      return await translateDeepLBatch(strings, deepl, apiKey);
    } catch (e) {
      console.warn(`  DeepL batch failed: ${e.message}`);
    }
  }
  const out = [];
  for (let i = 0; i < strings.length; i += 8) {
    const chunk = strings.slice(i, i + 8);
    const part = await Promise.all(
      chunk.map(async (s) => {
        await new Promise((r) => setTimeout(r, 120));
        return translateGoogle(s, google);
      }),
    );
    out.push(...part);
  }
  return out;
}

function injectLanguageLabels(flat, labels) {
  for (const [code, label] of Object.entries(labels)) {
    flat[`language.${code}`] = label;
  }
  flat['language.label'] = flat['language.label'] || 'Language';
  return flat;
}

async function translateLocale(localeCode, enFlat, labels, apiKey) {
  const outPath = path.join(localesDir, `${localeCode}.json`);
  const existingPath = path.join(localesDir, `${localeCode}.json`);
  if (localeCode === 'nl' && fs.existsSync(existingPath)) {
    const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
    const flat = injectLanguageLabels(flatten(existing), labels);
    fs.writeFileSync(outPath, JSON.stringify(unflatten(flat), null, 2) + '\n');
    console.log(`✓ ${localeCode}.json (kept existing nl, updated language labels)`);
    return;
  }

  const out = { ...enFlat };
  injectLanguageLabels(out, labels);
  const keys = Object.keys(enFlat).filter((k) => !k.startsWith('language.'));
  const stringKeys = keys.filter((k) => typeof enFlat[k] === 'string' && enFlat[k].trim());
  const BATCH = 40;
  for (let i = 0; i < stringKeys.length; i += BATCH) {
    const batchKeys = stringKeys.slice(i, i + BATCH);
    const batchVals = batchKeys.map((k) => enFlat[k]);
    try {
      const translated = await translateBatch(batchVals, localeCode, apiKey);
      batchKeys.forEach((k, j) => {
        out[k] = translated[j] || enFlat[k];
      });
    } catch (e) {
      console.warn(`  batch ${i}: ${e.message}`);
      batchKeys.forEach((k) => {
        out[k] = enFlat[k];
      });
    }
    console.log(`  ${localeCode}: ${Math.min(i + BATCH, stringKeys.length)}/${stringKeys.length}`);
  }
  fs.writeFileSync(outPath, JSON.stringify(unflatten(out), null, 2) + '\n');
  console.log(`✓ Wrote ${outPath} (${keys.length} keys)`);
}

function writeSchema(localeCode) {
  const schemaPath = path.join(localesDir, `${localeCode}.schema.json`);
  if (fs.existsSync(schemaPath)) return;
  const template = fs.existsSync(path.join(localesDir, 'nl.schema.json'))
    ? fs.readFileSync(path.join(localesDir, 'nl.schema.json'), 'utf8')
    : JSON.stringify({ settings_schema: { products: { name: 'Products' } } }, null, 2);
  const data = JSON.parse(template);
  const native = getLocales().find((l) => l.code === localeCode)?.nativeName || localeCode;
  if (data.settings_schema?.products) {
    data.settings_schema.products.name = native;
  }
  fs.writeFileSync(schemaPath, JSON.stringify(data, null, 2) + '\n');
}

async function main() {
  const args = process.argv.slice(2);
  const only = args.find((a) => a.startsWith('--locale='))?.split('=')[1]?.split(',');
  const skipExisting = args.includes('--skip-existing');

  const enPath = path.join(localesDir, 'en.default.json');
  if (!fs.existsSync(enPath)) {
    console.error('Run: node scripts/build-locales.mjs first');
    process.exit(1);
  }

  const enFlat = flatten(JSON.parse(fs.readFileSync(enPath, 'utf8')));
  const labels = Object.fromEntries(getLocales().map((l) => [l.code, l.label]));
  injectLanguageLabels(enFlat, labels);
  fs.writeFileSync(enPath, JSON.stringify(unflatten(enFlat), null, 2) + '\n');

  const apiKey = process.env.DEEPL_API_KEY || process.env.DEEPL_AUTH_KEY;
  const targets = getLocales().filter((l) => !l.primary && (!only || only.includes(l.code)));

  console.log(`Translating ${targets.length} locales${apiKey ? ' (DeepL)' : ' (LibreTranslate)'}…\n`);

  for (const loc of targets) {
    const outPath = path.join(localesDir, `${loc.code}.json`);
    if (skipExisting && fs.existsSync(outPath)) {
      console.log(`⊘ skip ${loc.code} (exists)`);
      continue;
    }
    await translateLocale(loc.code, enFlat, labels, apiKey);
    writeSchema(loc.code);
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
