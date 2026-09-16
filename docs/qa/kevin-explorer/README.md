# Release validation — 17 September 2026

- Responsive/browser matrix: 8 of 8 passed, spanning Chromium, WebKit and Firefox from 320px phones to 4K desktop layouts.
- Cart error/success scenarios: 7 of 7 passed; no cart-clear requests.
- Committed regression suite: 5 of 5 passed (photo fallback, configure cart success/rejection/uncertain response, refreshed-price device plus optional cover).
- Extended interactions: passed marker spacing, immediate popup, keyboard, motion toggle, Back/focus restoration, mobile sheet and enlarged text containment. The final visibility fix removes reliance on a stale renderer-facing flag after camera jumps.
- Emulated touch: a vertical swipe scrolled the page while the inline model remained interactive.
- Real Shopify unpublished-theme test: KEVIN plus a white extra cover added once, an existing brown cover preserved, displayed bundle total matched actual cart. Fresh anonymous session; no checkout/order submitted and user's cart untouched.
- Rendered locale checks: English exercised in the browser matrix; German, French, Dutch and Czech each rendered complete translated explorer copy and four accessory variants.
- Shopify skill validator: 11 of 11 files valid, revision 5. Theme Check: zero errors; existing warnings retained. Asset audit and whitespace checks passed.
- Before release, 12 existing live theme files matched the saved backup; no concurrent live changes were overwritten.

Original photographs and approved desktop/mobile GLBs are preserved. The release-assets manifest records shipped component asset hashes. Screenshots show local QA, not a production transaction.

These checks use browser and device emulation, not certification on every physical iOS, Android or TV device. The two top apertures share a factual description until their individual positions can be confirmed. Native AR is not included.
