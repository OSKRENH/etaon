(() => {
  const card = document.querySelector('[data-logo-key="ru"]');
  if (!card) return;

  const preview = card.querySelector('.logo-preview');
  const colorControls = card.querySelector('.card-tone-switch');
  if (!preview || !colorControls) return;

  card.querySelector('.logo-language-switch')?.remove();
  colorControls.setAttribute('aria-label', 'Цвет логотипа');

  const subtitle = card.querySelector('footer small');
  if (subtitle) subtitle.textContent = 'Основной логотип';

  const languageSwitch = document.createElement('button');
  languageSwitch.type = 'button';
  languageSwitch.className = 'language-segment-switch';
  languageSwitch.dataset.language = 'ru';
  languageSwitch.setAttribute('aria-label', 'Переключить на английскую версию');
  languageSwitch.setAttribute('aria-pressed', 'false');
  languageSwitch.innerHTML = '<span class="language-option language-option-ru">рус</span><span class="language-option language-option-en">eng</span>';
  preview.appendChild(languageSwitch);

  let isAnimating = false;

  function assetPath(language, tone) {
    return `./assets/logos/${language === 'en' ? 'en' : 'ru'}-${tone}.svg`;
  }

  function updateCardState(language) {
    const isEnglish = language === 'en';
    const tone = card.dataset.currentTone || 'blue';
    const caption = card.querySelector('footer b');
    const downloadButton = card.querySelector('[data-download]');

    card.dataset.logoLanguage = language;
    languageSwitch.dataset.language = language;
    languageSwitch.setAttribute('aria-pressed', String(isEnglish));
    languageSwitch.setAttribute('aria-label', isEnglish ? 'Переключить на русскую версию' : 'Переключить на английскую версию');

    if (caption) caption.textContent = isEnglish ? 'Английская версия' : 'Кириллическая версия';
    if (downloadButton) downloadButton.dataset.download = `logos/${isEnglish ? 'en' : 'ru'}-${tone}.svg`;
  }

  function switchLanguage(nextLanguage) {
    if (isAnimating || card.dataset.logoLanguage === nextLanguage) return;

    const image = [...preview.children].find((node) => node.tagName === 'IMG' && !node.classList.contains('language-fade-layer'));
    if (!image) return;

    isAnimating = true;
    const tone = card.dataset.currentTone || 'blue';
    const nextSrc = assetPath(nextLanguage, tone);
    const nextAlt = nextLanguage === 'en' ? 'Английский логотип Etalon' : 'Кириллический логотип Эталон';
    const preload = new Image();

    preload.onload = () => {
      const incoming = image.cloneNode(false);
      incoming.src = nextSrc;
      incoming.alt = nextAlt;
      incoming.className = 'language-fade-layer';
      preview.appendChild(incoming);
      updateCardState(nextLanguage);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          image.classList.add('language-fade-out');
          incoming.classList.add('is-visible');
        });
      });

      window.setTimeout(() => {
        image.style.transition = 'none';
        image.src = nextSrc;
        image.alt = nextAlt;
        image.classList.remove('language-fade-out');
        void image.offsetWidth;
        image.style.transition = '';
        incoming.remove();
        isAnimating = false;
      }, 560);
    };

    preload.onerror = () => {
      isAnimating = false;
    };

    preload.src = nextSrc;
  }

  languageSwitch.addEventListener('click', () => {
    switchLanguage(card.dataset.logoLanguage === 'en' ? 'ru' : 'en');
  });

  card.dataset.logoLanguage = 'ru';
  updateCardState('ru');
})();
