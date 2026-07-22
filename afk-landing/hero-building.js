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
      backdrop-filter: blur(2px);
    }

    .hero-building-art {
      position: absolute;
      z-index: 1;
      right: max(-54px, calc((100vw - 1600px) / 2 - 40px));
      bottom: -48px;
      width: min(31vw, 440px);
      height: min(500px, 78%);
      object-fit: contain;
      object-position: right bottom;
      pointer-events: none;
      user-select: none;
      opacity: 0;
      transform: translate3d(22px, 18px, 0) scale(.985);
      filter: drop-shadow(0 28px 52px rgba(30, 60, 132, .17));
      transition: opacity .65s ease, transform .8s cubic-bezier(.22, 1, .36, 1);
    }

    .hero.has-building .hero-building-art {
      opacity: .82;
      transform: translate3d(0, 0, 0) scale(1);
    }

    .hero::after {
      content: '';
      position: absolute;
      z-index: 1;
      right: 0;
      bottom: 0;
      width: min(40vw, 620px);
      height: 130px;
      pointer-events: none;
      background: linear-gradient(to top, rgba(246, 249, 255, .96), rgba(246, 249, 255, 0));
    }

    @media (max-width: 1280px) {
      .hero-building-art {
        right: -90px;
        bottom: -42px;
        width: min(34vw, 390px);
        height: min(450px, 75%);
      }

      .hero.has-building .hero-building-art {
        opacity: .6;
      }
    }

    @media (max-width: 980px) {
      .hero-building-art,
      .hero::after {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .hero-building-art {
        transition: none;
        transform: none;
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

      image.addEventListener('load', () => {
        hero.classList.add('has-building');
      }, { once: true });

      hero.appendChild(image);
    })
    .catch((error) => console.error(error));
})();
