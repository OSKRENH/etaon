const refreshStyles = document.createElement('link');
refreshStyles.rel = 'stylesheet';
refreshStyles.href = './visual-refresh.css';
document.head.appendChild(refreshStyles);

const downloadIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3h2v10.17l3.59-3.58L18 11l-6 6-6-6 1.41-1.41L11 13.17V3zM5 19h14v2H5z"/></svg>';
const copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>';

/* Актуальные цифры */
const statItems = [...document.querySelectorAll('.stats article')];
if (statItems.length >= 4) {
  statItems[0].innerHTML = '<strong>1987</strong><span>год основания</span>';
  statItems[3].innerHTML = '<strong>9,8 млн м²</strong><span class="stat-nowrap">жилой площади</span>';
}

/* Диагональный разделитель — самостоятельный элемент сетки */
document.querySelectorAll('.quick-links a').forEach((link) => {
  if (!link.querySelector('.quick-slash')) {
    const slash = document.createElement('i');
    slash.className = 'quick-slash';
    slash.setAttribute('aria-hidden', 'true');
    link.querySelector('b')?.after(slash);
  }
});

/* Переключатели цвета внутри каждого окна логотипа */
document.querySelector('.logo-tone-switch')?.remove();
const groupCaption = document.querySelector('[data-logo-key="group"] footer small');
if (groupCaption) groupCaption.textContent = 'Полная версия';

const logoCards = [...document.querySelectorAll('[data-logo-key]')];
const tones = [
  { key: 'blue', label: 'Синий логотип', color: '#223E90' },
  { key: 'white', label: 'Белый логотип', color: '#FFFFFF' },
  { key: 'black', label: 'Чёрный логотип', color: '#1D1D1B' }
];

function setCardTone(card, tone) {
  const key = card.dataset.logoKey;
  const preview = card.querySelector('.logo-preview');
  const image = preview?.querySelector('img');
  const downloadButton = card.querySelector('[data-download]');
  const path = `logos/${key}-${tone}.svg`;

  if (image) image.src = `./assets/${path}`;
  if (preview) {
    preview.classList.remove('tone-blue', 'tone-white', 'tone-black');
    preview.classList.add(`tone-${tone}`);
  }
  if (downloadButton) downloadButton.dataset.download = path;

  card.querySelectorAll('[data-card-tone]').forEach((button) => {
    const active = button.dataset.cardTone === tone;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

logoCards.forEach((card) => {
  const preview = card.querySelector('.logo-preview');
  if (!preview) return;

  const controls = document.createElement('div');
  controls.className = 'card-tone-switch';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Цвет логотипа');

  tones.forEach(({ key, label, color }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.cardTone = key;
    button.style.setProperty('--tone', color);
    button.setAttribute('aria-label', label);
    button.title = label;
    button.addEventListener('click', () => setCardTone(card, key));
    controls.appendChild(button);
  });

  preview.appendChild(controls);
  setCardTone(card, 'blue');
});

/* Логотип мягко увеличивается только пока карточка находится в поле зрения */
if ('IntersectionObserver' in window) {
  const logoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-in-view', entry.isIntersecting && entry.intersectionRatio >= 0.32);
    });
  }, {
    threshold: [0, 0.32, 0.7],
    rootMargin: '-6% 0px -8% 0px'
  });
  logoCards.forEach((card) => logoObserver.observe(card));
} else {
  logoCards.forEach((card) => card.classList.add('is-in-view'));
}

/* Палитра из брендбука */
function colorCard({ name, hex, rgb, cmyk, pantone, ral, className = '' }) {
  const rows = [
    `<div><dt>Для экрана</dt><dd>${rgb}</dd></div>`,
    `<div><dt>Для печати</dt><dd>${cmyk}</dd></div>`,
    pantone ? `<div><dt>Pantone</dt><dd>${pantone}</dd></div>` : '',
    ral ? `<div><dt>RAL</dt><dd>${ral}</dd></div>` : ''
  ].join('');

  return `<article class="${className}" style="--swatch:${hex}">
    <header><b>${name}</b><div class="color-code"><strong>${hex}</strong><button class="copy-icon" type="button" data-copy="${hex}" aria-label="Скопировать ${hex}" title="Скопировать код">${copyIcon}</button></div></header>
    <dl>${rows}</dl>
  </article>`;
}

const colorGrid = document.querySelector('.color-grid');
if (colorGrid) {
  colorGrid.innerHTML = [
    colorCard({ name: 'Фирменный синий', hex: '#213A8F', rgb: '33, 58, 143', cmyk: '100, 85, 0, 0', pantone: '2728 C', ral: '5005' }),
    colorCard({ name: 'Графитовый', hex: '#1E242E', rgb: '30, 36, 46', cmyk: '86, 72, 54, 68', pantone: '7547 C', ral: '7021' }),
    colorCard({ name: 'Синий 50%', hex: '#909CC7', rgb: '144, 156, 199', cmyk: '50, 43, 0, 0', className: 'blue-tint' }),
    colorCard({ name: 'Синий 15%', hex: '#DEE1EE', rgb: '222, 225, 238', cmyk: '15, 13, 0, 0', className: 'blue-tint' }),
    colorCard({ name: 'Акцентный оранжевый', hex: '#FF4D00', rgb: '255, 77, 0', cmyk: '0, 79, 94, 0', className: 'orange' })
  ].join('');
}

/* Убираем запрет про сложный фон */
document.querySelectorAll('.dont li').forEach((item) => {
  if (item.textContent.toLowerCase().includes('сложном фоне')) item.remove();
});

/* В футере остаётся только логотип */
document.querySelector('.footer-year')?.remove();

/* Копирование кодов */
document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    const originalLabel = button.getAttribute('aria-label');
    try {
      await navigator.clipboard.writeText(value);
      button.classList.add('is-copied');
      button.setAttribute('aria-label', 'Скопировано');
      setTimeout(() => {
        button.classList.remove('is-copied');
        button.setAttribute('aria-label', originalLabel || `Скопировать ${value}`);
      }, 1200);
    } catch {
      window.prompt('Скопируйте значение:', value);
    }
  });
});

/* Скачивание текущей цветовой версии */
document.querySelectorAll('[data-download]').forEach((button) => {
  button.innerHTML = downloadIcon;
  button.addEventListener('click', () => {
    const path = button.dataset.download;
    const anchor = document.createElement('a');
    anchor.href = `./assets/${path}`;
    anchor.download = path.split('/').pop();
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  });
});

/* Неразрывные короткие слова без ручных переносов */
const orphanWords = [
  'а', 'в', 'во', 'и', 'или', 'к', 'ко', 'на', 'над', 'не', 'ни', 'но',
  'о', 'об', 'обо', 'от', 'по', 'под', 'при', 'про', 'с', 'со', 'у',
  'за', 'из', 'изо', 'до', 'для', 'без'
];

function preventOrphans(root) {
  const escapedWords = orphanWords.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(
    `(^|[\\s(«„"—–-])(${escapedWords.join('|')})[ \\t]+(?=[А-Яа-яЁёA-Za-z0-9«„"])`,
    'giu'
  );
  const skipped = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT', 'OPTION', 'SVG']);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || skipped.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    node.nodeValue = node.nodeValue.replace(pattern, '$1$2\u00A0');
  });
}
preventOrphans(document.body);

/* Поиск */
const search = document.querySelector('#search');
const searchable = [...document.querySelectorAll('[data-search]')];
search?.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  searchable.forEach((section) => {
    const haystack = `${section.dataset.search} ${section.textContent}`.replace(/\u00A0/g, ' ').toLowerCase();
    section.classList.toggle('is-hidden', Boolean(query) && !haystack.includes(query));
  });
});

/* Параллакс и контекстная стрелка наверх */
const hero = document.querySelector('.hero');
const mapSection = document.querySelector('.map-section');
const backToTop = document.querySelector('.back-to-top');
const topbar = document.querySelector('.topbar');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let ticking = false;

function updateViewportEffects() {
  const viewport = window.innerHeight || 1;

  if (!reduceMotion && hero) {
    const rect = hero.getBoundingClientRect();
    const progress = (viewport / 2 - (rect.top + rect.height / 2)) / viewport;
    hero.style.setProperty('--hero-parallax', `${Math.max(-34, Math.min(34, progress * 34))}px`);
  }

  if (!reduceMotion && mapSection) {
    const rect = mapSection.getBoundingClientRect();
    const progress = (viewport / 2 - (rect.top + rect.height / 2)) / viewport;
    mapSection.style.setProperty('--map-parallax', `${Math.max(-36, Math.min(36, progress * 36))}px`);
  }

  if (backToTop && hero) {
    const topbarHeight = topbar?.getBoundingClientRect().height || 0;
    const heroHasPassed = hero.getBoundingClientRect().bottom <= topbarHeight + 8;
    backToTop.classList.toggle('is-visible', heroHasPassed && window.scrollY > 80);
  }

  ticking = false;
}

function requestViewportEffects() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateViewportEffects);
}

window.addEventListener('scroll', requestViewportEffects, { passive: true });
window.addEventListener('resize', requestViewportEffects);
updateViewportEffects();
