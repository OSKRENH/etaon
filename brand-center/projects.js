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
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => select(tab.dataset.city)));
})();
