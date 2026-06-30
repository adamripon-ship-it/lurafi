(function initHeroSlider() {
  'use strict';

  var sliders = document.querySelectorAll('[data-hero-slider]');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initProductRotators(scope) {
    var rotators = scope.querySelectorAll('[data-product-rotator]');
    rotators.forEach(function (rotator) {
      if (rotator.dataset.rotatorReady) return;
      rotator.dataset.rotatorReady = 'true';

      var frames = rotator.querySelectorAll('[data-product-angle]');
      if (frames.length < 2) return;

      var angleIndex = 0;
      var dragStartX = 0;
      var dragDelta = 0;
      var isDragging = false;
      var pixelsPerStep = 56;

      function showAngle(index) {
        angleIndex = (index + frames.length) % frames.length;
        frames.forEach(function (frame, i) {
          var isActive = i === angleIndex;
          frame.classList.toggle('hero-product-rotator__frame--active', isActive);
          if (isActive) {
            frame.removeAttribute('hidden');
          } else {
            frame.setAttribute('hidden', '');
          }
        });
      }

      function handlePointerDown(event) {
        isDragging = true;
        dragStartX = event.clientX;
        dragDelta = 0;
        rotator.classList.add('hero-product-rotator--dragging');
        if (rotator.setPointerCapture && event.pointerId != null) {
          rotator.setPointerCapture(event.pointerId);
        }
      }

      function handlePointerMove(event) {
        if (!isDragging) return;
        dragDelta = event.clientX - dragStartX;
        while (dragDelta <= -pixelsPerStep) {
          showAngle(angleIndex + 1);
          dragStartX = event.clientX;
          dragDelta = event.clientX - dragStartX;
        }
        while (dragDelta >= pixelsPerStep) {
          showAngle(angleIndex - 1);
          dragStartX = event.clientX;
          dragDelta = event.clientX - dragStartX;
        }
      }

      function handlePointerUp() {
        isDragging = false;
        rotator.classList.remove('hero-product-rotator--dragging');
      }

      rotator.addEventListener('pointerdown', handlePointerDown);
      rotator.addEventListener('pointermove', handlePointerMove);
      rotator.addEventListener('pointerup', handlePointerUp);
      rotator.addEventListener('pointercancel', handlePointerUp);
      rotator.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          showAngle(angleIndex + 1);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          showAngle(angleIndex - 1);
        }
      });
    });
  }

  initProductRotators(document);

  if (!sliders.length) return;

  sliders.forEach(function (root) {
    initProductRotators(root);
    var stage = root.querySelector('.hero-slider__stage');
    var slides = root.querySelectorAll('[data-hero-slide]');
    if (slides.length < 2) return;

    var controls = root.querySelector('[data-hero-slider-controls]');
    var dotsRoot = root.querySelector('[data-hero-slider-dots]');
    var prevBtn = root.querySelector('[data-hero-slider-prev]');
    var nextBtn = root.querySelector('[data-hero-slider-next]');
    var pauseBtn = root.querySelector('[data-hero-slider-pause]');
    var liveRegion = root.querySelector('[data-hero-slider-live]');
    var progressBar = root.querySelector('[data-hero-slider-progress]');
    var intervalMs = parseInt(root.getAttribute('data-autoplay-ms') || '7000', 10);
    var pauseLabel = root.getAttribute('data-label-pause') || 'Pause slideshow';
    var playLabel = root.getAttribute('data-label-play') || 'Play slideshow';
    var activeIndex = 0;
    var timer;
    var isPaused = reducedMotion || intervalMs <= 0;
    var dots = [];
    var touchStartX = 0;
    var touchStartY = 0;

    function getSlideLabel(index) {
      var slide = slides[index];
      return slide ? slide.getAttribute('data-hero-slide-label') || 'Slide ' + (index + 1) : '';
    }

    function announceSlide(index) {
      if (!liveRegion) return;
      var label = getSlideLabel(index);
      liveRegion.textContent = label + ', slide ' + (index + 1) + ' of ' + slides.length;
    }

    function preloadAdjacent(index) {
      [index - 1, index + 1].forEach(function (i) {
        var normalized = (i + slides.length) % slides.length;
        var slide = slides[normalized];
        var img = slide.querySelector('.hero-slider__image--illustration, .hero-product-rotator__frame--active');
        if (!img || img.complete) return;
        var preload = new Image();
        preload.src = img.currentSrc || img.src;
      });
    }

    function resetProgress() {
      if (!progressBar || isPaused) {
        if (progressBar) progressBar.style.width = '0%';
        return;
      }
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          progressBar.style.transition = 'width ' + intervalMs + 'ms linear';
          progressBar.style.width = '100%';
        });
      });
    }

    function setActive(index) {
      activeIndex = (index + slides.length) % slides.length;

      var heroSection = root.closest('.hero-apple');

      slides.forEach(function (slide, i) {
        var isActive = i === activeIndex;
        slide.classList.toggle('hero-slider__slide--active', isActive);
        slide.toggleAttribute('inert', !isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        slide.tabIndex = isActive ? 0 : -1;
      });

      if (heroSection) {
        var activeSlide = slides[activeIndex];
        var isProductSlide = activeSlide && activeSlide.classList.contains('hero-slider__slide--product');
        heroSection.classList.toggle('hero-apple--product-active', isProductSlide);
      }

      dots.forEach(function (dot, i) {
        var isActive = i === activeIndex;
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        dot.classList.toggle('hero-slider__dot--active', isActive);
        dot.tabIndex = isActive ? 0 : -1;
      });

      if (dots[activeIndex] && dotsRoot) {
        dots[activeIndex].scrollIntoView({
          inline: 'center',
          block: 'nearest',
          behavior: reducedMotion ? 'auto' : 'smooth'
        });
      }

      announceSlide(activeIndex);
      preloadAdjacent(activeIndex);
      resetProgress();
    }

    function buildDots() {
      if (!dotsRoot) return;
      while (dotsRoot.firstChild) dotsRoot.removeChild(dotsRoot.firstChild);
      dots = [];

      slides.forEach(function (slide, i) {
        var label = slide.getAttribute('data-hero-slide-label') || 'Slide ' + (i + 1);
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-slider__dot';
        dot.setAttribute('role', 'tab');
        dot.id = 'hero-tab-' + slide.id.replace('hero-slide-', '');
        dot.setAttribute('aria-controls', slide.id);
        dot.setAttribute('aria-label', label);

        var labelEl = document.createElement('span');
        labelEl.className = 'hero-slider__dot-label';
        labelEl.textContent = label;
        dot.appendChild(labelEl);

        slide.setAttribute('aria-labelledby', dot.id);
        slide.setAttribute('role', 'tabpanel');

        dot.addEventListener('click', function () {
          stopAutoplay(true);
          setActive(i);
        });

        dotsRoot.appendChild(dot);
        dots.push(dot);
      });
    }

    function next() {
      setActive(activeIndex + 1);
    }

    function prev() {
      setActive(activeIndex - 1);
    }

    function startAutoplay() {
      if (isPaused || intervalMs <= 0) return;
      stopAutoplay(false);
      timer = window.setInterval(next, intervalMs);
      resetProgress();
    }

    function stopAutoplay(userInitiated) {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      if (progressBar) {
        progressBar.style.transition = 'none';
        var computed = window.getComputedStyle(progressBar).width;
        progressBar.style.width = computed;
      }
      if (userInitiated) isPaused = true;
      updatePauseButton();
    }

    function togglePause() {
      isPaused = !isPaused;
      if (isPaused) {
        stopAutoplay(false);
      } else {
        startAutoplay();
      }
      updatePauseButton();
    }

    function updatePauseButton() {
      if (!pauseBtn) return;
      pauseBtn.setAttribute('aria-pressed', isPaused ? 'true' : 'false');
      pauseBtn.setAttribute('aria-label', isPaused ? playLabel : pauseLabel);
      pauseBtn.classList.toggle('hero-slider__pause--paused', isPaused);
      var pauseLabelEl = pauseBtn.querySelector('.hero-slider__pause-label');
      if (pauseLabelEl) pauseLabelEl.textContent = isPaused ? playLabel : pauseLabel;
    }

    function handleKeydown(event) {
      if (!root.contains(document.activeElement)) return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        stopAutoplay(true);
        next();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        stopAutoplay(true);
        prev();
      } else if (event.key === 'Home') {
        event.preventDefault();
        stopAutoplay(true);
        setActive(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        stopAutoplay(true);
        setActive(slides.length - 1);
      }
    }

    function handleTouchStart(event) {
      if (!stage || event.touches.length !== 1) return;
      if (event.target.closest('[data-product-rotator]')) return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }

    function handleTouchEnd(event) {
      if (!stage || event.changedTouches.length !== 1) return;
      var deltaX = event.changedTouches[0].clientX - touchStartX;
      var deltaY = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;
      stopAutoplay(true);
      if (deltaX < 0) next();
      else prev();
    }

    buildDots();
    setActive(0);

    if (controls) controls.hidden = false;

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        stopAutoplay(true);
        prev();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        stopAutoplay(true);
        next();
      });
    }

    if (pauseBtn && intervalMs > 0) {
      pauseBtn.hidden = false;
      pauseBtn.addEventListener('click', togglePause);
      updatePauseButton();
    } else if (pauseBtn) {
      pauseBtn.hidden = true;
    }

    root.addEventListener('mouseenter', function () {
      if (!isPaused) stopAutoplay(false);
    });
    root.addEventListener('mouseleave', function () {
      if (!isPaused) startAutoplay();
    });
    root.addEventListener('focusin', function () {
      if (!isPaused) stopAutoplay(false);
    });
    root.addEventListener('focusout', function (event) {
      if (!root.contains(event.relatedTarget) && !isPaused) startAutoplay();
    });

    document.addEventListener('keydown', handleKeydown);

    if (stage) {
      stage.addEventListener('touchstart', handleTouchStart, { passive: true });
      stage.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    if (!isPaused) startAutoplay();
  });
})();
