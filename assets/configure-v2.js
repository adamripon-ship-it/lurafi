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
    plan: 'buy',
    variantId: null,
    sellingPlanId: null,
    quantity: 1
  };

  var els = {
    image: root.querySelector('[data-configure-image]'),
    colorName: root.querySelectorAll('[data-configure-color-name]'),
    colorNameInline: root.querySelector('[data-configure-color-name-inline]'),
    chipDot: root.querySelector('[data-configure-chip-dot]'),
    stickyColor: root.querySelector('[data-configure-sticky-color]'),
    swatches: root.querySelector('[data-configure-swatches]'),
    planCards: root.querySelectorAll('[data-plan]'),
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
    error: root.querySelector('[data-configure-error]'),
    sellingPlanSelect: root.querySelector('[data-selling-plan-select]')
  };

  function getPlanData() {
    return state.plan === 'subscribe' ? data.subscribe : data.buy;
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
      grey: 'kevin-front-cover-grey-v2.png',
      white: 'kevin-front-cover-white-v2.png',
      burgundy: 'kevin-front-cover-red-v2.png',
      red: 'kevin-front-cover-red-v2.png',
      espresso: 'kevin-front-cover-brown-v2.png',
      brown: 'kevin-front-cover-brown-v2.png',
      navy: 'kevin-front-cover-blue-v2.png',
      blue: 'kevin-front-cover-blue-v2.png'
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
    var plan = params.get('plan');
    if (plan === 'subscribe' && data.subscribe && data.subscribe.variants.length) {
      state.plan = 'subscribe';
    } else {
      state.plan = 'buy';
    }
  }

  function initVariant() {
    var variants = getVariants();
    if (!variants.length) return;
    var saved = loadState();
    if (saved && saved.variantId && findVariantById(saved.variantId)) {
      state.variantId = saved.variantId;
      if (saved.plan) state.plan = saved.plan;
      if (saved.quantity) state.quantity = saved.quantity;
    }
    if (!state.variantId) state.variantId = variants[0].id;
    if (state.plan === 'subscribe' && data.subscribe.sellingPlans && data.subscribe.sellingPlans.length) {
      state.sellingPlanId = (saved && saved.sellingPlanId) || data.subscribe.sellingPlans[0].id;
    }
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
    els.planCards.forEach(function (card) {
      var plan = card.getAttribute('data-plan');
      card.classList.toggle('is-selected', plan === state.plan);
      card.setAttribute('aria-pressed', plan === state.plan);
    });
    if (els.sellingPlanSelect) {
      var showPlans = state.plan === 'subscribe' && data.subscribe.sellingPlans && data.subscribe.sellingPlans.length > 1;
      els.sellingPlanSelect.hidden = !showPlans;
      var wrap = root.querySelector('[data-selling-plan-select-wrap]');
      if (wrap) wrap.hidden = !showPlans;
    }
    if (els.qtyWrap) {
      els.qtyWrap.hidden = state.plan !== 'buy';
    }
  }

  function getLinePriceCents() {
    var variant = findVariantById(state.variantId);
    if (!variant) return 0;
    if (state.plan === 'subscribe') {
      var plans = data.subscribe.sellingPlans || [];
      var sp = plans.find(function (p) { return String(p.id) === String(state.sellingPlanId); });
      if (sp && sp.price) return sp.price;
      return variant.price;
    }
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
      els.totalSuffix.textContent = state.plan === 'subscribe' ? '/mo' : '';
    }
    if (els.stickyTotal) {
      els.stickyTotal.textContent = formatted;
    }
    if (els.stickyTotalSuffix) {
      els.stickyTotalSuffix.textContent = state.plan === 'subscribe' ? '/mo' : '';
    }
    if (els.perDevice) {
      if (state.plan === 'buy' && state.quantity > 1 && variant) {
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
      els.summaryPlan.textContent = state.plan === 'subscribe'
        ? (t && t.summaryPlanSub) || 'Kevin+ monthly'
        : (t && t.summaryPlanBuy) || 'One-time purchase';
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

  els.planCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var plan = card.getAttribute('data-plan');
      if (plan === 'subscribe' && (!data.subscribe || !data.subscribe.variants.length)) return;
      state.plan = plan;
      if (plan === 'subscribe' && data.subscribe.sellingPlans && data.subscribe.sellingPlans.length) {
        state.sellingPlanId = data.subscribe.sellingPlans[0].id;
        state.quantity = 1;
      }
      var variants = getVariants();
      if (variants.length && !findVariantById(state.variantId)) {
        state.variantId = variants[0].id;
      }
      render();
    });
  });

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

  function goToCartPermalink(item) {
    var quantity = Number(item.quantity) || 1;
    var url = '/cart/' + encodeURIComponent(item.id) + ':' + encodeURIComponent(quantity) + '?checkout';
    if (item.selling_plan) {
      url += '&selling_plan=' + encodeURIComponent(item.selling_plan);
    }
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
        quantity: state.plan === 'buy' ? state.quantity : 1
      };
      if (state.plan === 'subscribe' && state.sellingPlanId) {
        item.selling_plan = state.sellingPlanId;
      }

      goToCartPermalink(item);
    });
  });

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
