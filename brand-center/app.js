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

const search = document.querySelector('#search');
const searchable = [...document.querySelectorAll('[data-search]')];

search?.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  searchable.forEach((section) => {
    const haystack = `${section.dataset.search} ${section.textContent}`
      .replace(/\u00A0/g, ' ')
      .toLowerCase();
    section.classList.toggle('is-hidden', Boolean(query) && !haystack.includes(query));
  });
});

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
