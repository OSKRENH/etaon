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

  // Если обложка не загрузилась, остаётся плитка с первой буквой названия
  section.querySelectorAll('.project-cover img').forEach((img) => {
    const hide = () => img.classList.add('is-broken');
    img.addEventListener('error', hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

  tabs.forEach((tab) => tab.addEventListener('click', () => select(tab.dataset.city)));
})();
