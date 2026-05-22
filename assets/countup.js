(function initCountUps() {
  'use strict';

  var reduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('motion-reduced');
  var DEFAULT_DURATION = 1000;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function formatIntWithCommas(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function parseTarget(raw) {
    var s = String(raw || '')
      .replace(/\u00a0/g, ' ')
      .trim();
    if (!s) return null;

    var frac = /^(\d+)\s*\/\s*(\d+)$/.exec(s);
    if (frac) {
      return { kind: 'frac', target: parseInt(frac[1], 10), rest: '/' + frac[2] };
    }

    var pctEnd = /^(\d+(?:\.\d+)?)\s*%$/.exec(s);
    if (pctEnd) {
      var pv = parseFloat(pctEnd[1]);
      if (!Number.isFinite(pv)) return null;
      var pd = pctEnd[1].indexOf('.') >= 0 ? pctEnd[1].split('.')[1].length : 0;
      return { kind: 'suffix', target: pv, decimals: pd, suffix: '%' };
    }

    var lead = /^(\d+(?:,\d{3})*(?:\.\d+)?)/.exec(s);
    if (!lead) return null;
    var rest = s.slice(lead[0].length);
    if (/\d/.test(rest)) return null;
    var cleaned = lead[0].replace(/,/g, '');
    var num = parseFloat(cleaned);
    if (!Number.isFinite(num)) return null;
    var decMatch = /\.(\d+)$/.exec(lead[0]);
    var decimals = decMatch ? decMatch[1].length : 0;
    var useComma = /,/.test(lead[0]);

    return { kind: 'suffix', target: num, decimals: decimals, suffix: rest, useComma: useComma };
  }

  function formatFrame(parsed, current) {
    if (parsed.kind === 'frac') {
      return Math.round(current) + parsed.rest;
    }
    if (parsed.kind === 'suffix') {
      if (parsed.decimals > 0) {
        return current.toFixed(parsed.decimals) + (parsed.suffix || '');
      }
      var iv = parsed.useComma ? formatIntWithCommas(current) : String(Math.round(current));
      return iv + (parsed.suffix || '');
    }
    return String(current);
  }

  function animateEl(el, parsed, durationMs, delayMs, finalText) {
    window.setTimeout(function () {
      var start = null;
      function frame(now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / durationMs);
        var eased = easeOutQuart(t);
        var cur = parsed.target * eased;
        if (t >= 1) cur = parsed.target;
        el.textContent = formatFrame(parsed, cur);
        if (t < 1) requestAnimationFrame(frame);
        else {
          el.textContent = finalText;
          el.setAttribute('data-countup-done', '1');
        }
      }
      requestAnimationFrame(frame);
    }, delayMs);
  }

  function getDuration(el) {
    var p = el.closest('[data-countup-duration]');
    if (p && p.dataset && p.dataset.countupDuration) {
      var n = parseInt(p.dataset.countupDuration, 10);
      if (Number.isFinite(n) && n > 200) return n;
    }
    return DEFAULT_DURATION;
  }

  function wire(el, indexHint) {
    if (el.getAttribute('data-countup-done') === '1') return;
    var finalText = el.textContent.trim();
    var parsed = parseTarget(finalText);
    if (!parsed) return;

    el.textContent = formatFrame(parsed, 0);

    var duration = getDuration(el);
    var stagger =
      typeof indexHint === 'number' && Number.isFinite(indexHint) ? indexHint : 0;
    var delay = Math.min(stagger * 70, 360);

    if (!('IntersectionObserver' in window)) {
      animateEl(el, parsed, duration, delay, finalText);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          animateEl(el, parsed, duration, delay, finalText);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.15 }
    );
    observer.observe(el);
  }

  function boot() {
    if (reduced) return;

    var main = document.getElementById('MainContent');
    if (!main) return;

    var els = main.querySelectorAll('[data-countup]:not([data-countup-done])');

    els.forEach(function (el, i) {
      if (el.closest('.hero-apple')) return;
      var group =
        el.closest('.stats-grid-4, .stats-row') ||
        el.closest('.tile-grid-3') ||
        el.closest('.tile-grid-2');
      var gi = group ? Array.prototype.indexOf.call(group.querySelectorAll('[data-countup]'), el) : i;
      wire(el, gi >= 0 ? gi : i);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
