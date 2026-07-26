(() => {
  const card = document.querySelector('[data-logo-key="ru"]');
  if (!card) return;

  const preview = card.querySelector('.logo-preview');
  const colorControls = card.querySelector('.card-tone-switch');
  if (!preview || !colorControls) return;

  card.querySelector('.logo-language-switch')?.remove();
  colorControls.setAttribute('aria-label', 'Цвет логотипа');

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

    const currentImage = [...preview.children].find((node) => node.tagName === 'IMG' && !node.classList.contains('language-transition-image'));
    if (!currentImage) return;

    isAnimating = true;
    const movingToEnglish = nextLanguage === 'en';
    const tone = card.dataset.currentTone || 'blue';
    const incomingImage = new Image();
    const previewRect = preview.getBoundingClientRect();
    const imageRect = currentImage.getBoundingClientRect();

    incomingImage.className = `language-transition-image ${movingToEnglish ? 'from-bottom' : 'from-top'}`;
    incomingImage.src = assetPath(nextLanguage, tone);
    incomingImage.alt = movingToEnglish ? 'Английский логотип Etalon' : 'Кириллический логотип Эталон';
    Object.assign(incomingImage.style, {
      left: `${imageRect.left - previewRect.left}px`,
      top: `${imageRect.top - previewRect.top}px`,
      width: `${imageRect.width}px`,
      height: `${imageRect.height}px`
    });

    currentImage.classList.remove('language-exit-up', 'language-exit-down', 'is-switching');
    currentImage.classList.add(movingToEnglish ? 'language-exit-up' : 'language-exit-down');
    preview.appendChild(incomingImage);
    updateCardState(nextLanguage);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        currentImage.classList.add('is-switching');
        incomingImage.classList.add('is-switching');
      });
    });

    window.setTimeout(() => {
      currentImage.src = incomingImage.src;
      currentImage.alt = incomingImage.alt;
      currentImage.classList.remove('language-exit-up', 'language-exit-down', 'is-switching');
      incomingImage.remove();
      isAnimating = false;
    }, 460);
  }

  languageSwitch.addEventListener('click', () => {
    switchLanguage(card.dataset.logoLanguage === 'en' ? 'ru' : 'en');
  });

  card.dataset.logoLanguage = 'ru';
  updateCardState('ru');
})();
