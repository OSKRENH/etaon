(() => {
  const nav = document.querySelector('.mobile-section-nav');
  if (!nav) return;

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const targets = links
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(({ section }) => section);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeHref = '';
  let ticking = false;

  function setActive(href) {
    links.forEach((link) => {
      const active = link.getAttribute('href') === href;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });

    if (href === activeHref) return;
    activeHref = href;
    const activeLink = links.find((link) => link.getAttribute('href') === href);
    activeLink?.scrollIntoView({
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }

  function update() {
    const navBottom = nav.getBoundingClientRect().bottom;
    const marker = Math.min(window.innerHeight * 0.34, navBottom + 180);
    let active = targets[0];

    targets.forEach((item) => {
      if (item.section.getBoundingClientRect().top <= marker) active = item;
    });

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
      active = targets[targets.length - 1];
    }

    if (active) setActive(active.link.getAttribute('href'));
    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  links.forEach((link) => {
    link.addEventListener('click', () => setActive(link.getAttribute('href')));
  });

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('pageshow', update);
  window.addEventListener('hashchange', update);
  reducedMotion.addEventListener?.('change', update);
  update();
})();
