# KEVIN explorer integration

## Placement and behavior

The homepage's Product link and secondary hero action lead to the explorer after Light, Shadow, Sound, before the existing product statistics. The purchase page retains Photos as its initial gallery and offers an explicit 3D switch. All five cover previews sit inside the model frame: vertically on its left edge on larger screens, horizontally across the bottom on phones. Selecting a colour preserves the camera angle and never adds an item. Grey is included with every device; other covers are separate, paid accessories.

The order panel sits alongside the model on desktop and directly below it on phones. It keeps quantities, the selection total and both purchase actions in the same viewport after entering the explorer. On short phones a native selector switches the single quantity row between KEVIN 3.0 and the selected cover. A per-colour badge records accessory quantities; opening the selection summary lists all selected lines. Steppers and direct numeric entry accept any nonnegative safe integer, with Shopify enforcing actual availability. There is no arbitrary five-device or 99-cover cap. Zero devices supports covers-only orders. Competing sticky purchase bars hide while this workspace is visible and return outside it.

The homepage's “Configure & buy KEVIN 3.0” link carries device quantity, each cover quantity and the preview colour into the purchase page. The existing purchase controls and 3D controls share one configuration state. Quantities are whitelisted and validated before restoring; transient URL parameters are removed after use.

Prices and availability refresh from market-specific Shopify variants. An anonymous, tokenless Storefront API `cartCreate` quote calculates the selected lines and automatic discounts using the current Liquid country. Quote requests omit cookies, request neither cart identifiers nor checkout URLs, and never modify the customer's Ajax cart. They are debounced, currency-checked, validated against requested quantities, protected from stale responses and refreshed before cart submission. Failed quotes disable purchase actions and provide retry controls in both the explorer and the normal purchase page. The displayed amount is the price for the current selection; shipping, customer-specific offers, discount codes and interactions with existing cart items are confirmed in the actual cart/checkout. No discount amounts or tiers are hardcoded.

Add to cart and checkout append the exact configured device/accessory quantities in one Ajax request. Existing cart items remain intact. Both purchase surfaces lock during submission. An ambiguous failure or Shopify 422 response may already have added available stock; the interface links to the cart and blocks a duplicate retry. No payment is submitted by this component.

The model and library load only after an explicit interaction. The smaller model is selected for small screens or data-saving connections. Original product photographs remain available if 3D cannot load. Twelve anchored icon markers cover the front, three buttons, both small top openings, rear lighting/LED groups/light channels, vents and feet. Nearby targets separate with leader lines and never overlap; the feature list remains available. A selected marker opens an animated explanation in a visible popover or phone bottom sheet. Motion diagrams illustrate benefits and have a pause toggle and reduced-motion support. Expanded view supports zoom, Escape/Back, focus return and scroll restoration. Inline view reserves vertical gestures for page scrolling. View buttons provide an alternative to dragging. Controls use at least 48px targets, with 4–12px gaps (8px between cover swatches); large displays use larger controls. Arrow-key navigation supplements Tab for remote-style controls. No sound or automatic rotation starts on load. Marker pulses and diagrams run for a short, bounded sequence after interaction.

Supported storefront locales are taken from the existing theme configuration: EN, DE, FR, NL and CS. Source copy also retains IT for future use. No language was published or removed by this change. Existing translations and store configuration were preserved. The pre-existing locale generator rewrites some unrelated approved strings; those unrelated changes were restored before deployment.

## Model and colour provenance

The desktop GLB is the approved photograph-based reconstruction. The mobile GLB preserves its silhouette and material assignments with smaller embedded textures. Four colour images are unchanged user-supplied references. Evenly focused interior fabric samples are baked into mirrored repeating textures at runtime. This removes the one-sided perspective blur of projecting the whole reference photograph. Their white image backgrounds are not applied to the product. The source images remain unchanged. Softer environment exposure and rougher housing materials reduce glare. Grey restores the original photographed texture and normal map. The 3D canvas is transparent. Colour previews are explicitly approximate, not calibrated material measurements.

## Product fact-check, 17 September 2026

- [x] List all factual claims: detachable magnetic covers and available colours; included grey versus paid accessories; everyday sound/Bluetooth; top-button modes; status LED and light sensor; light/shadow effect; wall distance; cooling/clear vents; four rubber feet and clearance; placement guidance.
- [x] Load canonical sources: manufacturer help and quick guide, manufacturer KEVIN.3 technical listing, repository `assets/llms-full.txt` and approved English locale, supplied photographs and user's cover/feet instructions.
- [x] Verify each claim in the table below.
- [x] Exclude unsupported statements: no individual identification of the two top openings, invented internal speaker layout, guaranteed protection, measured cooling gain, scratch-proofing or anti-vibration claim.
- [x] Re-read the complete source copy and five published translations for retained factual meaning.

| Claims | Evidence |
| --- | --- |
| Magnetic cover, colour range, grey supplied and extras purchased separately | [Manufacturer help](https://kevinswiss.com/help/), freshly retrieved, and merchant's explicit instructions |
| Everyday sound, presence simulation and Bluetooth speaker | Manufacturer help and repository product fact sheet |
| Power/middle/right controls, lamp and volume/brightness controls, offline use | [Manufacturer quick guide](https://kevinswiss.com/wp-content/uploads/2024/11/kevin-english-manual.png), visually inspected; help confirms blue Bluetooth status |
| Ambient light sensor for energy saving | [Manufacturer KEVIN.3 technical listing](https://shop.mitipi.com/shop/kevin-3-business/), indexed manufacturer text; its direct URL now redirects to a missing page. No left/right assignment of photographed apertures is claimed. |
| Rear light/shadows and outside-visible presence effects | Manufacturer help and product fact sheet |
| Sequenced lights and angled light-shaping channels | [Mitipi optical design WO2019042940A1](https://patents.google.com/patent/WO2019042940A1/en), used to explain the design principle, not a verified LED-by-LED KEVIN.3 wiring map. Single emitters and groups of three are visible in supplied photographs. |
| 15–60cm wall distance, avoid competing lamps, keep vents clear, avoid soft surfaces/covering | Manufacturer quick guide; its inconsistent inch conversion is deliberately omitted |
| Four rubber feet, grip and clearance below base | Merchant's explicit description and supplied underside photograph; clearance is visually observed, not a measured thermal benefit |
| Accessory price/availability | Live Shopify product variants, rendered for the current market; no fixed prices in JavaScript |

## Release and rollback

Live store: `6mzhe1-yf.myshopify.com`, domain `mitipi.eu`, theme `185079038330`.
Unpublished QA theme: `186299253114` (`kevin-explorer-qa-20260917`).

Deployment on merge pushes only changed theme files, with deletion disabled. This preserves live-only images and unrelated merchant edits. The original live theme was pulled to the private workspace before changes. Do not commit its private cookie jar, credentials or downloaded customer/session data.

To roll back this release, revert its merge commit through a reviewed PR. New explorer assets can safely remain unused, so remove their deletion entries from a rollback deployment list and restore only the prior versions of modified theme files. Republish the existing live theme to refresh Shopify's page cache, then run the backend check and one storefront smoke check. A full previous-theme backup is retained in the task workspace as an additional recovery option.

## Re-running regression checks

`EXPLORER_QA_URL=<local-rendered-theme-url> npx playwright test tests/e2e/explorer-regression.spec.js --project=chromium --workers=1`

These tests mock quotes and intercept cart writes, stopping at the checkout boundary. They cover photo fallback, mixed quantities above the old caps, covers-only orders, selection handoff, synchronized controls, stale price responses, automatic discounts, price failure/retry, submission locks and stock/network failures. Original responsive/material/accessibility results remain under `docs/qa/kevin-explorer/`; the quantity/visible-configurator release is recorded under `docs/qa/kevin-visible-configurator/`.

The isolated real Shopify check used two devices, two white covers and three blue covers, while preserving an existing brown cover. The quoted selection total exactly matched the selected cart lines (CHF 1,207.06, including the current automatic discount). This is dated QA evidence, not a price promise. No order was placed and the merchant's browser cart was untouched.

## Visible configurator fact-check, 17 September 2026

- [x] List new claims: KEVIN 3.0 branding, grey cover with every unit, optional extra covers, live selection pricing, quantity availability and successful cart addition.
- [x] Load sources: merchant's explicit product/included-cover instructions; manufacturer help and repository fact sheet from the preceding hardware review; current Shopify variants and isolated cart/quote responses.
- [x] Verify: included grey/paid extras follow merchant instructions; names and totals follow Shopify; success text appears only after a confirmed response. No new hardware claims were added.
- [x] Remove unsupported claims: no “unlimited stock,” guaranteed checkout total or hardcoded automatic discount. Selection-pricing note explains final cart reconciliation.
- [x] Re-read all five published locale changes: quantities, retry states, included cover and purchase labels preserve these meanings. Existing feature translations are unchanged.

API references: [Storefront tokenless access](https://shopify.dev/docs/api/storefront/latest), [Shopify cart creation and pricing](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage), [Ajax cart operations and partial stock errors](https://shopify.dev/docs/api/ajax/reference/cart). Touch sizing follows [Apple](https://developer.apple.com/design/tips/) and [Android](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views) guidance, with at least 48 CSS-pixel controls tested in the explorer.

Browser emulation does not certify every physical phone, iPad, Android tablet, TV OS or remote. No native TV application or AR flow is introduced. Older/non-WebGL browsers retain product photographs and the existing purchase controls.
