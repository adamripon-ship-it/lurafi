#!/usr/bin/env node
/**
 * Generate assets/llms.{locale}.txt and llms-full.{locale}.txt for priority locales.
 * Usage: node scripts/generate-llms-assets.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildConfigureUrl,
  buildHomeUrl,
  getLocales,
  loadLanguagesConfig,
} from './i18n/registry.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = loadLanguagesConfig();
const domain = cfg.domain;

const enShort = fs.readFileSync(path.join(root, 'assets/llms.txt'), 'utf8');
const enFull = fs.readFileSync(path.join(root, 'assets/llms-full.txt'), 'utf8');

const localeIntros = {
  nl: {
    title: 'Lurafi / Kevin (NL)',
    intro: 'Lurafi verkoopt Kevin, een Zwitserse AI-aanwezigheidssimulator voor woningbeveiliging.',
    benefit:
      'Kevin laat je huis bewoond lijken en klinken wanneer je weg bent. Licht, schaduw en geluid helpen inbrekers af te schrikken vóór een inbraak.',
  },
  fr: {
    title: 'Lurafi / Kevin (FR)',
    intro: 'Lurafi vend Kevin, un simulateur de présence suisse pour la sécurité domestique.',
    benefit:
      'Kevin fait paraître votre maison habitée par la lumière, l\'ombre et le son lorsque vous êtes absent.',
  },
  de: {
    title: 'Lurafi / Kevin (DE)',
    intro: 'Lurafi verkauft Kevin, einen Schweizer KI-Präsenzsimulator für die Wohnungssicherheit.',
    benefit:
      'Kevin lässt Ihr Zuhause bewohnt wirken und klingen, wenn Sie weg sind — Licht, Schatten und Sound als Abschreckung.',
  },
  es: {
    title: 'Lurafi / Kevin (ES)',
    intro: 'Lurafi vende Kevin, un simulador de presencia suizo para la seguridad del hogar.',
    benefit:
      'Kevin hace que tu casa parezca y suene habitada cuando no estás, con luz, sombra y sonido.',
  },
  it: {
    title: 'Lurafi / Kevin (IT)',
    intro: 'Lurafi vende Kevin, un simulatore di presenza svizzero per la sicurezza domestica.',
    benefit:
      'Kevin fa sembrare la tua casa abitata con luce, ombra e suono quando sei via.',
  },
};

function buildShort(loc) {
  const code = loc.code;
  const intro = localeIntros[code];
  const home = buildHomeUrl(domain, code);
  const buy = buildConfigureUrl(domain, code, 'buy');
  const sub = buildConfigureUrl(domain, code, 'subscribe');
  if (!intro) {
    return enShort.replace('https://lurafi.ai/', home).replace(
      'https://lurafi.ai/pages/configure?plan=buy',
      buy,
    );
  }
  return `# ${intro.title}

${intro.intro}

${intro.benefit}

Key facts:
- Product: Kevin
- Category: AI home security, presence simulation
- Privacy: No cameras, no microphones, no cloud monitoring
- Setup: Plug in, place near a window, configure in the app
- Warranty: 3-year Swiss warranty
- Delivery: Free delivery across Europe

Important URLs:
- Homepage: ${home}
- Configure / buy: ${buy}
- Subscribe: ${sub}
- Full LLM summary: https://${domain}/cdn/shop/t/1/assets/llms-full.${code}.txt
- AI sitemap: https://${domain}/cdn/shop/t/1/assets/sitemap-ai.xml

Contact:
- Email: hello@lurafi.ai
`;
}

function buildFull(loc) {
  const code = loc.code;
  const shortPath = `llms.${code}.txt`;
  const home = buildHomeUrl(domain, code);
  const buy = buildConfigureUrl(domain, code, 'buy');
  const base = enFull
    .replace(/https:\/\/lurafi\.ai\//g, home.endsWith('/') ? home : `${home}`)
    .replace(/https:\/\/lurafi\.ai\/pages\/configure\?plan=buy/g, buy)
    .replace(/llms-full\.txt/g, `llms-full.${code}.txt`)
    .replace(/llms\.txt/g, shortPath);
  if (localeIntros[code]) {
    return base.replace('# Lurafi / Kevin', `# ${localeIntros[code].title}`);
  }
  return base;
}

function updateEnIndex() {
  const links = getLocales()
    .filter((l) => l.llmAssets || l.primary)
    .map((l) => {
      const home = buildHomeUrl(domain, l.code);
      const buy = buildConfigureUrl(domain, l.code, 'buy');
      return `- ${l.label} home: ${home}\n- ${l.label} configure: ${buy}`;
    })
    .join('\n');

  const contactBlock = `Contact:\n- Email: hello@lurafi.ai\n`;
  const txt = `# Lurafi / Kevin

Lurafi sells Kevin, a Swiss AI presence simulation device for home security.

Kevin helps make a home look and sound lived-in when people are away. It uses light, shadow, and sound to deter burglars before a break-in happens.

Key facts:
- Product: Kevin
- Category: AI home security, burglary deterrent, presence simulation
- Core benefit: Prevention, not reaction
- Privacy: No cameras, no microphones, no cloud monitoring
- Data: Simulations are stored locally on the device and are not shared with third parties
- Setup: Plug in, place near a window, configure schedules or geofencing in the app
- Power: Typical use around 9W
- Warranty: 3-year Swiss warranty
- Delivery: Free delivery across Europe

Important URLs:
${links}
- Full LLM summary: https://${domain}/cdn/shop/t/1/assets/llms-full.txt
- AI sitemap: https://${domain}/cdn/shop/t/1/assets/sitemap-ai.xml

${contactBlock}`;
  fs.writeFileSync(path.join(root, 'assets/llms.txt'), txt);
}

for (const loc of getLocales()) {
  if (!loc.llmAssets || loc.primary) continue;
  const shortPath = path.join(root, `assets/llms.${loc.code}.txt`);
  const fullPath = path.join(root, `assets/llms-full.${loc.code}.txt`);
  fs.writeFileSync(shortPath, buildShort(loc));
  fs.writeFileSync(fullPath, buildFull(loc));
  console.log(`✓ llms.${loc.code}.txt + llms-full.${loc.code}.txt`);
}

updateEnIndex();
console.log('✓ Updated assets/llms.txt index');
