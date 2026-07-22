(() => {
  const hero = document.querySelector('.hero');
  const offerPanel = document.querySelector('.offer-panel');
  if (!hero || !offerPanel || hero.querySelector('.hero-building-art')) return;

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
      width: min(54vw, 860px);
      height: 100%;
      pointer-events: none;
      background: radial-gradient(
        circle at 66% 42%,
        rgba(74, 126, 232, .22),
        rgba(74, 126, 232, 0) 65%
      );
    }

    .hero-layout {
      position: relative;
      z-index: auto;
      grid-template-columns: minmax(0, 1fr) 440px;
      gap: 54px;
    }

    .hero-footnote {
      position: relative;
      z-index: 9;
    }

    .hero-copy {
      position: relative;
      z-index: 8;
    }

    .offer-panel {
      position: relative;
      z-index: auto;
      justify-self: end;
      width: 440px;
      min-height: 350px;
      padding: 30px 26px 28px 214px;
      overflow: visible;
      background: linear-gradient(160deg, #3d5ebd 0%, #223d90 55%, #192f73 100%);
      box-shadow: 0 30px 70px rgba(34, 61, 144, .20);
    }

    .offer-panel > * {
      position: relative;
      z-index: 7;
      width: 100%;
      max-width: 200px;
      text-shadow: 0 1px 10px rgba(12, 28, 78, .18);
    }

    .offer-panel .offer-value {
      font-size: clamp(62px, 5vw, 82px);
    }

    .offer-panel li {
      padding-left: 17px;
    }

    .hero-building-art {
      position: absolute;
      z-index: 4;
      bottom: -32px;
      width: 430px;
      height: auto;
      max-height: 88%;
      object-fit: contain;
      object-position: right bottom;
      pointer-events: none;
      user-select: none;
      opacity: .98;
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
      height: 54px;
      pointer-events: none;
      background: linear-gradient(
        to top,
        rgba(246, 249, 255, .96),
        rgba(246, 249, 255, 0)
      );
    }

    @media (max-width: 1380px) {
      .hero-layout {
        grid-template-columns: minmax(0, 1fr) 400px;
        gap: 38px;
      }

      .offer-panel {
        width: 400px;
        min-height: 342px;
        padding-left: 184px;
        padding-right: 22px;
      }

      .offer-panel > * {
        max-width: 194px;
      }

      .hero-building-art {
        width: 374px;
        bottom: -28px;
      }
    }

    @media (max-width: 1120px) {
      .hero-layout {
        grid-template-columns: minmax(0, 1fr) 365px;
        gap: 28px;
      }

      .offer-panel {
        width: 365px;
        min-height: 330px;
        padding-left: 164px;
        padding-right: 20px;
      }

      .offer-panel > * {
        max-width: 181px;
      }

      .hero-building-art {
        width: 330px;
        bottom: -22px;
        opacity: .94;
      }
    }

    @media (max-width: 980px) {
      .hero-building-art,
      .hero::before,
      .hero::after {
        display: none;
      }

      .hero-layout {
        grid-template-columns: 1fr;
      }

      .offer-panel {
        width: min(100%, 620px);
        min-height: 0;
        padding: 28px;
      }

      .offer-panel > * {
        max-width: none;
      }
    }
  `;
  document.head.appendChild(style);

  function placeBuilding(image) {
    if (window.innerWidth <= 980) return;

    const heroRect = hero.getBoundingClientRect();
    const panelRect = offerPanel.getBoundingClientRect();
    const overlap = window.innerWidth <= 1120 ? 145 : window.innerWidth <= 1380 ? 166 : 198;
    const imageWidth = image.getBoundingClientRect().width || 430;
    const panelLeft = panelRect.left - heroRect.left;

    image.style.left = `${Math.round(panelLeft - imageWidth + overlap)}px`;
    image.style.right = 'auto';
  }

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

      image.addEventListener(
        'load',
        () => {
          placeBuilding(image);
          window.addEventListener('resize', () => placeBuilding(image), { passive: true });
        },
        { once: true },
      );

      hero.appendChild(image);
    })
    .catch((error) => console.error(error));
})();
