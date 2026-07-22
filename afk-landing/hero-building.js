(() => {
  const hero = document.querySelector('.hero');
  if (!hero || hero.querySelector('.hero-building-art')) return;

  const PARTS_BASE =
    'https://raw.githubusercontent.com/OSKRENH/etaon/main/afk-landing/assets/hero-building';

  const style = document.createElement('style');
  style.id = 'hero-building-style';
  style.textContent = `
    .hero { isolation: isolate; }
    .hero-grid { z-index: 0; }
    .hero-layout,
    .hero-footnote { position: relative; z-index: 2; }
    .hero-copy,
    .offer-panel { position: relative; z-index: 3; }

    .hero-building-art {
      position: absolute;
      z-index: 1;
      right: max(-90px, calc((100vw - 1640px) / 2));
      bottom: -28px;
      width: min(32vw, 470px);
      height: auto;
      max-height: 520px;
      object-fit: contain;
      object-position: right bottom;
      pointer-events: none;
      user-select: none;
      opacity: .9;
      filter: drop-shadow(0 26px 48px rgba(34, 61, 144, .16));
    }

    @media (max-width: 1280px) {
      .hero-building-art {
        right: -120px;
        width: min(38vw, 430px);
        opacity: .72;
      }
    }

    @media (max-width: 980px) {
      .hero-building-art { display: none; }
    }
  `;
  document.head.appendChild(style);

  Promise.all(
    [1, 2].map(async (part) => {
      const response = await fetch(`${PARTS_BASE}/part-${part}.txt`, {
        cache: 'force-cache',
      });
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
