(function () {
  'use strict';

  // Cart page: quantity stepper + remove without a full reload (Section Rendering API),
  // and a sticky mobile checkout bar that only shows while the in-page Checkout button
  // is still below the viewport, so the two never sit on screen together.

  var section = document.querySelector('[data-cart-section]');
  if (!section) return;
  var sectionId = section.getAttribute('data-cart-section');
  var stickyObserver = null;
  var resizeTimer = null;

  function localePath(path) {
    if (window.LurafiCart && typeof window.LurafiCart.localePath === 'function') {
      return window.LurafiCart.localePath(path);
    }
    return '/' + String(path).replace(/^\/+/, '');
  }

  function getSection() {
    return document.querySelector('[data-cart-section]');
  }

  function initSticky() {
    if (stickyObserver) {
      stickyObserver.disconnect();
      stickyObserver = null;
    }
    var bar = document.querySelector('[data-cart-sticky]');
    var anchor = document.querySelector('[data-cart-sticky-anchor]');
    if (!bar || !anchor) return;
    if (!('IntersectionObserver' in window)) {
      bar.hidden = true;
      return;
    }
    // Measure the bar (incl. the safe-area inset) without painting it, so the
    // anchor only counts as "on screen" once it has cleared the bar.
    bar.style.visibility = 'hidden';
    bar.hidden = false;
    var barHeight = bar.offsetHeight || 100;
    bar.hidden = true;
    bar.style.visibility = '';
    stickyObserver = new IntersectionObserver(
      function (entries) {
        var entry = entries[0];
        // Show only while the real Checkout button is still further down the page.
        var below = !entry.isIntersecting && entry.boundingClientRect.top > 0;
        bar.hidden = !below;
      },
      { rootMargin: '0px 0px -' + (barHeight + 8) + 'px 0px', threshold: 0 }
    );
    stickyObserver.observe(anchor);
  }

  function replaceSection(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var fresh = doc.querySelector('[data-cart-section]');
    var current = getSection();
    if (!fresh || !current) return false;
    current.replaceWith(fresh);
    return true;
  }

  function restoreFocus(line, selector) {
    var lineEl = document.querySelector('[data-cart-line][data-line="' + line + '"]');
    var target = lineEl && selector ? lineEl.querySelector(selector) : null;
    if (target && !target.disabled) {
      target.focus({ preventScroll: true });
      return;
    }
    var main = document.getElementById('MainContent');
    if (main) main.focus({ preventScroll: true });
  }

  function submitFormFallback() {
    // Classic POST /cart keeps the shopper moving if the JSON API is unavailable.
    var form = document.getElementById('CartForm');
    if (!form) return;
    if (typeof form.requestSubmit === 'function') form.requestSubmit();
    else form.submit();
  }

  function changeLine(line, quantity, lineEl, focusSelector) {
    lineEl.setAttribute('aria-busy', 'true');
    return fetch(localePath('cart/change.js'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        line: line,
        quantity: quantity,
        sections: sectionId,
        sections_url: window.location.pathname
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Cart change failed');
        return res.json();
      })
      .then(function (cart) {
        var html = cart && cart.sections && cart.sections[sectionId];
        if (!html || !replaceSection(html)) {
          window.location.reload();
          return;
        }
        initSticky();
        restoreFocus(line, focusSelector);
        if (window.LurafiCart && typeof window.LurafiCart.refreshCount === 'function') {
          window.LurafiCart.refreshCount();
        }
        document.dispatchEvent(new CustomEvent('lurafi:cart_changed', { detail: cart }));
      })
      .catch(function () {
        lineEl.removeAttribute('aria-busy');
        submitFormFallback();
      });
  }

  document.addEventListener('click', function (e) {
    var target = e.target.closest ? e.target : null;
    if (!target) return;
    var minus = target.closest('[data-cart-qty-minus]');
    var plus = target.closest('[data-cart-qty-plus]');
    var remove = target.closest('[data-cart-remove]');
    var control = minus || plus || remove;
    if (!control) return;
    var lineEl = control.closest('[data-cart-line]');
    if (!lineEl) return;
    if (remove) e.preventDefault();
    if (lineEl.getAttribute('aria-busy') === 'true') return;

    var line = Number(lineEl.getAttribute('data-line'));
    if (!line) return;
    if (remove) {
      changeLine(line, 0, lineEl, null);
      return;
    }
    var input = lineEl.querySelector('[data-cart-qty-input]');
    var qty = Math.max(1, Math.floor(Number(input && input.value)) || 1);
    qty = minus ? Math.max(1, qty - 1) : qty + 1;
    if (input) input.value = qty;
    changeLine(line, qty, lineEl, minus ? '[data-cart-qty-minus]' : '[data-cart-qty-plus]');
  });

  document.addEventListener('change', function (e) {
    var input = e.target && e.target.closest ? e.target.closest('[data-cart-qty-input]') : null;
    if (!input) return;
    var lineEl = input.closest('[data-cart-line]');
    if (!lineEl || lineEl.getAttribute('aria-busy') === 'true') return;
    var line = Number(lineEl.getAttribute('data-line'));
    var qty = Math.floor(Number(input.value));
    if (!line || !Number.isFinite(qty) || qty < 0) {
      input.value = input.defaultValue;
      return;
    }
    changeLine(line, qty, lineEl, '[data-cart-qty-input]');
  });

  initSticky();
  window.addEventListener(
    'resize',
    function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(initSticky, 200);
    },
    { passive: true }
  );
})();
