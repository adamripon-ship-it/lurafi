import fs from 'fs';
import path from 'path';
import {
  getLanguageLabels,
  getLocaleRouteMap,
  getPublishedLocales,
} from './i18n/registry.mjs';
import { customersEn, customersNl } from './customers-locale.mjs';

const root = path.join(import.meta.dirname, '..');
const languageLabels = getLanguageLabels();
const index = JSON.parse(fs.readFileSync(path.join(root, 'templates/index.json'), 'utf8'));

const en = {
  accessibility: {
    skip_to_text: 'Skip to content',
    home: '{{ shop.name }} home',
    open_menu: 'Open menu',
    close_menu: 'Close menu',
    decrease_qty: 'Decrease quantity',
    increase_qty: 'Increase quantity',
    color_swatches: 'Color',
    checkout_summary: 'Checkout summary',
    order_summary: 'Order summary',
    checkout_benefits: 'Checkout benefits',
    cart_items: 'Cart, {{ count }} items',
    cart_item: 'Cart, {{ count }} item',
    main_navigation: 'Main navigation',
    mobile_navigation: 'Mobile navigation',
    configure_navigation: 'Configure',
    configure_steps: 'Checkout steps',
    hero_benefits: 'Kevin benefits',
    llm_assets_nl: 'Dutch LLM summary',
    scroll_to_content: 'Scroll to content'
  },
  general: { search: { search: 'Search' } },
  language: {
    label: 'Language',
    ...getLanguageLabels(),
  },
  country: {
    label: 'Country / region',
  },
  header: {
    why_kevin: 'Why Kevin',
    product: 'Product',
    how_it_works: 'How it works',
    app: 'App',
    pricing: 'Pricing',
    buy: 'Buy',
    buy_now: 'Buy Now',
    menu: 'Menu',
    explore: 'Explore',
    buy_group: 'Buy',
    support: 'Support',
    setup_and_app: 'Setup and app',
    cart: 'Cart',
    log_in: 'Log in',
    account: 'Account'
  },
  footer: {
    note: 'Kevin simulates human presence using light, shadow, and sound. Actual deterrence results may vary. See product documentation for details.',
    product: 'Product',
    features: 'Features',
    how_it_works: 'How It Works',
    the_app: 'The App',
    pricing: 'Pricing',
    company: 'Company',
    about: 'About Kevin',
    press: 'Press',
    careers: 'Careers',
    support: 'Support',
    setup_guide: 'Setup Guide',
    contact: 'Contact Us',
    where_to_buy: 'Where to Buy',
    configure: 'Configure Kevin',
    cart: 'Cart',
    copyright: 'Copyright © {{ year }} {{ shop_name }}. All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Use',
    llm_summary: 'LLM summary'
  },
  seo: {
    home: {
      description:
        'When you are away, Kevin uses Swiss AI to simulate real human presence with light, shadow, and sound—so your home stays visibly lived-in and burglars move on.'
    },
    org_description:
      'When you are away, Kevin uses Swiss AI to simulate real human presence with light, shadow, and sound so your home stays visibly lived-in and burglars move on.',
    sitemap: {
      title: 'Sitemap — Lurafi & Kevin',
      description:
        'Human sitemap with links to all locales, Shopify sitemap.xml, AI sitemap, llms.txt short summaries, and llms-full.txt complete guides for search engines and LLM crawlers.'
    },
    llms: {
      title: 'LLM site summary — Kevin presence simulation',
      description:
        'Plain-text overview for AI assistants: product facts, URLs, and links to llms.txt and llms-full.txt machine-readable files.'
    }
  },
  products: {
    product: {
      add_to_cart: 'Add to cart',
      buy_now: 'Buy now',
      configure_buy: 'Configure & buy',
      sold_out: 'Sold out',
      image_alt: 'Kevin smart home security device'
    }
  },
  sections: { cart: { title: 'Your cart' } },
  cart: {
    empty: 'Your cart is empty',
    continue_shopping: 'Continue shopping',
    checkout: 'Checkout',
    free_delivery: 'Free delivery',
    returns: '30-day returns',
    secure: 'Secure checkout'
  },
  configure: {
    back: 'Back',
    nav_title: 'Configure your Kevin',
    cart: 'Cart',
    step_configure: 'Configure',
    step_checkout: 'Checkout',
    header_eyebrow: 'Secure checkout',
    title: 'Choose your Kevin.',
    lede: 'Pick your color and plan—you are one step from a home that never looks empty.',
    color_label: 'Front Cover Color',
    color_prefix: 'Color:',
    plan_label: 'Choose Your Plan',
    plan_buy: 'Buy',
    plan_buy_sub: 'One-time purchase',
    plan_badge_popular: 'Most popular',
    plan_sub: 'Kevin+',
    plan_sub_sub: 'Monthly subscription',
    plan_sub_badge: 'Flexible',
    billing: 'Billing',
    quantity: 'Quantity',
    qty_hint: 'Recommended: 2 devices for homes with multiple floors',
    included: 'Included',
    order_summary: 'Order summary',
    product_title: 'Kevin presence simulator',
    summary_front: 'Front',
    summary_plan: 'Plan',
    summary_delivery: 'Delivery',
    delivery_free: 'Free',
    total: 'Total',
    checkout_cta: 'Continue to checkout',
    sticky_checkout: 'Checkout',
    free_delivery: 'Free delivery',
    returns: '30-day returns',
    warranty: '3-year warranty',
    secure: 'Secure checkout powered by Shopify',
    buy_features:
      'Own your device outright|70+ hours of believable AI presence|Control everything from the Kevin App|Free delivery across Europe|3-year Swiss warranty|Lifetime software updates included',
    sub_features:
      'Device included—nothing upfront|Premium AI library that keeps improving|New simulations as threats evolve|Hardware replacement if anything fails|Cancel anytime|Free delivery and returns',
    summary_plan_buy: 'One-time purchase',
    summary_plan_sub: 'Kevin+ monthly',
    per_device: ' per device',
    error_products: 'Please assign products in Theme settings → Products.',
    error_checkout: 'Online checkout is almost ready. Email hello@lurafi.ai to order, or try again soon.',
    processing: 'Processing…',
    device_alt: 'Kevin device'
  },
  hero: {
    callouts_aria_label: 'Kevin benefits',
    away_eyebrow: 'Away mode',
    away_title: 'Living room active',
    away_body: 'Light, shadow, and sound vary automatically.',
    privacy_eyebrow: 'Privacy',
    privacy_title: 'No cameras. No mics.',
    privacy_body: 'Simulation plays locally on the device.',
    checkout_eyebrow: 'Checkout',
    checkout_title: 'Free delivery',
    checkout_body: 'Secure Shopify checkout.'
  },
  home: {},
  stats: { swiss_engineered: 'Swiss Engineered' },
  sitemap: {
    overline: 'SEO sitemap',
    heading: 'Sitemap for people, search engines, and AI assistants.',
    lede: 'Key Lurafi and Kevin resources in one place, including AI-readable summaries for AEO and GEO discovery.',
    primary: 'Primary pages',
    homepage: 'Homepage',
    configure_buy: 'Configure / buy Kevin',
    configure_sub: 'Kevin+ subscription',
    cart: 'Cart',
    ai_files: 'AI and LLM files',
    short_llm: 'Short LLM summary',
    full_llm: 'Full LLM summary',
    ai_sitemap: 'AI sitemap XML',
    llm_page: 'LLM page',
    search_sitemaps: 'Search engine sitemaps',
    shopify_sitemap: 'Shopify XML sitemap',
    ai_geo_sitemap: 'AI / AEO / GEO XML sitemap',
    robots: 'Robots.txt discovery file',
    human_sitemap: 'Human-readable sitemap',
    ai_files_hint: 'Start with the short LLM file; follow the link inside to the full summary. Both are listed in sitemap-ai.xml and Shopify sitemap.xml.',
    llms_points_to_full: 'links to full summary'
  },
  llms_page: {
    ai_discovery: 'AI / LLM machine-readable files',
    short_points_to_full: 'Each short llms.txt file links to its matching llms-full.txt for complete brand and product context.',
    oneliner:
      'When you are away, Kevin uses Swiss AI to simulate real human presence with light, shadow, and sound—so your home stays visibly lived-in and burglars move on.',
    what_we_sell: 'What we sell',
    buy_bullet:
      '**Kevin (Buy)**: One-time purchase. Device with 70+ hours of believable AI presence, Kevin App control, free delivery in Europe, 3-year Swiss warranty.',
    sub_bullet:
      '**Kevin+ (Subscribe)**: Monthly plan with device included, premium AI library, hardware replacement, cancel anytime.',
    how_heading: 'How it works',
    how_1: 'Plug in near a window.',
    how_2: 'Set a schedule or let Kevin activate when you leave.',
    how_3: 'Your home never looks empty—light, shadow, and sound adapt over time.',
    diff_heading: 'Key differentiators',
    diff_1: 'Prevention, not reaction (vs alarms that trigger after entry)',
    diff_2: 'No cameras, no microphones',
    diff_3: 'Swiss-engineered AI; ~9W power',
    diff_4: 'Qualitative daytime burglary risk positioning (no unsourced police statistics)',
    urls_heading: 'Primary URLs',
    contact_heading: 'Contact',
    brand_heading: 'Brand',
    tagline: 'Tagline: Presence that prevents.',
    character: 'Character: Homeowners in Switzerland/Europe who want peace of mind when away.',
    guide: 'Guide: Swiss-engineered AI presence simulation.',
    lede:
      'Swiss AI presence simulation for your home. When you are away, Kevin uses light, shadow, and sound so your home looks and sounds lived-in—and burglars move on.'
  },
  faq: {
    q1: 'What is Kevin?',
    a1: 'Kevin is Swiss AI presence simulation for your home. It uses light, shadow, and sound to make your home look and sound lived-in when you are away.',
    q2: 'How is Kevin different from alarms and cameras?',
    a2: 'Alarms react after entry. Cameras record evidence but rarely deter in the moment. Kevin focuses on prevention so your home never looks empty from the street.',
    q3: 'Does Kevin use cameras or microphones?',
    a3: 'No. Kevin simulates presence with light, shadow, and sound only. No cameras and no microphones in your home. Simulations are stored locally on the device, not streamed from the cloud or shared with third parties.',
    q4: 'How do I buy Kevin?',
    a4: 'Choose your color and plan on the configure page, then continue to secure Shopify checkout with free delivery across Europe and a 3-year Swiss warranty.'
  },
  errors: {
    not_found_title: 'Page not found',
    not_found_body: 'The page you are looking for does not exist.'
  }
};


en.home.specs = en.home.specs || {};
en.home.specs.rows = {
  dimensions: { label: 'Size', value: 'Approx. 21.2 × 10.2 × 9.2 cm' },
  power: { label: 'Power', value: 'Mains powered with 3 m cable; typical use around 9 W' },
  connectivity: { label: 'Connectivity', value: 'Wi-Fi, Bluetooth, app control, and local on-device playback' },
  privacy: { label: 'Privacy', value: 'No camera. No microphone. No listening. No third-party sharing.' },
  storage: { label: 'Simulation library', value: '70+ hours of activities and sounds stored locally on the device' },
  placement: { label: 'Best placement', value: 'Near a visible window, with a wall or ceiling for shadows' }
};

en.spec_row = {
  dimensions_label: 'Size', dimensions_value: 'Approx. 21.2 × 10.2 × 9.2 cm',
  power_label: 'Power', power_value: 'Mains powered with 3 m cable; typical use around 9 W',
  connectivity_label: 'Connectivity', connectivity_value: 'Wi-Fi, Bluetooth, app control, and local on-device playback',
  privacy_label: 'Privacy', privacy_value: 'No camera. No microphone. No listening. No third-party sharing.',
  storage_label: 'Simulation library', storage_value: '70+ hours of activities and sounds stored locally on the device',
  placement_label: 'Best placement', placement_value: 'Near a visible window, with a wall or ceiling for shadows'
};

en.colors = {
  grey: 'Grey', white: 'White', burgundy: 'Burgundy', red: 'Red', espresso: 'Espresso', brown: 'Brown', navy: 'Navy', blue: 'Blue'
};
en.configure.device_in = 'Kevin in {{ color }}';

function nonBlankSectionSettings(sec) {
  const settings = {};
  if (!sec?.settings) return settings;
  for (const [key, val] of Object.entries(sec.settings)) {
    if (typeof val === 'string' && val.trim() !== '') settings[key] = val;
  }
  return settings;
}

/** Canonical EN homepage copy — theme index.json stays empty; locales are source of truth. */
const enHome = JSON.parse(fs.readFileSync(path.join(root, 'config/home-en.json'), 'utf8'));

en.home = {};
for (const [id, sec] of Object.entries(index.sections)) {
  const overrides = nonBlankSectionSettings(sec);
  const hasCmsOverrides = Object.keys(overrides).length > 0;
  if (hasCmsOverrides) {
    // CMS guard: section settings in index.json win; do not merge home-en.json for this section
    en.home[id] = { ...(en.home[id] || {}), ...overrides };
  } else {
    en.home[id] = { ...(enHome[id] || {}), ...overrides };
  }
}

if (en.home.app) {
  en.home.app.carousel_label = 'App screenshots';
}

en.accessibility.previous = 'Previous';
en.accessibility.next = 'Next';

const nlHome = {
  hero: {
    eyebrow: 'Zwitserse aanwezigheidssimulatie',
    headline: 'Laat je huis levend lijken.',
    lede: 'Kevin gebruikt Zwitsers ontworpen licht, schaduw en alledaags geluid zodat je huis bewoond aanvoelt voordat iemand de deur test.',
    cta_primary_label: 'Koop Kevin',
    cta_secondary_label: 'Hoe het werkt'
  },
  problem: {
    overline: 'Het probleem',
    heading: 'Leeg nodigt uit.',
    subheading:
      'De meeste beveiligingsproducten reageren pas als het risico al begonnen is. Kevin is gemaakt voor het moment ervoor: wanneer een huis, flat of kantoor van buitenaf bewoond moet lijken.',
    tile_1_title: 'Alarmen reageren',
    tile_1_body:
      'Een sirene gaat af na binnenkomst. Kevin voegt zichtbare aanwezigheid toe van tevoren, zodat je woning het moeilijkere doelwit lijkt.',
    tile_2_title: "Camera's registreren",
    tile_2_body:
      'Beelden kunnen later helpen, maar maken een stille kamer niet bewoond. Inbrekers rekenen nog steeds op snelheid en afstand.',
    tile_3_title: 'Licht is voorspelbaar',
    tile_3_body:
      'Timers zetten lampen aan en uit. Kevin creëert veranderende schaduwen, tv-achtig flikkerlicht en huishoudelijke geluiden die natuurlijker aanvoelen.'
  },
  solution: {
    overline: 'De Kevin-methode',
    heading: 'Afschrikking die menselijk aanvoelt.',
    subheading:
      'Plaats Kevin bij een muur of plafond die als podium kan dienen. Van buitenaf maken gecoördineerd licht, beweging en geluid de kamer actief, niet geautomatiseerd.',
    pillar_1_title: 'Warm licht',
    pillar_1_body:
      'Heldere, warme scènes laten een kamer bewoond lijken in plaats van alleen verlicht. Kevin varieert het ritme voor ochtend, avond en nacht.',
    pillar_2_title: 'Bewegende schaduwen',
    pillar_2_body:
      'Geprojecteerde silhouetten en verschuivend licht suggereren mensen in de ruimte, zonder camera’s of microfoons.',
    pillar_3_title: 'Alledaags geluid',
    pillar_3_body:
      'Keukengeluiden, tv-sfeer, voetstappen, stemmen en je eigen opnames maken de simulatie persoonlijker en minder repetitief.'
  },
  steps: {
    overline: 'Het plan',
    heading: 'Aansluiten. Routines instellen. Rustig vertrekken.',
    subheading:
      'Geen installatie, geen bekabeling, geen maandelijks monitoringpaneel. Kevin start met een eenvoudige setup en wordt nuttiger via schema’s, geofencing en updates.',
    step_1_title: 'Plaats Kevin',
    step_1_body:
      'Zet hem bij een zichtbaar raam met een muur of plafond voor schaduwen. Sluit stroom aan en laat de kamer het podium worden.',
    step_2_title: 'Stel je routine in',
    step_2_body:
      'Gebruik de app voor weekschema’s, vakantiemodus of geo-activering wanneer je het gebied verlaat.',
    step_3_title: 'Blijf geloofwaardig',
    step_3_body:
      'Kevin speelt gevarieerde licht- en geluidsscenario’s vanaf lokale opslag, zodat je routines niet uit de cloud worden gestreamd of met derden worden gedeeld.',
    stat_1_label: 'Installatietijd',
    stat_2_label: 'Kabels nodig',
    stat_3_label: 'Privacy',
    stat_4_label: 'Bescherming'
  },
  app: {
    overline: 'Kevin-app',
    heading: 'Aanwezigheid op jouw schema.',
    subheading:
      'Zet Kevin aan, plan weekroutines en beheer meerdere apparaten vanuit één eenvoudige app voor gemoedsrust.',
    tile_1_title: 'Weekschema’s',
    tile_1_body:
      'Plan ochtend, avond, nacht, weekenden en vakanties zodat je huis een geloofwaardig ritme volgt terwijl je weg bent.',
    tile_2_title: 'Geo-activering',
    tile_2_body:
      'Kevin kan starten wanneer je het gebied verlaat, terwijl je handmatig een simulatie kunt starten voor korte boodschappen.',
    tile_3_title: 'Je eigen geluiden',
    tile_3_body:
      'Upload opnames en label ze per kamer of activiteit zodat de simulatie meer op jouw huishouden klinkt.',
    tile_4_title: 'Meerdere locaties',
    tile_4_body:
      'Gebruik meer dan één Kevin voor appartementen, extra verdiepingen, kantoren of tweede woningen die niet verlaten mogen lijken.'
  },
  personas: {
    overline: 'Gemaakt voor jou',
    heading: 'Een slimmere laag voor het echte leven.',
    subheading:
      'Of je nu reist, pendelt, een klein kantoor runt of al een alarm hebt: Kevin voegt het ontbrekende signaal toe—iemand lijkt er te zijn.',
    persona_1_title: 'Vaak op reis',
    persona_1_body:
      'Weekend weg of lange vakantie: Kevin houdt de kamer actief met gevarieerde scènes in plaats van een vaste lichttimer.',
    persona_1_quote: '"Ik wilde dat het huis bewoond aanvoelde, niet alleen verlicht. Kevin geeft me dat."',
    persona_2_title: 'Al een alarm?',
    persona_2_body:
      'Houd het. Kevin vult detectie aan met afschrikking, zodat je huis bewoond lijkt voordat iemand binnenkomst overweegt.',
    persona_2_quote: '"Ons alarm vertelt ons als er iets gebeurt. Kevin helpt het huis het verkeerde doelwit te laten lijken."',
    persona_3_title: 'Meerdere kamers of woningen',
    persona_3_body:
      'Eén apparaat beschermt één zichtbaar podium. Voeg meer Kevin’s toe voor extra verdiepingen, kantoren of tweede woningen.',
    persona_3_quote: '"We gebruiken Kevin waar de straat de kamer kan zien. Het verandert het gevoel van buitenaf."'
  },
  stats: {
    heading: 'Gebouwd voor geloofwaardige afschrikking.',
    stat_1_label: 'Risicovermindering volgens Mitipi',
    stat_2_label: 'Ingebouwde simulaties',
    stat_3_label: 'Typisch energieverbruik',
    stat_4_label: "Camera's of microfoons"
  },
  proof: {
    heading: 'Realistisch waar het telt: van buitenaf.',
    quote_1:
      '"Vanaf de stoep laten licht en beweging de kamer bewoond lijken. Precies wat ik wilde."',
    author_1_location: 'Zürich, Zwitserland',
    quote_2:
      '"Een vriend dacht dat er iemand binnen was en belde aan. Kevin deed zijn werk voordat iemand de deur bereikte."',
    author_2_location: 'Lyon, Frankrijk',
    quote_3:
      '"De schaduweffecten vallen op. Vanuit het trappenhuis voelt het appartement niet leeg."',
    author_3_location: 'München, Duitsland',
    summary_eyebrow: 'Waarom twijfel verandert in vertrouwen',
    summary_body:
      'Kevin is eenvoudig te plaatsen, privacy-first ontworpen en het meest overtuigend vanuit het perspectief dat telt: buiten het huis.'
  },
  pricing: {
    overline: 'Prijzen',
    heading: 'Kies je beveiligingslaag.',
    subheading:
      'Koop Kevin direct of neem een maandabonnement. Beide bieden privacy-first aanwezigheidssimulatie om af te schrikken voordat een alarm nodig is.',
    buy_label: 'Eenmalige aankoop',
    buy_tagline: 'Voor altijd van jou.',
    buy_cta: 'Nu kopen',
    sub_label: 'Maandabonnement',
    sub_tagline: 'Apparaat inbegrepen. Altijd opzegbaar.',
    sub_cta: 'Nu abonneren',
    buy_features:
      'Volledig eigendom|70+ uur ingebouwde simulaties|Weekschema’s en geo-activering|Eigen huishoudelijke geluiden uploaden|Flexibele plaatsing met 3 m stroomkabel|Gratis bezorging|3 jaar garantie',
    sub_features:
      'Apparaat gratis inbegrepen|Premium simulatiebibliotheek|Regelmatige software-updates|Prioritaire support|Hardwarevervanging|Flexibel voor meerdere kamers of woningen|Gratis bezorging'
  },

  specs: {
    eyebrow: 'In het kort',
    heading: 'Ontworpen om eenvoudig, privé en draagbaar te zijn.',
    rows: {
      dimensions: { label: 'Afmeting', value: 'Ca. 21,2 × 10,2 × 9,2 cm' },
      power: { label: 'Stroom', value: 'Netstroom met 3 m kabel; typisch verbruik rond 9 W' },
      connectivity: { label: 'Connectiviteit', value: 'Wi-Fi, Bluetooth, app-bediening en lokale weergave op het apparaat' },
      privacy: { label: 'Privacy', value: 'Geen camera. Geen microfoon. Geen afluisteren. Geen delen met derden.' },
      storage: { label: 'Simulatiebibliotheek', value: '70+ uur activiteiten en geluiden lokaal opgeslagen op het apparaat' },
      placement: { label: 'Beste plaatsing', value: 'Bij een zichtbaar raam, met een muur of plafond voor schaduwen' }
    }
  },

  cta: {
    heading: 'Vertrek zonder het te verkondigen.',
    subheading:
      'Kevin laat je huis actief lijken en klinken met Zwitsers ontworpen aanwezigheidssimulatie. Gratis bezorging. 60 seconden setup. Geen camera’s of microfoons.',
    primary_cta: 'Koop Kevin',
    secondary_cta: 'Meer informatie'
  }
};



en.cart.drawer_title = 'Your bag';
en.cart.close = 'Close cart';
en.cart.edit_configuration = 'Edit configuration';
en.cart.quantity = 'Quantity';
en.cart.quantity_for = 'Quantity for {{ product }}';
en.cart.remove = 'Remove';
en.cart.subtotal = 'Subtotal:';
en.cart.delivery_method = 'Delivery method';
en.cart.delivery_value = 'Free delivery (Europe)';
en.cart.delivery_note = 'Shown as a free shipping rate in checkout. Taxes are calculated at checkout.';
en.cart.checkout_trust = 'Secure Shopify checkout';
en.cart.update = 'Update cart';
en.cart.empty_configure_note = 'Configure Kevin to continue to checkout with free delivery.';
en.cart.empty_configure_cta = 'Configure your Kevin';
en.cart.free_delivery_checkout = 'Free delivery selected at checkout';
en.cart.drawer_delivery = 'Free delivery selected at checkout · 30-day returns';
en.cart.secure_shopify = 'Secure Shopify checkout';
en.products.product.shipping_note = 'Ships free · 60-second setup · 3-year warranty';
en.errors.back_home = 'Back to home';
en.customers = customersEn;

en.stats.badge_1 = 'European Security Award 2024';
en.stats.badge_3 = 'No monitoring subscription';
en.stats.badge_4 = 'On-device simulation';

const nl = JSON.parse(JSON.stringify(en));
if (nl.home.app) {
  nl.home.app.carousel_label = 'App-screenshots';
}
nl.accessibility = {
  skip_to_text: 'Ga naar inhoud',
  home: '{{ shop.name }} startpagina',
  open_menu: 'Menu openen',
  close_menu: 'Menu sluiten',
  decrease_qty: 'Aantal verlagen',
  increase_qty: 'Aantal verhogen',
  color_swatches: 'Kleur',
  checkout_summary: 'Afrekenoverzicht',
  order_summary: 'Besteloverzicht',
  checkout_benefits: 'Afrekenvoordelen',
  cart_items: 'Winkelwagen, {{ count }} artikelen',
  cart_item: 'Winkelwagen, {{ count }} artikel',
  main_navigation: 'Hoofdnavigatie',
  mobile_navigation: 'Mobiele navigatie',
  configure_navigation: 'Configureren',
  configure_steps: 'Afrekenstappen',
  hero_benefits: 'Kevin-voordelen',
  llm_assets_nl: 'Nederlandse LLM-samenvatting',
  previous: 'Vorige',
  next: 'Volgende',
  scroll_to_content: 'Naar inhoud scrollen'
};
en.language = { label: 'Language', ...languageLabels };
nl.language = { label: 'Taal', ...languageLabels };
nl.header = {
  why_kevin: 'Waarom Kevin',
  product: 'Product',
  how_it_works: 'Hoe het werkt',
  app: 'App',
  pricing: 'Prijzen',
  buy: 'Kopen',
  buy_now: 'Nu kopen',
  menu: 'Menu',
  explore: 'Ontdekken',
  buy_group: 'Kopen',
  support: 'Support',
  setup_and_app: 'Setup en app',
  cart: 'Winkelwagen',
  log_in: 'Inloggen',
  account: 'Account'
};
nl.customers = customersNl;
nl.footer = {
  note: 'Kevin simuleert menselijke aanwezigheid met licht, schaduw en geluid. Resultaten kunnen variëren. Zie productdocumentatie voor details.',
  product: 'Product',
  features: 'Functies',
  how_it_works: 'Hoe het werkt',
  the_app: 'De app',
  pricing: 'Prijzen',
  company: 'Bedrijf',
  about: 'Over Kevin',
  press: 'Pers',
  careers: 'Vacatures',
  support: 'Support',
  setup_guide: 'Installatiegids',
  contact: 'Contact',
  where_to_buy: 'Waar te kopen',
  configure: 'Kevin configureren',
  cart: 'Winkelwagen',
  copyright: 'Copyright © {{ year }} {{ shop_name }}. Alle rechten voorbehouden.',
  privacy: 'Privacybeleid',
  terms: 'Gebruiksvoorwaarden',
  llm_summary: 'LLM-samenvatting'
};
nl.seo = {
  home: {
    description:
      'Als je weg bent, simuleert Kevin met Zwitserse AI echte menselijke aanwezigheid met licht, schaduw en geluid—zodat je huis zichtbaar bewoond blijft en inbrekers verder gaan.'
  },
  org_description:
    'Als je weg bent, simuleert Kevin met Zwitserse AI echte menselijke aanwezigheid met licht, schaduw en geluid zodat je huis zichtbaar bewoond blijft en inbrekers verder gaan.'
};
nl.products = {
  product: {
    add_to_cart: 'In winkelwagen',
    buy_now: 'Nu kopen',
    configure_buy: 'Configureren en kopen',
    sold_out: 'Uitverkocht',
    image_alt: 'Kevin slimme thuisbeveiliging'
  }
};
nl.sections = { cart: { title: 'Je winkelwagen' } };
nl.cart = {
  empty: 'Je winkelwagen is leeg',
  continue_shopping: 'Verder winkelen',
  checkout: 'Afrekenen',
  free_delivery: 'Gratis bezorging',
  returns: '30 dagen retour',
  secure: 'Veilig afrekenen'
};
nl.configure = {
  back: 'Terug',
  nav_title: 'Configureer je Kevin',
  cart: 'Winkelwagen',
  step_configure: 'Configureren',
  step_checkout: 'Afrekenen',
  header_eyebrow: 'Veilig afrekenen',
  title: 'Kies je Kevin.',
  lede: 'Kies je kleur en plan—je bent één stap verwijderd van een huis dat nooit leeg lijkt.',
  color_label: 'Kleur voorkant',
  color_prefix: 'Kleur:',
  plan_label: 'Kies je plan',
  plan_buy: 'Kopen',
  plan_buy_sub: 'Eenmalige aankoop',
  plan_badge_popular: 'Meest gekozen',
  plan_sub: 'Kevin+',
  plan_sub_sub: 'Maandabonnement',
  plan_sub_badge: 'Flexibel',
  billing: 'Facturatie',
  quantity: 'Aantal',
  qty_hint: 'Aanbevolen: 2 apparaten voor woningen met meerdere verdiepingen',
  included: 'Inbegrepen',
  order_summary: 'Besteloverzicht',
  product_title: 'Kevin aanwezigheidssimulator',
  summary_front: 'Voorkant',
  summary_plan: 'Plan',
  summary_delivery: 'Bezorging',
  delivery_free: 'Gratis',
  total: 'Totaal',
  checkout_cta: 'Doorgaan naar afrekenen',
  sticky_checkout: 'Afrekenen',
  free_delivery: 'Gratis bezorging',
  returns: '30 dagen retour',
  warranty: '3 jaar garantie',
  secure: 'Veilig afrekenen via Shopify',
  buy_features:
    'Direct eigendom|70+ uur geloofwaardige AI-aanwezigheid|Alles via de Kevin-app|Gratis bezorging in Europa|3 jaar Zwitserse garantie|Levenslange software-updates',
  sub_features:
    'Apparaat inbegrepen—niets vooraf|Premium AI-bibliotheek|Nieuwe simulaties bij dreigingen|Hardwarevervanging bij defect|Altijd opzegbaar|Gratis bezorging en retour',
  summary_plan_buy: 'Eenmalige aankoop',
  summary_plan_sub: 'Kevin+ maandelijks',
  per_device: ' per apparaat',
  error_products: 'Wijs producten toe in Thema-instellingen → Producten.',
  error_checkout: 'Online afrekenen is bijna klaar. Mail hello@lurafi.ai om te bestellen, of probeer het binnenkort opnieuw.',
  processing: 'Bezig…',
  device_alt: 'Kevin-apparaat'
};
nl.hero = {
  callouts_aria_label: 'Kevin-voordelen',
  away_eyebrow: 'Weg-modus',
  away_title: 'Woonkamer actief',
  away_body: 'Licht, schaduw en geluid variëren automatisch.',
  privacy_eyebrow: 'Privacy',
  privacy_title: "Geen camera's. Geen microfoons.",
  privacy_body: 'Simulatie speelt lokaal op het apparaat.',
  checkout_eyebrow: 'Afrekenen',
  checkout_title: 'Gratis bezorging',
  checkout_body: 'Veilig afrekenen via Shopify.'
};
nl.home = {};
for (const [id, sec] of Object.entries(index.sections)) {
  nl.home[id] = { ...nonBlankSectionSettings(sec), ...(nlHome[id] || {}) };
}
nl.stats = { swiss_engineered: 'Zwitsers ontworpen' };
nl.sitemap = {
  overline: 'SEO-sitemap',
  heading: 'Sitemap voor mensen, zoekmachines en AI-assistenten.',
  lede: 'Belangrijke Lurafi- en Kevin-bronnen op één plek, inclusief AI-leesbare samenvattingen voor AEO en GEO.',
  primary: 'Hoofdpagina’s',
  homepage: 'Startpagina',
  configure_buy: 'Kevin configureren / kopen',
  configure_sub: 'Kevin+-abonnement',
  cart: 'Winkelwagen',
  ai_files: 'AI- en LLM-bestanden',
  short_llm: 'Korte LLM-samenvatting',
  full_llm: 'Volledige LLM-samenvatting',
  ai_sitemap: 'AI-sitemap XML',
  llm_page: 'LLM-pagina',
  search_sitemaps: 'Zoekmachine-sitemaps',
  shopify_sitemap: 'Shopify XML-sitemap',
  ai_geo_sitemap: 'AI / AEO / GEO XML-sitemap',
  robots: 'Robots.txt',
  human_sitemap: 'Sitemap voor mensen',
  ai_files_hint: 'Begin bij het korte LLM-bestand; daarin staat een link naar de volledige samenvatting. Beide staan in sitemap-ai.xml en sitemap.xml.',
  llms_points_to_full: 'verwijst naar volledige samenvatting'
};
nl.seo.sitemap = {
  title: 'Sitemap — Lurafi & Kevin',
  description:
    'Sitemap met alle talen, Shopify sitemap.xml, AI-sitemap, llms.txt korte samenvattingen en llms-full.txt volledige gidsen voor zoekmachines en LLM-crawlers.'
};
nl.seo.llms = {
  title: 'LLM-samenvatting — Kevin aanwezigheidssimulatie',
  description:
    'Platte-tekstoverzicht voor AI-assistenten: productfeiten, URL’s en links naar llms.txt en llms-full.txt.'
};
nl.llms_page = {
  ai_discovery: 'AI- en LLM-bestanden (machine-leesbaar)',
  short_points_to_full:
    'Elk kort llms.txt-bestand linkt naar het bijbehorende llms-full.txt voor volledige merk- en productcontext.',
  oneliner:
    'Als je weg bent, simuleert Kevin met Zwitserse AI echte menselijke aanwezigheid met licht, schaduw en geluid—zodat je huis zichtbaar bewoond blijft en inbrekers verder gaan.',
  what_we_sell: 'Wat we verkopen',
  buy_bullet:
    '**Kevin (Kopen)**: Eenmalige aankoop. Apparaat met 70+ uur geloofwaardige AI-aanwezigheid, Kevin-app, gratis bezorging in Europa, 3 jaar Zwitserse garantie.',
  sub_bullet:
    '**Kevin+ (Abonnement)**: Maandplan met apparaat inbegrepen, premium AI-bibliotheek, hardwarevervanging, altijd opzegbaar.',
  how_heading: 'Hoe het werkt',
  how_1: 'Aansluiten bij een raam.',
  how_2: 'Stel een schema in of laat Kevin activeren wanneer je vertrekt.',
  how_3: 'Je huis lijkt nooit leeg—licht, schaduw en geluid passen zich aan.',
  diff_heading: 'Belangrijkste onderscheid',
  diff_1: 'Preventie, geen reactie (vs alarmen na binnenkomst)',
  diff_2: "Geen camera's, geen microfoons",
  diff_3: 'Zwitsers ontworpen AI; ~9W verbruik',
  diff_4: 'Kwalitatieve positionering rond dagelijkse inbraakrisico’s',
  urls_heading: 'Primaire URL’s',
  contact_heading: 'Contact',
  brand_heading: 'Merk',
  tagline: 'Tagline: Aanwezigheid die voorkomt.',
  character: 'Doelgroep: Huiseigenaren in Zwitserland/Europa die rust willen als ze weg zijn.',
  guide: 'Gids: Zwitsers ontworpen AI-aanwezigheidssimulatie.',
  lede:
    'Zwitserse AI-aanwezigheidssimulatie voor je huis. Als je weg bent, gebruikt Kevin licht, schaduw en geluid zodat je huis bewoond lijkt en klinkt—inbrekers gaan verder.'
};
nl.faq = {
  q1: 'Wat is Kevin?',
  a1: 'Kevin is Zwitserse AI-aanwezigheidssimulatie voor je huis. Het gebruikt licht, schaduw en geluid zodat je huis bewoond lijkt en klinkt als je weg bent.',
  q2: 'Hoe verschilt Kevin van alarmen en camera’s?',
  a2: 'Alarmen reageren na binnenkomst. Camera’s registreren bewijs maar schrikken zelden direct af. Kevin richt zich op preventie zodat je huis vanaf de straat nooit leeg lijkt.',
  q3: "Gebruikt Kevin camera's of microfoons?",
  a3: 'Nee. Kevin simuleert alleen aanwezigheid met licht, schaduw en geluid. Geen camera’s en geen microfoons. Simulaties staan lokaal op het apparaat, niet in de cloud of bij derden.',
  q4: 'Hoe koop ik Kevin?',
  a4: 'Kies je kleur en plan op de configureerpagina en ga verder naar veilig Shopify-afrekenen met gratis bezorging in Europa en 3 jaar Zwitserse garantie.'
};


nl.cart.drawer_title = 'Je winkelwagen';
nl.cart.close = 'Winkelwagen sluiten';
nl.cart.edit_configuration = 'Configuratie bewerken';
nl.cart.quantity = 'Aantal';
nl.cart.quantity_for = 'Aantal voor {{ product }}';
nl.cart.remove = 'Verwijderen';
nl.cart.subtotal = 'Subtotaal:';
nl.cart.delivery_method = 'Bezorgmethode';
nl.cart.delivery_value = 'Gratis bezorging (Europa)';
nl.cart.delivery_note = 'Wordt als gratis verzendtarief getoond bij afrekenen. Belastingen worden bij afrekenen berekend.';
nl.cart.checkout_trust = 'Veilig afrekenen via Shopify';
nl.cart.update = 'Winkelwagen bijwerken';
nl.cart.empty_configure_note = 'Configureer Kevin om door te gaan naar afrekenen met gratis bezorging.';
nl.cart.empty_configure_cta = 'Configureer je Kevin';
nl.cart.free_delivery_checkout = 'Gratis bezorging geselecteerd bij afrekenen';
nl.cart.drawer_delivery = 'Gratis bezorging bij afrekenen · 30 dagen retour';
nl.cart.secure_shopify = 'Veilig Shopify-afrekenen';
nl.products.product.shipping_note = 'Gratis verzending · Setup in 60 seconden · 3 jaar garantie';
nl.errors.back_home = 'Terug naar home';

nl.stats.badge_1 = 'European Security Award 2024';
nl.stats.badge_3 = 'Geen monitoringabonnement';
nl.stats.badge_4 = 'Simulatie op apparaat';


nl.spec_row = {
  dimensions_label: 'Afmeting', dimensions_value: 'Ca. 21,2 × 10,2 × 9,2 cm',
  power_label: 'Stroom', power_value: 'Netstroom met 3 m kabel; typisch verbruik rond 9 W',
  connectivity_label: 'Connectiviteit', connectivity_value: 'Wi-Fi, Bluetooth, app-bediening en lokale weergave op het apparaat',
  privacy_label: 'Privacy', privacy_value: 'Geen camera. Geen microfoon. Geen afluisteren. Geen delen met derden.',
  storage_label: 'Simulatiebibliotheek', storage_value: '70+ uur activiteiten en geluiden lokaal opgeslagen op het apparaat',
  placement_label: 'Beste plaatsing', placement_value: 'Bij een zichtbaar raam, met een muur of plafond voor schaduwen'
};

nl.colors = {
  grey: 'Grijs', white: 'Wit', burgundy: 'Bordeaux', red: 'Rood', espresso: 'Espresso', brown: 'Bruin', navy: 'Marineblauw', blue: 'Blauw'
};
nl.configure.device_in = 'Kevin in {{ color }}';
nl.header.support = 'Klantenservice';
nl.footer.support = 'Klantenservice';
nl.header.setup_and_app = 'Installatie en app';
nl.home.pricing.sub_features = 'Apparaat gratis inbegrepen|Premium simulatiebibliotheek|Regelmatige software-updates|Prioritaire klantenservice|Hardwarevervanging|Flexibel voor meerdere kamers of woningen|Gratis bezorging';

nl.errors = {
  not_found_title: 'Pagina niet gevonden',
  not_found_body: 'De pagina die je zoekt bestaat niet.'
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

const enFlat = flatten(en);
const nlFlat = flatten(nl);
const enOut = unflatten(enFlat);
const nlOut = unflatten(nlFlat);

fs.writeFileSync(path.join(root, 'locales/en.default.json'), JSON.stringify(enOut, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'locales/nl.json'), JSON.stringify(nlOut, null, 2) + '\n');

const COUNTRY_SELECTOR_MARKERS = [
  'data-country-select',
  'country_code',
  'lurafi_published_country_csv',
  'lurafi_country_order_csv',
  'HeaderCountrySelector',
  'language-selector__select--country',
];

function assertNoCountrySelector(relPath, text) {
  const hits = COUNTRY_SELECTOR_MARKERS.filter((marker) => text.includes(marker));
  if (hits.length) {
    throw new Error(
      `${relPath} must remain language-only. Remove country selector markers: ${hits.join(', ')}`,
    );
  }
}

const publishedCodes = getPublishedLocales()
  .map((l) => l.shopifyLocale || l.code)
  .join(',');
const localeCsv = `,${publishedCodes},`;
const localeAssign = `assign lurafi_published_locale_csv = '${localeCsv}'`;
const localeRoutesJson = JSON.stringify(getLocaleRouteMap());

for (const rel of [
  'layout/theme.liquid',
  'snippets/language-selector.liquid',
  'snippets/meta-tags.liquid',
  'snippets/seo-hreflang.liquid',
]) {
  const filePath = path.join(root, rel);
  let text = fs.readFileSync(filePath, 'utf8');
  text = text.replace(
    /assign lurafi_published_locale_csv = '[^']*'/,
    localeAssign,
  );
  text = text.replace(
    /assign lurafi_published_locale_codes = '[^']*' \| split: ','/,
    localeAssign,
  );
  if (rel === 'snippets/language-selector.liquid') {
    assertNoCountrySelector(rel, text);
  }
  fs.writeFileSync(filePath, text);
}

const themePath = path.join(root, 'layout/theme.liquid');
let themeText = fs.readFileSync(themePath, 'utf8');
themeText = themeText.replace(
  /window\.lurafiLocaleRoutes = \{[\s\S]*?\};/,
  `window.lurafiLocaleRoutes = ${localeRoutesJson};`,
);
if (!themeText.includes('window.lurafiLocaleRoutes')) {
  themeText = themeText.replace(
    /window\.lurafiLocalization = \{[\s\S]*?\};/,
    (block) => `${block}\n      window.lurafiLocaleRoutes = ${localeRoutesJson};`,
  );
}
fs.writeFileSync(themePath, themeText);

assertNoCountrySelector('snippets/language-selector.liquid', fs.readFileSync(path.join(root, 'snippets/language-selector.liquid'), 'utf8'));

console.log('Wrote locales:', Object.keys(enFlat).length, 'keys');
console.log('Published storefront locales:', publishedCodes);
console.log('Locale route map injected for language switcher');
