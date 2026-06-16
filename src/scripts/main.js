import '../styles/main.css';
import { initTypewriter } from './typewriter.js';
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
  initTypewriter({
    target: '#caption',
    cursor: '#cursor',
    text: 'Architecting AI systems for federal missions.',
    startDelay: 800,
    typeSpeed: 45,
  });
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
