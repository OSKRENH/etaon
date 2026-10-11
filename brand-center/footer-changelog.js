const footerChangelog = document.querySelector('.footer-changelog');

if (footerChangelog) {
  document.addEventListener('click', (event) => {
    if (!footerChangelog.open || footerChangelog.contains(event.target)) return;
    footerChangelog.open = false;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !footerChangelog.open) return;
    footerChangelog.open = false;
    footerChangelog.querySelector('summary')?.focus();
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
