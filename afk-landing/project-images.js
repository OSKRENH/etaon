(() => {
  const PARTS_BASE = 'https://raw.githubusercontent.com/OSKRENH/etaon/main/afk-landing/assets/project-sprite';
  const partUrls = Array.from({ length: 6 }, (_, index) => `${PARTS_BASE}/part-${index + 1}.txt`);
  const CELL_WIDTH = 480;
  const CELL_HEIGHT = 267;

  const projects = [
    { panel: 'etalon', index: 0, column: 0, row: 0, alt: 'ЖК Шагал' },
    { panel: 'etalon', index: 1, column: 1, row: 0, alt: 'ЖК Соколин Парк' },
    { panel: 'aurix', index: 0, column: 0, row: 1, alt: 'Резиденция Омега' },
    { panel: 'aurix', index: 1, column: 1, row: 1, alt: 'ЛДМ' },
    { panel: 'rsk', index: 0, column: 0, row: 2, alt: 'Кленовая аллея' },
    { panel: 'rsk', index: 1, column: 1, row: 2, alt: 'Центральный квартал' },
  ];

  const cardStyles = `
    .project-card {
      min-height: 440px;
      overflow: hidden;
    }

    .project-card::before {
      content: none !important;
      display: none !important;
    }

    .project-card-media {
      position: relative;
      flex: 0 0 220px;
      height: 220px;
      margin: -22px -22px 20px;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      overflow: hidden;
      border-bottom: 1px solid rgba(34, 61, 144, .10);
      background:
        radial-gradient(circle at 88% 18%, rgba(34, 61, 144, .10), transparent 38%),
        linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
    }

    .project-card-aurix .project-card-media {
      border-bottom-color: rgba(31, 0, 72, .10);
      background:
        radial-gradient(circle at 88% 18%, rgba(31, 0, 72, .10), transparent 38%),
        linear-gradient(180deg, #fbf9fd 0%, #f2edf8 100%);
    }

    .project-card-rsk .project-card-media {
      border-bottom-color: rgba(85, 191, 242, .20);
      background:
        radial-gradient(circle at 88% 18%, rgba(105, 202, 255, .17), transparent 38%),
        linear-gradient(180deg, #f5fbff 0%, #eaf8ff 100%);
    }

    .project-card-media img {
      display: block;
      width: auto;
      height: auto;
      max-width: min(396px, 100%);
      max-height: 220px;
      margin-left: auto;
      object-fit: contain;
      object-position: right bottom;
      filter: drop-shadow(0 16px 24px rgba(18, 36, 83, .12));
    }

    @media (max-width: 720px) {
      .project-card { min-height: 400px; }
      .project-card-media {
        flex-basis: 190px;
        height: 190px;
      }
      .project-card-media img {
        max-width: min(342px, 100%);
        max-height: 190px;
      }
    }
  `;

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function cropProjectImage(sheet, column, row) {
    const canvas = document.createElement('canvas');
    canvas.width = CELL_WIDTH;
    canvas.height = CELL_HEIGHT;

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, CELL_WIDTH, CELL_HEIGHT);
    context.drawImage(
      sheet,
      column * CELL_WIDTH,
      row * CELL_HEIGHT,
      CELL_WIDTH,
      CELL_HEIGHT,
      0,
      0,
      CELL_WIDTH,
      CELL_HEIGHT,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(URL.createObjectURL(blob)), 'image/png');
    });
  }

  async function mountProjectImages(sprite) {
    const sheet = await loadImage(`data:image/webp;base64,${sprite}`);

    const style = document.createElement('style');
    style.id = 'project-images-style';
    style.textContent = cardStyles;
    document.head.appendChild(style);

    await Promise.all(projects.map(async ({ panel, index, column, row, alt }) => {
      const cards = document.querySelectorAll(`[data-brand-panel="${panel}"] .project-card`);
      const card = cards[index];
      if (!card || card.querySelector('.project-card-media')) return;

      const media = document.createElement('div');
      media.className = 'project-card-media';

      const image = document.createElement('img');
      image.src = await cropProjectImage(sheet, column, row);
      image.alt = alt;
      image.decoding = 'async';

      media.appendChild(image);
      card.prepend(media);
    }));
  }

  Promise.all(partUrls.map(async (url) => {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Не удалось загрузить изображения проектов: ${response.status}`);
    return response.text();
  }))
    .then((parts) => mountProjectImages(parts.join('').trim()))
    .catch((error) => console.error(error));
})();
