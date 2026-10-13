/* Проекты: фильтр по городу */
(() => {
  const section = document.querySelector('.projects-section');
  if (!section) return;
  const tabs = [...section.querySelectorAll('.project-tab')];
  const cards = [...section.querySelectorAll('.project-card')];

  // Подсветка города по началу ряда; клик по городу прокручивает ряд к его первому проекту
  let locked = false;
  function highlight(city) {
    tabs.forEach((tab) => {
      const active = tab.dataset.city === city;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-pressed', String(active));
    });
  }
  function currentCity() {
    const atEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 4;
    if (atEnd) return cards[cards.length - 1].dataset.city;
    const edge = grid.scrollLeft + 10;
    const first = cards.find((card) => card.offsetLeft + card.offsetWidth > edge) || cards[0];
    return first.dataset.city;
  }
  function select(city) {
    locked = true;
    highlight(city);
    const target = cards.find((card) => card.dataset.city === city);
    if (target) grid.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
  }

  // Стрелки для горизонтальной прокрутки ряда
  const grid = section.querySelector('.project-grid');
  const nav = document.createElement('div');
  nav.className = 'project-nav';
  nav.innerHTML = '<button type="button" aria-label="Назад">←</button><button type="button" aria-label="Вперёд">→</button>';
  grid.before(nav);
  const [prev, next] = nav.querySelectorAll('button');
  function updateNav() {
    if (!locked) highlight(currentCity());
    prev.disabled = grid.scrollLeft < 4;
    next.disabled = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 4;
    nav.hidden = grid.scrollWidth <= grid.clientWidth + 4;
  }
  const step = () => Math.max(grid.clientWidth * 0.8, 240);
  prev.addEventListener('click', () => grid.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => grid.scrollBy({ left: step(), behavior: 'smooth' }));
  ['wheel', 'touchstart', 'pointerdown'].forEach((type) => grid.addEventListener(type, () => { locked = false; }, { passive: true }));
  nav.addEventListener('click', () => { locked = false; }, true);
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
