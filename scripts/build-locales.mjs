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
    buy: 'Get Kevin',
    buy_now: 'Get Kevin',
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
      title: 'Kevin® — Swiss AI Presence Simulator That Deters Burglars | Mitipi',
      description:
        'Kevin® simulates human presence with Swiss AI—light, shadow, and sound—so your home looks lived-in and burglars move on. No cameras. No microphones. Plug and play.'
    },
    org_description:
      'Kevin® simulates human presence with Swiss AI—light, shadow, and sound—so your home looks lived-in and burglars move on. No cameras. No microphones. Plug and play.',
    sitemap: {
      title: 'Sitemap — Mitipi & Kevin',
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
      image_alt: 'Kevin® smart home presence simulator',
      shipping_note: 'Free delivery · Plug & play · 3-year Swiss warranty'
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
    lede: 'Pick your color—you are one step from a home that never looks empty.',
    color_label: 'Your Kevin',
    color_prefix: 'Colour:',
    device_heading: 'Your Kevin',
    device_colour_label: 'Colour:',
    plan_label: 'Choose Your Plan',
    plan_buy: 'Buy',
    plan_buy_sub: 'One-time purchase',
    plan_badge_popular: 'Most popular',
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
      'Own your device outright|70+ hours of built-in simulations|Control from the Kevin App|Bluetooth speaker and lamp at home|Free delivery across Europe|3-year Swiss warranty|Lifetime software updates included',
    summary_plan_buy: 'One-time purchase',
    per_device: ' per device',
    error_products: 'Please assign products in Theme settings → Products.',
    error_checkout: 'Online checkout is almost ready. Email hello@lurafi.com to order, or try again soon.',
    processing: 'Processing…',
    device_alt: 'Kevin device',
    covers_heading: 'Optional front covers',
    covers_note: '{{ price }} each · any colour, any quantity',
    covers_included: 'Your Kevin includes the Grey cover — add extra colours below.',
    cover_soon: 'Soon',
    cover_alt: '{{ name }} front cover',
    cover_qty_label: '{{ name }} cover quantity',
    cover_minus_label: 'Remove one {{ name }} cover',
    cover_plus_label: 'Add one {{ name }} cover'
  },
  hero: {
    callouts_aria_label: 'Kevin benefits',
    carousel_label: 'Who is Kevin for?',
    pause_autoplay: 'Pause slideshow',
    play_autoplay: 'Play slideshow',
    previous_slide: 'Previous slide',
    next_slide: 'Next slide',
    drag_to_rotate: 'Drag to rotate Kevin',
    away_eyebrow: 'Away mode',
    away_title: 'Living room active',
    away_body: 'Light, shadow, and sound vary automatically.',
    privacy_eyebrow: 'Privacy',
    privacy_title: 'No cameras. No mics.',
    privacy_body: 'Simulation plays locally on the device.',
    checkout_eyebrow: 'Checkout',
    checkout_title: 'Free delivery',
    checkout_body: 'Secure Shopify checkout.',
    slide_1: {
      label: 'Everyone',
      eyebrow: 'For every home',
      headline: 'Deter burglaries before they happen.',
      lede: 'Kevin® simulates human presence with Swiss AI—light, shadow, and sound—so your home looks lived-in from outside. No cameras. No microphones. Plug and play.',
      image_alt: 'Kevin® presence simulator — Swiss-engineered Kevin 3 device',
      callout_1_eyebrow: 'Plug and play',
      callout_1_title: '9 watts',
      callout_1_body: 'Connect power and place near a window—typical use around 9 W. No installation or wiring.',
      callout_2_eyebrow: '100% privacy',
      callout_2_title: 'No cameras. No mics.',
      callout_2_body: 'Simulations run locally on the device. Nothing uploaded to the cloud or shared with third parties.',
      callout_3_eyebrow: 'Jammer-proof',
      callout_3_title: 'Local storage',
      callout_3_body: '70+ hours of light, shadow, and sound keep playing—even when burglars jam Wi-Fi cameras and alarms.',
      callout_4_eyebrow: 'Checkout',
      callout_4_title: 'Free delivery',
      callout_4_body: 'Secure checkout with free delivery across Europe.'
    },
    slide_2: {
      label: 'Seniors',
      eyebrow: 'Living alone · 80+',
      headline: 'Feel safe at home—without surveillance.',
      lede: 'Neighbours see warm light and believable movement—Kevin keeps your home looking cared for with no cameras and no microphones.',
      image_alt: 'Night photograph of a half-timbered European house — warm lit windows with a wheelchair silhouette visible inside',
      callout_1_eyebrow: 'Living alone',
      callout_1_title: 'Not an easy target',
      callout_1_body: 'Neighbours see warm light and movement — a home that looks cared for, not vacant.',
      callout_2_eyebrow: 'Privacy',
      callout_2_title: 'No cameras. No mics.',
      callout_2_body: 'Presence without surveillance — quiet deterrence that respects your privacy and dignity.',
      callout_3_eyebrow: 'Schedule',
      callout_3_title: 'Like family just left',
      callout_3_body: 'Evening scenes that match when your daughter visits — believable shadow and sound without a monitoring panel.'
    },
    slide_3: {
      label: 'New parents',
      eyebrow: 'New parent · mom and baby',
      headline: 'Hold your baby—home looks occupied.',
      lede: 'While you settle the baby, Kevin keeps believable adult movement on the ground floor—light, shadow, and sound from local storage.',
      image_alt: 'Editorial illustration of a single mother with infant in a Dutch terraced home at evening',
      callout_1_eyebrow: 'After bedtime',
      callout_1_title: 'Downstairs still active',
      callout_1_body: 'While you settle the baby upstairs, Kevin keeps believable adult movement on the ground floor.',
      callout_2_eyebrow: 'From the street',
      callout_2_title: 'Visible deterrence',
      callout_2_body: 'Warm windows and shifting light dissuade opportunists who watch for dark, silent flats.',
      callout_3_eyebrow: 'Privacy',
      callout_3_title: 'No nursery cameras',
      callout_3_body: 'No cameras watching your nursery — only light, shadow, and everyday sound inside your home.'
    },
    slide_4: {
      label: 'Single parents',
      eyebrow: 'Single parent · toddler',
      headline: 'Upstairs with your child—downstairs looks busy.',
      lede: 'Kevin simulates cooking rhythms, TV glow, and hallway footsteps so passers-by see an occupied ground floor while you are upstairs.',
      image_alt: 'Night photograph of a brick apartment — warm upstairs bedroom light with a mother and toddler silhouetted at the window',
      callout_1_eyebrow: 'Dinner hour',
      callout_1_title: 'Kitchen sounds on',
      callout_1_body: 'Simulated cooking rhythms and hallway footsteps — like another adult is still downstairs.',
      callout_2_eyebrow: 'Single parent',
      callout_2_title: 'Kids safe upstairs',
      callout_2_body: 'Ground-floor TV glow and voices while you read bedtime stories on the floor above.',
      callout_3_eyebrow: 'Shadows',
      callout_3_title: 'Someone else home',
      callout_3_body: 'Silhouette and voice layers — the signal passers-by notice without you shouting.'
    },
    slide_5: {
      label: 'Students',
      eyebrow: 'Student · first flat',
      headline: 'Your first flat should not look empty.',
      lede: 'Kevin makes your studio look lived-in to neighbours in the corridor—realistic household sounds without blasting music through thin walls.',
      image_alt: 'Editorial illustration of a European student in a German Altbau studio at blue hour',
      callout_1_eyebrow: 'First year away',
      callout_1_title: 'Miles from family',
      callout_1_body: 'Your door looks lived-in to neighbours in the corridor who notice when flats go dark.',
      callout_2_eyebrow: 'Shared halls',
      callout_2_title: 'Quiet deterrence',
      callout_2_body: 'Realistic low-level household sounds — not loud music through thin walls during exam week.',
      callout_3_eyebrow: 'Portable',
      callout_3_title: 'Pack and go',
      callout_3_body: 'Move Kevin between bedroom and desk nook, or take it when you relocate next semester.'
    },
    slide_6: {
      label: 'Expat solo',
      eyebrow: 'Expat · living alone',
      headline: 'New city—home still looks lived in.',
      lede: 'One plug-and-play device simulates believable presence while you work late or explore a new country—no drilling, no landlord drama.',
      image_alt: 'Night photograph of a brick apartment building — silhouette of a woman working on a laptop visible through a warmly lit window',
      callout_1_eyebrow: 'New country',
      callout_1_title: 'No neighbour favours',
      callout_1_body: 'You have not built local trust — Kevin makes the flat look occupied while you learn the city.',
      callout_2_eyebrow: 'Late nights',
      callout_2_title: 'Home still awake',
      callout_2_body: 'Varied evening scenes run while you work late or travel for the weekend — outsiders see life inside.',
      callout_3_eyebrow: 'Rental-friendly',
      callout_3_title: 'No install drama',
      callout_3_body: 'One device, no drilling, no landlord fights — presence simulation that travels with you.'
    },
    slide_7: {
      label: 'On holiday',
      eyebrow: 'Couple · away together',
      headline: 'Enjoy the trip—home keeps living.',
      lede: 'Light, shadow, and sound vary while you are abroad so passers-by see everyday rhythms—not a dark, silent flat.',
      image_alt: 'Night photograph of a German apartment facade — silhouettes of a woman holding a baby and a man visible through lit windows',
      callout_1_eyebrow: 'On holiday',
      callout_1_title: 'Home still lives',
      callout_1_body: 'Light and sound vary while you are abroad — passers-by see everyday rhythms, not a dark shell.',
      callout_2_eyebrow: 'Away mode',
      callout_2_title: 'One tap to protect',
      callout_2_body: 'Lock up and Kevin shifts scenes through the day without timers on six different lamps.',
      callout_3_eyebrow: 'Schedule',
      callout_3_title: 'Set before you fly',
      callout_3_body: 'Schedule simulations in advance—protection that fits around your getaway.'
    },
    slide_8: {
      label: 'Second home',
      eyebrow: 'Second home · rental',
      headline: 'Every property looks occupied between visits.',
      lede: 'Schedule weekly occupancy for your holiday home or city break—hallway, living room, and kitchen rhythms rotate automatically.',
      image_alt: 'Editorial illustration of a warm occupied European holiday home viewed from inside at night',
      callout_1_eyebrow: 'Days away',
      callout_1_title: 'Multi-room scenes',
      callout_1_body: 'Hallway, living room, and kitchen rhythms rotate — not one lamp on a timer for a whole week.',
      callout_2_eyebrow: 'One app',
      callout_2_title: 'All properties',
      callout_2_body: 'Manage every Kevin from one app—full coverage day and night across locations.',
      callout_3_eyebrow: 'Second home',
      callout_3_title: 'Set once per season',
      callout_3_body: 'Weekly schedules for your Alpine flat or coast house — believable occupancy between your visits.'
    }
  },
  home: {},
  stats: {
    swiss_engineered: 'Swiss engineered & designed'
  },
  sitemap: {
    overline: 'SEO sitemap',
    heading: 'Sitemap for people, search engines, and AI assistants.',
    lede: 'Key Lurafi and Kevin resources in one place, including AI-readable summaries for AEO and GEO discovery.',
    primary: 'Primary pages',
    homepage: 'Homepage',
    configure_buy: 'Configure / buy Kevin',
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
      'Kevin® simulates human presence with Swiss AI—light, shadow, and sound—so your home looks lived-in and burglars move on.',
    what_we_sell: 'What we sell',
    buy_bullet:
      '**Kevin (Buy)**: One-time purchase. Device with 70+ hours of built-in simulations, Kevin App control, Bluetooth speaker at home, free delivery in Europe, 3-year Swiss warranty.',
    how_heading: 'How it works',
    how_1: 'Plug in near a window.',
    how_2: 'Schedule simulations or let geo-fencing activate Kevin when you leave.',
    how_3: 'Light, shadow, and sound play from local storage—believable presence day and night.',
    diff_heading: 'Key differentiators',
    diff_1: 'Prevention before break-in (vs alarms that trigger after entry)',
    diff_2: 'No cameras, no microphones — 100% privacy',
    diff_3: 'Swiss-engineered AI; ~9W power; plug and play',
    diff_4: 'Jammer-resilient local playback when Wi-Fi security fails',
    urls_heading: 'Primary URLs',
    contact_heading: 'Contact',
    brand_heading: 'Brand',
    tagline: 'Tagline: Smart. Secure. Swiss.',
    character: 'Character: Homeowners in Europe who want peace of mind when away—without cameras or monitoring.',
    guide: 'Guide: Swiss-engineered AI presence simulation.',
    lede:
      'Kevin® simulates human presence with Swiss AI. Light, shadow, and sound make your home look and sound lived-in—burglars move on. No cameras. No microphones.'
  },
  faq: {
    q1: 'What is Kevin?',
    a1: 'Kevin® is a Swiss-engineered AI presence simulator. It uses light, shadow, and sound to make your home look and sound lived-in when you are away—in homes, flats, offices, and holiday properties.',
    q2: 'How is Kevin different from alarms and cameras?',
    a2: 'Alarms react after entry. Cameras record evidence and can fail when Wi-Fi is jammed. Kevin focuses on prevention—believable occupancy from outside before anyone tests the door.',
    q3: 'Does Kevin use cameras or microphones?',
    a3: 'No. Kevin simulates presence with light, shadow, and sound only. No cameras and no microphones. Simulations are stored locally on the device, not streamed from the cloud or shared with third parties.',
    q4: 'How do I buy Kevin?',
    a4: 'Choose your color on the configure page, then continue to secure Shopify checkout with free delivery across Europe and a 3-year Swiss warranty.',
    q5: 'Does Kevin work if Wi-Fi is jammed?',
    a5: 'Yes. Core simulations play from local storage on the device. Kevin keeps projecting light, shadow, and sound even when burglars use jamming devices to disable Wi-Fi cameras and alarm systems.',
    q6: 'Is the simulation really convincing?',
    a6: 'Independent reviewer Galaxus called Kevin.3 “an unrivalled, easy-to-use all-in-one solution that delivers a truly spectacular show.” The effect is strongest where it matters: from outside, through curtains, at dusk.'
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
  connectivity: { label: 'Connectivity', value: 'Wi-Fi and Bluetooth for app control; simulations play locally on device (jammer-resilient)' },
  privacy: { label: 'Privacy', value: 'No camera. No microphone. No listening. No third-party sharing.' },
  storage: { label: 'Simulation library', value: '70+ hours of activities and sounds stored locally on the device' },
  placement: { label: 'Best placement', value: 'Near a visible window, with a wall or ceiling for shadows' }
};

en.spec_row = {
  dimensions_label: 'Size', dimensions_value: 'Approx. 21.2 × 10.2 × 9.2 cm',
  power_label: 'Power', power_value: 'Mains powered with 3 m cable; typical use around 9 W',
  connectivity_label: 'Connectivity', connectivity_value: 'Wi-Fi and Bluetooth for app control; simulations play locally on device (jammer-resilient)',
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

/** Canonical EN homepage copy — merged with non-empty CMS overrides from templates/index.json. */
const enHome = JSON.parse(fs.readFileSync(path.join(root, 'config/home-en.json'), 'utf8'));

en.home = {};
for (const [id, sec] of Object.entries(index.sections)) {
  const overrides = nonBlankSectionSettings(sec);
  en.home[id] = { ...(enHome[id] || {}), ...overrides };
}

if (en.home.app) {
  en.home.app.carousel_label = 'App screenshots';
}

en.accessibility.previous = 'Previous';
en.accessibility.next = 'Next';

const nlHome = {
  hero: {
    eyebrow: 'Zwitserse aanwezigheidssimulatie',
    headline: 'Voorkom het ondenkbare.',
    lede: 'KEVIN® 3.0 is een preventieve stap ter bescherming tegen aanranders, stalkers, gewelddadige indringers en inbrekers—zodat uw dierbaren veilig zijn, waar ze ook wonen.',
    cta_primary_label: 'Koop Kevin',
    cta_secondary_label: 'Hoe het werkt',
    trust_1: 'Zwitsers ontworpen',
    trust_2: 'Laag energieverbruik',
    trust_3: 'Jammerbestendig',
    sticky_cta_label: 'Koop Kevin'
  },
  problem: {
    overline: 'Het probleem',
    heading: 'Als dierbaren alleen wonen of een huis leeg oogt, worden ze een doelwit.',
    subheading:
      'Aanranders, gewelddadige indringers en inbrekers kiezen makkelijke doelwitten: vrouwen die alleen wonen, een dochter in haar eerste studentenkamer, oudere echtparen. KEVIN 3.0® simuleert mensen die met je samenwonen, zodat niemand ooit alleen lijkt.',
    tile_1_title: 'Echte menselijke schaduwen',
    tile_1_body:
      'Ultrarealistische schaduweffecten van één persoon of een heel gezin—zo ziet de straat dat er iemand thuis is en niemand alleen woont.',
    tile_2_title: 'Het geluid van echt leven',
    tile_2_body:
      'Ultrarealistische geluidsscenario’s—gesprekken, een blaffende hond, koken, schoonmaken, spelletjes, de tv—voor echte, geloofwaardige aanwezigheid.',
    tile_3_title: 'Timers houden niemand voor de gek',
    tile_3_body:
      'Dezelfde lamp op dezelfde tijd, elke avond: dat leest als automatisering, niet als leven. Kevin varieert alles.',
    tile_4_title: 'De laag die alarmen missen',
    tile_4_body:
      'Een alarm detecteert pas een inbraak, en hulp laat op zich wachten. KEVIN® vervangt je alarm niet—het voegt de ontbrekende preventielaag toe en stopt gewelddadige indringers, aanranders en dieven vóór je dierbaren ooit geweld meemaken.'
  },
  mechanism: {
    overline: 'Zo werkt het',
    heading: 'Licht. Schaduw. Geluid.',
    subheading:
      'Een inbreker beoordeelt een huis in seconden—aan het licht, de beweging en het geluid. Kevin levert alle drie, zodat je huis van straat tot voordeur bewoond oogt en de inbreker verdergaat naar een makkelijker doelwit.',
    phase_1_title: 'De lichten komen tot leven',
    phase_1_body:
      'Warm licht verspringt van kamer tot kamer, als echte lampen en een flikkerende tv—nooit het starre aan-uit-knipperen dat een goedkope timer verraadt.',
    phase_2_title: 'Schaduwen kruisen het raam',
    phase_2_body:
      'Bewegende silhouetten trekken langs de gordijnen—precies het teken van leven waar een inbreker naar zoekt voordat hij een doelwit kiest.',
    phase_3_title: 'Het huis klinkt bewoond',
    phase_3_body:
      'Stemmen, een tv, kookgeluiden en een hond die blaft bij de deurbel klinken rechtstreeks vanaf het apparaat—zodat zelfs van dichtbij duidelijk iemand thuis is.'
  },
  stats: {
    heading: 'Weken geloofwaardig, geen minuten.',
    stat_1_value: '20%',
    stat_1_label: 'Lagere woonverzekering bij sommige verzekeraars',
    stat_2_value: '70+',
    stat_2_label: 'Uur unieke, afwisselende simulaties',
    stat_3_value: '9W',
    stat_3_label: 'Laag energieverbruik',
    stat_4_value: '0',
    stat_4_label: "Camera's of microfoons",
    ticker_items:
      'Keukengeluiden|Tv-avond|Hondengeblaf|Douche loopt|Stofzuigen|Telefoongesprek|Huiswerk|Etentje|Avondlezen|Ochtendroutine',
    badge_1: 'Geen monitoringabonnement',
    badge_2: 'Zwitsers ontworpen en ontwikkeld',
    badge_3: 'Storingsbestendige lokale weergave'
  },
  jammer: {
    overline: 'Als wifi wegvalt',
    heading: "Jammers verblinden camera's. Kevin speelt door.",
    subheading:
      "Goedkope jammers halen camera's en app-alarmen van het netwerk. Kevin speelt elke simulatie vanaf de opslag op het apparaat—geen cloud, geen signaal, geen gat.",
    col_1_title: 'De camera',
    col_1_body:
      'Streams stoppen, meldingen komen nooit aan. Een gestoorde camera beschermt niemand—hij neemt alleen niets op.',
    col_1_status: 'Signaal weg',
    col_2_title: 'Kevin',
    col_2_body:
      'Licht, schaduw en geluid gaan door vanaf lokale opslag—het huis mist geen tel.',
    col_2_status: 'Speelt door'
  },
  app: {
    overline: 'Kevin-app',
    heading: 'Instellen. Vergeten.',
    subheading:
      "Schema's, geo-fencing en meerdere panden—aanwezigheid die zichzelf regelt vanuit één app.",
    ui_status: 'Thuis · Beschermd',
    ui_row_1: '18:30 — Keukengeluiden',
    ui_row_2: '19:45 — Tv-avond',
    ui_row_3: '21:10 — Hondengeblaf bij deurbel',
    ui_row_4: 'Weg-modus — start als je vertrekt',
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
  authority: {
    overline: 'Waarom Kevin',
    heading: 'Drie taken. Eén stil apparaat.',
    subheading:
      'KEVIN 3.0 bestaat voor de momenten waarop een huis het eerlijkst leeg is.',
    reason_1_title: 'Voorkom de inbraak',
    reason_1_body:
      'Inbrekers kiezen makkelijke, lege doelwitten. Een huis dat gloeit, beweegt en praat wordt overgeslagen.',
    reason_2_title: 'Waak over tweede huizen',
    reason_2_body:
      'Chalets, vakantiewoningen en boten blijven geloofwaardig bewoond tussen je bezoeken door.',
    reason_3_title: 'Nooit “alleen thuis”',
    reason_3_body:
      'Kevin simuleert meer bewoners—stemmen, beweging, een hond—geruststelling voor iedereen die alleen woont.',
    trust_1: 'Preventie, geen reactie',
    trust_2: 'Ontwikkeld in Zwitserland',
    trust_3: 'Simuleert mensen én honden',
    quote:
      'Een ongeëvenaarde, gebruiksvriendelijke alles-in-één-oplossing die een werkelijk spectaculaire show neerzet.',
    quote_author: 'Galaxus',
    quote_source: 'Kevin.3-review, januari 2026'
  },
  audience: {
    overline: 'Wie Kevin beschermt',
    heading: 'Elk huis is soms leeg.',
    subheading:
      'Kevin trekt in waar het leven even uittrekt—voor een avond, een seizoen of een semester.',
    chips:
      'Gezinnen op vakantie|Zakenreizigers|Expats|Alleenwonenden|Eerste flat in een nieuwe stad|Alleenstaande moeders|Gepensioneerden en weduwen|Tweede huizen en chalets|Boten en jachten|Kantoren, winkels en ambassades',
    story:
      'Haar eerste studio, een nieuwe stad, 400 km van huis. Kevin vult hem met stemmen, licht en een hond die de deurbel hoort—zodat het nooit voelt, of klinkt, alsof ze alleen woont.'
  },
  pricing: {
    overline: 'Koop Kevin®',
    heading: 'Eenmalige aankoop. Levenslange updates inbegrepen.',
    subheading:
      'Koop Kevin® eenmalig met gratis levenslang lidmaatschap, software-updates, 3 jaar Zwitserse garantie en gratis bezorging in heel Europa.',
    buy_label: 'Kevin® kopen',
    buy_tagline: 'Eenmalig kopen. Alle updates inbegrepen.',
    buy_cta: 'Koop Kevin',
    buy_features:
      'Volledig eigendom|70+ uur ingebouwde simulaties|Weekschema’s en geo-activering|Eigen huishoudelijke geluiden uploaden|Flexibele plaatsing met 3 m stroomkabel|Gratis bezorging|3 jaar garantie'
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

  faq: {
    overline: 'FAQ',
    heading: 'Vragen en antwoorden.'
  },

  cta: {
    heading: 'Vertrek zonder het te verkondigen.',
    subheading:
      'Kevin laat je huis actief lijken en klinken met Zwitsers ontworpen aanwezigheidssimulatie. Gratis bezorging. 60 seconden setup. Geen camera’s of microfoons.',
    primary_cta: 'Koop Kevin',
    secondary_cta: 'Hoe het werkt'
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
en.products.product.shipping_note = 'Free delivery · Plug & play · 3-year Swiss warranty';
en.errors.back_home = 'Back to home';
en.customers = customersEn;


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
  buy: 'Koop Kevin',
  buy_now: 'Koop Kevin',
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
    title: 'Kevin® — Zwitserse AI-aanwezigheidssimulatie tegen inbraak | Mitipi',
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
  lede: 'Kies je kleur—je bent één stap verwijderd van een huis dat nooit leeg lijkt.',
  color_label: 'Jouw Kevin',
  color_prefix: 'Kleur:',
  device_heading: 'Jouw Kevin',
  device_colour_label: 'Kleur:',
  plan_label: 'Kies je plan',
  plan_buy: 'Kopen',
  plan_buy_sub: 'Eenmalige aankoop',
  plan_badge_popular: 'Meest gekozen',
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
  summary_plan_buy: 'Eenmalige aankoop',
  per_device: ' per apparaat',
  error_products: 'Wijs producten toe in Thema-instellingen → Producten.',
  error_checkout: 'Online afrekenen is bijna klaar. Mail hello@lurafi.ai om te bestellen, of probeer het binnenkort opnieuw.',
  processing: 'Bezig…',
  device_alt: 'Kevin-apparaat',
  covers_heading: 'Optionele voorpanelen',
  covers_note: '{{ price }} per stuk · elke kleur, elk aantal',
  covers_included: 'Je Kevin wordt geleverd met de grijze cover — voeg hieronder extra kleuren toe.',
  cover_soon: 'Binnenkort',
  cover_alt: 'Voorpaneel {{ name }}',
  cover_qty_label: 'Aantal covers {{ name }}',
  cover_minus_label: 'Eén cover {{ name }} verwijderen',
  cover_plus_label: 'Eén cover {{ name }} toevoegen'
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
  nl.home[id] = { ...(en.home[id] || {}), ...nonBlankSectionSettings(sec), ...(nlHome[id] || {}) };
}
nl.stats = { swiss_engineered: 'Zwitsers ontworpen' };
nl.sitemap = {
  overline: 'SEO-sitemap',
  heading: 'Sitemap voor mensen, zoekmachines en AI-assistenten.',
  lede: 'Belangrijke Lurafi- en Kevin-bronnen op één plek, inclusief AI-leesbare samenvattingen voor AEO en GEO.',
  primary: 'Hoofdpagina’s',
  homepage: 'Startpagina',
  configure_buy: 'Kevin configureren / kopen',
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
  title: 'Sitemap — Mitipi & Kevin',
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
  a4: 'Kies je kleur op de configureerpagina en ga verder naar veilig Shopify-afrekenen met gratis bezorging in Europa en 3 jaar Zwitserse garantie.',
  q5: 'Werkt Kevin als de wifi wordt gestoord?',
  a5: 'Ja. De kernsimulaties spelen vanaf lokale opslag op het apparaat. Kevin blijft licht, schaduw en geluid afspelen, ook wanneer inbrekers wifi-camera\u2019s en alarmen met een jammer uitschakelen.',
  q6: 'Is de simulatie echt overtuigend?',
  a6: 'Onafhankelijke reviewer Galaxus noemde Kevin.3 “een ongeëvenaarde, gebruiksvriendelijke alles-in-één-oplossing die een werkelijk spectaculaire show neerzet.” Het effect is het sterkst waar het telt: van buiten, door gordijnen, in de schemering.'
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

// The language switcher must not grow a separate, visible country dropdown.
// A hidden country_code coupled to the chosen language is allowed (and required)
// so that picking a language also selects its market/currency — that is not a
// country *selector*, so country_code is intentionally not on this list.
const COUNTRY_SELECTOR_MARKERS = [
  'data-country-select',
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
