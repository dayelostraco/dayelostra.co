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
      'LLMs in classified enclaves',
      'Multi-provider AI agent orchestration',
      'Zero Trust + RMF + ATO',
      '17 years of secure systems',
      'AWS GovCloud, Azure, GCP',
    ],
    interval: 4500,
  });
}
