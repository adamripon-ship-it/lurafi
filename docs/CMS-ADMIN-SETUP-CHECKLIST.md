# CMS Admin setup checklist (one-time)

Run after theme CMS code is deployed. **Store:** `6mzhe1-yf` · **Theme:** lurafi-deploy `184679596410`

## Developer (once)

```bash
npm run cms:navigation          # Create Navigation menus + wire header/footer JSON
npm run theme:push:live         # Publish menu assignments to live theme
npm run shopify:commerce:setup  # Kevin+ selling plan (subscribe checkout)
```

## Content lead (once, ~30 min)

- [ ] Open [Theme Editor](https://admin.shopify.com/store/6mzhe1-yf/themes/184679596410/editor)
- [ ] **Header** → confirm **Main navigation menu** = `Main menu`
- [ ] **Footer** → confirm four footer menus assigned (Product, Company, Support, Where to buy)
- [ ] **Theme settings (gear)** → upload Logo, Favicon, default share image if needed
- [ ] Install [Translate & Adapt](https://apps.shopify.com/translate-and-adapt) for FR/DE/CS bulk pass
- [ ] **Markets** → translate menu link titles per locale (or review in Translate & Adapt)

## Daily editing

1. Customize → select **language** (EN / NL / FR / DE / CS)
2. Click section → edit text or images → **Save**
3. Repeat for each language you changed

See [CONTENT-TEAM-GUIDE.md](./CONTENT-TEAM-GUIDE.md) and [CMS-EDITORIAL-WORKFLOW-PLAN.md](./CMS-EDITORIAL-WORKFLOW-PLAN.md).

## Verify

- [ ] https://mitipi.eu/ — header links scroll to sections
- [ ] https://mitipi.eu/nl/ — Dutch hero (if customized) or locale fallback
- [ ] Footer columns show menu links (not only hardcoded fallbacks)
- [ ] Configure + cart links work from footer **Where to buy**
