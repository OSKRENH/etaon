/* Проекты: фильтр по городу */
(() => {
  const section = document.querySelector('.projects-section');
  if (!section) return;
  const tabs = [...section.querySelectorAll('.project-tab')];
  const cards = [...section.querySelectorAll('.project-card')];

  function select(city) {
    tabs.forEach((tab) => {
      const active = tab.dataset.city === city;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-pressed', String(active));
    });
    cards.forEach((card) => {
      card.hidden = city !== 'all' && card.dataset.city !== city;
    });
    grid.scrollLeft = 0;
    updateNav();
  }

  // Стрелки для горизонтальной прокрутки ряда
  const grid = section.querySelector('.project-grid');
  const nav = document.createElement('div');
  nav.className = 'project-nav';
  nav.innerHTML = '<button type="button" aria-label="Назад">←</button><button type="button" aria-label="Вперёд">→</button>';
  grid.before(nav);
  const [prev, next] = nav.querySelectorAll('button');
  function updateNav() {
    prev.disabled = grid.scrollLeft < 4;
    next.disabled = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 4;
    nav.hidden = grid.scrollWidth <= grid.clientWidth + 4;
  }
  const step = () => Math.max(grid.clientWidth * 0.8, 240);
  prev.addEventListener('click', () => grid.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => grid.scrollBy({ left: step(), behavior: 'smooth' }));
  grid.addEventListener('scroll', updateNav, { passive: true });
  window.addEventListener('resize', updateNav);
  updateNav();

  // Если обложка не загрузилась, остаётся плитка с первой буквой названия
  section.querySelectorAll('.project-cover img').forEach((img) => {
    const hide = () => img.classList.add('is-broken');
    img.addEventListener('error', hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

  tabs.forEach((tab) => tab.addEventListener('click', () => select(tab.dataset.city)));
})();
