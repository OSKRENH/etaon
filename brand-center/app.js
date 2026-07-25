const search = document.querySelector('#search');
const searchable = [...document.querySelectorAll('[data-search]')];

search?.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  searchable.forEach((section) => {
    const haystack = `${section.dataset.search} ${section.textContent}`.toLowerCase();
    section.classList.toggle('is-hidden', query && !haystack.includes(query));
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

document.querySelectorAll('[data-download]').forEach((button) => {
  button.addEventListener('click', () => {
    const anchor = document.createElement('a');
    anchor.href = `./assets/${button.dataset.download}`;
    anchor.download = button.dataset.download;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  });
});