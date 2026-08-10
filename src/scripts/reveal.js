export function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  // No IntersectionObserver: show everything immediately.
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const reveal = (el, animate = true) => {
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
