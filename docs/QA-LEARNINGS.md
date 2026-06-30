# QA learnings — live Shopify storefront (mitipi.eu)

Operational notes for agents and CI running QA against the **production** Mitipi store.

**Store:** `6mzhe1-yf.myshopify.com` · **URL:** https://mitipi.eu · **Live theme:** `lurafi-deploy` (`184679596410`)

See also [INCIDENT-2026-06-24.md](./INCIDENT-2026-06-24.md) for the full post-mortem.

---

## Golden rules

1. **Never run `qa:full` back-to-back on mitipi.eu.** Wait at least **30 minutes** between full Playwright suites on the live domain.
2. **Theme/CMS changes do not cause TCP outages.** If HTTPS times out before HTML loads, suspect network, Shopify edge, or rate limits — not Liquid.
3. **Post-deploy smoke order:** Admin API → single `curl -I` → optional one browser viewport — not three full QA passes.
4. **429 / Cloudflare challenge = cooldown**, not a failed deploy. Message: *“Your connection needs to be verified before you can proceed.”*
5. **Admin API is the source of truth** when the browser fails: domains, live theme, products, locales.

---

## Recommended commands

| When | Command |
|------|---------|
| After theme push (fast) | `node scripts/qa-mitipi-backend.mjs` |
| HTTP smoke | `curl -sI https://mitipi.eu/ \| head -5` |
| CMS structure only | `LURAFI_URL=https://mitipi.eu node scripts/qa-full.mjs` *(HTTP + CMS checks only if you split — or use backend + curl)* |
| Full regression | `LURAFI_URL=https://mitipi.eu npm run qa:full` **once**, off-peak |
| Theme lint | `npm run theme:check` |

Targeted scripts (lighter than `qa:full`):

```bash
npm run qa:mitipi:backend
npm run qa:mitipi:browser    # 3 viewports — still heavy; don't chain
npm run qa:mitipi:audit
LURAFI_URL=https://mitipi.eu npm run qa:i18n
```

---

## Playwright stability (PR #21+)

Shared helpers: `scripts/lib/playwright-qa.mjs`

| Issue | Fix |
|-------|-----|
| Hang on `networkidle` | Use `domcontentloaded` + wait for `[data-configure]`, `.headline-hero`, `main` |
| shop.app CORS console errors | Filter via `filterCriticalConsoleErrors()` |
| `/checkout` link audit false positives | Skip `/checkout`, `/checkouts/*`, `/cdn-cgi/*` in full-site audit |
| Subscribe checkout URL without `selling_plan=` | Pass if checkout reached (plan on cart line item) |
| HTTP 429 | Retry with backoff; warn instead of fail in audit |

---

## Interpreting `qa:full` results

| Suite | What failure usually means |
|-------|----------------------------|
| Backend (Admin API) | Token, store config, missing product/page — **real** |
| HTTP storefront | Store down or wrong URL — **real** |
| CMS structure | Missing nav/hero/pricing markup — **real** theme issue |
| Browser QA | Often **429** if run after another heavy suite |
| Full-site audit | **429** mid-run or stale configure during challenge |
| i18n browser QA | **429** on `/account/login`; configure missing while challenged |
| Checkout smoke | Rate limit after subscribe+buy in one session; cart permalink OK |

**Healthy baseline (2026-06-24):** HTTP + backend + browser QA (46/46) all green when not rate-limited.

---

## What agents must not do

- Run `qa:full` three times in one session on production to “get green CI”
- Assume CMS merge broke the site because timing coincided with QA
- Use `networkidle` on Shopify storefronts
- Fail a deploy on shop.app console noise or `/checkout` HEAD probe errors
