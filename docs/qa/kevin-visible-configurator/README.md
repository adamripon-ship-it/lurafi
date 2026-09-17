# Visible KEVIN configurator QA — 17 September 2026

Validated on unpublished Shopify theme 186299253114 before deployment.

- Eight browser/viewport combinations: Chromium desktop, Pixel 7, landscape tablet and 4K; WebKit small iPhone, portrait tablet and landscape phone; Firefox notebook. All five materials, feature popups, placement, gallery/3D switch, quantity controls, modal exit and viewport fit passed.
- Final desktop and small-phone checks repeated after pricing changes. Five published languages passed at 320 × 568, with all visible buttons, links, summaries, inputs and selectors at least 48 CSS pixels. A real touch tap after numeric input opens the summary on the first attempt. Safari's native selector appearance was replaced to honor the 48px height. The German purchase label wraps without widening the existing pricing card.
- Desktop explorer accessibility scan: no WCAG A/AA violations in the tested component.
- Twelve automated regression cases passed. Quotes and cart writes are mocked in those cases; checkout stops at the navigation boundary.
- Separate anonymous Shopify cart test: 2 devices + 2 white + 3 blue covers; quote and real selected cart lines both CHF 1,207.06. Existing brown cover preserved; preview quoting did not modify the active cart. No order placed; merchant browser cart untouched.
- Anonymous quotes returned the expected currency for CH, IE, DE, FR, NL and CZ. Pricing/discount rules are not embedded in the theme.
- Liquid/JavaScript/CSS validation passed. Theme check: 0 errors, 8 pre-existing warnings. Asset audit passed.
- Original animation methods/keyframes, GLBs and reference photos unchanged.
- Ten live files matched the reviewed base before deployment. Remote main also matched the base. Deployment changes only the selected theme files and never deletes live-only assets.

Saved JSON reports omit cart/session identifiers, cookies, tokens and unnecessary API extensions. `theme-check.json` contains only file locations and diagnostic messages. Screenshots are emulated browser results, not certification of every physical device or TV operating system.
