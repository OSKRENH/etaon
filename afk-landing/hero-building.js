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
      width: min(48vw, 760px);
      height: 100%;
      pointer-events: none;
      background: radial-gradient(circle at 72% 42%, rgba(74, 126, 232, .2), rgba(74, 126, 232, 0) 64%);
    }

    .hero-layout,
    .hero-footnote {
      position: relative;
      z-index: 4;
    }

    .hero-copy {
      position: relative;
      z-index: 5;
    }

    .offer-panel {
      position: relative;
      z-index: 6;
      background: linear-gradient(145deg, rgba(58, 92, 190, .97), rgba(29, 58, 139, .98));
      box-shadow: 0 26px 56px rgba(29, 58, 139, .2);
    }

    .hero-building-art {
      position: absolute;
      z-index: 2;
      right: max(-12px, calc((100vw - 1540px) / 2 - 8px));
      bottom: -34px;
      width: auto;
      height: min(640px, 91%);
      max-width: 39vw;
      object-fit: contain;
      object-position: right bottom;
      pointer-events: none;
      user-select: none;
      opacity: 1;
      filter:
        drop-shadow(0 34px 62px rgba(25, 53, 120, .21))
        drop-shadow(0 0 26px rgba(71, 120, 220, .1));
    }

    .hero::after {
      content: '';
      position: absolute;
      z-index: 3;
      right: 0;
      bottom: 0;
      width: min(44vw, 720px);
      height: 56px;
      pointer-events: none;
      background: linear-gradient(to top, rgba(246, 249, 255, .94), rgba(246, 249, 255, 0));
    }

    @media (max-width: 1380px) {
      .hero-building-art {
        right: -34px;
        bottom: -28px;
        height: min(570px, 86%);
        max-width: 37vw;
      }
    }

    @media (max-width: 1120px) {
      .hero-building-art {
        right: -62px;
        bottom: -22px;
        height: min(500px, 79%);
        max-width: 36vw;
        opacity: .9;
      }
    }

    @media (max-width: 980px) {
      .hero-building-art,
      .hero::before,
      .hero::after {
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
