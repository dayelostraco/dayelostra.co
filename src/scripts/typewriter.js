export function initTypewriter({ target, cursor, text, startDelay = 0, typeSpeed = 100 }) {
  const captionEl = document.querySelector(target);
  const cursorEl = document.querySelector(cursor);
  if (!captionEl || !text) return;

  if (cursorEl) {
    setInterval(() => cursorEl.classList.toggle('opacity-0'), 600);
  }

  let i = 0;
  const tick = () => {
    captionEl.textContent = text.slice(0, i++);
    if (i <= text.length) setTimeout(tick, typeSpeed);
  };
  setTimeout(tick, startDelay);
}
