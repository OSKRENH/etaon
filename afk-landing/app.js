const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const leadForm = document.querySelector('[data-lead-form]');
const formStatus = document.querySelector('[data-form-status]');

function ensureStylesheet(id, href) {
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

ensureStylesheet('gilroy-fonts', 'https://fonts.cdnfonts.com/css/gilroy-bold');
ensureStylesheet('landing-typography', './typography.css');

function mountEtalonLogos() {
  const tabHeader = document.querySelector('[data-brand-tab="etalon"] .brand-tab-header');
  if (tabHeader) {
    tabHeader.innerHTML = '<img class="brand-tab-logo-etalon" src="./etalon-blue.svg" alt="Эталон" />';
  }

  const summaryName = document.querySelector('[data-brand-panel="etalon"] .brand-summary span');
  if (summaryName) {
    const logo = document.createElement('img');
    logo.className = 'brand-summary-logo-etalon';
    logo.src = './etalon-blue.svg';
    logo.alt = 'Эталон';
    summaryName.replaceWith(logo);
  }
}

mountEtalonLogos();

const TYPOGRAPHY_EXCLUDED_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE']);
const SHORT_RUSSIAN_WORDS = /(^|[\s([{"«])((?:а|без|бы|в|во|для|до|же|за|и|из|или|к|как|ко|ли|между|на|над|не|ни|но|о|об|от|по|под|при|про|с|со|у|через|что))\s+(?=\S)/giu;

function fixHangingWords(root = document.body) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || !node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
      if (TYPOGRAPHY_EXCLUDED_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest('[data-no-typography]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    node.nodeValue = node.nodeValue.replace(SHORT_RUSSIAN_WORDS, '$1$2\u00A0');
  });
}

fixHangingWords();

function syncHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
}

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  mobileMenu?.classList.toggle('is-open', willOpen);
  document.body.classList.toggle('menu-open', willOpen);
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  });
});

const brandTabs = [...document.querySelectorAll('[data-brand-tab]')];
const brandPanels = [...document.querySelectorAll('[data-brand-panel]')];
const projectSelect = leadForm?.querySelector('select[name="project"]');

function activateBrand(brand) {
  brandTabs.forEach((tab) => {
    const active = tab.dataset.brandTab === brand;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });

  brandPanels.forEach((panel) => {
    const active = panel.dataset.brandPanel === brand;
    panel.classList.toggle('is-active', active);
    panel.hidden = !active;
  });
}

brandTabs.forEach((tab) => {
  tab.addEventListener('click', () => activateBrand(tab.dataset.brandTab));
});

document.querySelectorAll('[data-project-choice]').forEach((button) => {
  button.addEventListener('click', () => {
    if (projectSelect) projectSelect.value = button.dataset.projectChoice;
    document.querySelector('#consultation')?.scrollIntoView({ behavior: 'smooth' });
  });
});

leadForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  formStatus.textContent = '';

  const requiredFields = [...leadForm.querySelectorAll('[required]')];
  requiredFields.forEach((field) => field.classList.remove('field-error'));

  const invalidFields = requiredFields.filter((field) => {
    if (field.type === 'checkbox') return !field.checked;
    return !field.value.trim() || !field.checkValidity();
  });

  if (invalidFields.length) {
    invalidFields.forEach((field) => field.classList.add('field-error'));
    invalidFields[0].focus();
    formStatus.textContent = 'Проверьте обязательные поля.';
    return;
  }

  const submitButton = leadForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Заявка подготовлена';
  formStatus.textContent = 'Форма валидна. Для публикации подключите обработчик CRM или Tilda Webhook.';
});
