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

function ensureScript(id, src) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

ensureStylesheet(
  'landing-typography',
  'https://cdn.jsdelivr.net/gh/OSKRENH/etaon@bde632be4df271b1d6d73376668b7ed21902691d/afk-landing/typography.css',
);

ensureStylesheet(
  'editorial-layout',
  'https://cdn.jsdelivr.net/gh/OSKRENH/etaon@6b14ecef4c28634c4eaeeca0d4580d4f66601d66/afk-landing/editorial.css',
);

ensureScript(
  'hero-building',
  'https://cdn.jsdelivr.net/gh/OSKRENH/etaon@9514e252ba268a118b66f5603126e38d4e0f3653/afk-landing/hero-building.js',
);

function normalizeBrandNames() {
  const replacements = [
    [/«Эталона»/g, '«Эталон»'],
    [/Эталона/g, 'Эталон'],
    [/Aurix/g, 'AURIX'],
  ];

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    const parent = walker.currentNode.parentElement;
    if (!parent || parent.closest('script, style')) continue;
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach((node) => {
    let value = node.nodeValue;
    replacements.forEach(([pattern, replacement]) => {
      value = value.replace(pattern, replacement);
    });
    node.nodeValue = value;
  });

  document.querySelectorAll('img[alt="Aurix"]').forEach((image) => {
    image.alt = 'AURIX';
  });

  document.querySelectorAll('optgroup[label="Aurix"]').forEach((group) => {
    group.label = 'AURIX';
  });

  document.querySelectorAll('[data-project-choice]').forEach((button) => {
    button.dataset.projectChoice = button.dataset.projectChoice
      .replace(/Эталона/g, 'Эталон')
      .replace(/Aurix/g, 'AURIX');
  });
}

function setHTML(selector, html) {
  const element = document.querySelector(selector);
  if (element) element.innerHTML = html;
}

function applyEditorialCopy() {
  setHTML(
    '.hero-copy .eyebrow',
    '<span></span>Предложение для&nbsp;сотрудников АФК&nbsp;«Система»',
  );
  setHTML(
    '.hero-copy h1',
    'Квартиры в&nbsp;проектах <span>«Эталон», AURIX и&nbsp;РСК</span> на&nbsp;специальных условиях',
  );
  setHTML(
    '.hero-lead',
    'Выберите бренд и&nbsp;проект. Получите дополнительную скидку и&nbsp;персональный расчёт условий.',
  );
  setHTML(
    '.hero-footnote p',
    'Финальные условия зависят от&nbsp;проекта и&nbsp;даты обращения. Актуальный расчёт предоставит менеджер.',
  );

  setHTML('.offer-title', 'к&nbsp;действующим скидкам');
  setHTML('.offer-panel > p', 'Для&nbsp;сотрудников компаний группы АФК&nbsp;«Система».');
  const offerItems = document.querySelectorAll('.offer-panel li');
  if (offerItems[0]) offerItems[0].innerHTML = 'Суммируется с&nbsp;доступными предложениями';
  if (offerItems[1]) offerItems[1].innerHTML = 'Персональный подбор проекта и&nbsp;планировки';
  if (offerItems[2]) offerItems[2].innerHTML = 'Расчёт ипотеки и&nbsp;рассрочки';

  setHTML('.stats .section-intro h2', 'Девелопер с&nbsp;подтверждённым опытом');
  setHTML(
    '.stats .section-intro p:not(.section-index)',
    'Группа «Эталон» создаёт жилые кварталы и&nbsp;городскую инфраструктуру с&nbsp;1987 года.',
  );
  const statCaptions = document.querySelectorAll('.stats-grid span');
  if (statCaptions[0]) statCaptions[0].innerHTML = 'работает на&nbsp;рынке';
  if (statCaptions[1]) statCaptions[1].textContent = 'площадей построено';
  if (statCaptions[2]) statCaptions[2].innerHTML = 'жителей в&nbsp;проектах';
  if (statCaptions[3]) statCaptions[3].innerHTML = 'рабочих мест создано';

  setHTML('.projects-intro h2', 'Три бренда — одно спецпредложение');
  setHTML(
    '.projects-intro p:not(.section-index)',
    'Выберите бренд и&nbsp;подходящий проект по&nbsp;классу, городу и&nbsp;бюджету.',
  );

  document.querySelectorAll('.brand-summary-logo, .brand-summary > div > span').forEach((logo) => {
    logo.remove();
  });
  const summaryLabels = document.querySelectorAll('.brand-summary strong');
  if (summaryLabels[0]) summaryLabels[0].innerHTML = 'Бизнес- и&nbsp;комфорт-класс';
  if (summaryLabels[1]) summaryLabels[1].textContent = 'Премиальные резиденции';
  if (summaryLabels[2]) summaryLabels[2].textContent = 'Современный комфорт-класс';

  setHTML(
    '#panel-etalon .brand-summary p',
    'Проекты в&nbsp;Москве, Санкт-Петербурге и&nbsp;регионах России.',
  );
  setHTML(
    '#panel-aurix .brand-summary p',
    'Камерные проекты в&nbsp;Москве и&nbsp;Санкт-Петербурге.',
  );
  setHTML(
    '#panel-rsk .brand-summary p',
    'Новые жилые проекты в&nbsp;Мариуполе и&nbsp;Луганске.',
  );

  const projectDescriptions = document.querySelectorAll('.project-card > p');
  const projectCopy = [
    'Квартал на&nbsp;первой линии набережной Марка Шагала, в&nbsp;9 км от&nbsp;Кремля.',
    'Городской квартал рядом с&nbsp;зелёными зонами Богородского района Москвы.',
    'Премиальный дом в&nbsp;Гагаринском районе, рядом с&nbsp;парками и&nbsp;ведущими вузами.',
    'Эксклюзивный квартал на&nbsp;Аптекарском острове с&nbsp;видовыми сити-виллами.',
    'Современный жилой комплекс в&nbsp;десяти минутах от&nbsp;центра Мариуполя.',
    '18 корпусов с&nbsp;благоустроенными дворами, паркингом и&nbsp;спортивной инфраструктурой.',
  ];
  projectDescriptions.forEach((description, index) => {
    if (projectCopy[index]) description.innerHTML = projectCopy[index];
  });

  const brandCaptions = document.querySelectorAll('.brand-tab-caption');
  if (brandCaptions[0]) brandCaptions[0].innerHTML = 'Бизнес и&nbsp;комфорт';

  setHTML(
    '.programs .section-intro p:not(.section-index)',
    'Менеджер рассчитает доступные условия для&nbsp;выбранного проекта.',
  );
  setHTML('.program-card:nth-child(3) h3', 'Ставка на&nbsp;весь срок');
  setHTML(
    '.program-disclaimer',
    '* Условия носят информационный характер, не&nbsp;являются публичной офертой и&nbsp;могут быть изменены. Актуальные параметры предоставит менеджер.',
  );

  setHTML('.steps .section-intro h2', 'Три шага к&nbsp;персональному предложению');
  setHTML(
    '.steps .section-intro p:not(.section-index)',
    'Заявка, персональный расчёт и&nbsp;подбор конкретных вариантов.',
  );
  const stepDescriptions = document.querySelectorAll('.steps-list p');
  const stepCopy = [
    'Укажите компанию, корпоративную почту и&nbsp;интересующий проект.',
    'Менеджер проверит скидки, ипотеку и&nbsp;рассрочку, затем подготовит сценарии покупки.',
    'Сравните проекты, планировки и&nbsp;итоговую стоимость покупки.',
  ];
  stepDescriptions.forEach((description, index) => {
    if (stepCopy[index]) description.innerHTML = stepCopy[index];
  });

  setHTML(
    '.consultation-copy h2',
    'Получите подборку квартир на&nbsp;специальных условиях',
  );
  setHTML(
    '.consultation-copy > p:not(.section-index)',
    'Оставьте заявку — специалист группы «Эталон» уточнит задачу и&nbsp;подготовит подходящие варианты.',
  );
  setHTML(
    '.consultation-note p',
    'Для&nbsp;подтверждения предложения потребуется корпоративный e-mail сотрудника компании группы АФК&nbsp;«Система».',
  );
  setHTML(
    '.checkbox-label span',
    'Согласен с&nbsp;<a href="https://etalongroup.ru/upload/etalongroup.content/1c9/kicwsf5eu5t8cdr0epb5s8rfhnpxwf9r.pdf" target="_blank" rel="noreferrer">условиями обработки персональных данных</a>',
  );

  setHTML(
    '.footer-bottom p',
    'Информация на&nbsp;сайте носит исключительно информационный характер и&nbsp;не&nbsp;является публичной офертой, определяемой статьёй 437 ГК&nbsp;РФ.',
  );

  document.querySelectorAll('a[href="#steps"]').forEach((link) => {
    link.innerHTML = 'Как&nbsp;получить';
  });
}

normalizeBrandNames();
applyEditorialCopy();

function mountEtalonLogo() {
  const tabHeader = document.querySelector('[data-brand-tab="etalon"] .brand-tab-header');
  if (tabHeader) {
    tabHeader.innerHTML = '<img class="brand-tab-logo" src="./etalon-blue.svg" alt="Эталон" />';
  }
}

mountEtalonLogo();

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
