// Mobile sidebar with WCAG-compliant focus trap, aria-expanded sync, ESC + outside-anchor-click close.
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initSidebar() {
  const sidebar = document.querySelector('[data-sidebar]');
  if (!sidebar) return;

  const triggers = document.querySelectorAll('[data-sidebar-trigger]');
  const closes = sidebar.querySelectorAll('[data-sidebar-close]');

  // Set dialog semantics on the panel
  sidebar.setAttribute('role', 'dialog');
  sidebar.setAttribute('aria-modal', 'true');
  triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));

  let lastFocused = null;

  const open = () => {
    lastFocused = document.activeElement;
    sidebar.classList.remove('hidden');
    sidebar.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'true'));
    // Move focus into the dialog (close button is first interactive)
    const firstClose = sidebar.querySelector('[data-sidebar-close]');
    firstClose?.focus();
  };

  const close = () => {
    sidebar.classList.add('hidden');
    sidebar.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
    // Restore focus to the trigger (or whatever was focused before open)
    lastFocused?.focus?.();
  };

  triggers.forEach((el) => el.addEventListener('click', open));
  closes.forEach((el) => el.addEventListener('click', close));

  // Anchor clicks inside sidebar close it (then scroll-into-view runs)
  sidebar.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', close);
  });

  // Keyboard handling: ESC closes, Tab/Shift+Tab cycle within the dialog
  document.addEventListener('keydown', (e) => {
    if (sidebar.classList.contains('hidden')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;

    const focusables = Array.from(sidebar.querySelectorAll(FOCUSABLE)).filter(
      (el) => !el.hasAttribute('disabled') && el.offsetParent !== null,
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  });
}
