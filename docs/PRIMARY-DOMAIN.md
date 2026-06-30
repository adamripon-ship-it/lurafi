# Primary domain: mitipi.eu

**Canonical storefront URL:** `https://mitipi.eu`  
**Shopify store:** `6mzhe1-yf.myshopify.com` (Mitipi GmbH)  
**Live theme:** `lurafi-deploy` — ID `184679596410`

## Shopify Admin

1. **Settings → Domains**
2. Confirm **`mitipi.eu`** is **Primary**
3. **`www.mitipi.eu`** should redirect to apex (`301` → `https://mitipi.eu/`)

## Verify

```bash
curl -sI https://mitipi.eu/ | head -5          # expect 200
curl -sI https://www.mitipi.eu/ | head -8      # expect 301 → mitipi.eu
```

## Repo alignment

| Location | Value |
|----------|--------|
| `config/languages.json` → `domain` | `mitipi.eu` |
| `npm run qa:full` | `LURAFI_URL=https://mitipi.eu` |
| Playwright default | `https://mitipi.eu` |
| Theme push | `npm run theme:push:live` |

After changing `domain`, regenerate GEO assets:

```bash
npm run geo:generate
```

## Legacy

Previous primary domains (`lurafi.com`, `lurafi.ai`, `www.lurafi.com`) are documented in [PRIMARY-DOMAIN-WWW.md](./PRIMARY-DOMAIN-WWW.md) and migration docs. Do not point new deploys at those hosts.
