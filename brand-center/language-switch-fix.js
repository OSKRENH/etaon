(() => {
  const card = document.querySelector('[data-logo-key="ru"]');
  if (!card) return;

  const preview = card.querySelector('.logo-preview');
  const controls = card.querySelector('.card-tone-switch');
  const footerTitle = card.querySelector('footer b');
  const footerSubtitle = card.querySelector('footer small');
  const downloadButton = card.querySelector('[data-download]');
  const originalImage = preview?.querySelector(':scope > img');
  const liveRegion = document.querySelector('#ui-status');
  if (!preview || !controls || !originalImage) return;

  controls.setAttribute('aria-label', 'Цвет логотипа');
  if (footerSubtitle) footerSubtitle.textContent = 'Основной логотип';
  if (footerTitle) footerTitle.setAttribute('aria-live', 'polite');

  const announce = (message) => {
    if (!liveRegion) return;
    liveRegion.textContent = '';
    window.requestAnimationFrame(() => {
      liveRegion.textContent = message;
    });
  };

  const stack = document.createElement('div');
  stack.className = 'language-logo-stack';
  stack.dataset.language = 'ru';

  const ruImage = document.createElement('img');
  ruImage.className = 'language-logo-layer language-logo-layer-ru';
  ruImage.alt = 'Кириллический логотип Эталон';
  ruImage.decoding = 'async';

  const enImage = document.createElement('img');
  enImage.className = 'language-logo-layer language-logo-layer-en';
  enImage.alt = 'Английский логотип Etalon';
  enImage.decoding = 'async';

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
    downloadButton.setAttribute('aria-label', language === 'en' ? 'Скачать английский логотип' : 'Скачать кириллический логотип');
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
        window.requestAnimationFrame(() => stack.classList.remove('is-tone-changing'));
      });
    }

    toneButtons.forEach((button) => {
      const active = button.dataset.cardTone === tone;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    updateDownload();
  }

  function setLanguage(language, shouldAnnounce = false) {
    const isEnglish = language === 'en';
    card.dataset.logoLanguage = language;
    stack.dataset.language = language;
    languageSwitch.dataset.language = language;
    languageSwitch.setAttribute('aria-pressed', String(isEnglish));
    languageSwitch.setAttribute('aria-label', isEnglish ? 'Переключить на русскую версию' : 'Переключить на английскую версию');
    if (footerTitle) footerTitle.textContent = isEnglish ? 'Английская версия' : 'Кириллическая версия';
    updateDownload();
    if (shouldAnnounce) announce(isEnglish ? 'Показана английская версия логотипа' : 'Показана кириллическая версия логотипа');
  }

  toneButtons.forEach((button) => {
    button.addEventListener('click', () => setTone(button.dataset.cardTone || 'blue'));
  });

  languageSwitch.addEventListener('click', () => {
    setLanguage(card.dataset.logoLanguage === 'en' ? 'ru' : 'en', true);
  });

  card.dataset.logoLanguage = 'ru';
  setTone(card.dataset.currentTone || 'blue', true);
  setLanguage('ru');
})();

(() => {
  const downloadLinks = [...document.querySelectorAll('.compact-downloads a[href]')];
  if (!downloadLinks.length) return;

  const fallbackMetadata = {
    'Etalon_Brand_Guide_2025.pdf': 'PDF · 29 КБ',
    'Etalon_Logos_All_Formats.zip': 'ZIP · SVG, PNG, EPS, PDF · 377 КБ',
    'Etalon_Symbol_All_Formats.zip': 'ZIP · SVG, PNG, EPS, PDF · 23 КБ',
    'Etalon_Map_All_Formats.zip': 'ZIP · SVG, PNG, EPS, PDF · 205 КБ',
    'Gilroy.zip': 'ZIP · TTF · 71 КБ',
  };

  function getFilename(link) {
    try {
      return new URL(link.href, window.location.href).pathname.split('/').pop() || '';
    } catch {
      return '';
    }
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '';
    const megabyte = 1024 * 1024;
    if (bytes >= megabyte) {
      const value = bytes / megabyte;
      return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value)} МБ`;
    }
    const value = Math.max(1, Math.round(bytes / 1024));
    return `${new Intl.NumberFormat('ru-RU').format(value)} КБ`;
  }

  const metadataNodes = new Map();

  downloadLinks.forEach((link) => {
    const label = link.querySelector(':scope > span');
    if (!label) return;

    const filename = getFilename(link);
    const title = label.textContent.trim();
    const titleNode = document.createElement('span');
    const metaNode = document.createElement('small');

    titleNode.className = 'download-name';
    titleNode.textContent = title;
    metaNode.className = 'download-meta';
    metaNode.textContent = fallbackMetadata[filename] || '';

    label.className = 'download-label';
    label.replaceChildren(titleNode, metaNode);
    metadataNodes.set(filename, metaNode);
  });

  fetch('./downloads/downloads-manifest.json', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`Download manifest returned ${response.status}`);
      return response.json();
    })
    .then((manifest) => {
      metadataNodes.forEach((node, filename) => {
        const item = manifest?.[filename];
        if (!item) return;
        const size = formatBytes(Number(item.bytes));
        node.textContent = [item.format, size].filter(Boolean).join(' · ');
      });
    })
    .catch(() => {
      // The static fallback remains visible if metadata cannot be loaded.
    });
})();
