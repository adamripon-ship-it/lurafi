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

  function getForcedColorImage(key) {
    var forcedImages = {
      grey: 'kevin-front-cover-grey-v2.webp',
      white: 'kevin-front-cover-white-v2.webp',
      burgundy: 'kevin-front-cover-red-v2.webp',
      red: 'kevin-front-cover-red-v2.webp',
      espresso: 'kevin-front-cover-brown-v2.webp',
      brown: 'kevin-front-cover-brown-v2.webp',
      navy: 'kevin-front-cover-blue-v2.webp',
      blue: 'kevin-front-cover-blue-v2.webp'
    };
    return forcedImages[key] ? buildAssetUrl(forcedImages[key]) : null;
  }

  function getVariantImage(variant) {
    var key = colorKey(variant.color);
    var forcedImage = getForcedColorImage(key);
    if (forcedImage) return forcedImage;
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
      if (saved.quantity) state.quantity = saved.quantity;
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
      btn.style.setProperty('--swatch-color', getHex(variant.color));
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
    if (!variant) return 0;
    return variant.price * state.quantity;
  }

  function renderTotal() {
    var variant = findVariantById(state.variantId);
    var cents = getLinePriceCents();
    var formatted = window.LurafiCart ? window.LurafiCart.formatMoney(cents) : (cents / 100).toFixed(2);
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
        els.perDevice.textContent = window.LurafiCart.formatMoney(variant.price) + perSuffix;
      } else {
        els.perDevice.hidden = true;
      }
    }
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
      state.quantity = Math.max(1, state.quantity - 1);
      render();
    });
  }
  if (els.qtyPlus) {
    els.qtyPlus.addEventListener('click', function () {
      state.quantity = Math.min(5, state.quantity + 1);
      render();
    });
  }

  if (els.sellingPlanSelect) {
    els.sellingPlanSelect.addEventListener('change', function () {
      state.sellingPlanId = els.sellingPlanSelect.value;
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

  // Optional paid front covers: variant ids of the currently selected covers.
  function selectedCoverIds() {
    var out = [];
    var btns = document.querySelectorAll('[data-configure-covers] .configure-cover[aria-pressed="true"]');
    Array.prototype.forEach.call(btns, function (b) {
      var id = b.getAttribute('data-cover-id');
      if (id && Number(id) > 0) out.push(id);
    });
    return out;
  }

  function goToCartPermalink(item, variant) {
    trackBeginCheckout(variant, item);
    var quantity = Number(item.quantity) || 1;
    var url = '/cart/' + encodeURIComponent(item.id) + ':' + encodeURIComponent(quantity);
    selectedCoverIds().forEach(function (cid) {
      url += ',' + encodeURIComponent(cid) + ':1';
    });
    url += '?checkout';
    window.location.href = url;
  }

  els.ctas.forEach(function (cta) {
    cta.addEventListener('click', function () {
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
          els.error.textContent = (window.themeTranslations && window.themeTranslations.configure && window.themeTranslations.configure.errorCheckout) || 'Online checkout is almost ready. Email hello@lurafi.ai to order, or try again soon.';
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

      // With covers selected, use the multi-line permalink (addAndCheckout only
      // adds the device); otherwise keep the fast add-and-checkout path.
      if (selectedCoverIds().length === 0 && window.LurafiCart && typeof window.LurafiCart.addAndCheckout === 'function') {
        window.LurafiCart.addAndCheckout(item).catch(function () {
          goToCartPermalink(item, variant);
        });
        return;
      }

      goToCartPermalink(item, variant);
    });
  });

  // Optional front-cover add-ons: toggle selection. Covers without a real
  // Shopify variant id are shown but not purchasable (data-cover-soon).
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-configure-covers] .configure-cover'),
    function (btn) {
      if (btn.getAttribute('data-cover-soon') === '1') return;
      btn.addEventListener('click', function () {
        var pressed = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!pressed));
        btn.classList.toggle('is-selected', !pressed);
      });
    }
  );

  function resetCtaLabels() {
    var t = window.themeTranslations && window.themeTranslations.configure;
    var mainLabel = (t && t.checkoutCta) || 'Continue to checkout';
    var stickyLabel = (t && t.stickyCheckout) || 'Checkout';
    els.ctaLabels.forEach(function (label, index) {
      label.textContent = index === 0 ? mainLabel : stickyLabel;
    });
  }

  initPlanFromUrl();
  initVariant();
  render();
  root.classList.add('configure-page--ready');
  resetCtaLabels();
})();
