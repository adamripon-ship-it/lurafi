# Primary domain: www.lurafi.com

**Canonical storefront URL:** `https://www.lurafi.com`  
**Apex** `https://lurafi.com` should **301 redirect** to www (Shopify `canonical_host_redirection`).

The theme normalizes canonical and hreflang tags to www, but **only Shopify Admin can flip server redirects**. Theme deploy alone cannot reverse www → apex.

## Merchant steps (required)

1. Open **Shopify Admin** for store `6mzhe1-yf` (Mitipi GmbH):  
   https://admin.shopify.com/store/6mzhe1-yf/settings/domains

2. Under **Domains**, confirm both are **Connected** with valid SSL:
   - `lurafi.com`
   - `www.lurafi.com`

3. Set **Primary domain** to **`www.lurafi.com`**:
   - Click **`www.lurafi.com`**
   - Choose **Set as primary domain** (wording may be “Make primary”)

4. Confirm Shopify shows:
   - **Primary:** `www.lurafi.com`
   - **Redirect:** `lurafi.com` → `www.lurafi.com` (and `*.myshopify.com` → primary, if enabled)

5. Wait 1–5 minutes, then verify:

```bash
curl -sI https://www.lurafi.com/ | head -5
curl -sI https://lurafi.com/ | head -8
```

**Expected after change:**

| URL | Status | Notes |
|-----|--------|--------|
| `https://www.lurafi.com/` | **200** | Primary |
| `https://lurafi.com/` | **301** | `location: https://www.lurafi.com/` |
| | | `x-redirect-reason: canonical_host_redirection` |

**Before change (wrong for this project):** www 301 → apex, apex 200.

## Repo alignment

| Item | Value |
|------|--------|
| `config/languages.json` → `domain` | `www.lurafi.com` |
| LLM assets / sitemap-ai | Regenerate: `npm run geo:generate` |
| QA / Playwright default | `LURAFI_URL=https://www.lurafi.com` |

## Cloudflare

DNS records stay as Shopify documents (A + CNAME). No change needed for www-as-primary unless SSL or proxy settings block Shopify’s redirect.

See [CLOUDFLARE-DNS.md](./CLOUDFLARE-DNS.md).
