const downloadIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3h2v10.17l3.59-3.58L18 11l-6 6-6-6 1.41-1.41L11 13.17V3zM5 19h14v2H5z"/></svg>';
const copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>';
const liveRegion = document.querySelector('#ui-status');

function announce(message) {
  if (!liveRegion) return;
  liveRegion.textContent = '';
  window.requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
}

/* Переключатели цвета внутри карточек логотипов */
const logoCards = [...document.querySelectorAll('[data-logo-key]')];
const logoSwapTimers = new WeakMap();
const tones = [
  { key: 'blue', label: 'Синий логотип', color: '#223E90' },
  { key: 'white', label: 'Белый логотип', color: '#FFFFFF' },
  { key: 'black', label: 'Черный логотип', color: '#1D1D1B' }
];

function getCardAssetKey(card) {
  return card.dataset.logoKey;
}

function getCardAlt(card) {
  if (card.dataset.logoKey === 'ru') return 'Кириллический логотип Эталон';
  if (card.dataset.logoKey === 'group') return 'Логотип Группы Эталон';
  return 'Фирменный знак Эталон';
}

function swapLogoImage(image, src, alt, instant = false) {
  const previousTimer = logoSwapTimers.get(image);
  if (previousTimer) window.clearTimeout(previousTimer);

  if (instant) {
    image.src = src;
    image.alt = alt;
    image.classList.remove('is-changing');
    return;
  }

  image.classList.add('is-changing');
  const timer = window.setTimeout(() => {
    image.src = src;
    image.alt = alt;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => image.classList.remove('is-changing'));
    });
  }, 110);
  logoSwapTimers.set(image, timer);
}

function setCardTone(card, tone, instant = false) {
  const assetKey = getCardAssetKey(card);
  const preview = card.querySelector('.logo-preview');
  const image = preview?.querySelector(':scope > img');
  const downloadButton = card.querySelector('[data-download]');
  const path = `logos/${assetKey}-${tone}.svg`;

  card.dataset.currentTone = tone;
  if (image) swapLogoImage(image, `./assets/${path}`, getCardAlt(card), instant);
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
  setCardTone(card, 'blue', true);
});

if ('IntersectionObserver' in window) {
  const logoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-in-view', entry.isIntersecting && entry.intersectionRatio >= 0.32);
    });
  }, { threshold: [0, 0.32, 0.7], rootMargin: '-6% 0px -8% 0px' });
  logoCards.forEach((card) => logoObserver.observe(card));
} else {
  logoCards.forEach((card) => card.classList.add('is-in-view'));
}

/* Палитра */
function colorCard({ name, hex, rgb, cmyk, pantone, ral, className = '' }) {
  const rows = [
    `<div><dt>RGB</dt><dd>${rgb}</dd></div>`,
    `<div><dt>CMYK</dt><dd>${cmyk}</dd></div>`,
    pantone ? `<div><dt>Pantone</dt><dd>${pantone}</dd></div>` : '',
    ral ? `<div><dt>RAL</dt><dd>${ral}</dd></div>` : ''
  ].join('');

  return `<article class="${className}" style="--swatch:${hex}">
    <header><b>${name}</b><div class="color-code"><button class="copy-icon" type="button" data-copy="${hex}" aria-label="Скопировать ${hex}" title="Скопировать код">${copyIcon}</button><strong>${hex}</strong></div></header>
    <dl>${rows}</dl>
  </article>`;
}

const colorGrid = document.querySelector('.color-grid');
if (colorGrid) {
  colorGrid.innerHTML = [
    colorCard({ name: 'Фирменный синий', hex: '#223E90', rgb: '34, 62, 144', cmyk: '100, 85, 0, 0', pantone: '2728 C', ral: '5005' }),
    colorCard({ name: 'Графитовый', hex: '#1E242E', rgb: '30, 36, 46', cmyk: '86, 72, 54, 68', pantone: '7547 C', ral: '7021' }),
    colorCard({ name: 'Синий 50%', hex: '#919FC8', rgb: '145, 159, 200', cmyk: '50, 43, 0, 0', className: 'blue-tint' }),
    colorCard({ name: 'Синий 15%', hex: '#DEE2EE', rgb: '222, 226, 238', cmyk: '15, 13, 0, 0', className: 'blue-tint' }),
    colorCard({ name: 'Акцентный оранжевый', hex: '#FF4D00', rgb: '255, 77, 0', cmyk: '0, 79, 94, 0', className: 'orange' })
  ].join('');
}

/* Копирование кодов */
document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    const originalLabel = button.getAttribute('aria-label');
    try {
      await navigator.clipboard.writeText(value);
      button.classList.add('is-copied');
      button.setAttribute('aria-label', 'Скопировано');
      announce(`Цвет ${value} скопирован`);
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
    if (!path) return;
    const anchor = document.createElement('a');
    anchor.href = `./assets/${path}`;
    anchor.download = path.split('/').pop();
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    announce(`Скачивание файла ${anchor.download} началось`);
  });
});

/* В интерфейсе используем Е вместо Ё */
function replaceYo(root) {
  const skipped = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT', 'OPTION', 'SVG']);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || skipped.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return /[Ёё]/.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    node.nodeValue = node.nodeValue.replaceAll('Ё', 'Е').replaceAll('ё', 'е');
  });
}
replaceYo(document.body);

/* Неразрывные короткие слова */
const orphanWords = [
  'а', 'в', 'во', 'и', 'или', 'к', 'ко', 'на', 'над', 'не', 'ни', 'но',
  'о', 'об', 'обо', 'от', 'по', 'под', 'при', 'про', 'с', 'со', 'у',
  'за', 'из', 'изо', 'до', 'для', 'без'
];

function preventOrphans(root) {
  const escapedWords = orphanWords.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(
    `(^|[\\s(«„"—–-])(${escapedWords.join('|')})[ \\t]+(?=[А-Яа-яЕеA-Za-z0-9«„"])`,
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

/* Активный раздел, карта и контекстные кнопки */
const sidebarLinks = [...document.querySelectorAll('.sidebar nav a[href^="#"]')];
const sections = sidebarLinks
  .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
  .filter(({ section }) => section);
const brandIntro = document.querySelector('.brand-intro');
const mapSection = document.querySelector('.map-section');
const backToTop = document.querySelector('.back-to-top');
const topbar = document.querySelector('.topbar');
const contextualDownloads = [...document.querySelectorAll('.button-small, .sidebar-download')];
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let ticking = false;

function updateViewportEffects() {
  const viewport = window.innerHeight || 1;
  const marker = Math.min(viewport * 0.34, 300);
  let active = sections[0];

  sections.forEach((item) => {
    if (item.section.getBoundingClientRect().top <= marker) active = item;
  });

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
    active = sections[sections.length - 1];
  }

  sections.forEach(({ link }) => {
    const isActive = link === active?.link;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });

  if (!reducedMotionQuery.matches && mapSection) {
    const rect = mapSection.getBoundingClientRect();
    const progress = (viewport / 2 - (rect.top + rect.height / 2)) / viewport;
    mapSection.style.setProperty('--map-parallax', `${Math.max(-36, Math.min(36, progress * 36))}px`);
  } else if (mapSection) {
    mapSection.style.setProperty('--map-parallax', '0px');
  }

  if (brandIntro) {
    const topbarHeight = topbar?.getBoundingClientRect().height || 0;
    const introHasPassed = brandIntro.getBoundingClientRect().bottom <= topbarHeight + 8;
    const showContextActions = introHasPassed && window.scrollY > 80;
    backToTop?.classList.toggle('is-visible', showContextActions);
    contextualDownloads.forEach((button) => button.classList.toggle('is-visible', showContextActions));
  }

  ticking = false;
}

function requestViewportEffects() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(updateViewportEffects);
}

window.addEventListener('scroll', requestViewportEffects, { passive: true });
window.addEventListener('resize', requestViewportEffects);
window.addEventListener('pageshow', updateViewportEffects);
window.addEventListener('hashchange', updateViewportEffects);
reducedMotionQuery.addEventListener?.('change', updateViewportEffects);
updateViewportEffects();
