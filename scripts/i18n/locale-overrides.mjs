/**
 * Locale strings and sync rules shared by build-locales.mjs and sync-locale-keys.mjs.
 */

/** home.hero.* keys that duplicate top-level hero.* — omit from NL build and strip on sync. */
export const HERO_DUPLICATE_HOME_SUFFIXES = new Set([
  'callouts_aria_label',
  'away_eyebrow',
  'away_title',
  'away_body',
  'privacy_eyebrow',
  'privacy_title',
  'privacy_body',
  'checkout_eyebrow',
  'checkout_title',
  'checkout_body',
]);

const HERO_DUPLICATE_PREFIX = 'home.hero.';

export function isHeroDuplicateHomeKey(key) {
  if (!key.startsWith(HERO_DUPLICATE_PREFIX)) return false;
  return HERO_DUPLICATE_HOME_SUFFIXES.has(key.slice(HERO_DUPLICATE_PREFIX.length));
}

/** Locales whose home.* tree is fully authored by build-locales (not EN backfill). */
export const BUILD_MANAGED_HOME_LOCALES = new Set(['nl.json']);

export function shouldSkipSyncKey(localeFile, key) {
  if (BUILD_MANAGED_HOME_LOCALES.has(localeFile) && key.startsWith('home.')) return true;
  if (isHeroDuplicateHomeKey(key)) return true;
  return false;
}

/** Native UI labels — applied when missing or still equal to EN fallback. */
export const LOCALE_NATIVE_STRINGS = {
  nl: {
    'language.label': 'Taal',
    'accessibility.configure_steps': 'Afrekenstappen',
  },
  de: {
    'language.label': 'Sprache',
    'accessibility.configure_steps': 'Kassenschritte',
    'accessibility.scroll_to_content': 'Zum Inhalt scrollen',
    'home.proof.summary_eyebrow': 'Warum aus Zögern Vertrauen wird',
    'home.proof.summary_body':
      'Kevin ist einfach zu platzieren, datenschutzfreundlich konzipiert und am überzeugendsten aus genau der Perspektive, die zählt: von außen.',
  },
  fr: {
    'language.label': 'Langue',
    'accessibility.configure_steps': 'Étapes de paiement',
    'accessibility.scroll_to_content': 'Faire défiler vers le contenu',
    'home.proof.summary_eyebrow': 'Pourquoi le doute se transforme en confiance',
    'home.proof.summary_body':
      "Kevin est simple à installer, conçu pour la confidentialité, et le plus convaincant du point de vue qui compte : depuis l'extérieur.",
  },
  cs: {
    'language.label': 'Jazyk',
    'accessibility.configure_steps': 'Kroky pokladny',
    'accessibility.scroll_to_content': 'Přejít na obsah',
    'home.proof.summary_eyebrow': 'Proč se pochybnost mění v důvěru',
    'home.proof.summary_body':
      'Kevin se snadno umístí, je navržen s důrazem na soukromí a nejvíce přesvědčí z perspektivy, na které záleží: zvenčí.',
  },
};

export function localeCodeFromFile(file) {
  return file.replace(/\.json$/, '');
}
