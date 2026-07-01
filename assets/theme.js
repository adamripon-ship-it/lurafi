(function () {
  var path = window.location.pathname;
  if (path.indexOf('/pages/configure') !== -1 && !document.querySelector('[data-configure]')) {
    var params = new URLSearchParams(window.location.search);
    var plan = params.get('plan') || 'buy';
    window.location.replace('/?view=configure&plan=' + encodeURIComponent(plan));
    return;
  }
})();

/** Replace hero when Shopify homepage page_cache serves stale section HTML. */
(function heroCacheRefresh() {
  'use strict';

  window.lurafiRefreshStaleHero = function lurafiRefreshStaleHero() {
    var isHome =
      window.location.pathname === '/' ||
      /^\/(en|nl|fr|de|cs)\/?$/.test(window.location.pathname);
    if (!isHome) return Promise.resolve(false);

    var heroSection = document.getElementById('shopify-section-hero');
    if (!heroSection) return Promise.resolve(false);
    if (heroSection.querySelector('[data-hero-layout="focus-v4"]')) return Promise.resolve(false);

    var url =
      window.location.pathname +
      (window.location.search ? window.location.search + '&' : '?') +
      'section_id=hero&_hero_refresh=' +
      Date.now();

    return fetch(url, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('hero section fetch failed');
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var fresh = doc.getElementById('shopify-section-hero');
        if (!fresh || !fresh.querySelector('[data-hero-layout="focus-v4"]')) return false;
        heroSection.replaceWith(fresh);
        return true;
      })
      .catch(function () {
        return false;
      });
  };
})();

(function initPageMotion() {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealAllStatic() {
    document.querySelectorAll('.section-apple').forEach(function (section) {
      section.classList.add('section-apple--visible');
    });
    var hero = document.querySelector('.hero-apple');
    if (hero) hero.classList.add('hero-apple--animate');
    var configure = document.querySelector('[data-configure]');
    if (configure) configure.classList.add('configure-page--animate');
    var main = document.getElementById('MainContent');
    if (main) main.classList.add('page-content--enter');
  }

  if (reducedMotion) {
    root.classList.add('motion-reduced');
    revealAllStatic();
    return;
  }

  var STAGGER_STEP = 0.07;
  var STAGGER_MAX = 0.45;

  var staggerSelectors = [
    '.apple-container > .overline-blue',
    '.apple-container > .overline-blue-dark',
    '.apple-container > h2.headline-section',
    '.apple-container > .headline-section',
    '.apple-container > .body-elevated',
    '.apple-container > p.body-elevated',
    '.section-image',
    '.tile-grid-3 > *',
    '.tile-grid-2 > *',
    '.stats-row > *',
    '.stats-grid-4 > *',
    '.lp-app__bento > *',
    '.trust-badges > span',
    '.proof-summary-card',
    '.cta-row > *',
    '.plan-card'
  ];

  function prepareSection(section) {
    var index = 0;
    staggerSelectors.forEach(function (selector) {
      section.querySelectorAll(selector).forEach(function (el) {
        if (el.closest('.hero-apple')) return;
        if (el.classList.contains('reveal-item')) return;
        el.classList.add('reveal-item');
        var delay = Math.min(index * STAGGER_STEP, STAGGER_MAX);
        el.style.setProperty('--reveal-delay', delay + 's');
        index += 1;
      });
    });
  }

  function runHeroEntrance() {
    var hero = document.querySelector('.hero-apple');
    if (!hero) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add('hero-apple--animate');
      });
    });
  }

  function runConfigureEntrance() {
    var page = document.querySelector('[data-configure]');
    if (!page) return;
    requestAnimationFrame(function () {
      page.classList.add('configure-page--animate');
    });
  }

  function runGenericPageEntrance() {
    var main = document.getElementById('MainContent');
    if (!main || document.querySelector('.hero-apple') || document.querySelector('[data-configure]')) return;
    main.classList.add('page-content--enter');
  }

  function setViewportClass() {
    var w = window.innerWidth;
    root.classList.remove('viewport-mobile', 'viewport-tablet', 'viewport-desktop');
    if (w < 768) root.classList.add('viewport-mobile');
    else if (w < 1024) root.classList.add('viewport-tablet');
    else root.classList.add('viewport-desktop');
  }

  function getObserverOptions() {
    if (window.innerWidth < 768) {
      return { rootMargin: '0px 0px 2% 0px', threshold: 0.04 };
    }
    if (window.innerWidth < 1024) {
      return { rootMargin: '0px 0px -2% 0px', threshold: 0.05 };
    }
    return { rootMargin: '0px 0px -5% 0px', threshold: 0.06 };
  }

  function revealSectionIfInView(section) {
    var rect = section.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh * 0.92 && rect.bottom > 0) {
      section.classList.add('section-apple--visible');
      return true;
    }
    return false;
  }

  var sectionObserver = null;

  function observeSections() {
    var sections = document.querySelectorAll('.section-apple');
    sections.forEach(prepareSection);

    if (!('IntersectionObserver' in window)) {
      sections.forEach(function (section) {
        section.classList.add('section-apple--visible');
      });
      return;
    }

    if (sectionObserver) sectionObserver.disconnect();

    sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('section-apple--visible');
          sectionObserver.unobserve(entry.target);
        });
      },
      getObserverOptions()
    );

    sections.forEach(function (section) {
      if (!revealSectionIfInView(section)) {
        sectionObserver.observe(section);
      }
    });
  }

  function initStickyCta() {
    var bar = document.querySelector('[data-sticky-cta]');
    if (!bar) return;
    var heroActions = document.querySelector('.hero-banner__actions');
    var hero = document.querySelector('.hero-apple');
    var show = function () {
      var triggerY;
      if (heroActions) {
        triggerY = heroActions.getBoundingClientRect().bottom + window.scrollY + 32;
      } else if (hero) {
        triggerY = hero.offsetHeight * 0.92;
      } else {
        triggerY = 400;
      }
      bar.hidden = window.scrollY <= triggerY;
    };
    show();
    window.addEventListener('scroll', show, { passive: true });
  }

  function init() {
    setViewportClass();
    root.classList.add('motion-ready');

    var startUi = function () {
      runHeroEntrance();
      runConfigureEntrance();
      observeSections();
      runGenericPageEntrance();
      initStickyCta();
    };

    var refreshHero = window.lurafiRefreshStaleHero;
    if (typeof refreshHero === 'function') {
      var refreshTimeout = window.setTimeout(startUi, 1200);
      refreshHero().then(function (refreshed) {
        window.clearTimeout(refreshTimeout);
        if (refreshed) initStickyCta();
        startUi();
      });
    } else {
      startUi();
    }

    var resizeTimer;
    window.addEventListener(
      'resize',
      function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          setViewportClass();
          observeSections();
        }, 200);
      },
      { passive: true }
    );

    /* If observers never fire (CDN cache, IO quirks), never leave content hidden */
    window.setTimeout(function () {
      var hero = document.querySelector('.hero-apple');
      if (hero && !hero.classList.contains('hero-apple--animate')) {
        revealAllStatic();
        return;
      }
      document.querySelectorAll('.section-apple').forEach(function (section) {
        if (section.classList.contains('section-apple--visible')) return;
        var hidden = section.querySelector('.reveal-item');
        if (hidden && getComputedStyle(hidden).opacity === '0') {
          section.classList.add('section-apple--visible');
        }
      });
    }, 2800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

