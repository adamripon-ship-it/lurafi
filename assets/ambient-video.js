(function initAmbientVideos() {
  'use strict';

  var reduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('motion-reduced');
  var connection = navigator.connection || {};

  // Respect user preferences: poster frame stays, video never plays.
  if (reduced || connection.saveData) return;

  function arm(video) {
    video.muted = true;

    function play() {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }

    if (!('IntersectionObserver' in window)) {
      play();
      return;
    }

    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) play();
          else video.pause();
        });
      },
      { threshold: 0.2 }
    ).observe(video);
  }

  function boot() {
    document.querySelectorAll('video[data-ambient-video]').forEach(arm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
