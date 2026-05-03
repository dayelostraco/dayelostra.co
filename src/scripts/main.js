import '../styles/main.css';
import { initTypewriter } from './typewriter.js';
import { initReveal } from './reveal.js';
import { initSidebar } from './sidebar.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

function boot() {
  initSidebar();
  initReveal();
  initTypewriter({
    target: '#caption',
    cursor: '#cursor',
    text: 'Sales Executive, Product Developer, & Amateur Pilot',
    startDelay: 2000,
    typeSpeed: 100,
  });
}
