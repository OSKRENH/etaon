const themeLink = document.createElement('link');
themeLink.rel = 'stylesheet';
themeLink.href = './theme-light.css';
document.head.appendChild(themeLink);

function replaceLogo(selector, src, alt) {
  document.querySelectorAll(selector).forEach((container) => {
    const image = new Image();
    image.src = src;
    image.alt = alt;
    image.decoding = 'async';
    container.replaceChildren(image);
  });
}

replaceLogo(
  '.etalon-logo',
  'https://static.tildacdn.com/tild3365-6236-4633-b064-666561653563/etalon-black.svg',
  'Эталон',
);
replaceLogo(
  '.afk-logo',
  'https://static.tildacdn.com/tild6362-6262-4566-b733-306331626335/afk.svg',
  'АФК Система',
);

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const leadForm = document.querySelector('[data-lead-form]');
const formStatus = document.querySelector('[data-form-status]');

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
