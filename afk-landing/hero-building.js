(() => {
  const hero = document.querySelector('.hero');
  const offerPanel = document.querySelector('.offer-panel');
  const heroTitle = document.querySelector('.hero-copy h1');
  if (!hero || !offerPanel || !heroTitle || hero.querySelector('.hero-building-art')) return;

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
      width: min(50vw, 780px);
      height: 100%;
      pointer-events: none;
      background: radial-gradient(
        circle at 62% 40%,
        rgba(74, 126, 232, .20),
        rgba(74, 126, 232, 0) 66%
      );
    }

    .hero-layout {
      position: relative;
      z-index: auto;
      grid-template-columns: minmax(0, 1fr) 320px;
      gap: 34px;
    }

    .hero-copy {
      position: relative;
      z-index: 8;
      max-width: 730px;
    }

    .hero-copy h1 {
      max-width: 720px;
      font-size: clamp(48px, 4.25vw, 66px);
      line-height: .97;
      letter-spacing: -.048em;
    }

    .hero-copy .hero-lead {
      max-width: 610px;
      font-size: 16px;
      line-height: 1.48;
    }

    .hero-footnote {
      position: relative;
      z-index: 9;
    }

    .offer-panel {
      position: relative;
      z-index: auto;
      justify-self: end;
      width: 320px;
      min-height: 326px;
      padding: 25px 24px;
      overflow: visible;
      background: linear-gradient(160deg, #3d5ebd 0%, #223d90 55%, #192f73 100%);
      box-shadow: 0 26px 60px rgba(34, 61, 144, .19);
    }

    .offer-panel > * {
      position: relative;
      z-index: 7;
      width: 100%;
      max-width: none;
      text-shadow: 0 1px 10px rgba(12, 28, 78, .18);
    }

    .offer-panel .offer-kicker {
      font-size: 9px;
      letter-spacing: .13em;
    }

    .offer-panel .offer-value {
      margin-top: 17px;
      font-size: clamp(58px, 4.2vw, 72px);
    }

    .offer-panel .offer-title {
      margin-top: 9px;
      font-size: 17px;
    }

    .offer-panel > p {
      margin: 7px 0 17px;
      font-size: 12px;
      line-height: 1.42;
    }

    .offer-panel li {
      padding: 10px 0 10px 16px;
      font-size: 11.5px;
      line-height: 1.3;
    }

    .offer-panel li::before {
      top: 15px;
      width: 5px;
      height: 5px;
    }

    .hero-building-art {
      position: absolute;
      z-index: 4;
      top: 0;
      left: 0;
      width: auto;
      height: 500px;
      object-fit: contain;
      object-position: right bottom;
      pointer-events: none;
      user-select: none;
      opacity: .98;
      filter:
        drop-shadow(0 32px 58px rgba(25, 53, 120, .20))
        drop-shadow(0 0 22px rgba(71, 120, 220, .09));
    }

    .hero::after {
      content: '';
      position: absolute;
      z-index: 6;
      right: 0;
      bottom: 0;
      width: min(43vw, 680px);
      height: 48px;
      pointer-events: none;
      background: linear-gradient(
        to top,
        rgba(246, 249, 255, .96),
        rgba(246, 249, 255, 0)
      );
    }

    @media (max-width: 1380px) {
      .hero-layout {
        grid-template-columns: minmax(0, 1fr) 304px;
        gap: 26px;
      }

      .hero-copy {
        max-width: 660px;
      }

      .hero-copy h1 {
        max-width: 650px;
        font-size: clamp(46px, 4vw, 59px);
      }

      .offer-panel {
        width: 304px;
        min-height: 318px;
        padding: 24px 22px;
      }
    }

    @media (max-width: 1120px) {
      .hero-layout {
        grid-template-columns: minmax(0, 1fr) 288px;
        gap: 20px;
      }

      .hero-copy h1 {
        font-size: clamp(43px, 4.1vw, 52px);
      }

      .hero-copy .hero-lead {
        font-size: 15px;
      }

      .offer-panel {
        width: 288px;
        min-height: 310px;
        padding: 22px 20px;
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

      .hero-copy {
        max-width: none;
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
    const titleRect = heroTitle.getBoundingClientRect();
    const panelRect = offerPanel.getBoundingClientRect();

    const top = Math.max(112, titleRect.top - heroRect.top - 2);
    const height = Math.max(410, heroRect.height - top + 10);
    const overlap = window.innerWidth <= 1120 ? 8 : window.innerWidth <= 1380 ? 10 : 12;

    image.style.top = `${Math.round(top)}px`;
    image.style.bottom = 'auto';
    image.style.height = `${Math.round(height)}px`;
    image.style.width = 'auto';

    requestAnimationFrame(() => {
      const imageWidth = image.getBoundingClientRect().width;
      const panelLeft = panelRect.left - heroRect.left;
      image.style.left = `${Math.round(panelLeft - imageWidth + overlap)}px`;
      image.style.right = 'auto';
    });
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
