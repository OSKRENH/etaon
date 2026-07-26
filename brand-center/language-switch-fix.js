(() => {
  const card = document.querySelector('[data-logo-key="ru"]');
  if (!card) return;

  const preview = card.querySelector('.logo-preview');
  const controls = card.querySelector('.card-tone-switch');
  const footerTitle = card.querySelector('footer b');
  const footerSubtitle = card.querySelector('footer small');
  const downloadButton = card.querySelector('[data-download]');
  const originalImage = preview?.querySelector(':scope > img');
  if (!preview || !controls || !originalImage) return;

  controls.querySelector('.logo-language-switch')?.remove();
  controls.setAttribute('aria-label', 'Цвет логотипа');
  if (footerSubtitle) footerSubtitle.textContent = 'Основной логотип';

  const stack = document.createElement('div');
  stack.className = 'language-logo-stack';
  stack.dataset.language = 'ru';

  const ruImage = document.createElement('img');
  ruImage.className = 'language-logo-layer language-logo-layer-ru';
  ruImage.alt = 'Кириллический логотип Эталон';

  const enImage = document.createElement('img');
  enImage.className = 'language-logo-layer language-logo-layer-en';
  enImage.alt = 'Английский логотип Etalon';

  stack.append(ruImage, enImage);
  originalImage.replaceWith(stack);

  const languageSwitch = document.createElement('button');
  languageSwitch.type = 'button';
  languageSwitch.className = 'language-segment-switch';
  languageSwitch.dataset.language = 'ru';
  languageSwitch.setAttribute('aria-label', 'Переключить на английскую версию');
  languageSwitch.setAttribute('aria-pressed', 'false');
  languageSwitch.innerHTML = '<span class="language-option language-option-ru">рус</span><span class="language-option language-option-en">eng</span>';
  preview.appendChild(languageSwitch);

  const toneButtons = [...controls.querySelectorAll('[data-card-tone]')].map((button) => {
    const cleanButton = button.cloneNode(true);
    button.replaceWith(cleanButton);
    return cleanButton;
  });

  const assetPath = (language, tone) => `./assets/logos/${language}-${tone}.svg`;

  function updateDownload() {
    if (!downloadButton) return;
    const language = card.dataset.logoLanguage || 'ru';
    const tone = card.dataset.currentTone || 'blue';
    downloadButton.dataset.download = `logos/${language}-${tone}.svg`;
  }

  function setTone(tone, instant = false) {
    card.dataset.currentTone = tone;
    preview.classList.remove('tone-blue', 'tone-white', 'tone-black');
    preview.classList.add(`tone-${tone}`);

    const nextRu = assetPath('ru', tone);
    const nextEn = assetPath('en', tone);

    if (instant) {
      ruImage.src = nextRu;
      enImage.src = nextEn;
    } else {
      stack.classList.add('is-tone-changing');
      Promise.all([nextRu, nextEn].map((src) => new Promise((resolve) => {
        const image = new Image();
        image.onload = image.onerror = resolve;
        image.src = src;
      }))).then(() => {
        ruImage.src = nextRu;
        enImage.src = nextEn;
        requestAnimationFrame(() => stack.classList.remove('is-tone-changing'));
      });
    }

    toneButtons.forEach((button) => {
      const active = button.dataset.cardTone === tone;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    updateDownload();
  }

  function setLanguage(language) {
    const isEnglish = language === 'en';
    card.dataset.logoLanguage = language;
    stack.dataset.language = language;
    languageSwitch.dataset.language = language;
    languageSwitch.setAttribute('aria-pressed', String(isEnglish));
    languageSwitch.setAttribute('aria-label', isEnglish ? 'Переключить на русскую версию' : 'Переключить на английскую версию');
    if (footerTitle) footerTitle.textContent = isEnglish ? 'Английская версия' : 'Кириллическая версия';
    updateDownload();
  }

  toneButtons.forEach((button) => {
    button.addEventListener('click', () => setTone(button.dataset.cardTone || 'blue'));
  });

  languageSwitch.addEventListener('click', () => {
    setLanguage(card.dataset.logoLanguage === 'en' ? 'ru' : 'en');
  });

  card.dataset.logoLanguage = 'ru';
  setTone(card.dataset.currentTone || 'blue', true);
  setLanguage('ru');
})();
