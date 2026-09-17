(function () {
  'use strict';

  var root = document.querySelector('[data-configure]');
  if (!root) return;

  var dataEl = document.getElementById('ConfigureData');
  if (!dataEl) return;

  var data;
  try {
    data = JSON.parse(dataEl.textContent);
  } catch (e) {
    return;
  }

  if (data.moneyFormat) {
    window.themeMoneyFormat = data.moneyFormat;
  }

  // Currency formatting for the client-computed totals. Shopify's option
  // selection helper (Shopify.formatMoney) is not loaded on this custom page,
  // so we format with Intl.NumberFormat using the market's presentment
  // currency (resolved server-side in ConfigureData.currency) and a locale
  // derived from the active language. This guarantees the currency symbol
  // always shows and matches the selected market: € for the euro markets
  // (Ireland/Netherlands/France/Germany) and Kč for the Czech koruna market.
  var CURRENCY = String(data.currency || 'EUR').toUpperCase();
  var LOCALE_BY_LANG = {
    en: 'en-IE', nl: 'nl-NL', fr: 'fr-FR', de: 'de-DE', cs: 'cs-CZ'
  };
  function moneyLocale() {
    var lang = (document.documentElement.lang || 'en').split('-')[0].toLowerCase();
    return LOCALE_BY_LANG[lang] || 'en-IE';
  }
  var moneyFormatter = null;
  function getMoneyFormatter() {
    if (moneyFormatter) return moneyFormatter;
    try {
      moneyFormatter = new Intl.NumberFormat(moneyLocale(), {
        style: 'currency', currency: CURRENCY
      });
    } catch (e) {
      moneyFormatter = null;
    }
    return moneyFormatter;
  }
  function formatCents(cents) {
    var value = (Number(cents) || 0) / 100;
    var fmt = getMoneyFormatter();
    if (fmt) return fmt.format(value);
    if (window.LurafiCart && window.LurafiCart.formatMoney) {
      return window.LurafiCart.formatMoney(cents);
    }
    return value.toFixed(2);
  }

  var STORAGE_KEY = 'lurafi_configure';

  var state = {
    variantId: null,
    quantity: 1
  };

  var els = {
    image: root.querySelector('[data-configure-image]'),
    colorName: root.querySelectorAll('[data-configure-color-name]'),
    colorNameInline: root.querySelector('[data-configure-color-name-inline]'),
    chipDot: root.querySelector('[data-configure-chip-dot]'),
    stickyColor: root.querySelector('[data-configure-sticky-color]'),
    swatches: root.querySelector('[data-configure-swatches]'),
    qtyWrap: root.querySelector('[data-configure-qty]'),
    qtyValue: root.querySelector('[data-configure-qty-value]'),
    qtyMinus: root.querySelector('[data-configure-qty-minus]'),
    qtyPlus: root.querySelector('[data-configure-qty-plus]'),
    features: root.querySelector('[data-configure-features]'),
    total: root.querySelector('[data-configure-total]'),
    totalSuffix: root.querySelector('[data-configure-total-suffix]'),
    summaryColor: root.querySelector('[data-configure-summary-color]'),
    summaryPlan: root.querySelector('[data-configure-summary-plan]'),
    summaryCoversRow: root.querySelector('[data-configure-summary-covers-row]'),
    summaryCovers: root.querySelector('[data-configure-summary-covers]'),
    stickyTotal: root.querySelector('[data-configure-sticky-total]'),
    stickyTotalSuffix: root.querySelector('[data-configure-sticky-total-suffix]'),
    perDevice: root.querySelector('[data-configure-per-device]'),
    ctas: root.querySelectorAll('[data-configure-checkout]'),
    ctaLabels: root.querySelectorAll('[data-configure-cta-label]'),
    error: root.querySelector('[data-configure-error]')
  };

  function getPlanData() {
    return data.buy;
  }

  function getVariants() {
    var plan = getPlanData();
    return plan && plan.variants ? plan.variants : [];
  }

  function findVariantById(id) {
    return getVariants().find(function (v) { return String(v.id) === String(id); });
  }

  function colorKey(name) {
    return (name || '').toLowerCase().replace(/\s+/g, '');
  }

  function displayColor(name) {
    var key = colorKey(name);
    var colors = window.themeTranslations && window.themeTranslations.colors;
    if (colors && colors[key]) return colors[key];
    return name;
  }

  function deviceAlt(colorName) {
    var template = window.themeTranslations && window.themeTranslations.configure && window.themeTranslations.configure.deviceIn;
    var label = displayColor(colorName);
    if (template) return template.replace('{{ color }}', label).replace('{{ color }}', label);
    return 'Kevin in ' + label;
  }

  function buildAssetUrl(fileName) {
    var sample = data.defaultImage || (data.colorImages && (data.colorImages.grey || data.colorImages.white));
    if (sample) {
      var absolute = sample.indexOf('//') === 0 ? window.location.protocol + sample : sample;
      return absolute.replace(/\/assets\/[^/?#]+(?:\?[^#]*)?/, '/assets/' + fileName);
    }
    return window.location.origin + '/cdn/shop/t/1/assets/' + fileName;
  }

  // Only one unit colour exists (Grey). The image for it is the first
  // gallery slide, resolved server-side (Theme Editor → Shopify product
  // media → bundled asset) and exposed as ConfigureData.colorImages.grey.
  function getVariantImage(variant) {
    var key = colorKey(variant.color);
    if (data.colorImages && data.colorImages[key]) return data.colorImages[key];
    if (variant.image) return variant.image;
    return data.defaultImage;
  }

  function getHex(colorName) {
    var map = data.colorHex || {};
    return map[colorKey(colorName)] || '#8e8e93';
  }

  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  function loadState() {
    try {
      var saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return null;
  }

  function initPlanFromUrl() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('plan') === 'subscribe') {
      params.delete('plan');
      var next = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', next);
    }
  }

  function initVariant() {
    var variants = getVariants();
    if (!variants.length) return;
    var saved = loadState();
    if (saved && saved.variantId && findVariantById(saved.variantId)) {
      state.variantId = saved.variantId;
      if (Number.isSafeInteger(saved.quantity) && saved.quantity >= 0) state.quantity = saved.quantity;
    }
    if (!state.variantId) state.variantId = variants[0].id;
  }

  function renderSwatches() {
    if (!els.swatches) return;
    els.swatches.innerHTML = '';
    getVariants().forEach(function (variant) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'configure-swatch' + (String(variant.id) === String(state.variantId) ? ' is-selected' : '');
      // Single device colour — show the real product photo, not a flat swatch.
      var swatchImg = getVariantImage(variant);
      if (swatchImg) {
        btn.classList.add('configure-swatch--photo');
        var im = document.createElement('img');
        im.src = swatchImg;
        im.alt = '';
        im.loading = 'lazy';
        btn.appendChild(im);
      } else {
        btn.style.setProperty('--swatch-color', getHex(variant.color));
      }
      btn.dataset.colorKey = colorKey(variant.color);
      btn.title = displayColor(variant.color);
      btn.setAttribute('aria-label', displayColor(variant.color));
      btn.setAttribute('aria-pressed', String(variant.id) === String(state.variantId));
      btn.dataset.variantId = variant.id;
      btn.addEventListener('click', function () {
        state.variantId = variant.id;
        saveState();
        render();
      });
      els.swatches.appendChild(btn);
    });
  }

  function renderFeatures() {
    if (!els.features) return;
    var plan = getPlanData();
    var features = plan && plan.features ? plan.features : [];
    els.features.innerHTML = features.map(function (f) {
      return '<li class="configure-feature"><span class="configure-feature__icon" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span><span class="configure-feature__text">' + f + '</span></li>';
    }).join('');
  }

  function renderPlanCards() {
    if (els.qtyWrap) els.qtyWrap.hidden = false;
  }

  function getLinePriceCents() {
    var variant = findVariantById(state.variantId);
    var cents = variant ? variant.price * state.quantity : 0;
    return cents + coversPriceCents();
  }

  // Order-summary line for the optional covers, e.g. "Red ×1, Blue ×2 · €89.85".
  function renderCoversSummary() {
    if (!els.summaryCovers) return;
    var covers = selectedCovers();
    if (!covers.length) {
      els.summaryCovers.textContent = els.summaryCovers.getAttribute('data-none-label') || '—';
      if (els.summaryCoversRow) els.summaryCoversRow.classList.remove('has-covers');
      return;
    }
    var parts = covers.map(function (c) { return c.name + ' \u00d7' + c.qty; });
    els.summaryCovers.textContent = parts.join(', ') + ' \u00b7 ' + formatCents(coversPriceCents());
    if (els.summaryCoversRow) els.summaryCoversRow.classList.add('has-covers');
  }

  function renderTotal() {
    var variant = findVariantById(state.variantId);
    var cents = getLinePriceCents();
    var formatted = formatCents(cents);
    renderCoversSummary();
    if (els.total) {
      els.total.textContent = formatted;
    }
    if (els.totalSuffix) {
      els.totalSuffix.textContent = '';
    }
    if (els.stickyTotal) {
      els.stickyTotal.textContent = formatted;
    }
    if (els.stickyTotalSuffix) {
      els.stickyTotalSuffix.textContent = '';
    }
    if (els.perDevice) {
      if (state.quantity > 1 && variant) {
        els.perDevice.hidden = false;
        var perSuffix = (window.themeTranslations && window.themeTranslations.configure && window.themeTranslations.configure.perDevice) || ' per device';
        els.perDevice.textContent = formatCents(variant.price) + perSuffix;
      } else {
        els.perDevice.hidden = true;
      }
    }
    publishConfiguration();
  }

  function renderSummary() {
    var variant = findVariantById(state.variantId);
    if (els.summaryColor && variant) {
      els.summaryColor.textContent = displayColor(variant.color);
    }
    if (els.summaryPlan) {
      var t = window.themeTranslations && window.themeTranslations.configure;
      els.summaryPlan.textContent = (t && t.summaryPlanBuy) || 'One-time purchase';
    }
  }

  function renderImage() {
    var variant = findVariantById(state.variantId);
    if (!variant || !els.image) return;
    var src = getVariantImage(variant);
    if (els.image.src !== src) {
      els.image.style.opacity = '0';
      setTimeout(function () {
        els.image.src = src;
        els.image.alt = deviceAlt(variant.color);
        els.image.style.opacity = '1';
      }, 150);
    }
    var label = displayColor(variant.color);
    if (els.colorName && els.colorName.length) {
      els.colorName.forEach(function (node) { node.textContent = label; });
    }
    if (els.colorNameInline) els.colorNameInline.textContent = label;
    if (els.stickyColor) els.stickyColor.textContent = label;
    if (els.chipDot) els.chipDot.style.background = getHex(variant.color);
  }

  function renderQty() {
    if (els.qtyValue) els.qtyValue.textContent = state.quantity;
  }

  function render() {
    renderSwatches();
    renderPlanCards();
    renderFeatures();
    renderImage();
    renderQty();
    renderTotal();
    renderSummary();
    saveState();
  }

  if (els.qtyMinus) {
    els.qtyMinus.addEventListener('click', function () {
      state.quantity = Math.max(0, state.quantity - 1);
      render();
    });
  }
  if (els.qtyPlus) {
    els.qtyPlus.addEventListener('click', function () {
      state.quantity = Math.min(Number.MAX_SAFE_INTEGER, state.quantity + 1);
      render();
    });
  }

  function isValidVariantId(id) {
    var n = Number(id);
    return n > 0 && Number.isFinite(n);
  }

  function trackBeginCheckout(variant, item) {
    if (!window.LurafiCart || typeof window.LurafiCart.track !== 'function') return;
    var unitPrice = variant && variant.price != null ? variant.price : 0;
    window.LurafiCart.track('begin_checkout', {
      items: [
        {
          product_id: variant && variant.product_id,
          id: variant && variant.id,
          product_title: (variant && variant.product_title) || 'Kevin',
          variant_title: (variant && variant.color) || '',
          final_price: unitPrice,
          price: unitPrice,
          quantity: item.quantity || 1
        }
      ],
      total_price: unitPrice * (item.quantity || 1)
    }, { plan: 'buy' });
  }

  // Optional paid front covers: {id, qty} for every cover with quantity > 0
  // (any colour, any volume).
  function selectedCovers() {
    var out = [];
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-configure-covers] .configure-cover[data-cover-id]'),
      function (card) {
        var id = card.getAttribute('data-cover-id');
        var qtyEl = card.querySelector('[data-cover-qty]');
        var qty = qtyEl ? Number(qtyEl.textContent) || 0 : 0;
        var price = Number(card.getAttribute('data-cover-price')) || 0;
        var nameEl = card.querySelector('.configure-cover__name');
        var name = nameEl ? nameEl.textContent.trim() : '';
        if (id && Number(id) > 0 && qty > 0) out.push({ id: id, qty: qty, price: price, name: name });
      }
    );
    return out;
  }

  // Cover add-ons contribute to the running total (device price + covers).
  function coversPriceCents() {
    return selectedCovers().reduce(function (sum, c) { return sum + c.price * c.qty; }, 0);
  }

  // Cart permalinks (/cart/{id}:{qty},…) send the customer straight to
  // checkout by default; only ?storefront=true would divert to the cart page.
  function goToCartPermalink(item, variant) {
    trackBeginCheckout(variant, item);
    var quantity = Number(item.quantity) || 1;
    var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    if (root.charAt(root.length - 1) !== '/') root += '/';
    var url = root + 'cart/' + encodeURIComponent(item.id) + ':' + encodeURIComponent(quantity);
    selectedCovers().forEach(function (c) {
      url += ',' + encodeURIComponent(c.id) + ':' + encodeURIComponent(c.qty);
    });
    window.location.href = url;
  }

  function checkoutRequest(url, options) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 20000);
    return fetch(url, Object.assign({}, options, { signal: controller.signal })).finally(function () { clearTimeout(timer); });
  }

  els.ctas.forEach(function (cta) {
    cta.addEventListener('click', async function () {
      if (cta.disabled) return;
      var variant = findVariantById(state.variantId);
      if (!variant) {
        if (els.error) {
          els.error.hidden = false;
          els.error.textContent = (window.themeTranslations && window.themeTranslations.configure && window.themeTranslations.configure.errorProducts) || 'Please assign products in Theme settings → Products.';
        }
        els.ctas.forEach(function (button) { button.disabled = false; });
        resetCtaLabels();
        return;
      }
      if (!isValidVariantId(variant.id)) {
        if (els.error) {
          els.error.hidden = false;
          els.error.textContent = (window.themeTranslations && window.themeTranslations.configure && window.themeTranslations.configure.errorCheckout) || 'Online checkout is almost ready. Email hello@mitipi.eu to order, or try again soon.';
        }
        els.ctas.forEach(function (button) { button.disabled = false; });
        resetCtaLabels();
        return;
      }
      if (els.error) els.error.hidden = true;
      els.ctas.forEach(function (button) {
        button.disabled = true;
      });
      els.ctaLabels.forEach(function (label) {
        label.textContent = (window.themeTranslations && window.themeTranslations.configure && window.themeTranslations.configure.processing) || 'Processing…';
      });

      var item = {
        id: variant.id,
        quantity: state.quantity
      };

      var items = (item.quantity > 0 ? [item] : []).concat(selectedCovers().map(function (cover) {
        return { id: cover.id, quantity: cover.qty };
      }));
      var localeRoot = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
      var sent = false;
      state.locked = true;
      publishConfiguration();
      try {
        if (!items.length) throw new Error('Empty selection');
        await Promise.all(items.map(async function (line) {
          var response = await checkoutRequest(localeRoot + 'variants/' + line.id + '.js', { credentials: 'same-origin' });
          if (!response.ok) throw new Error('Price unavailable');
          var offer = await response.json();
          if (!offer.available) throw new Error('Unavailable');
          applyPrice(offer.id || line.id, offer.price, offer.available);
        }));
        renderTotal();
        var explorer = root.querySelector('kevin-explorer');
        if (explorer?.requestQuote) await explorer.requestQuote(true);
        sent = true;
        var response = await checkoutRequest(localeRoot + 'cart/add.js', {
          method: 'POST', credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: items })
        });
        if (!response.ok) {
          // Shopify may partially add available stock on an error; check the cart before retrying.
          throw new Error('Cart update failed');
        }
        trackBeginCheckout(variant, item);
        window.location.href = localeRoot + 'checkout';
      } catch (error) {
        state.locked = sent;
        state.message = sent ? data.explorerCartUnknown : data.explorerCartError;
        publishConfiguration();
        if (els.error) {
          els.error.hidden = false;
          els.error.textContent = state.message;
          var cartLink = document.createElement('a');
          cartLink.href = localeRoot + 'cart';
          cartLink.className = 'ke-checkout-cart';
          cartLink.textContent = data.explorerViewCart;
          els.error.appendChild(document.createTextNode(' '));
          els.error.appendChild(cartLink);
        }
        if (!sent) {
          resetCtaLabels();
        }
      }
    });
  });

  // Optional front-cover add-ons: per-cover quantity steppers. Covers without a
  // real Shopify variant id are shown but not purchasable (data-cover-soon).
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-configure-covers] .configure-cover'),
    function (card) {
      if (card.getAttribute('data-cover-soon') === '1') return;
      var qtyEl = card.querySelector('[data-cover-qty]');
      var minus = card.querySelector('[data-cover-minus]');
      var plus = card.querySelector('[data-cover-plus]');
      if (!qtyEl || !minus || !plus) return;
      function setQty(n) {
        n = Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, n));
        qtyEl.textContent = String(n);
        card.classList.toggle('is-selected', n > 0);
        renderTotal();
      }
      minus.addEventListener('click', function () { setQty((Number(qtyEl.textContent) || 0) - 1); });
      plus.addEventListener('click', function () { setQty((Number(qtyEl.textContent) || 0) + 1); });
    }
  );

  // Product gallery: scroll-snap track (swipe on touch), prev/next arrows,
  // thumbnail tabs, arrow keys. Thumbs mirror the visible slide on scroll.
  (function initGallery() {
    var track = root.querySelector('[data-gallery-track]');
    if (!track) return;
    var slides = Array.prototype.slice.call(track.querySelectorAll('[data-gallery-slide]'));
    var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-gallery-thumb]'));
    var prev = root.querySelector('[data-gallery-prev]');
    var next = root.querySelector('[data-gallery-next]');
    if (slides.length < 2) return;
    var status = root.querySelector('[data-gallery-status]');
    var slideLabel = track.getAttribute('data-slide-label') || '';
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var index = 0;
    function setActive(i, announce) {
      index = (i + slides.length) % slides.length;
      thumbs.forEach(function (t, n) {
        var on = n === index;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      slides.forEach(function (s, n) {
        if (n === index) s.removeAttribute('aria-hidden');
        else s.setAttribute('aria-hidden', 'true');
      });
      if (announce && status && slideLabel) {
        // Clear then set so repeated announcements fire reliably.
        status.textContent = '';
        requestAnimationFrame(function () { status.textContent = slideLabel.replace('__N__', String(index + 1)); });
      }
    }
    function goTo(i, behavior) {
      setActive(i, true);
      track.scrollTo({ left: slides[index].offsetLeft, behavior: reduceMotion ? 'auto' : (behavior || 'smooth') });
    }
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () { goTo(Number(t.getAttribute('data-index')) || 0); });
    });
    if (prev) prev.addEventListener('click', function () { goTo(index - 1); });
    if (next) next.addEventListener('click', function () { goTo(index + 1); });
    var raf = 0;
    track.addEventListener('scroll', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        if (i !== index) setActive(i, true);
      });
    }, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
    });
  })();

  function resetCtaLabels() {
    var t = window.themeTranslations && window.themeTranslations.configure;
    var mainLabel = (t && t.checkoutCta) || 'Continue to checkout';
    var stickyLabel = (t && t.stickyCheckout) || 'Checkout';
    els.ctaLabels.forEach(function (label, index) {
      label.textContent = index === 0 ? mainLabel : stickyLabel;
    });
  }


  // One configuration state drives the photo page, the 3D controls and checkout.
  function publishConfiguration() {
    var variant = findVariantById(state.variantId);
    if (!variant) return;
    if (els.qtyMinus) els.qtyMinus.disabled = Boolean(state.locked) || state.quantity === 0;
    if (els.qtyPlus) els.qtyPlus.disabled = Boolean(state.locked);
    els.ctas.forEach(function (button) { button.disabled = Boolean(state.locked) || (state.quantity === 0 && !selectedCovers().length); });
    root.querySelectorAll('[data-cover-colour]').forEach(function (card) {
      var quantity = Number(card.querySelector('[data-cover-qty]')?.textContent) || 0;
      var minus = card.querySelector('[data-cover-minus]'), plus = card.querySelector('[data-cover-plus]');
      if (minus) minus.disabled = Boolean(state.locked) || quantity === 0;
      if (plus) plus.disabled = Boolean(state.locked) || card.dataset.coverSoon === '1';
    });
    var covers = Array.from(root.querySelectorAll('[data-cover-colour]')).map(function (card) {
      return { id: card.dataset.coverId, colour: card.dataset.coverColour, amount: Number(card.dataset.coverPrice) || 0, available: card.dataset.coverSoon !== '1', quantity: Number(card.querySelector('[data-cover-qty]')?.textContent) || 0 };
    });
    root.dispatchEvent(new CustomEvent('kevin:configuration', { bubbles: true, detail: { quantity: state.quantity, device: { id: variant.id, amount: variant.price, available: variant.available !== false }, covers: covers, locked: Boolean(state.locked), message: state.message || '' } }));
  }
  function applyPrice(id, amount, available) {
    var variant = findVariantById(id);
    if (variant && typeof amount === 'number') { variant.price = amount; variant.available = available; }
    root.querySelectorAll('[data-cover-id]').forEach(function (card) {
      if (String(card.dataset.coverId) !== String(id)) return;
      if (typeof amount === 'number') { card.dataset.coverPrice = amount; var label = card.querySelector('.configure-cover__price'); if (label) label.textContent = formatCents(amount); }
      card.dataset.coverSoon = available ? '0' : '1';
    });
  }
  root.addEventListener('kevin:quote-total', function (event) {
    var price = event.detail.text;
    if (els.total) els.total.textContent = price;
    if (els.stickyTotal) els.stickyTotal.textContent = price;
    els.ctas.forEach(function (button) { button.disabled = Boolean(state.locked) || !event.detail.ready; });
    var retry = root.querySelector('[data-configure-price-retry]');
    if (!retry && els.ctas[0]) {
      retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'btn-apple-secondary btn-block';
      retry.dataset.configurePriceRetry = '';
      retry.textContent = event.target.t('retry_price');
      retry.addEventListener('click', function () { event.target.requestQuote(true).catch(function () {}); });
      els.ctas[0].before(retry);
    }
    if (retry) retry.hidden = !event.detail.failed;
  });
  root.addEventListener('kevin:cart-lock' , function (event) {
    state.locked = event.detail.locked;
    state.message = event.detail.message || '';
    publishConfiguration();
  });
  root.addEventListener('kevin:price-refresh', function (event) {
    event.detail.forEach(function (offer) { applyPrice(offer.id, offer.amount, offer.available); });
    renderTotal();
  });
  root.addEventListener('kevin:quantity-change', function (event) {
    if (state.locked) return;
    var key = event.detail.key, quantity = event.detail.quantity;
    if (!Number.isSafeInteger(quantity) || quantity < 0) return;
    if (key === 'device') state.quantity = quantity;
    else root.querySelectorAll('[data-cover-colour]').forEach(function (card) {
      if (card.dataset.coverColour === key) {
        var value = card.querySelector('[data-cover-qty]');
        if (value) value.textContent = quantity;
        card.classList.toggle('is-selected', quantity > 0);
      }
    });
    renderQty();
    renderTotal();
    saveState();
  });
  function restoreExplorerSelection() {
    var params = new URLSearchParams(location.search);
    if (!params.has('kevin_qty')) return;
    function quantity(name, fallback) {
      var raw = params.get(name), n = Number(raw);
      return raw !== null && /^\d+$/.test(raw) && Number.isSafeInteger(n) ? n : fallback;
    }
    state.quantity = quantity('kevin_qty', 1);
    root.querySelectorAll('[data-cover-colour]').forEach(function (card) {
      var field = card.querySelector('[data-cover-qty]');
      if (field) field.textContent = quantity('cover_' + card.dataset.coverColour, 0);
    });
    var colour = params.get('preview');
    if (['grey','white','blue','brown','red'].includes(colour)) root.dataset.explorerPreview = colour;
    ['kevin_qty','cover_white','cover_blue','cover_brown','cover_red','preview'].forEach(function (key) { params.delete(key); });
    history.replaceState(history.state, '', location.pathname + (params.size ? '?' + params : '') + location.hash);
  }

  initPlanFromUrl();
  initVariant();
  restoreExplorerSelection();
  render();
  root.classList.add('configure-page--ready');
  if (root.dataset.explorerPreview) root.dispatchEvent(new CustomEvent('kevin:preview-ready', { detail: { colour: root.dataset.explorerPreview } }));
  resetCtaLabels();
})();
