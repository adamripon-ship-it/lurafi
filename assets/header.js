(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var nav = document.getElementById('MobileNav');
  var panel = document.getElementById('MobileNavPanel');
  var openBtn = document.querySelector('[data-menu-open]');
  var focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var lastFocused = null;
  var closeTimer = null;

  if (header) {
    var hero = document.querySelector('.hero-apple');
    var onScroll = function () {
      if (!hero) {
        header.setAttribute('data-theme', 'light');
        return;
      }
      var heroHeight = Math.max(hero.offsetHeight || 0, window.innerHeight);
      var pastHero = window.scrollY > heroHeight * 0.65;
      header.setAttribute('data-theme', pastHero ? 'light' : 'dark');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  function closeMenuIfDesktop() {
    if (!nav || window.matchMedia('(min-width: 1024px)').matches) {
      if (nav && nav.getAttribute('data-open') === 'true') {
        nav.setAttribute('data-open', 'false');
        nav.setAttribute('aria-hidden', 'true');
        nav.hidden = true;
        document.body.classList.remove('mobile-nav-open');
        if (openBtn) {
          openBtn.setAttribute('aria-expanded', 'false');
          openBtn.setAttribute('aria-label', 'Open menu');
        }
      }
    }
  }

  if (nav && openBtn) {
    window.addEventListener('resize', closeMenuIfDesktop, { passive: true });
    closeMenuIfDesktop();
  }

  if (!nav || !openBtn || !panel) return;

  function getFocusable(container) {
    return Array.prototype.slice.call(container.querySelectorAll(focusableSelector)).filter(function (el) {
      return el.offsetParent !== null || el === panel;
    });
  }

  function setOpen(open) {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = null;
    }
    if (open) nav.hidden = false;
    nav.setAttribute('data-open', open ? 'true' : 'false');
    nav.setAttribute('aria-hidden', open ? 'false' : 'true');
    openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    openBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('mobile-nav-open', open);

    if (open) {
      lastFocused = document.activeElement;
      panel.focus();
    } else if (lastFocused) {
      lastFocused.focus();
      lastFocused = null;
    }

    if (!open) {
      closeTimer = window.setTimeout(function () {
        if (nav.getAttribute('data-open') !== 'true') nav.hidden = true;
      }, 400);
    }
  }

  function trapFocus(e) {
    if (nav.getAttribute('data-open') !== 'true' || e.key !== 'Tab') return;
    var focusable = getFocusable(panel);
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

  openBtn.addEventListener('click', function () {
    setOpen(nav.getAttribute('data-open') !== 'true');
  });

  nav.querySelectorAll('[data-menu-close]').forEach(function (el) {
    el.addEventListener('click', function () { setOpen(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.getAttribute('data-open') === 'true') {
      setOpen(false);
    }
    trapFocus(e);
  });
})();
