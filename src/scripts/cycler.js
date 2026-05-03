export function initCycler({ target, items, interval = 5500, fadeMs = 350 } = {}) {
  const el = document.querySelector(target);
  if (!el || !items?.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  el.textContent = items[0];
  if (reduce) return;

  let i = 0;
  let paused = false;
  el.parentElement?.addEventListener('mouseenter', () => (paused = true));
  el.parentElement?.addEventListener('mouseleave', () => (paused = false));

  setInterval(() => {
    if (paused) return;
    el.classList.add('is-out');
    setTimeout(() => {
      i = (i + 1) % items.length;
      el.textContent = items[i];
      el.classList.remove('is-out');
    }, fadeMs);
  }, interval);
}
