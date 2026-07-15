(function () {
  // Region (country) switcher. Each menu option carries an explicit locale + a
  // country so that switching also selects the market (currency + tax):
  //   Ireland→EUR/en · Netherlands→EUR/nl · Germany→EUR/de · France→EUR/fr ·
  //   Czech Republic→CZK/cs · Switzerland→CHF with a language submenu (en/de/fr).
  // The chosen locale_code + country_code are POSTed to /localization.

  function getLocaleRoutes() {
    return window.lurafiLocaleRoutes || null;
  }

  function detectLocaleFromPath(pathname, routes) {
    if (!routes) return 'en';
    var stripped = pathname || '/';
    var found = 'en';
    Object.keys(routes).forEach(function (code) {
      if (code === 'en') return;
      var prefix = routes[code].prefix;
      if (!prefix) return;
      if (stripped === prefix || stripped.indexOf(prefix + '/') === 0) {
        found = code;
      }
    });
    return found;
  }

  function stripLocalePrefix(pathname, routes, localeCode) {
    var path = pathname || '/';
    if (!routes || localeCode === 'en') return path;
    var prefix = routes[localeCode] && routes[localeCode].prefix;
    if (!prefix) return path;
    if (path === prefix) return '/';
    if (path.indexOf(prefix + '/') === 0) return path.slice(prefix.length) || '/';
    return path;
  }

  function rewriteReturnTo(pathname, search, hash, targetLocale) {
    var routes = getLocaleRoutes();
    if (!routes) {
      return (pathname || '/') + (search || '') + (hash || '');
    }

    var currentLocale = detectLocaleFromPath(pathname, routes);
    var stripped = stripLocalePrefix(pathname, routes, currentLocale);
    var target = routes[targetLocale] || routes.en;
    var targetPrefix = target.prefix || '';

    var configureMatch = stripped.match(/\/pages\/([^/?#]+)/);
    if (configureMatch) {
      var currentHandle = configureMatch[1];
      var isConfigurePage = Object.keys(routes).some(function (code) {
        var configurePath = routes[code].configurePath || '';
        var handle = configurePath.split('/pages/')[1];
        return Boolean(handle && currentHandle === handle);
      });
      if (isConfigurePage) {
        return target.configurePath + (search || '') + (hash || '');
      }
    }

    var nextPath = (targetPrefix + stripped).replace(/\/{2,}/g, '/');
    if (nextPath.length > 1 && nextPath.endsWith('/')) {
      nextPath = nextPath.slice(0, -1);
    }
    return nextPath + (search || '') + (hash || '');
  }

  function submitSelection(root, locale, country) {
    var form = root.querySelector('.language-selector__form');
    if (!form || form.dataset.submitting === 'true') return;
    var localeInput = form.querySelector('[data-language-locale]');
    var countryInput = form.querySelector('[data-language-country]');
    var returnInput = form.querySelector('[data-language-return-to]');
    if (localeInput) localeInput.value = locale;
    if (countryInput) countryInput.value = country;
    if (returnInput) {
      returnInput.value = rewriteReturnTo(
        window.location.pathname || '/',
        window.location.search || '',
        window.location.hash || '',
        (locale || 'en').split('-')[0].toLowerCase()
      );
    }
    form.dataset.submitting = 'true';
    form.submit();
  }

  function closeMenu(root) {
    var trigger = root.querySelector('[data-region-trigger]');
    var menu = root.querySelector('[data-region-menu]');
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    showMainList(root);
  }

  function openMenu(root) {
    document.querySelectorAll('[data-language-selector]').forEach(function (other) {
      if (other !== root) closeMenu(other);
    });
    var trigger = root.querySelector('[data-region-trigger]');
    var menu = root.querySelector('[data-region-menu]');
    if (menu) menu.hidden = false;
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    showMainList(root);
  }

  function showSubmenu(root, key) {
    var list = root.querySelector('[data-region-list]');
    var sub = root.querySelector('[data-region-submenu="' + key + '"]');
    var parent = root.querySelector('[data-region-submenu-open="' + key + '"]');
    if (list) list.hidden = true;
    if (sub) sub.hidden = false;
    if (parent) parent.setAttribute('aria-expanded', 'true');
    var firstLang = sub && sub.querySelector('.language-selector__opt--lang');
    if (firstLang) firstLang.focus();
  }

  function showMainList(root) {
    var list = root.querySelector('[data-region-list]');
    if (list) list.hidden = false;
    root.querySelectorAll('[data-region-submenu]').forEach(function (sub) {
      sub.hidden = true;
    });
    root.querySelectorAll('[data-region-submenu-open]').forEach(function (p) {
      p.setAttribute('aria-expanded', 'false');
    });
  }

  function initSelectors() {
    document.querySelectorAll('[data-language-selector]').forEach(function (root) {
      if (root.dataset.regionReady === 'true') return;
      // Normalise the localization action just in case.
      var form = root.querySelector('.language-selector__form');
      if (form) {
        var action = form.getAttribute('action') || '';
        if (action.indexOf('localization') !== -1 && action !== '/localization') {
          form.setAttribute('action', '/localization');
        }
        // Activate the hidden fields for the enhanced menu. They ship without a
        // name so that without JS only the <noscript> select submits.
        var localeInput = form.querySelector('[data-language-locale]');
        var countryInput = form.querySelector('[data-language-country]');
        if (localeInput && !localeInput.name) localeInput.name = 'locale_code';
        if (countryInput && !countryInput.name) countryInput.name = 'country_code';
      }
      root.classList.add('is-ready');
      root.dataset.regionReady = 'true';
    });
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!(target instanceof Element)) return;

    var trigger = target.closest('[data-region-trigger]');
    if (trigger) {
      var root = trigger.closest('[data-language-selector]');
      var menu = root && root.querySelector('[data-region-menu]');
      if (root && menu) {
        if (menu.hidden) openMenu(root);
        else closeMenu(root);
      }
      event.preventDefault();
      return;
    }

    var back = target.closest('[data-region-submenu-back]');
    if (back) {
      var rootB = back.closest('[data-language-selector]');
      if (rootB) {
        showMainList(rootB);
        var parent = rootB.querySelector('[data-region-submenu-open]');
        if (parent) parent.focus();
      }
      event.preventDefault();
      return;
    }

    var openSub = target.closest('[data-region-submenu-open]');
    if (openSub) {
      var rootS = openSub.closest('[data-language-selector]');
      if (rootS) showSubmenu(rootS, openSub.getAttribute('data-region-submenu-open'));
      event.preventDefault();
      return;
    }

    var opt = target.closest('.language-selector__opt');
    if (opt && opt.hasAttribute('data-locale') && opt.hasAttribute('data-country')) {
      var rootO = opt.closest('[data-language-selector]');
      if (rootO) submitSelection(rootO, opt.getAttribute('data-locale'), opt.getAttribute('data-country'));
      event.preventDefault();
      return;
    }

    // Click outside any selector → close all.
    if (!target.closest('[data-language-selector]')) {
      document.querySelectorAll('[data-language-selector]').forEach(closeMenu);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('[data-language-selector]').forEach(function (root) {
      var menu = root.querySelector('[data-region-menu]');
      if (menu && !menu.hidden) {
        closeMenu(root);
        var trigger = root.querySelector('[data-region-trigger]');
        if (trigger) trigger.focus();
      }
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSelectors);
  } else {
    initSelectors();
  }
})();
