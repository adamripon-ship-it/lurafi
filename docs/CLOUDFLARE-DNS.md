# Point `lurafi.com` to Shopify via Cloudflare

Use this when **Cloudflare manages DNS** for `lurafi.com` and the storefront runs on Shopify (current or migrated store).

**Related:** [MIGRATION-PLAN.md](./MIGRATION-PLAN.md) Phase 6 · [MIGRATION.md](./MIGRATION.md)

> **Note:** Production content in this repo is configured for **`lurafi.ai`** (`config/languages.json`). If **`lurafi.com`** becomes the primary storefront URL, update that domain field and run `npm run geo:generate` after cutover.

---

## Current DNS (public lookup)

As of setup review, `lurafi.com` already uses Cloudflare nameservers and Shopify targets:

| Host | Type | Target | Purpose |
|------|------|--------|---------|
| `@` (apex) | **A** | `23.227.38.65` | Shopify storefront (apex) |
| `www` | **CNAME** | `shops.myshopify.com` | Shopify storefront (www) |

Always confirm the **A record IP** in your **new** store’s Admin — Shopify shows store-specific values under **Settings → Domains**.

---

## Golden rule: grey cloud for Shopify records

Shopify does **not** support Cloudflare **proxied** (orange cloud) DNS for standard merchant setups.

| Proxy status | Icon | Use for Shopify A/CNAME? |
|--------------|------|---------------------------|
| **DNS only** | Grey cloud | **Yes — required** |
| **Proxied** | Orange cloud | **No** — causes “Cloudflare Proxy not supported”, SSL pending, broken storefront |

In **Cloudflare → DNS → Records**, click the cloud icon until it is **grey** for:

- `@` A record → Shopify IP  
- `www` CNAME → `shops.myshopify.com`

Leave orange cloud off unless you have Cloudflare **Orange-to-Orange (O2O)** configured with Cloudflare support (Enterprise/SaaS pattern — not default).

---

## Step-by-step (new or migrated Shopify store)

### 1. Connect domain in Shopify first

On the **destination** store (not the old one during migration):

1. **Settings → Domains → Connect existing domain**
2. Enter `lurafi.com` (and `www.lurafi.com` if prompted separately)
3. Shopify shows required DNS records — **copy those exactly** (IP may differ from `23.227.38.65`)
4. Do **not** remove the domain from the old store until the new store is verified

### 2. Edit records in Cloudflare

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select zone **`lurafi.com`**
3. **DNS → Records**

**Remove or fix conflicts:**

- Delete extra **A** / **AAAA** on `@` that point elsewhere  
- Delete **CNAME** on `@` (apex cannot CNAME; use A record)  
- Remove old **WordPress**, **Squarespace**, or parking records  

**Add or update:**

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | Shopify IP from Admin (e.g. `23.227.38.65`) | **DNS only (grey)** |
| CNAME | `www` | `shops.myshopify.com` | **DNS only (grey)** |

**TTL:** Auto is fine. Before cutover, optionally set **300** seconds on `@` and `www` for faster rollback.

### 3. SSL/TLS in Cloudflare

With **grey cloud** (recommended):

- Cloudflare does not terminate HTTPS for those hostnames; **Shopify’s SSL** serves the certificate.
- In Cloudflare **SSL/TLS**, mode can stay **Full** — it mainly affects proxied records.

If Shopify shows **SSL pending** for more than a few hours:

1. Confirm grey cloud on Shopify records  
2. **Shopify → Settings → Domains** → remove `lurafi.com` / `www`, then **Connect existing** again  
3. Check **CAA** records in Cloudflare — if present, allow **Let’s Encrypt**

### 4. Set primary domain in Shopify

After DNS is **Connected**:

1. **Settings → Domains**
2. Set **Primary domain** to **`www.lurafi.com`** (apex `lurafi.com` redirects to www). See [PRIMARY-DOMAIN-WWW.md](./PRIMARY-DOMAIN-WWW.md).
3. Enable redirect from the non-primary host and from `*.myshopify.com`

### 5. Verify

```bash
dig lurafi.com A +short
dig www.lurafi.com CNAME +short
```

Browser checks:

- [ ] `https://lurafi.com/` loads the Shopify storefront (not “domain not configured”)
- [ ] `https://www.lurafi.com/` returns **200** (primary)
- [ ] `https://lurafi.com/` **301** → `https://www.lurafi.com/`
- [ ] Padlock / valid certificate
- [ ] `/pages/configure?plan=buy` works
- [ ] One locale prefix (e.g. `/nl/`) works

---

## Migrating to a **new** Shopify account

DNS at Cloudflare often **stays the same** (same A + CNAME targets). What changes is **which store owns the domain**:

| Step | Action |
|------|--------|
| 1 | Finish theme + QA on new store (`*.myshopify.com`) |
| 2 | **New store:** Connect `lurafi.com` + `www` |
| 3 | Cloudflare: grey-cloud A + CNAME (update IP if Shopify shows a new one) |
| 4 | Wait for **Connected** + SSL active on **new** store |
| 5 | Set primary domain on **new** store |
| 6 | **Old store:** Remove `lurafi.com` (avoid two stores claiming the same domain) |

If the storefront breaks after store swap but DNS looks correct: disconnect/reconnect the domain in the **new** Shopify Admin to refresh SSL verification.

---

## `lurafi.com` vs `lurafi.ai`

You may run **both** domains on one Shopify store:

1. Connect **both** in **Settings → Domains**
2. Choose **one primary** (e.g. `lurafi.com`)
3. Shopify redirects the other automatically

If the theme / GEO assets should use `.com` instead of `.ai`:

1. Edit `config/languages.json` → `"domain": "lurafi.com"`
2. `npm run geo:generate`
3. Push updated assets:  
   `shopify theme push -s YOUR-STORE.myshopify.com --only "assets/llms*.txt" "assets/sitemap-ai.xml"`

Email addresses in the theme (`hello@lurafi.ai`) are independent of the storefront domain — change only if you want `@lurafi.com` mail.

---

## Optional Cloudflare settings

| Setting | Recommendation |
|---------|------------------|
| **Always Use HTTPS** | On (zone-wide is OK with grey-cloud Shopify records) |
| **Automatic HTTPS Rewrites** | On |
| **Email records** (MX, SPF, DKIM) | Do **not** delete if you use `@lurafi.com` email |
| **Workers / Page Rules** routing `/` to non-Shopify | Remove or they will break the store |

---

## Rollback

1. Cloudflare: point `@` A and `www` CNAME back to **old** store targets (save pre-cutover values)
2. **Old** Shopify Admin: reconnect domain and set primary
3. **New** store: remove domain

Document before cutover:

```
# Saved rollback — lurafi.com
@ A → _______________
www CNAME → _______________
Primary Shopify store: _______________
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| “Cloudflare Proxy not supported” | Grey-cloud the A and www CNAME records |
| “Domain points to Shopify but isn’t configured properly” | Domain not connected on this store, or wrong store; reconnect in Admin |
| SSL pending > 24h | Grey cloud; reconnect domain; check CAA |
| Apex works, www fails | Add/fix `www` CNAME → `shops.myshopify.com` |
| Wrong site / old store | Domain still attached to previous Shopify account |

---

## Checklist

- [ ] Domain connected on **correct** Shopify store  
- [ ] Cloudflare `@` A → Shopify IP (**grey cloud**)  
- [ ] Cloudflare `www` CNAME → `shops.myshopify.com` (**grey cloud**)  
- [ ] Primary domain set in Shopify  
- [ ] HTTPS works on apex and www  
- [ ] Old store no longer lists `lurafi.com` (after migration)  
- [ ] Update `config/languages.json` if `.com` is canonical  
