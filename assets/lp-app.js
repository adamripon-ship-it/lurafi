(function initLpApp() {
  'use strict';

  var sections = document.querySelectorAll('[data-lp-app]');
  if (!sections.length) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isMobileCarousel() {
    return window.matchMedia('(max-width: 767px)').matches;
  }

  function isMultiTrackCarousel(section) {
    var track = section.querySelector('[data-lp-app-track]');
    return !!(track && track.classList.contains('app-showcase__track--multi'));
  }

  function shouldUseCarousel(section) {
    return isMobileCarousel() || isMultiTrackCarousel(section);
  }

  function initCarousel(section) {
    var track = section.querySelector('[data-lp-app-track]');
    var controls = section.querySelector('[data-lp-app-controls]');
    var dotsRoot = section.querySelector('[data-lp-app-dots]');
    var prevBtn = section.querySelector('[data-lp-app-prev]');
    var nextBtn = section.querySelector('[data-lp-app-next]');
    var slides = section.querySelectorAll('[data-lp-app-slide]');

    if (!track || !controls || !dotsRoot || slides.length < 2) return;

    var dots = [];
    var activeIndex = 0;
    var scrollTimer;

    function setControlsVisible(show) {
      controls.hidden = !show;
    }

    function scrollToIndex(index) {
      var slide = slides[index];
      if (!slide) return;
      var offset = slide.offsetLeft - track.offsetLeft;
      track.scrollTo({ left: offset, behavior: reducedMotion ? 'auto' : 'smooth' });
    }

    function setActive(index) {
      activeIndex = index;
      dots.forEach(function (dot, i) {
        var isActive = i === index;
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        dot.classList.toggle('app-showcase__dot--active', isActive);
      });
    }

    function buildDots() {
      dotsRoot.innerHTML = '';
      dots = [];
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'app-showcase__dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.addEventListener('click', function () {
          scrollToIndex(i);
        });
        dotsRoot.appendChild(dot);
        dots.push(dot);
      });
      setActive(0);
    }

    function syncFromScroll() {
      var trackCenter = track.scrollLeft + track.clientWidth / 2;
      var closest = 0;
      var closestDist = Infinity;
      slides.forEach(function (slide, i) {
        var slideCenter = slide.offsetLeft - track.offsetLeft + slide.offsetWidth / 2;
        var dist = Math.abs(slideCenter - trackCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      setActive(closest);
    }

    function onScroll() {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(syncFromScroll, 80);
    }

    function onPrev() {
      var next = activeIndex - 1;
      if (next < 0) next = slides.length - 1;
      scrollToIndex(next);
    }

    function onNext() {
      var next = activeIndex + 1;
      if (next >= slides.length) next = 0;
      scrollToIndex(next);
    }

    function mount() {
      if (shouldUseCarousel(section)) {
        buildDots();
        setControlsVisible(true);
        track.addEventListener('scroll', onScroll, { passive: true });
        prevBtn.addEventListener('click', onPrev);
        nextBtn.addEventListener('click', onNext);
        syncFromScroll();
      } else {
        setControlsVisible(false);
      }
    }

    mount();

    var resizeTimer;
    window.addEventListener(
      'resize',
      function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          track.removeEventListener('scroll', onScroll);
          prevBtn.replaceWith(prevBtn.cloneNode(true));
          nextBtn.replaceWith(nextBtn.cloneNode(true));
          prevBtn = section.querySelector('[data-lp-app-prev]');
          nextBtn = section.querySelector('[data-lp-app-next]');
          mount();
        }, 180);
      },
      { passive: true }
    );
  }

  function initParallax(section) {
    if (reducedMotion || !section.hasAttribute('data-lp-app-animate')) return;
    if (section.querySelector('.app-showcase__track--multi')) return;

    var phones = section.querySelectorAll('.app-showcase__phone');
    if (!phones.length) return;

    var ticking = false;

    function update() {
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.bottom < 0 || rect.top > vh) {
        ticking = false;
        return;
      }
      var center = rect.top + rect.height * 0.5;
      var progress = (vh * 0.5 - center) / vh;
      phones.forEach(function (phone, index) {
        var direction = index % 2 === 0 ? 1 : -1;
        var amount = 8 + (index % 3) * 2;
        phone.style.setProperty('--parallax-y', (progress * amount * direction).toFixed(2) + 'px');
      });
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();
  }

  sections.forEach(function (section) {
    initCarousel(section);
    initParallax(section);
  });
})();
