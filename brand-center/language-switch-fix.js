(() => {
  const downloadLinks = [...document.querySelectorAll('.compact-downloads a[href]')];
  if (!downloadLinks.length) return;

  const fallbackMetadata = {
    'Etalon_Logos_All_Formats.zip': 'ZIP · SVG, PNG, EPS, PDF · 377 КБ',
    'Etalon_Symbol_All_Formats.zip': 'ZIP · SVG, PNG, EPS, PDF · 23 КБ',
    'Etalon_Map_All_Formats.zip': 'ZIP · SVG, PNG, EPS, PDF · 205 КБ',
    'Etalon_Colors_All_Formats.zip': 'ZIP · SVG, PNG, PDF, ASE, CSS',
    'Etalon_Brand_Kit.zip': 'ZIP · всё сразу',
    'Gilroy.zip': 'ZIP · TTF · 71 КБ',
  };

  function getFilename(link) {
    try {
      return new URL(link.href, window.location.href).pathname.split('/').pop() || '';
    } catch {
      return '';
    }
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '';
    const megabyte = 1024 * 1024;
    if (bytes >= megabyte) {
      const value = bytes / megabyte;
      return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value)} МБ`;
    }
    const value = Math.max(1, Math.round(bytes / 1024));
    return `${new Intl.NumberFormat('ru-RU').format(value)} КБ`;
  }

  const metadataNodes = new Map();

  downloadLinks.forEach((link) => {
    const label = link.querySelector(':scope > span');
    if (!label) return;

    const filename = getFilename(link);
    const title = label.textContent.trim();
    const titleNode = document.createElement('span');
    const metaNode = document.createElement('small');

    titleNode.className = 'download-name';
    titleNode.textContent = title;
    metaNode.className = 'download-meta';
    metaNode.textContent = fallbackMetadata[filename] || '';

    label.className = 'download-label';
    label.replaceChildren(titleNode, metaNode);
    metadataNodes.set(filename, metaNode);
  });

  // Единственная загрузка манифеста на страницу: footer-changelog.js берет
  // дату сборки из этого же промиса, а не делает второй запрос.
  window.etalonDownloadManifest = fetch('./downloads/downloads-manifest.json', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`Download manifest returned ${response.status}`);
      return response.json();
    });

  window.etalonDownloadManifest
    .then((manifest) => {
      metadataNodes.forEach((node, filename) => {
        const item = manifest?.[filename];
        if (!item) return;
        const size = formatBytes(Number(item.bytes));
        node.textContent = [item.format, size].filter(Boolean).join(' · ');
      });
    })
    .catch(() => {
      // The static fallback remains visible if metadata cannot be loaded.
    });
})();
