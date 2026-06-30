# Access setup — GitHub, Shopify, Cloudflare

Complete these steps **with Adam in the loop** so Cursor can execute the migration. Nothing here commits secrets to git.

**Verify anytime:**

```bash
./scripts/verify-access.sh
```

**Migration runbook after access:** [SETUP-NEW-SHOPIFY-ACCOUNT.md](./SETUP-NEW-SHOPIFY-ACCOUNT.md)

---

## Current status (machine check)

| Service | Status | Action |
|---------|--------|--------|
| **GitHub** | `gh` logged in as `adamripon-ship-it`, repo access OK | Add **production** secrets for **new** store |
| **Shopify CLI** | Old store `fu03cn-1v` session exists | Auth **new** store + full scopes |
| **Cloudflare** | `lurafi.com` on Cloudflare NS | API token or dashboard; MCP optional |
| **GitHub Deploy secrets** | `production` env exists, secrets likely empty | Add token + store hostname |

---

## 1. GitHub (repo + deploy)

### Already working

- Account: **adamripon-ship-it**
- Repo: **adamripon-ship-it/lurafi**
- CI: **Theme Check** on every PR
- Deploy: **Deploy theme (manual)** → environment `production`

### You need to add (new Shopify store)

**GitHub → lurafi → Settings → Secrets and variables → Actions → Environment `production`**

| Secret name | Value | How to get it |
|-------------|-------|----------------|
| `SHOPIFY_CLI_THEME_TOKEN` | Admin API access token | New store → Develop apps → Theme deploy app → `write_themes` |
| `SHOPIFY_FLAG_STORE` | `your-new-store.myshopify.com` | New store hostname |

### Create Theme Access app (new store)

1. **Settings → Apps and sales channels → Develop apps → Create an app**
2. Name: `GitHub Theme Deploy`
3. **Configure Admin API scopes:** `read_themes`, `write_themes`
4. **Install app** on store
5. Reveal **Admin API access token** → paste into GitHub secret (shown once)

### Verify

```bash
gh secret list --repo adamripon-ship-it/lurafi --env production
./scripts/verify-access.sh
```

### Optional: re-auth gh with full scopes

```bash
gh auth refresh -h github.com -s repo,workflow,delete_repo,admin:org,user,project
gh auth setup-git
```

---

## 2. Shopify (old + new store)

### Roles needed

| Store | Access | Purpose |
|-------|--------|---------|
| **Old** `fu03cn-1v.myshopify.com` | Staff (read) | Export products, reference settings |
| **New** `____.myshopify.com` | Owner or staff with Themes + Products | Theme push, catalog, domain |

**Canonical store (verified 2026-06-26):** `6mzhe1-yf.myshopify.com` — shop **Mitipi GmbH**, primary domain **`https://mitipi.eu`** ([PRIMARY-DOMAIN.md](./PRIMARY-DOMAIN.md)).  
**Admin URL:** `https://admin.shopify.com/store/6mzhe1-yf` (not `mitipi-2`).  
**Legacy hostname in theme/markets:** `mitipi-2.myshopify.com` appears in `hreflang` links but is **not** a separate OAuth/API store (OAuth and client-credentials token only work on `6mzhe1-yf`).

### Authenticate Shopify CLI (interactive — browser)

Run in **your terminal** (Cursor terminal works — must be interactive):

```bash
cd /Users/adam/lurafi
npm ci

# Replace with your NEW store hostname
./scripts/auth-new-store.sh YOUR-NEW-STORE.myshopify.com
```

Or with env var:

```bash
export SHOPIFY_STORE="YOUR-NEW-STORE.myshopify.com"
./scripts/auth-new-store.sh
```

The script requests full theme + i18n scopes and runs `shopify theme list` to confirm.

Legacy manual command (same scopes):

```bash
export SHOPIFY_STORE="YOUR-NEW-STORE.myshopify.com"
shopify store auth --store "$SHOPIFY_STORE" \
  --scopes read_themes,write_themes,read_locales,write_locales,read_translations,write_translations,\
read_content,write_content,read_online_store_pages,write_online_store_pages,read_markets,write_markets,read_products
```

Approve in the browser when prompted.

### Target store (migration)

| Hostname | Role |
|----------|------|
| `6mzhe1-yf.myshopify.com` | **Canonical** — set `SHOPIFY_STORE` and `SHOPIFY_FLAG_STORE` here; **www.lurafi.com** primary domain |
| `mitipi-2.myshopify.com` | Market/hreflang alias only — do **not** use for Admin, OAuth, or deploy |
| `fu03cn-1v.myshopify.com` | Old lurafi production — do not deploy here |

### Admin UI platform error

If `admin.shopify.com/store/6mzhe1-yf` shows a **Shopify platform error** (with a correlation id), that is a **Shopify-side** outage or account issue — not the wrong store slug. API/scripts may still work via `SHOPIFY_ADMIN_TOKEN`. Contact [Shopify Support](https://help.shopify.com/en/questions) with the correlation id and store `6mzhe1-yf.myshopify.com`. Try `https://6mzhe1-yf.myshopify.com/admin` or another browser/incognito while logged in as the store owner.

### Troubleshooting: lurafi.com `/` or `/products/kevin` return 404

Verified pattern (2026-06-03):

| URL | Typical status | Meaning |
|-----|----------------|---------|
| `/` | 404 (generic Shopify HTML) | Live theme missing default `templates/index.json` or incomplete deploy |
| `/?view=index` | 200 | Theme index works when template is forced |
| `/pages/configure` | 200 | Page template present on live theme |
| `/products/kevin` | 404 | Live theme missing `templates/product.json` or product not on Online Store |
| `/products/kevin?view=configure` | 200 | Alternate product template works |
| `/products.json` | 200 | Products exist in catalog |

**Fix:** Run a **full** theme deploy to live theme `184679596410` on `6mzhe1-yf.myshopify.com` after a valid Admin token:

```bash
npm run shopify:approve-scopes
./scripts/shopify-refresh-admin-token.sh
./scripts/sync-github-deploy-secrets.sh
# GitHub → Actions → Deploy theme (manual) → theme_id 184679596410
# or locally:
npm run theme:push:live
```

Also check **Settings → Online Store → Preferences → Homepage** is not set to a deleted page.

### Troubleshooting: “Unauthorized Access” or “don't have access to this dev store”

This means the **Shopify account in your browser / CLI is not staff on that store**.

| Symptom | Cause | Fix |
|---------|-------|-----|
| Browser: **Unauthorized Access** during `store auth` | Wrong Shopify login, or not invited to store | Log into `https://admin.shopify.com/store/6mzhe1-yf` with the **store owner** account first |
| CLI: **don't have access to this dev store** | CLI partner session is `adam.ripon@surfstr.com` but store is under another login (e.g. Mitipi) | Use the owner account, or add your email as **staff** with Themes permission |
| Auth loop / wrong store | Stale CLI session | `shopify auth logout` → `shopify auth login` → pick correct account → re-run auth script |

**Step-by-step fix:**

```bash
# 1. Clear wrong Shopify login
shopify auth logout

# 2. Log in with the account that owns mitipi-2 (may NOT be adam.ripon@surfstr.com)
shopify auth login

# 3. Confirm you can open Admin in browser:
#    https://admin.shopify.com/store/6mzhe1-yf

# 4. Re-auth store (full scopes)
cd /Users/adam/lurafi
./scripts/auth-new-store.sh 6mzhe1-yf.myshopify.com
```

**If the store owner is someone else:** ask them to invite **adam.ripon@surfstr.com** (or your CLI email) under **Settings → Users and permissions** with **Themes** + **Products** access.

**Bypass browser OAuth (recommended for CI and when OAuth fails):**

Mitipi no longer uses legacy “Develop apps” in Admin. Use the **lurafi** app in [Dev Dashboard](https://dev.shopify.com) → **Settings** → **App automation token** (or an Admin API access token from a custom app if you have one).

```bash
cd /Users/adam/lurafi

# 1) Add to .env (gitignored) — paste real token once, never in chat:
#    SHOPIFY_STORE=6mzhe1-yf.myshopify.com
#    SHOPIFY_ADMIN_TOKEN=paste-your-token-here-once

# 2) Verify token (no browser OAuth)
./scripts/auth-with-token.sh 6mzhe1-yf.myshopify.com

# 3) Full migration (skips shopify store auth when SHOPIFY_ADMIN_TOKEN is set)
./scripts/migrate-to-store.sh
```

`migrate-to-store.sh` and `activate-locales.sh` read `.env` automatically. They pass `--password` to `shopify theme push` and use the token for Admin GraphQL in `setup-shopify-i18n.mjs`.

Optional env aliases: `SHOPIFY_THEME_PASSWORD` (same as admin token for theme CLI), `SHOPIFY_THEME_NAME=lurafi-deploy` (unpublished theme name).

Then add the same token to GitHub `production` secrets (see section 1).

### Optional: refresh old store session

```bash
shopify store auth --store fu03cn-1v.myshopify.com \
  --scopes read_themes,write_themes,read_products
```

### Verify

```bash
export SHOPIFY_STORE="YOUR-NEW-STORE.myshopify.com"
shopify theme list -s "$SHOPIFY_STORE"
```

You should see theme(s) listed without auth errors.

### Local `.env` (optional, gitignored)

```bash
cp .env.example .env
```

```env
SHOPIFY_STORE=6mzhe1-yf.myshopify.com
OLD_SHOPIFY_STORE=fu03cn-1v.myshopify.com
SHOPIFY_ADMIN_TOKEN=paste-your-token-here-once
SHOPIFY_THEME_NAME=lurafi-deploy
```

---

## 3. Cloudflare (`lurafi.com`)

DNS for Shopify must use **grey cloud (DNS only)** on A/CNAME records. See [CLOUDFLARE-DNS.md](./CLOUDFLARE-DNS.md).

### Option A — Dashboard (simplest)

1. Log in at [dash.cloudflare.com](https://dash.cloudflare.com)
2. Open zone **lurafi.com**
3. **DNS → Records** — agent guides you at cutover; no token required if you edit manually

### Option B — API token (lets Cursor/script read DNS)

1. Cloudflare → **My Profile → API Tokens → Create Token**
2. Use template **Edit zone DNS** or custom:
   - Permissions: **Zone → DNS → Edit**
   - Zone Resources: **Include → Specific zone → lurafi.com**
3. Copy token once → local `.env`:

```env
CLOUDFLARE_API_TOKEN=your_token_here
CLOUDFLARE_ZONE_ID=   # optional; zone Overview → API section on right
```

Never commit `.env`.

### Option C — Wrangler CLI

```bash
npm install -g wrangler
wrangler login
wrangler whoami
```

### Option D — Cloudflare MCP in Cursor

1. **Cursor Settings → MCP**
2. Enable **Cloudflare** plugin → **Connect / Reauthenticate**
3. Tell the agent when connected so it can use Cloudflare docs/tools

### Verify

```bash
dig lurafi.com NS +short    # should show *.ns.cloudflare.com
./scripts/verify-access.sh
```

---

## 4. Information to send the agent

Copy-paste when ready (no passwords or tokens in chat):

```
NEW_SHOPIFY_STORE=6mzhe1-yf.myshopify.com
NEW_STORE_READY=[ ] lurafi app installed  [ ] SHOPIFY_ADMIN_TOKEN in .env  [ ] auth-with-token.sh OK
GITHUB_SECRETS (environment **production**, not repo-level): run `./scripts/sync-github-deploy-secrets.sh` from a machine with `.env` set.

- [ ] `SHOPIFY_FLAG_STORE` = `6mzhe1-yf.myshopify.com`
- [ ] `SHOPIFY_CLI_THEME_TOKEN` (refreshed app token)
- [ ] `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET` (optional; deploy workflow refreshes token each run)
CLOUDFLARE=[ ] dashboard access  [ ] API token in .env  [ ] MCP connected
CUTOVER_DOMAIN=lurafi.com
ORDERS_ON_OLD_STORE=yes/no
```

---

## 5. After access — what the agent runs

1. `./scripts/verify-access.sh`
2. Branch: `domain: lurafi.com` + `geo:generate`
3. `./scripts/migrate-to-store.sh` or GitHub Deploy workflow
4. `SHOPIFY_STORE=... ./scripts/activate-locales.sh`
5. QA on `*.myshopify.com`
6. Cloudflare DNS + connect domain in new Shopify Admin
7. Update repo deploy defaults + remove domain from old store

---

## Security

- Do **not** paste Admin API tokens, Cloudflare tokens, or PATs in chat
- Use GitHub Secrets for CI; `.env` for local only
- Rotate tokens if exposed
