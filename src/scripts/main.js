import '../styles/main.css';
import { initReveal } from './reveal.js';
import { initSidebar } from './sidebar.js';
import { initCycler } from './cycler.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

function boot() {
  initSidebar();
  initReveal();
  initNavScroll();
  initCycler({
    target: '#subhead',
    items: [
      'Architected and built. Not just managed.',
      'Federal AI from prototype to ATO in months, not years.',
      'Systems that move billions and survive the audit.',
      'Multi-provider LLM orchestration validated at IL5.',
      '20 years inside the federal trust boundary.',
      'Zero Trust by design. Compliance stops being a tax.',
    ],
    interval: 4500,
  });
}

// Nav: transparent (light text) over the dark hero, light bar on scroll past it.
function initNavScroll() {
  const nav = document.querySelector('nav[aria-label="Primary"]');
  const hero = document.querySelector('#top');
  if (!nav) return;
  const update = () => {
    const threshold = (hero?.offsetHeight || 600) - 64;
    nav.classList.toggle('nav-scrolled', window.scrollY > threshold);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}
