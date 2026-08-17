export function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  // No IntersectionObserver: show everything immediately.
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Everything not yet revealed. Drained by both the observer and the scroll
  // sweep below; when it empties, the sweep detaches itself.
  const pending = new Set(targets);

  const reveal = (el, animate = true) => {
    pending.delete(el);
    if (el.classList.contains('is-visible')) return;
    if (animate) {
      // Cap the stagger so grouped cards don't lag behind on a fast scroll.
      const delay = Math.min(Number(el.dataset.revealDelay ?? 0), 200);
      if (delay > 0) el.style.transitionDelay = `${delay}ms`;
    } else {
      el.style.transition = 'none';
    }
    el.classList.add('is-visible');
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target);
        observer.unobserve(entry.target);
      }
    },
    // Pre-trigger: expand the root downward so elements begin fading in
    // before they scroll into view. A fast fling never lands on a blank.
    { threshold: 0, rootMargin: '0px 0px 25% 0px' },
  );

  // Safety net. IntersectionObserver only reports intersection *changes*, so an
  // element that goes from "below the fold" to "above the fold" between two
  // ticks never changes state and never gets a callback: it stays at opacity:0
  // permanently. That is not hypothetical. iOS momentum scrolling hands the
  // observer discrete jumps rather than a smooth sweep, which is why a fast
  // fling on a phone used to leave whole sections blank.
  //
  // On every scroll (coalesced to one animation frame) reveal anything still
  // pending that has crossed the fold, matching the observer's own pre-trigger.
  let queued = false;
  const sweep = () => {
    queued = false;
    const fold = window.innerHeight * 1.25;
    for (const el of pending) {
      const rect = el.getBoundingClientRect();
      if (rect.top >= fold) continue;
      // Already scrolled past: snap it in, no animation to catch up on.
      reveal(el, rect.bottom > 0);
      observer.unobserve(el);
    }
    if (!pending.size) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(sweep);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  targets.forEach((el) => {
    // Elements already scrolled fully past on load (bfcache restore, anchor
    // jump) can't re-enter from the bottom, so snap them visible without
    // animation. Everything else (in-view hero + below the fold) is observed.
    if (el.getBoundingClientRect().bottom < 0) {
      reveal(el, false);
    } else {
      observer.observe(el);
    }
  });
}
