#!/usr/bin/env node
/**
 * Generate assets/llms*.txt with cross-links (short → full) and stable discovery URLs.
 * Usage: node scripts/generate-llms-assets.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildConfigureUrl,
  buildHomeUrl,
  buildThemeAssetUrl,
  getLocales,
  getLlmAssetLocales,
  llmsFullFilename,
  llmsShortFilename,
  loadLanguagesConfig,
} from './i18n/registry.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = loadLanguagesConfig();
const domain = cfg.domain;

const enFullPath = path.join(root, 'assets/llms-full.txt');
const enFull = fs.readFileSync(enFullPath, 'utf8');

const localeIntros = {
  nl: {
    title: 'Mitipi / Kevin (NL)',
    intro: 'Mitipi verkoopt Kevin, een Zwitserse AI-aanwezigheidssimulator voor woningbeveiliging.',
    benefit:
      'Kevin laat je huis bewoond lijken en klinken wanneer je weg bent. Licht, schaduw en geluid helpen inbrekers af te schrikken vóór een inbraak.',
  },
  fr: {
    title: 'Mitipi / Kevin (FR)',
    intro: 'Mitipi vend Kevin, un simulateur de présence suisse pour la sécurité domestique.',
    benefit:
      "Kevin fait paraître votre maison habitée par la lumière, l'ombre et le son lorsque vous êtes absent.",
  },
  de: {
    title: 'Mitipi / Kevin (DE)',
    intro: 'Mitipi verkauft Kevin, einen Schweizer KI-Präsenzsimulator für die Wohnungssicherheit.',
    benefit:
      'Kevin lässt Ihr Zuhause bewohnt wirken und klingen, wenn Sie weg sind — Licht, Schatten und Sound als Abschreckung.',
  },
  es: {
    title: 'Mitipi / Kevin (ES)',
    intro: 'Mitipi vende Kevin, un simulador de presencia suizo para la seguridad del hogar.',
    benefit:
      'Kevin hace que tu casa parezca y suene habitada cuando no estás, con luz, sombra y sonido.',
  },
  it: {
    title: 'Mitipi / Kevin (IT)',
    intro: 'Mitipi vende Kevin, un simulatore di presenza svizzero per la sicurezza domestica.',
    benefit:
      'Kevin fa sembrare la tua casa abitata con luce, ombra e suono quando sei via.',
  },
};

function genericIntro(loc) {
  return {
    title: `Mitipi / Kevin (${loc.label})`,
    intro: `Mitipi sells Kevin — Swiss AI presence simulation (${loc.nativeName} storefront).`,
    benefit:
      'Kevin helps make a home look and sound lived-in when you are away using light, shadow, and sound.',
  };
}

function discoveryBlock(code, role = 'short') {
  const shortFile = llmsShortFilename(code);
  const fullFile = llmsFullFilename(code);
  const shortUrl = buildThemeAssetUrl(shortFile, domain);
  const fullUrl = buildThemeAssetUrl(fullFile, domain);
  const sitemapAi = buildThemeAssetUrl(cfg.discovery?.aiSitemap || 'sitemap-ai.xml', domain);
  const shopifySitemap = `https://${domain}/sitemap.xml`;
  const humanSitemap = code === 'en' ? `https://${domain}/pages/sitemap` : pageUrlFor(code, 'sitemap');
  const llmsPage = code === 'en' ? `https://${domain}/pages/llms` : pageUrlFor(code, 'llms');
  const shortLabel = role === 'short' ? 'Short summary (this file)' : 'Short summary';
  const fullLabel = role === 'full' ? 'Full summary (this file)' : 'Full summary (read for complete context)';

  return `## AI / LLM discovery
- ${shortLabel}: ${shortUrl}
- ${fullLabel}: ${fullUrl}
- AI sitemap XML: ${sitemapAi}
- Shopify sitemap XML: ${shopifySitemap}
- Human sitemap page: ${humanSitemap}
- LLM overview page: ${llmsPage}
`;
}

function pageUrlFor(code, pageKey) {
  const loc = getLocales().find((l) => l.code === code);
  const prefix = loc?.urlPrefix || '';
  const handle = loc?.pages?.[pageKey]?.handle || cfg.pages[pageKey].handle;
  return `https://${domain}${prefix}/pages/${handle}`;
}

function buildShort(loc) {
  const code = loc.code;
  const intro = localeIntros[code] || genericIntro(loc);
  const home = buildHomeUrl(domain, code);
  const buy = buildConfigureUrl(domain, code, 'buy');
  const fullUrl = buildThemeAssetUrl(llmsFullFilename(code), domain);

  return `# ${intro.title}

> ${intro.benefit}

${discoveryBlock(code, 'short')}

${intro.intro}

Key facts:
- Product: Kevin
- Category: AI home security, presence simulation, burglary deterrent
- Privacy: No cameras, no microphones, no cloud monitoring
- Setup: Plug in, place near a window, configure in the app
- Warranty: 3-year Swiss warranty
- Delivery: Free delivery across Europe

Important URLs:
- Homepage: ${home}
- Configure / buy: ${buy}

Contact:
- Email: hello@mitipi.eu
`;
}

function buildFull(loc) {
  const code = loc.code;
  const shortFile = llmsShortFilename(code);
  const fullFile = llmsFullFilename(code);
  const shortUrl = buildThemeAssetUrl(shortFile, domain);
  const fullUrl = buildThemeAssetUrl(fullFile, domain);
  const home = buildHomeUrl(domain, code);
  const buy = buildConfigureUrl(domain, code, 'buy');
  const intro = localeIntros[code] || genericIntro(loc);

  let base = enFull;
  if (loc.primary) {
    base = base.replace(
      '# Mitipi / Kevin: Full LLM and AI Search Summary',
      `# Mitipi / Kevin: Full LLM and AI Search Summary

> Short summary: ${shortUrl}

${discoveryBlock('en', 'full')}`,
    );
  } else {
    base = base
      .replace(/https:\/\/lurafi\.ai\//g, home.endsWith('/') ? home : `${home}/`)
      .replace(/https:\/\/lurafi\.ai\/pages\/configure\?plan=buy/g, buy)
      .replace(/llms-full\.txt/g, fullFile)
      .replace(/llms\.txt/g, shortFile)
      .replace('# Mitipi / Kevin: Full LLM and AI Search Summary', `# ${intro.title}: Full LLM Summary

> Short summary: ${shortUrl}

${discoveryBlock(code, 'full')}`);
  }

  const urlsSection = base.indexOf('## Important URLs');
  if (urlsSection !== -1) {
    const before = base.slice(0, urlsSection);
    const after = base.slice(urlsSection);
    const extra = `- Short LLM file: ${shortUrl}\n- Full LLM file: ${fullUrl}\n`;
    base = before + extra + after.replace(
      /- Short LLM file:.*\n- Full LLM file:.*\n/,
      '',
    );
  }

  return base;
}

function updateEnShort() {
  const links = getLocales()
    .filter((l) => l.publish !== false)
    .map((l) => {
      const home = buildHomeUrl(domain, l.code);
      const buy = buildConfigureUrl(domain, l.code, 'buy');
      return `- ${l.label} home: ${home}\n- ${l.label} configure: ${buy}`;
    })
    .join('\n');

  const kevinMd = buildThemeAssetUrl('kevin.md', domain);
  const productMd = buildThemeAssetUrl('kevin-product.md', domain);
  const specsMd = buildThemeAssetUrl('kevin-specs.md', domain);
  const faqMd = buildThemeAssetUrl('kevin-faq.md', domain);
  const companyMd = buildThemeAssetUrl('kevin-company.md', domain);
  const txt = `# Mitipi / Kevin

> Swiss AI presence simulation for your home. When you are away, Kevin uses light, shadow, and sound so your home looks and sounds lived-in—and burglars move on.

${discoveryBlock('en', 'short')}

Mitipi sells Kevin, a Swiss AI presence simulation device for home security.

Kevin helps make a home look and sound lived-in when people are away. It uses light, shadow, and sound to deter burglars before a break-in happens.

Key facts:
- Product: Kevin (KEVIN 3.0)
- Category: AI home security, burglary deterrent, presence simulation
- Core benefit: Prevention, not reaction
- Privacy: No cameras, no microphones, no cloud monitoring
- Data: Simulations are stored locally on the device and are not shared with third parties
- Setup: Plug in, place near a window, configure schedules or geofencing in the app
- Power: Typical use around 9W
- Warranty: 3-year Swiss warranty
- Delivery: Free delivery across Europe

Knowledge files (Markdown, for AI/LLM ingestion):
- Overview / index: ${kevinMd}
- Product overview: ${productMd}
- Technical specifications: ${specsMd}
- FAQ: ${faqMd}
- About the company: ${companyMd}

Important URLs:
${links}

Contact:
- Email: hello@mitipi.eu
`;
  fs.writeFileSync(path.join(root, 'assets/llms.txt'), txt);
}

function updateEnFull() {
  const shortUrl = buildThemeAssetUrl('llms.txt', domain);
  let full = fs.readFileSync(enFullPath, 'utf8');
  // Self-heal legacy domain/email drift baked into the EN template.
  full = full
    .replace(/https:\/\/lurafi\.ai\b/g, `https://${domain}`)
    .replace(/hello@lurafi\.(ai|com)\b/g, 'hello@mitipi.eu');
  if (!full.includes('> Short summary:')) {
    full = full.replace(
      '# Mitipi / Kevin: Full LLM and AI Search Summary',
      `# Mitipi / Kevin: Full LLM and AI Search Summary

> Short summary: ${shortUrl}

${discoveryBlock('en', 'full')}`,
    );
  }
  const shortLine = buildThemeAssetUrl('llms.txt', domain);
  const fullLine = buildThemeAssetUrl('llms-full.txt', domain);
  const aiLine = buildThemeAssetUrl('sitemap-ai.xml', domain);
  full = full.replace(
    /- Short LLM file:.*\n- Full LLM file:.*\n- AI sitemap:.*\n/s,
    `- Short LLM file: ${shortLine}\n- Full LLM file: ${fullLine}\n- AI sitemap: ${aiLine}\n- Shopify sitemap: https://${domain}/sitemap.xml\n`,
  );
  fs.writeFileSync(enFullPath, full);
}

for (const loc of getLlmAssetLocales()) {
  if (loc.primary) continue;
  const shortPath = path.join(root, `assets/${llmsShortFilename(loc.code)}`);
  const fullPath = path.join(root, `assets/${llmsFullFilename(loc.code)}`);
  fs.writeFileSync(shortPath, buildShort(loc));
  fs.writeFileSync(fullPath, buildFull(loc));
  console.log(`✓ ${path.basename(shortPath)} + ${path.basename(fullPath)}`);
}

updateEnShort();
updateEnFull();
console.log('✓ Updated assets/llms.txt + assets/llms-full.txt');
