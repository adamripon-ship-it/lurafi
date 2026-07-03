(function initScrollFx() {
  'use strict';

  // Homepage-only file (loaded conditionally by theme.liquid).
  // Modern browsers scrub via CSS animation-timeline in nightfall.css;
  // this file is the fallback driver: it writes --nf-progress (0..1)
  // that paused keyframes consume through a negative animation-delay.

  var reduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('motion-reduced');
  if (reduced) return;

  if (window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()')) {
    return; // CSS driver active — nothing to do.
  }

  function arm(target, progressFn) {
    var ticking = false;
    var active = false;

    function update() {
      ticking = false;
      var p = Math.min(1, Math.max(0, progressFn()));
      target.style.setProperty('--nf-progress', String(p));
    }

    function onScroll() {
      if (!active || ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    if (!('IntersectionObserver' in window)) {
      active = true;
      window.addEventListener('scroll', onScroll, { passive: true });
      update();
      return;
    }

    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          active = entry.isIntersecting;
          if (active) {
            window.addEventListener('scroll', onScroll, { passive: true });
            update();
          } else {
            window.removeEventListener('scroll', onScroll);
          }
        });
      },
      { rootMargin: '20% 0px 20% 0px' }
    ).observe(target);
  }

  function boot() {
    var heroStage = document.querySelector('.hero-banner__product');
    if (heroStage) {
      heroStage.setAttribute('data-nf-hero-drift', '');
      arm(heroStage, function () {
        // Progress = how far the first viewport height has been scrolled.
        return window.scrollY / Math.max(1, window.innerHeight);
      });
    }

    // Generic scrub tracks (mechanism section in PR 2 uses data-nf-scrub).
    document.querySelectorAll('[data-nf-scrub]').forEach(function (track) {
      arm(track, function () {
        var rect = track.getBoundingClientRect();
        var total = rect.height - window.innerHeight;
        if (total <= 0) return 1;
        return -rect.top / total;
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
