const search = document.querySelector('#search');
const searchable = [...document.querySelectorAll('[data-search]')];

search?.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  searchable.forEach((section) => {
    const haystack = `${section.dataset.search} ${section.textContent}`.toLowerCase();
    section.classList.toggle('is-hidden', Boolean(query) && !haystack.includes(query));
  });
});

const checkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    const originalMarkup = button.innerHTML;
    const originalLabel = button.getAttribute('aria-label');

    try {
      await navigator.clipboard.writeText(value);
      button.innerHTML = checkIcon;
      button.classList.add('is-copied');
      button.setAttribute('aria-label', 'Скопировано');
      setTimeout(() => {
        button.innerHTML = originalMarkup;
        button.classList.remove('is-copied');
        button.setAttribute('aria-label', originalLabel || `Скопировать ${value}`);
      }, 1200);
    } catch {
      window.prompt('Скопируйте значение:', value);
    }
  });
});

const toneButtons = [...document.querySelectorAll('[data-logo-tone]')];
const logoCards = [...document.querySelectorAll('[data-logo-key]')];

function applyLogoTone(tone) {
  toneButtons.forEach((button) => {
    const active = button.dataset.logoTone === tone;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  logoCards.forEach((card) => {
    const key = card.dataset.logoKey;
    const preview = card.querySelector('.logo-preview');
    const image = card.querySelector('.logo-preview img');
    const downloadButton = card.querySelector('[data-download]');
    const path = `logos/${key}-${tone}.svg`;

    image.src = `./assets/${path}`;
    preview.classList.remove('tone-blue', 'tone-white', 'tone-black');
    preview.classList.add(`tone-${tone}`);
    downloadButton.dataset.download = path;
  });
}

toneButtons.forEach((button) => {
  button.addEventListener('click', () => applyLogoTone(button.dataset.logoTone));
});

applyLogoTone('blue');

document.querySelectorAll('[data-download]').forEach((button) => {
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
