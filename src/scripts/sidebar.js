export function initSidebar() {
  const sidebar = document.querySelector('[data-sidebar]');
  if (!sidebar) return;

  const triggers = document.querySelectorAll('[data-sidebar-trigger]');
  const closes = sidebar.querySelectorAll('[data-sidebar-close]');

  const open = () => {
    sidebar.classList.remove('hidden');
    sidebar.classList.add('flex');
    document.body.classList.add('overflow-hidden');
  };
  const close = () => {
    sidebar.classList.add('hidden');
    sidebar.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
  };

  triggers.forEach((el) => el.addEventListener('click', open));
  closes.forEach((el) => el.addEventListener('click', close));

  sidebar.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', close);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sidebar.classList.contains('hidden')) close();
  });
}
