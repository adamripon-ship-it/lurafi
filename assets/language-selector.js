(function () {
  var FLAG_BY_LOCALE = {
    en: '🇬🇧',
    nl: '🇳🇱',
    fr: '🇫🇷',
    de: '🇩🇪',
    cs: '🇨🇿',
  };

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

  function syncReturnTo(form, select) {
    var input = form.querySelector('[data-language-return-to]');
    if (!input) return;

    var pathname = window.location.pathname || '/';
    var search = window.location.search || '';
    var hash = window.location.hash || '';
    var targetLocale = 'en';

    if (select && select.value) {
      targetLocale = select.value.split('-')[0].toLowerCase();
    }

    input.value = rewriteReturnTo(pathname, search, hash, targetLocale);
  }

  function decorateSelectOptions(select) {
    if (!select || select.dataset.flagsDecorated === 'true') return;
    Array.from(select.options).forEach(function (option) {
      var root = (option.value || '').split('-')[0].toLowerCase();
      var flag = FLAG_BY_LOCALE[root];
      var label = option.textContent.trim();
      if (flag && label.indexOf(flag) !== 0) {
        option.textContent = flag + ' ' + label;
      }
      if (!option.getAttribute('title') && option.getAttribute('lang')) {
        option.setAttribute('title', label);
      }
    });
    select.dataset.flagsDecorated = 'true';
  }

  function normalizeLocalizationForms() {
    document.querySelectorAll('[data-language-selector] form').forEach(function (form) {
      var action = form.getAttribute('action') || '';
      if (action.indexOf('localization') === -1) return;
      if (action !== '/localization') {
        form.setAttribute('action', '/localization');
      }
    });
  }

  function initLanguageSelectors() {
    normalizeLocalizationForms();
    document.querySelectorAll('[data-language-select]').forEach(decorateSelectOptions);
  }

  document.addEventListener('change', function (event) {
    var select = event.target;
    if (!select.matches || !select.matches('[data-language-select]')) return;
    var form = select.closest('form');
    if (!form || form.getAttribute('action')?.indexOf('localization') === -1) return;
    if (form.dataset.submitting === 'true') return;

    syncReturnTo(form, select);
    form.dataset.submitting = 'true';
    form.submit();
  });

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form.matches || !form.matches('form')) return;
    if (!form.closest('[data-language-selector]')) return;

    var select = form.querySelector('[data-language-select]');
    syncReturnTo(form, select);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSelectors);
  } else {
    initLanguageSelectors();
  }
})();
