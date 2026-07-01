(function () {
  'use strict';

  var focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var cartLastFocused = null;

  function updateCartCount(count) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.hidden = count < 1;
    });
    document.querySelectorAll('[data-cart-count-wrap]').forEach(function (wrap) {
      wrap.classList.toggle('has-items', count > 0);
    });
  }

  function formatMoney(cents) {
    if (window.Shopify && typeof Shopify.formatMoney === 'function') {
      return Shopify.formatMoney(cents, window.themeMoneyFormat || '{{amount}}');
    }
    return (cents / 100).toFixed(2);
  }

  // GA4 / GTM-compatible e-commerce event abstraction.
  // Pushes to window.dataLayer and dispatches a DOM CustomEvent so any
  // analytics provider (GTM, Shopify Custom Pixel, Segment) can subscribe.
  function trackEcommerce(eventName, cart, extra) {
    try {
      var currency =
        (window.Shopify && Shopify.currency && Shopify.currency.active) ||
        (cart && cart.currency) ||
        (window.lurafiLocalization && window.lurafiLocalization.currency) ||
        'EUR';
      var items = ((cart && cart.items) || []).map(function (item, index) {
        return {
          item_id: String(item.product_id || item.id || ''),
          item_name: item.product_title || item.title || '',
          item_variant: item.variant_title || '',
          price: (item.final_price != null ? item.final_price : item.price || 0) / 100,
          quantity: item.quantity || 1,
          index: index
        };
      });
      var payload = Object.assign(
        {
          event: eventName,
          ecommerce: {
            currency: currency,
            value: cart && cart.total_price != null ? cart.total_price / 100 : undefined,
            items: items
          }
        },
        extra || {}
      );
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push(payload);
      document.dispatchEvent(new CustomEvent('lurafi:' + eventName, { detail: payload }));
    } catch (e) {
      /* analytics must never block commerce */
    }
  }

  async function request(url, options) {
    var res = await fetch(url, options);
    if (!res.ok) {
      var err = await res.json().catch(function () { return {}; });
      throw new Error(err.description || err.message || 'Cart request failed');
    }
    return res.json();
  }

  function getCartDrawer() {
    return document.getElementById('CartDrawer');
  }

  function getCartPanel(drawer) {
    return drawer ? drawer.querySelector('[data-cart-drawer-panel]') : null;
  }

  function getFocusable(container) {
    if (!container) return [];
    return Array.prototype.slice.call(container.querySelectorAll(focusableSelector)).filter(function (el) {
      return el.offsetParent !== null || el === container;
    });
  }

  function trapCartFocus(e) {
    var drawer = getCartDrawer();
    if (!drawer || drawer.hidden || e.key !== 'Tab') return;
    var panel = getCartPanel(drawer);
    var focusable = getFocusable(panel || drawer);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function renderDrawer(cart) {
    var drawer = getCartDrawer();
    if (!drawer) return;
    var body = drawer.querySelector('[data-cart-drawer-body]');
    var footer = drawer.querySelector('[data-cart-drawer-footer]');
    var subtotal = drawer.querySelector('[data-cart-drawer-subtotal]');
    if (!body) return;

    var emptyText =
      drawer.getAttribute('data-empty-text') ||
      (window.themeTranslations && window.themeTranslations.cart && window.themeTranslations.cart.empty) ||
      'Your cart is empty.';
    var subtotalPrefix =
      drawer.getAttribute('data-subtotal-prefix') ||
      (window.themeTranslations && window.themeTranslations.cart && window.themeTranslations.cart.subtotal) ||
      'Subtotal:';

    if (!cart || !cart.items || !cart.items.length) {
      body.innerHTML = '<p class="cart-drawer__empty text-muted">' + emptyText + '</p>';
      if (footer) footer.hidden = true;
      return;
    }

    body.innerHTML = cart.items.map(function (item) {
      var img = item.image
        ? '<img src="' + item.image + '" alt="" width="64" height="64" loading="lazy">'
        : '';
      return (
        '<div class="cart-drawer__line">' +
        '<div class="cart-drawer__line-img">' + img + '</div>' +
        '<div><p class="cart-drawer__line-title">' + item.product_title + '</p>' +
        (item.variant_title && item.variant_title !== 'Default Title'
          ? '<p class="cart-drawer__line-variant">' + item.variant_title + '</p>'
          : '') +
        '<p class="cart-drawer__line-price">' + formatMoney(item.final_line_price) + '</p></div>' +
        '</div>'
      );
    }).join('');

    if (footer) footer.hidden = false;
    if (subtotal) subtotal.textContent = subtotalPrefix + ' ' + formatMoney(cart.total_price);
  }

  function openDrawer(cart) {
    var drawer = getCartDrawer();
    if (!drawer) return;
    renderDrawer(cart);
    drawer.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-drawer-open');
    cartLastFocused = document.activeElement;
    var panel = getCartPanel(drawer);
    if (panel) panel.focus();
  }

  function closeDrawer() {
    var drawer = getCartDrawer();
    if (!drawer) return;
    drawer.hidden = true;
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-drawer-open');
    if (cartLastFocused) {
      cartLastFocused.focus();
      cartLastFocused = null;
    }
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cart-drawer-close]')) closeDrawer();
  });

  document.addEventListener('keydown', function (e) {
    var drawer = getCartDrawer();
    if (e.key === 'Escape' && drawer && !drawer.hidden) closeDrawer();
    trapCartFocus(e);
  });

  function closeMobileNavIfOpen() {
    var nav = document.getElementById('MobileNav');
    if (!nav || nav.getAttribute('data-open') !== 'true') return false;
    var closeBtn = nav.querySelector('[data-menu-close]');
    if (closeBtn) closeBtn.click();
    else {
      nav.setAttribute('data-open', 'false');
      nav.setAttribute('aria-hidden', 'true');
      nav.hidden = true;
      document.body.classList.remove('mobile-nav-open');
      var menuBtn = document.querySelector('[data-menu-open]');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }
    return true;
  }

  document.addEventListener('click', function (e) {
    var openBtn = e.target.closest('[data-cart-drawer-open]');
    if (!openBtn || !window.LurafiCart) return;
    e.preventDefault();
    closeMobileNavIfOpen();
    window.LurafiCart.get().then(function (cart) {
      window.LurafiCart.openDrawer(cart);
    });
  });

  window.LurafiCart = {
    formatMoney: formatMoney,
    track: trackEcommerce,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,

    get: function () {
      return request('/cart.js');
    },

    add: function (items, options) {
      options = options || {};
      var body = { items: items };
      return request('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body)
      }).then(function () {
        return window.LurafiCart.get();
      }).then(function (cart) {
        updateCartCount(cart.item_count);
        trackEcommerce('add_to_cart', cart);
        if (options.openDrawer) {
          openDrawer(cart);
        }
        return cart;
      });
    },

    clear: function () {
      return request('/cart/clear.js', { method: 'POST' });
    },

    addAndCheckout: function (item) {
      var self = this;
      var vid = item && item.id;
      var n = Number(vid);
      if (!item || !Number.isFinite(n) || n <= 0) {
        var msgInvalid =
          (window.themeTranslations?.configure?.errorProducts || 'Checkout needs a published product. In Shopify Admin create the Kevin device, enable Online Store, then assign it under Theme settings → Products (Kevin buy).');
        return Promise.reject(new Error(msgInvalid));
      }

      function redirectWithCartPermalink() {
        var quantity = Number(item.quantity) || 1;
        var url = '/cart/' + encodeURIComponent(vid) + ':' + encodeURIComponent(quantity) + '?checkout';
        if (item.selling_plan) {
          url += '&selling_plan=' + encodeURIComponent(item.selling_plan);
        }
        window.location.href = url;
      }

      return self.clear().then(function () {
        return self.add([item]);
      }).then(function (cart) {
        trackEcommerce('begin_checkout', cart);
        window.location.href = '/checkout';
      }).catch(function () {
        trackEcommerce('begin_checkout', { items: [], total_price: 0 });
        redirectWithCartPermalink();
      });
    },

    refreshCount: function () {
      return window.LurafiCart.get().then(function (cart) {
        updateCartCount(cart.item_count);
        return cart;
      }).catch(function () {
        return null;
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.LurafiCart.refreshCount(); });
  } else {
    window.LurafiCart.refreshCount();
  }
})();
