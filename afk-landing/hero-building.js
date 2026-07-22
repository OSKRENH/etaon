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
    }

    .hero-grid {
      z-index: 0;
    }

    .hero-layout,
    .hero-footnote {
      position: relative;
      z-index: 2;
    }

    .hero-copy {
      position: relative;
      z-index: 4;
    }

    .offer-panel {
      position: relative;
      z-index: 5;
      backdrop-filter: blur(3px);
    }

    .hero-building-art {
      position: absolute;
      z-index: 3;
      right: max(-38px, calc((100vw - 1640px) / 2 - 22px));
      bottom: -82px;
      width: auto;
      height: min(700px, 96%);
      max-width: 43vw;
      object-fit: contain;
      object-position: right bottom;
      pointer-events: none;
      user-select: none;
      opacity: 1;
      filter:
        drop-shadow(0 38px 68px rgba(25, 53, 120, .22))
        drop-shadow(0 0 34px rgba(71, 120, 220, .13));
    }

    .hero::after {
      content: '';
      position: absolute;
      z-index: 1;
      right: 0;
      bottom: 0;
      width: min(44vw, 720px);
      height: 72px;
      pointer-events: none;
      background: linear-gradient(to top, rgba(246, 249, 255, .9), rgba(246, 249, 255, 0));
    }

    @media (max-width: 1380px) {
      .hero-building-art {
        right: -86px;
        bottom: -68px;
        height: min(610px, 90%);
        max-width: 42vw;
        opacity: .96;
      }
    }

    @media (max-width: 1120px) {
      .hero-building-art {
        right: -118px;
        bottom: -52px;
        height: min(530px, 82%);
        max-width: 41vw;
        opacity: .82;
      }
    }

    @media (max-width: 980px) {
      .hero-building-art,
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
