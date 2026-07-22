(() => {
  const PARTS_BASE = 'https://raw.githubusercontent.com/OSKRENH/etaon/main/afk-landing/assets/project-sprite';
  const partUrls = Array.from({ length: 6 }, (_, index) => `${PARTS_BASE}/part-${index + 1}.txt`);

  const cssForSprite = (sprite) => `
    .project-card {
      min-height: 440px;
      overflow: hidden;
    }

    .project-card::before {
      content: "";
      display: block;
      flex: 0 0 220px;
      height: 220px;
      margin: -22px -22px 20px;
      border-bottom: 1px solid rgba(34, 61, 144, .10);
      background-image: url("data:image/webp;base64,${sprite}");
      background-repeat: no-repeat;
      background-size: 200% 300%;
      background-color: #f3f6fd;
      transition: transform .35s ease;
    }

    .project-card:hover::before {
      transform: scale(1.015);
    }

    [data-brand-panel="etalon"] .project-card:nth-child(1)::before { background-position: 0% 0%; }
    [data-brand-panel="etalon"] .project-card:nth-child(2)::before { background-position: 100% 0%; }

    [data-brand-panel="aurix"] .project-card:nth-child(1)::before {
      background-position: 0% 50%;
      border-bottom-color: rgba(31, 0, 72, .10);
    }

    [data-brand-panel="aurix"] .project-card:nth-child(2)::before {
      background-position: 100% 50%;
      border-bottom-color: rgba(31, 0, 72, .10);
    }

    [data-brand-panel="rsk"] .project-card:nth-child(1)::before {
      background-position: 0% 100%;
      border-bottom-color: rgba(85, 191, 242, .20);
    }

    [data-brand-panel="rsk"] .project-card:nth-child(2)::before {
      background-position: 100% 100%;
      border-bottom-color: rgba(85, 191, 242, .20);
    }

    @media (max-width: 720px) {
      .project-card { min-height: 410px; }
      .project-card::before {
        flex-basis: 200px;
        height: 200px;
      }
    }
  `;

  Promise.all(partUrls.map(async (url) => {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Не удалось загрузить изображение проектов: ${response.status}`);
    return response.text();
  }))
    .then((parts) => {
      const style = document.createElement('style');
      style.id = 'project-images-style';
      style.textContent = cssForSprite(parts.join('').trim());
      document.head.appendChild(style);
    })
    .catch((error) => console.error(error));
})();
