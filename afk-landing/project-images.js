(() => {
  const PARTS_BASE = 'https://raw.githubusercontent.com/OSKRENH/etaon/main/afk-landing/assets/project-sprite';
  const partUrls = Array.from({ length: 6 }, (_, index) => `${PARTS_BASE}/part-${index + 1}.txt`);

  const projects = [
    { panel: 'etalon', index: 0, position: '0% 0%', alt: 'ЖК Шагал' },
    { panel: 'etalon', index: 1, position: '100% 0%', alt: 'ЖК Соколин Парк' },
    { panel: 'aurix', index: 0, position: '0% 50%', alt: 'Резиденция Омега' },
    { panel: 'aurix', index: 1, position: '100% 50%', alt: 'ЛДМ' },
    { panel: 'rsk', index: 0, position: '0% 100%', alt: 'Кленовая аллея' },
    { panel: 'rsk', index: 1, position: '100% 100%', alt: 'Центральный квартал' },
  ];

  const cssForSprite = (sprite) => `
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

    .project-card-visual {
      width: min(396px, 100%);
      aspect-ratio: 480 / 267;
      flex: 0 0 auto;
      margin-left: auto;
      background-image: url("data:image/webp;base64,${sprite}");
      background-repeat: no-repeat;
      background-size: 200% 300%;
      filter: drop-shadow(0 16px 24px rgba(18, 36, 83, .12));
    }

    @media (max-width: 720px) {
      .project-card { min-height: 400px; }
      .project-card-media {
        flex-basis: 190px;
        height: 190px;
      }
      .project-card-visual { width: min(342px, 100%); }
    }
  `;

  function mountProjectImages(sprite) {
    projects.forEach(({ panel, index, position, alt }) => {
      const cards = document.querySelectorAll(`[data-brand-panel="${panel}"] .project-card`);
      const card = cards[index];
      if (!card || card.querySelector('.project-card-media')) return;

      const media = document.createElement('div');
      media.className = 'project-card-media';
      media.setAttribute('role', 'img');
      media.setAttribute('aria-label', alt);

      const visual = document.createElement('div');
      visual.className = 'project-card-visual';
      visual.style.backgroundPosition = position;

      media.appendChild(visual);
      card.prepend(media);
    });

    const style = document.createElement('style');
    style.id = 'project-images-style';
    style.textContent = cssForSprite(sprite);
    document.head.appendChild(style);
  }

  Promise.all(partUrls.map(async (url) => {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Не удалось загрузить изображение проектов: ${response.status}`);
    return response.text();
  }))
    .then((parts) => mountProjectImages(parts.join('').trim()))
    .catch((error) => console.error(error));
})();
