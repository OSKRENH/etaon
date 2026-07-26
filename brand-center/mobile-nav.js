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

  function keepLinkVisible(link) {
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const edgePadding = 16;
    const isOutside =
      linkRect.left < navRect.left + edgePadding ||
      linkRect.right > navRect.right - edgePadding;

    if (!isOutside) return;

    const maxScroll = Math.max(0, nav.scrollWidth - nav.clientWidth);
    const centeredLeft = link.offsetLeft + link.offsetWidth / 2 - nav.clientWidth / 2;
    const nextLeft = Math.min(maxScroll, Math.max(0, centeredLeft));

    nav.scrollTo({
      left: nextLeft,
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
  }

  function setActive(href, reveal = true) {
    if (href === activeHref) return;
    activeHref = href;

    let activeLink = null;
    links.forEach((link) => {
      const active = link.getAttribute('href') === href;
      link.classList.toggle('is-active', active);
      if (active) {
        link.setAttribute('aria-current', 'location');
        activeLink = link;
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (reveal && activeLink) keepLinkVisible(activeLink);
  }

  function update() {
    const navBottom = nav.getBoundingClientRect().bottom;
    const activationLine = Math.max(navBottom + 24, window.innerHeight * 0.52);
    let active = targets[0];

    targets.forEach((item) => {
      if (item.section.getBoundingClientRect().top <= activationLine) active = item;
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
    link.addEventListener('click', () => {
      setActive(link.getAttribute('href'));
    });
  });

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('pageshow', update);
  window.addEventListener('hashchange', update);
  reducedMotion.addEventListener?.('change', requestUpdate);
  update();
})();
