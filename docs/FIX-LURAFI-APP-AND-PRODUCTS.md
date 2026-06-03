# Fix lurafi app + products (June 2026 Dev Dashboard)

## Problem

- **fullaccess** is released but **6mzhe1-yf** (lurafi.com) still runs the old install (no `write_products` on the token).
- **App URL** `https://example.com` breaks Install → “Example Domain” page.

## A. Approve scopes on the store (do first)

**Option 1 — OAuth link (fastest)**

```bash
./scripts/request-app-scope-approval.sh
```

Log in as **mma@surfstr.ch**, click **Install / Approve**, then:

```bash
./scripts/shopify-refresh-admin-token.sh
npm run shopify:products:migrate
```

**Option 2 — Dev Dashboard**

1. [dev.shopify.com](https://dev.shopify.com) → **lurafi** → **Home** → **Install app** → **6mzhe1-yf** (Mitipi GmbH / lurafi.com) → **Install**.

**Option 3 — CSV (no API)**

Admin → **Products** → **Import** → `scripts/data/products-import.csv`

## B. Fix App URL (stop Example Domain)

1. Dev Dashboard → **lurafi** → **Versions** → **Create version** (e.g. `fullaccess-url-fix`).
2. **App URL:** `https://shopify.dev/apps/default-app-home`
3. Turn off **Embed app in Shopify admin** if shown.
4. Keep scopes (include **write_products**).
5. **Release** → **Home** → **Install app** on **6mzhe1-yf** if asked.

## C. Verify

```bash
npm run qa:mitipi
```

- https://lurafi.com/products/kevin → must not 404
- https://lurafi.com/pages/configure?plan=buy → configure UI
