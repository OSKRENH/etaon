const search = document.querySelector('#search');
const searchable = [...document.querySelectorAll('[data-search]')];

search?.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  searchable.forEach((section) => {
    const haystack = `${section.dataset.search} ${section.textContent}`.toLowerCase();
    section.classList.toggle('is-hidden', Boolean(query) && !haystack.includes(query));
  });
});

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      const original = button.textContent;
      button.textContent = 'Скопировано';
      setTimeout(() => (button.textContent = original), 1200);
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
