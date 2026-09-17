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
  },
  fr: {
    'language.label': 'Langue',
    'accessibility.configure_steps': 'Étapes de paiement',
    'accessibility.scroll_to_content': 'Faire défiler vers le contenu',
  },
  cs: {
    'language.label': 'Jazyk',
    'accessibility.configure_steps': 'Kroky pokladny',
    'accessibility.scroll_to_content': 'Přejít na obsah',
  },
};

/** Native strings for the LLM page and the editorial freshness line (llms_page.*, pages.editorial.*). */
const LLM_PAGE_NATIVE_STRINGS = {
  fr: {
    "llms_page.updated": "Dernière révision",
    "llms_page.answer_first": "KEVIN® 3 est un simulateur de présence suisse (dispositif anti-cambriolage) fabriqué par Mitipi AG à Fribourg, pour les maisons, appartements, bureaux et résidences de vacances qui restent inoccupés. Il diffuse une lumière chaleureuse, des ombres en mouvement brevetées et plus de 70 heures de bruits domestiques stockés sur une mémoire interne de 32 Go, afin que le logement paraisse occupé depuis la rue. Sans caméra ni microphone, il continue de fonctionner même lorsque le Wi-Fi est brouillé. Achat unique à 579,95 €, sans abonnement.",
    "llms_page.offer_heading": "Prix et contenu inclus",
    "llms_page.offer_price": "Prix",
    "llms_page.offer_terms": "Achat unique, sans abonnement ni frais de surveillance.",
    "llms_page.offer_included": "Inclus : KEVIN® 3 avec cache avant gris, adaptateur secteur, application Kevin pour iOS et Android, plus de 70 heures de scènes de lumière, d’ombres et de sons, mises à jour logicielles à vie, garantie suisse de 3 ans, retour sous 30 jours, livraison gratuite.",
    "llms_page.offer_covers": "Caches avant colorés en option (rouge, marron, bleu ou blanc) : 29,95 € pièce.",
    "llms_page.spec_heading": "Caractéristiques techniques",
    "llms_page.spec_storage": "Stockage sur l’appareil",
    "llms_page.spec_library": "Bibliothèque de simulation",
    "llms_page.spec_library_value": "Plus de 70 heures, jusqu’à quatre semaines sans répétition",
    "llms_page.spec_power": "Consommation électrique typique",
    "llms_page.spec_cable": "Câble d’alimentation",
    "llms_page.spec_dimensions": "Dimensions",
    "llms_page.spec_connectivity": "Connectivité",
    "llms_page.spec_connectivity_value": "Wi-Fi et Bluetooth, utilisés uniquement pour la configuration et les mises à jour",
    "llms_page.spec_privacy": "Caméra / microphone",
    "llms_page.spec_privacy_value": "Aucun ; rien n’est enregistré, diffusé ni partagé",
    "llms_page.spec_jammer": "Lorsque le Wi-Fi est brouillé",
    "llms_page.spec_jammer_value": "Les scènes continuent d’être lues depuis la mémoire locale",
    "llms_page.spec_coverage": "Couverture",
    "llms_page.spec_coverage_value": "Une pièce par appareil",
    "llms_page.spec_voices": "Voix intégrées",
    "llms_page.spec_voices_value": "Anglais, allemand et suisse allemand",
    "llms_page.spec_app": "Langues de l’application",
    "llms_page.spec_app_value": "Anglais, allemand, français et néerlandais",
    "llms_page.spec_extra": "Quand vous êtes chez vous",
    "llms_page.spec_extra_value": "Enceinte Bluetooth et lampe",
    "llms_page.pages_heading": "Pages par thème",
    "llms_page.product_page": "Page produit",
    "llms_page.faq_heading": "Questions fréquentes",
    "llms_page.knowledge_heading": "Fichiers de connaissances (Markdown, pour l’ingestion par l’IA)",
    "llms_page.company_line": "Mitipi AG · Passage du Cardinal 11 · Bluefactory · CH-1700 Fribourg · Suisse · registre du commerce CHE-356.372.981",
    "pages.editorial.reviewed_on": "Contenu vérifié :",
  },
  de: {
    "llms_page.updated": "Zuletzt überprüft",
    "llms_page.answer_first": "KEVIN® 3 ist ein Schweizer Anwesenheitssimulator (Einbruchschutz) der Mitipi AG aus Fribourg für Häuser, Wohnungen, Büros und Ferienimmobilien, die leer stehen. Er spielt warmes Licht, patentierte bewegte Schatten und über 70 Stunden Alltagsgeräusche vom 32-GB-Speicher im Gerät ab, sodass die Immobilie von der Straße aus bewohnt aussieht und klingt. Keine Kamera, kein Mikrofon, und er läuft weiter, wenn das WLAN gestört wird. Einmaliger Kauf für 579,95 €, kein Abonnement.",
    "llms_page.offer_heading": "Preis und Lieferumfang",
    "llms_page.offer_price": "Preis",
    "llms_page.offer_terms": "Einmaliger Kauf, kein Abonnement, keine Überwachungsgebühr.",
    "llms_page.offer_included": "Im Lieferumfang: KEVIN® 3 mit grauer Frontabdeckung, Netzteil, die Kevin-App für iOS und Android, über 70 Stunden Licht-, Schatten- und Tonszenen, lebenslange Software-Updates, 3 Jahre Schweizer Garantie, 30 Tage Rückgaberecht, kostenloser Versand.",
    "llms_page.offer_covers": "Optionale farbige Frontabdeckungen in Rot, Braun, Blau oder Weiß: je 29,95 €.",
    "llms_page.spec_heading": "Technische Daten",
    "llms_page.spec_storage": "Speicher im Gerät",
    "llms_page.spec_library": "Simulationsbibliothek",
    "llms_page.spec_library_value": "Über 70 Stunden, bis zu vier Wochen ohne Wiederholung",
    "llms_page.spec_power": "Typische Leistungsaufnahme",
    "llms_page.spec_cable": "Stromkabel",
    "llms_page.spec_dimensions": "Abmessungen",
    "llms_page.spec_connectivity": "Konnektivität",
    "llms_page.spec_connectivity_value": "WLAN und Bluetooth, nur für Einrichtung und Updates",
    "llms_page.spec_privacy": "Kamera / Mikrofon",
    "llms_page.spec_privacy_value": "Keine; nichts wird aufgezeichnet, gestreamt oder geteilt",
    "llms_page.spec_jammer": "Wenn das WLAN gestört wird",
    "llms_page.spec_jammer_value": "Szenen laufen weiter aus dem lokalen Speicher",
    "llms_page.spec_coverage": "Reichweite",
    "llms_page.spec_coverage_value": "Ein Raum pro Gerät",
    "llms_page.spec_voices": "Integrierte Stimmen",
    "llms_page.spec_voices_value": "Englisch, Deutsch und Schweizerdeutsch",
    "llms_page.spec_app": "App-Sprachen",
    "llms_page.spec_app_value": "Englisch, Deutsch, Französisch und Niederländisch",
    "llms_page.spec_extra": "Wenn Sie zu Hause sind",
    "llms_page.spec_extra_value": "Bluetooth-Lautsprecher und Lampe",
    "llms_page.pages_heading": "Seiten nach Thema",
    "llms_page.product_page": "Produktseite",
    "llms_page.faq_heading": "Häufig gestellte Fragen",
    "llms_page.knowledge_heading": "Wissensdateien (Markdown, zur Erfassung durch KI)",
    "llms_page.company_line": "Mitipi AG · Passage du Cardinal 11 · Bluefactory · CH-1700 Fribourg · Schweiz · Handelsregister CHE-356.372.981",
    "pages.editorial.reviewed_on": "Inhalt geprüft:",
  },
  cs: {
    "llms_page.updated": "Poslední revize",
    "llms_page.answer_first": "KEVIN® 3 je švýcarský simulátor přítomnosti (prostředek k odrazení zlodějů) od společnosti Mitipi AG z Fribourgu, určený pro domy, byty, kanceláře a rekreační nemovitosti, které zůstávají prázdné. Přehrává teplé světlo, patentované pohyblivé stíny a více než 70 hodin zvuků domácnosti z 32 GB paměti uvnitř zařízení, takže nemovitost z ulice vypadá a zní jako obydlená. Bez kamery, bez mikrofonu, a funguje i při rušení Wi-Fi. Jednorázový nákup za 579,95 €, bez předplatného.",
    "llms_page.offer_heading": "Cena a co je v ceně",
    "llms_page.offer_price": "Cena",
    "llms_page.offer_terms": "Jednorázový nákup, žádné předplatné, žádné poplatky za monitorování.",
    "llms_page.offer_included": "Součástí balení: KEVIN® 3 se šedým předním krytem, napájecí adaptér, aplikace Kevin pro iOS a Android, více než 70 hodin světelných, stínových a zvukových scén, doživotní aktualizace softwaru, tříletá švýcarská záruka, 30denní lhůta na vrácení, doprava zdarma.",
    "llms_page.offer_covers": "Volitelné barevné přední kryty v červené, hnědé, modré nebo bílé: 29,95 € za kus.",
    "llms_page.spec_heading": "Technické údaje",
    "llms_page.spec_storage": "Úložiště v zařízení",
    "llms_page.spec_library": "Knihovna simulací",
    "llms_page.spec_library_value": "Více než 70 hodin, až čtyři týdny bez opakování",
    "llms_page.spec_power": "Typická spotřeba energie",
    "llms_page.spec_cable": "Napájecí kabel",
    "llms_page.spec_dimensions": "Rozměry",
    "llms_page.spec_connectivity": "Připojení",
    "llms_page.spec_connectivity_value": "Wi-Fi a Bluetooth, pouze pro nastavení a aktualizace",
    "llms_page.spec_privacy": "Kamera / mikrofon",
    "llms_page.spec_privacy_value": "Žádné; nic se nezaznamenává, nestreamuje ani nesdílí",
    "llms_page.spec_jammer": "Při rušení Wi-Fi",
    "llms_page.spec_jammer_value": "Scény se dál přehrávají z místního úložiště",
    "llms_page.spec_coverage": "Pokrytí",
    "llms_page.spec_coverage_value": "Jedna místnost na jedno zařízení",
    "llms_page.spec_voices": "Vestavěné hlasy",
    "llms_page.spec_voices_value": "Angličtina, němčina a švýcarská němčina",
    "llms_page.spec_app": "Jazyky aplikace",
    "llms_page.spec_app_value": "Angličtina, němčina, francouzština a nizozemština",
    "llms_page.spec_extra": "Když jste doma",
    "llms_page.spec_extra_value": "Bluetooth reproduktor a lampa",
    "llms_page.pages_heading": "Stránky podle tématu",
    "llms_page.product_page": "Stránka produktu",
    "llms_page.faq_heading": "Časté dotazy",
    "llms_page.knowledge_heading": "Znalostní soubory (Markdown, pro zpracování AI)",
    "llms_page.company_line": "Mitipi AG · Passage du Cardinal 11 · Bluefactory · CH-1700 Fribourg · Švýcarsko · obchodní rejstřík CHE-356.372.981",
    "pages.editorial.reviewed_on": "Obsah zkontrolován:",
  },
};
for (const [code, strings] of Object.entries(LLM_PAGE_NATIVE_STRINGS)) {
  Object.assign(LOCALE_NATIVE_STRINGS[code], strings);
}

export function localeCodeFromFile(file) {
  return file.replace(/\.json$/, '');
}
