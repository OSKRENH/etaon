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
