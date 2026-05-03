export function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        const delay = Number(el.dataset.revealDelay ?? 0);
        if (delay > 0) {
          el.style.transitionDelay = `${delay}ms`;
        }
        el.classList.add('is-visible');
        observer.unobserve(el);
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
  );

  targets.forEach((el) => observer.observe(el));
}
