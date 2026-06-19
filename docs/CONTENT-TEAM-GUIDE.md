# Content team guide — mitipi.eu (Shopify Theme Editor)

This guide explains how to update the mitipi.eu storefront **without code or GitHub**. All changes are made in **Shopify Admin → Online Store → Themes**.

## Store & theme

| Item | Value |
|------|--------|
| Live URL | https://mitipi.eu |
| Shopify store | `6mzhe1-yf.myshopify.com` (Mitipi GmbH) |
| Live theme | **lurafi-deploy** (`184679596410`) |
| Admin themes | https://admin.shopify.com/store/6mzhe1-yf/themes |

## Open the theme editor

1. Go to **Online Store → Themes**.
2. On **lurafi-deploy** (live), click **Customize**.
3. Use the **language** dropdown (top bar) to switch **EN / NL / FR / DE / CS** before editing text — each language has its own section settings.
4. Click **Save** when done. Changes go live on mitipi.eu immediately for the live theme.

**Tip:** Duplicate the theme first for risky edits; publish the duplicate when ready.

## What you can edit today

### Theme settings (gear icon, left sidebar)

- **Logo** and **favicon**
- **Default share image** (social previews)
- **Products** — Kevin (buy) and Kevin+ (subscribe) product picks
- **Configure page** handle

### Header (top of any page preview)

- Main navigation menu (when assigned — see Navigation below)
- Desktop and mobile **Buy** button labels
- Header CTA link (optional; defaults to Configure page)

### Footer

- Disclaimer note at top
- Four link columns (when Navigation menus assigned)
- Support, press, and careers email addresses

### Homepage sections

Click sections on the homepage preview:

| Section | What to edit |
|---------|----------------|
| Hero | Headline, subhead, CTAs, product image, callout cards, sticky mobile CTA |
| Problem / Solution / Steps | Headings, body copy, tiles/pillars/steps, images |
| App | Carousel screenshots (6), captions, feature tiles, animation toggle |
| Personas | Three persona cards + quotes |
| Stats | Four stat values and labels |
| Testimonials | Quotes, authors, summary |
| Pricing | Plan labels, taglines, CTAs, feature bullet lists |
| Specifications | Heading, product image, spec table rows (blocks) |
| Final CTA | Heading, buttons, link URLs |

### Shopify Admin (outside Customize)

| Content | Where |
|---------|--------|
| Product names, prices, descriptions | **Products** |
| Blog posts | **Online Store → Blog posts** |
| Legal pages, sitemap, LLM page body | **Online Store → Pages** |
| Navigation menus | **Online Store → Navigation** |

## Navigation menus (recommended setup)

Create four menus in **Online Store → Navigation**, then assign them in **Footer** section settings:

| Menu handle (suggested) | Used for |
|-------------------------|----------|
| `footer-product` | Product column links |
| `footer-company` | Company column (mailto links OK) |
| `footer-support` | Support column |
| `footer-shop` | Where to buy column |

Create **Main menu** (`main-menu`) for header nav and assign it in **Header** settings.

Default anchor links (`#pricing`, `#app`, etc.) still appear if no menu is assigned.

## Multi-language workflow

1. In Customize, select **English** → edit copy → Save.
2. Switch to **Nederlands** (or FR/DE/CS) → edit the same section → Save.
3. For bulk translation of theme strings, use **Shopify Translate & Adapt** (Apps). See [TRANSLATE-AND-ADAPT.md](./TRANSLATE-AND-ADAPT.md).

Blank section fields fall back to built-in translations — you only need to fill fields you want to override.

## Do not change in the editor

- Section order is fixed unless a developer reorders `templates/index.json`.
- Colors, fonts, and layout are code-controlled — editing CSS is not available in Customize.
- Country/currency selector is intentionally disabled (language-only).

## Developer sync (optional)

If developers run `npm run cms:seed` from Git, it repopulates theme JSON from locale files. **Do not run this after CMS edits** unless coordinated — it can overwrite `templates/index.json` in Git (Shopify live settings are separate).

## Help

- Technical issues: see [I18N-SHOPIFY.md](./I18N-SHOPIFY.md) and [SHOPIFY.md](./SHOPIFY.md)
- Deploy is via developers (`npm run theme:push:live`) — content edits in Customize do not require deploy
