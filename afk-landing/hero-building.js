(() => {
  const hero = document.querySelector('.hero');
  if (!hero || hero.querySelector('.hero-building-art')) return;

  const partsBase =
    'https://raw.githubusercontent.com/OSKRENH/etaon/main/afk-landing/assets/hero-building-v2';
  const partNames = Array.from({ length: 9 }, (_, index) => `chunk-${index + 1}.txt`);

  const style = document.createElement('style');
  style.id = 'hero-building-style';
  style.textContent = `
    .hero {
      isolation: isolate;
      overflow: hidden;
    }

    .hero-grid {
      z-index: 0;
    }

    .hero::before {
      content: '';
      position: absolute;
      z-index: 1;
      top: 0;
      right: 0;
      width: min(52vw, 820px);
      height: 100%;
      pointer-events: none;
      background: radial-gradient(
        circle at 68% 42%,
        rgba(74, 126, 232, .22),
        rgba(74, 126, 232, 0) 64%
      );
    }

    .hero-layout {
      position: relative;
      z-index: auto;
    }

    .hero-footnote {
      position: relative;
      z-index: 8;
    }

    .hero-copy {
      position: relative;
      z-index: 7;
    }

    .offer-panel {
      position: relative;
      z-index: auto;
      overflow: hidden;
      background: linear-gradient(160deg, #3d5ebd 0%, #223d90 55%, #192f73 100%);
      box-shadow: 0 30px 70px rgba(34, 61, 144, .20);
    }

    .offer-panel::after {
      content: '';
      position: absolute;
      z-index: 5;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      background: linear-gradient(
        90deg,
        rgba(25, 47, 115, .10) 0%,
        rgba(25, 47, 115, .16) 42%,
        rgba(25, 47, 115, .34) 100%
      );
    }

    .offer-panel > * {
      position: relative;
      z-index: 7;
      text-shadow: 0 1px 10px rgba(12, 28, 78, .18);
    }

    .hero-building-art {
      position: absolute;
      z-index: 4;
      left: calc(50% - 52px);
      right: auto;
      bottom: -34px;
      width: min(29vw, 440px);
      height: auto;
      max-height: 86%;
      object-fit: contain;
      object-position: right bottom;
      pointer-events: none;
      user-select: none;
      opacity: .96;
      filter:
        drop-shadow(0 34px 62px rgba(25, 53, 120, .21))
        drop-shadow(0 0 24px rgba(71, 120, 220, .10));
    }

    .hero::after {
      content: '';
      position: absolute;
      z-index: 6;
      right: 0;
      bottom: 0;
      width: min(46vw, 760px);
      height: 64px;
      pointer-events: none;
      background: linear-gradient(
        to top,
        rgba(246, 249, 255, .96),
        rgba(246, 249, 255, 0)
      );
    }

    @media (max-width: 1380px) {
      .hero-building-art {
        left: calc(50% - 18px);
        bottom: -28px;
        width: min(30vw, 400px);
        max-height: 82%;
      }
    }

    @media (max-width: 1120px) {
      .hero-building-art {
        left: calc(50% + 18px);
        bottom: -22px;
        width: min(31vw, 350px);
        max-height: 76%;
        opacity: .88;
      }

      .offer-panel::after {
        background: rgba(25, 47, 115, .26);
      }
    }

    @media (max-width: 980px) {
      .hero-building-art,
      .hero::before,
      .hero::after {
        display: none;
      }

      .offer-panel::after {
        display: none;
      }
    }
  `;
  document.head.appendChild(style);

  Promise.all(
    partNames.map(async (name) => {
      const response = await fetch(`${partsBase}/${name}`, { cache: 'force-cache' });
      if (!response.ok) {
        throw new Error(`Не удалось загрузить изображение первого экрана: ${response.status}`);
      }
      return response.text();
    }),
  )
    .then((parts) => {
      const image = document.createElement('img');
      image.className = 'hero-building-art';
      image.src = `data:image/webp;base64,${parts.join('').trim()}`;
      image.alt = '';
      image.setAttribute('aria-hidden', 'true');
      image.decoding = 'async';
      hero.appendChild(image);
    })
    .catch((error) => console.error(error));
})();
