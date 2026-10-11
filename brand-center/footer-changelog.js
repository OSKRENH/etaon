const footerChangelog = document.querySelector('.footer-changelog');

if (footerChangelog) {
  const panel = footerChangelog.querySelector('.footer-changelog-body');
  const summary = footerChangelog.querySelector('summary');

  /* <details> прячет содержимое в момент снятия [open], поэтому выход панели
     не успевает проиграться. Здесь анимация выхода идет первой, а [open]
     снимается по ее окончанию. Все способы закрытия проходят через эту функцию. */
  function closeChangelog() {
    if (!footerChangelog.open || footerChangelog.classList.contains('is-closing')) return;

    if (!panel || getComputedStyle(panel).animationName === 'none') {
      footerChangelog.open = false;
      return;
    }

    footerChangelog.classList.add('is-closing');
    const finish = () => {
      if (!footerChangelog.classList.contains('is-closing')) return;
      footerChangelog.open = false;
      footerChangelog.classList.remove('is-closing');
    };
    panel.addEventListener('animationend', finish, { once: true });
    window.setTimeout(finish, 400); // страховка, если animationend не придет
  }

  summary?.addEventListener('click', (event) => {
    if (!footerChangelog.open) return; // открытие остается штатным
    event.preventDefault();
    closeChangelog();
  });

  document.addEventListener('click', (event) => {
    if (!footerChangelog.open || footerChangelog.contains(event.target)) return;
    closeChangelog();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !footerChangelog.open) return;
    closeChangelog();
    summary?.focus();
  });
}

/* Дата «Обновлено» берется из даты сборки в манифесте загрузок, поэтому она не
   устаревает молча. Значение в разметке — запасной вариант, если манифест
   недоступен. */
const releaseDate = document.querySelector('[data-release-date]');

if (releaseDate) {
  const manifest = window.etalonDownloadManifest
    || fetch('./downloads/downloads-manifest.json', { cache: 'no-store' }).then((r) => {
      if (!r.ok) throw new Error(`Download manifest returned ${r.status}`);
      return r.json();
    });

  manifest
    .then((data) => {
      const builtAt = data?._builtAt;
      if (!builtAt) return;
      const parsed = new Date(`${builtAt}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime())) return;

      releaseDate.textContent = new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      })
        .format(parsed)
        .replace(/\s*г\.$/, '');
      releaseDate.setAttribute('datetime', builtAt);
    })
    .catch(() => {
      // Остается значение из разметки.
    });
}
