/* Production V365.5.3 Enterprise Dynamic CMS RC2
 * Unified frontend interaction controller.
 * Controls hero/room/story carousels, accordions, mobile navigation,
 * LINE modal, floating actions, scroll reveals and touch swipe.
 */
(() => {
  'use strict';

  const carouselStates = new WeakMap();
  const mobileQuery = window.matchMedia('(max-width: 960px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const lineUrl = 'https://lin.ee/933tuhU';
  let fadeObserver = null;
  let lastLineTrigger = null;

  function destroyCarousel(root) {
    const state = carouselStates.get(root);
    if (!state) return;
    state.destroy();
    carouselStates.delete(root);
  }

  function createCarousel(root, selector, options = {}) {
    destroyCarousel(root);

    const slides = Array.from(root.querySelectorAll(selector));
    if (!slides.length) return null;

    let index = Math.max(0, slides.findIndex(slide => slide.classList.contains('active')));
    let timer = null;
    let pointerStartX = null;
    let pausedByHover = false;
    let pausedByTouch = false;
    const interval = Number(options.interval) || 6000;

    const stop = () => {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    };

    const show = nextIndex => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.classList.toggle('active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      options.onShow?.(index, slides);
    };

    const schedule = () => {
      stop();
      if (
        slides.length < 2 ||
        document.hidden ||
        reducedMotion.matches ||
        pausedByHover ||
        pausedByTouch
      ) return;
      timer = window.setTimeout(() => {
        show(index + 1);
        schedule();
      }, interval);
    };

    const restart = () => {
      pausedByHover = false;
      pausedByTouch = false;
      schedule();
    };

    const onMouseEnter = () => {
      pausedByHover = true;
      stop();
    };
    const onMouseLeave = () => {
      pausedByHover = false;
      schedule();
    };
    const onPointerDown = event => {
      if (event.pointerType === 'mouse') return;
      pointerStartX = event.clientX;
      pausedByTouch = true;
      stop();
    };
    const onPointerUp = event => {
      if (pointerStartX !== null) {
        const delta = event.clientX - pointerStartX;
        if (Math.abs(delta) >= 40) show(index + (delta < 0 ? 1 : -1));
      }
      pointerStartX = null;
      pausedByTouch = false;
      schedule();
    };
    const onPointerCancel = () => {
      pointerStartX = null;
      pausedByTouch = false;
      schedule();
    };
    const onVisibility = () => document.hidden ? stop() : schedule();
    const onReducedMotion = () => reducedMotion.matches ? stop() : schedule();

    root.addEventListener('mouseenter', onMouseEnter);
    root.addEventListener('mouseleave', onMouseLeave);
    root.addEventListener('pointerdown', onPointerDown, { passive: true });
    root.addEventListener('pointerup', onPointerUp, { passive: true });
    root.addEventListener('pointercancel', onPointerCancel, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reducedMotion.addEventListener?.('change', onReducedMotion);

    show(index);
    schedule();

    const state = {
      show,
      next: () => { show(index + 1); schedule(); },
      prev: () => { show(index - 1); schedule(); },
      restart,
      destroy: () => {
        stop();
        root.removeEventListener('mouseenter', onMouseEnter);
        root.removeEventListener('mouseleave', onMouseLeave);
        root.removeEventListener('pointerdown', onPointerDown);
        root.removeEventListener('pointerup', onPointerUp);
        root.removeEventListener('pointercancel', onPointerCancel);
        document.removeEventListener('visibilitychange', onVisibility);
        reducedMotion.removeEventListener?.('change', onReducedMotion);
      }
    };
    carouselStates.set(root, state);
    return state;
  }

  function initHeroCarousels() {
    document.querySelectorAll('.js-carousel').forEach(root => {
      const dotsBox = root.querySelector('.dots');
      if (dotsBox) dotsBox.replaceChildren();
      const slides = Array.from(root.querySelectorAll('.slide'));
      const dots = slides.map((_, dotIndex) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'dot';
        button.setAttribute('aria-label', `切換至第 ${dotIndex + 1} 張`);
        dotsBox?.appendChild(button);
        return button;
      });
      const controller = createCarousel(root, '.slide', {
        interval: root.dataset.interval || 6000,
        onShow: activeIndex => dots.forEach((dot, index) => {
          dot.classList.toggle('active', index === activeIndex);
          dot.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
        })
      });
      dots.forEach((dot, dotIndex) => dot.addEventListener('click', () => {
        controller?.show(dotIndex);
        controller?.restart();
      }));
    });
  }

  function initRoomCarousels() {
    document.querySelectorAll('.js-room-carousel').forEach(root => {
      const controller = createCarousel(root, '.room-slide', {
        interval: root.dataset.interval || 5000
      });
      const prev = root.querySelector('.prev');
      const next = root.querySelector('.next');
      if (prev) prev.onclick = () => controller?.prev();
      if (next) next.onclick = () => controller?.next();
    });
  }

  function initStoryGalleries() {
    document.querySelectorAll('.js-story-gallery').forEach(root => {
      const buttons = Array.from(root.querySelectorAll('.gallery-list button'));
      const controller = createCarousel(root, '.gslide', {
        interval: root.dataset.interval || 6000,
        onShow: activeIndex => buttons.forEach((button, index) => {
          const active = index === activeIndex;
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', String(active));
        })
      });
      buttons.forEach((button, buttonIndex) => {
        button.onclick = () => {
          controller?.show(buttonIndex);
          controller?.restart();
        };
      });
    });
  }

  function syncAccordions() {
    document.querySelectorAll('.acc-item').forEach(item => {
      const button = item.querySelector('.acc-btn');
      const content = item.querySelector('.acc-content');
      const open = item.classList.contains('open');
      button?.setAttribute('type', 'button');
      button?.setAttribute('aria-expanded', String(open));
      content?.setAttribute('aria-hidden', String(!open));
    });
  }

  function initFade() {
    fadeObserver?.disconnect();
    if (!('IntersectionObserver' in window) || reducedMotion.matches) {
      document.querySelectorAll('.fade').forEach(element => element.classList.add('in'));
      return;
    }
    fadeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          fadeObserver?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade:not(.in)').forEach(element => fadeObserver.observe(element));
  }

  function handleFloatActions() {
    const floatActions = document.querySelector('.float-actions');
    const hero = document.querySelector('.hero');
    if (!floatActions) return;
    if (mobileQuery.matches) {
      floatActions.classList.add('show');
      return;
    }
    const threshold = Math.max((hero?.offsetHeight || 500) - 80, 250);
    floatActions.classList.toggle('show', window.scrollY > threshold);
  }

  function openLineModal(trigger) {
    const modal = document.getElementById('lineModal');
    if (!modal) return;
    lastLineTrigger = trigger || document.activeElement;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.line-modal-close')?.focus();
  }

  function closeLineModal() {
    const modal = document.getElementById('lineModal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modal.querySelector('.line-qr-details')?.removeAttribute('open');
    lastLineTrigger?.focus?.();
  }

  function onDocumentClick(event) {
    const menuButton = event.target.closest('.menu-btn');
    if (menuButton) {
      const links = document.querySelector('.nav-links');
      const open = links?.classList.toggle('show') || false;
      menuButton.setAttribute('aria-expanded', String(open));
      return;
    }

    if (event.target.closest('.nav-links a')) {
      document.querySelector('.nav-links')?.classList.remove('show');
      document.querySelector('.menu-btn')?.setAttribute('aria-expanded', 'false');
    }

    const accordionButton = event.target.closest('.acc-btn');
    if (accordionButton) {
      event.preventDefault();
      const item = accordionButton.closest('.acc-item');
      const content = item?.querySelector('.acc-content');
      const open = item?.classList.toggle('open') || false;
      accordionButton.setAttribute('aria-expanded', String(open));
      content?.setAttribute('aria-hidden', String(!open));
      return;
    }

    const lineAction = event.target.closest('.line-action');
    if (lineAction) {
      if (mobileQuery.matches) {
        lineAction.setAttribute('href', lineUrl);
        return;
      }
      event.preventDefault();
      openLineModal(lineAction);
      return;
    }

    if (event.target.closest('.line-modal-close') || event.target.id === 'lineModal') {
      closeLineModal();
      return;
    }

    if (event.target.closest('.to-top')) {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
  }

  function refresh() {
    initHeroCarousels();
    initRoomCarousels();
    initStoryGalleries();
    syncAccordions();
    initFade();
    handleFloatActions();
    document.documentElement.dataset.uiReady = 'true';
  }

  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLineModal();
  });
  window.addEventListener('scroll', handleFloatActions, { passive: true });
  window.addEventListener('resize', handleFloatActions);
  mobileQuery.addEventListener?.('change', handleFloatActions);
  window.addEventListener('meiyuan:content-updated', refresh);

  window.MeiyuanUI = { refresh };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refresh, { once: true });
  } else {
    refresh();
  }
})();
