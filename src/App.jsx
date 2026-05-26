import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, FabricImage, Group, Rect, Textbox, loadSVGFromString } from 'fabric';
import './App.css';

const BLEED_SIZE = 560;
const DEFAULT_FONT = 'Segoe UI';
const DEFAULT_OVERLAY_COLOR = '#223e90';
const DEFAULT_OVERLAY_OPACITY = 25;
const DEFAULT_BACKGROUND_COLOR = '#ffffff';
const DEFAULT_LOGO_COLOR = '#ffffff';
const DEFAULT_LOGO_OPACITY = 100;
const DEFAULT_TEXT_COLOR = '#ffffff';
const DEFAULT_TEXT_SIZE = 72;
const DEFAULT_TEXT_LINE_HEIGHT = 1;
const DEFAULT_TEXT_LETTER_SPACING = 0;
const DEFAULT_EDGE_INSET = 100;
const TEXT_TEMPLATE_VALUE = 'Дважды кликните для редактирования';
const DEFAULT_FONT_STYLE = 'Regular';
const MIN_CANVAS_SIZE = 120;
const HISTORY_PROPS = [
  'editorRole',
  'editorId',
  'editorName',
  'editorLogoColor',
  'editorHorizontalAlign',
  'editorVerticalAlign',
  'editorFontStyleLabel',
  'editorIsTemplate',
];
const APP_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120.77 100"><path fill="#1e242e" d="M0,80.6v19.4h81.98l7.53-19.4H0ZM32.67,40.27v19.4h64.86l7.53-19.4H32.67ZM0,0v19.4h113.23L120.77,0H0Z"/></svg>';
const APP_ICON_SRC = `data:image/svg+xml,${encodeURIComponent(APP_ICON_SVG)}`;
const COLOR_PRESETS = ['#223e90', '#9092c8', '#deddf0', '#1e242e', '#000000', '#ffffff'];
const FALLBACK_FONT_STYLES = [
  { label: 'Regular', weight: 400, style: 'normal' },
  { label: 'Medium', weight: 500, style: 'normal' },
  { label: 'Bold', weight: 700, style: 'normal' },
  { label: 'Italic', weight: 400, style: 'italic' },
];

const PRESETS = [
  { id: 'square', label: 'Квадрат', icon: '□', width: 1080, height: 1080 },
  { id: 'stories', label: 'Сторис', icon: '▯', width: 1080, height: 1920 },
  { id: 'screen', label: 'Экран', icon: '▭', width: 1920, height: 1080 },
  { id: 'dzen', label: 'Дзен', icon: '▰', width: 1200, height: 683 },
];

const CUSTOM_PRESET = { id: 'custom', label: 'Другое', icon: '⌘' };
const CANVAS_PRESETS = [...PRESETS, CUSTOM_PRESET];

const RESIZE_FORMATS = [
  { id: 'free', label: 'Свободно', ratio: null },
  { id: '1-1', label: '1:1', ratio: 1 },
  { id: '16-9', label: '16:9', ratio: 16 / 9 },
  { id: '9-16', label: '9:16', ratio: 9 / 16 },
  { id: '3-2', label: '3:2', ratio: 3 / 2 },
  { id: '2-3', label: '2:3', ratio: 2 / 3 },
  { id: '4-3', label: '4:3', ratio: 4 / 3 },
  { id: '3-4', label: '3:4', ratio: 3 / 4 },
  { id: '4-5', label: '4:5', ratio: 4 / 5 },
  { id: 'a4', label: 'A4', ratio: 210 / 297, width: 2480, height: 3508 },
  { id: 'a4-landscape', label: 'A4 альб.', ratio: 297 / 210, width: 3508, height: 2480 },
  { id: 'a5', label: 'A5', ratio: 148 / 210, width: 1748, height: 2480 },
  { id: 'a5-landscape', label: 'A5 альб.', ratio: 210 / 148, width: 2480, height: 1748 },
];

const IMAGE_ALIGNMENTS = [
  ['top', '↑'],
  ['centerY', '↕'],
  ['bottom', '↓'],
  ['left', '←'],
  ['centerX', '↔'],
  ['right', '→'],
];

const GUIDE_STEPS = [
  {
    id: 'upload',
    placement: 'upload',
    title: '1. Изображение',
    text: 'Нажмите на кнопку на холсте, перетащите файл или вставьте картинку из буфера.',
  },
  {
    id: 'objects',
    placement: 'objects',
    title: '2. Текст',
    text: 'Откройте “Объекты”, добавьте текст и меняйте шрифт, размер, цвет, интерлиньяж, межбуквенное расстояние и позицию.',
  },
  {
    id: 'overlay',
    placement: 'overlay',
    title: '3. Оверлей',
    text: 'Включите оверлей, затем настройте цвет и прозрачность поверх изображения.',
  },
  {
    id: 'logo',
    placement: 'logo',
    title: '4. Логотип',
    text: 'Добавьте логотип через “Объекты”, затем настройте цвет, прозрачность и угол размещения.',
  },
];

const WORKFLOW_STEPS = [
  {
    id: 'image',
    number: '01',
    label: 'Изображение',
    icon: '▧',
    title: 'Загрузите основу',
    text: 'Выберите формат, размер и подгоните изображение под макет.',
  },
  {
    id: 'text',
    number: '02',
    label: 'Текст',
    icon: 'T',
    title: 'Добавьте сообщение',
    text: 'Отредактируйте шаблон или оставьте макет без текста.',
  },
  {
    id: 'logo',
    number: '03',
    label: 'Логотип',
    icon: 'E',
    title: 'Поставьте знак',
    text: 'Выберите угол, цвет и прозрачность логотипа.',
  },
  {
    id: 'export',
    number: '04',
    label: 'Экспорт',
    icon: '↓',
    title: 'Сохраните результат',
    text: 'Проверьте макет и скачайте файл в нужном формате.',
  },
];

const TEXT_POSITIONS = [
  { horizontal: 'left', vertical: 'top', label: '↖' },
  { horizontal: 'center', vertical: 'top', label: '↑' },
  { horizontal: 'right', vertical: 'top', label: '↗' },
  { horizontal: 'left', vertical: 'middle', label: '←' },
  { horizontal: 'center', vertical: 'middle', label: '•' },
  { horizontal: 'right', vertical: 'middle', label: '→' },
  { horizontal: 'left', vertical: 'bottom', label: '↙' },
  { horizontal: 'center', vertical: 'bottom', label: '↓' },
  { horizontal: 'right', vertical: 'bottom', label: '↘' },
];

const LOGO_CORNERS = [
  { horizontal: 'left', vertical: 'top', label: '↖' },
  { horizontal: 'right', vertical: 'top', label: '↗' },
  { horizontal: 'left', vertical: 'bottom', label: '↙' },
  { horizontal: 'right', vertical: 'bottom', label: '↘' },
];

const ETALON_LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 677.6 255.1">
  <path fill="#233c91" d="M261.7,84.2l-33.6,86.6h17.9l6.6-17h23.6l6.5-16.8h-23.6l11.9-30.6,25,64.4h17.9l-33.6-86.6s-18.6,0-18.6,0ZM228.1,84.3h-60.6v16.7h22v69.9h16.7v-69.9h21.9v-16.7h0ZM115.9,84.3c-12.1,0-23,4.9-30.8,12.9l11.8,11.8c4.8-4.9,11.5-8,19-8,14.6,0,26.5,11.9,26.5,26.5s-11.9,26.5-26.5,26.5-14.2-3.1-19-8l-11.9,11.9c7.8,8,18.8,12.9,30.8,12.9,23.9,0,43.3-19.4,43.3-43.2s-19.4-43.3-43.2-43.3M140,119.2h-35l.2,16.8h28.3l6.5-16.8ZM533.1,84.2h-16.9v86.6h16.9v-34.8h35.7l6.5-16.8h-42.2v-35ZM575.6,84.2v86.6h16.9v-86.6s-16.9,0-16.9,0ZM456.2,84.2c-23.9,0-43.2,19.4-43.2,43.2s19.4,43.2,43.2,43.2,43.2-19.4,43.2-43.2c0-23.9-19.3-43.2-43.2-43.2M456.2,153.9c-14.6,0-26.5-11.9-26.5-26.5s11.9-26.5,26.5-26.5,26.5,11.9,26.5,26.5-11.9,26.5-26.5,26.5M355.8,84.2l-33.6,86.6h17.8l25-64.4,25,64.4h17.9l-33.6-86.6s-18.5,0-18.5,0Z"/>
</svg>`;

const FALLBACK_FONTS = [
  'Gilroy',
  'Arial',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Times New Roman',
  'Georgia',
  'Garamond',
  'Courier New',
  'Lucida Console',
  'Impact',
  'Comic Sans MS',
  'Segoe UI',
];

function getPresetById(id) {
  return PRESETS.find((preset) => preset.id === id) || PRESETS[0];
}

function clampCanvasDimension(value) {
  const numericValue = Math.round(Number(value));

  if (!Number.isFinite(numericValue)) {
    return MIN_CANVAS_SIZE;
  }

  return Math.max(MIN_CANVAS_SIZE, numericValue);
}

function clampPercent(value) {
  const numericValue = Math.round(Number(value));

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(100, Math.max(0, numericValue));
}

function getWorkspaceSize(size) {
  return {
    width: size.width + BLEED_SIZE * 2,
    height: size.height + BLEED_SIZE * 2,
  };
}

function getArtboardCenter(size) {
  return {
    x: BLEED_SIZE + size.width / 2,
    y: BLEED_SIZE + size.height / 2,
  };
}

function getSafeInset(size, inset) {
  const numericInset = Number(inset);
  const maxInset = Math.max(0, Math.floor(Math.min(size.width, size.height) / 2) - 1);

  if (!Number.isFinite(numericInset)) {
    return 0;
  }

  return Math.min(Math.max(0, numericInset), maxInset);
}

function getDefaultSafeInset(size) {
  const squarePreset = PRESETS[0];
  const baseRatio = DEFAULT_EDGE_INSET / Math.min(squarePreset.width, squarePreset.height);
  return getSafeInset(size, Math.round(Math.min(size.width, size.height) * baseRatio));
}

function getSafeArea(size, inset) {
  const safeInset = getSafeInset(size, inset);

  return {
    left: BLEED_SIZE + safeInset,
    top: BLEED_SIZE + safeInset,
    width: Math.max(1, size.width - safeInset * 2),
    height: Math.max(1, size.height - safeInset * 2),
  };
}

function getFontStyleValue(styleOption) {
  return `${styleOption.weight}:${styleOption.style}:${styleOption.label}`;
}

function parseFontStyleValue(value) {
  const [weight, style, ...labelParts] = String(value).split(':');

  return {
    label: labelParts.join(':') || DEFAULT_FONT_STYLE,
    weight: Number(weight) || 400,
    style: style || 'normal',
  };
}

function getFontWeightFromStyle(styleName) {
  const normalized = styleName.toLowerCase();

  if (normalized.includes('thin')) return 100;
  if (normalized.includes('extra light') || normalized.includes('ultra light')) return 200;
  if (normalized.includes('light')) return 300;
  if (normalized.includes('medium')) return 500;
  if (normalized.includes('semi bold') || normalized.includes('demi bold')) return 600;
  if (normalized.includes('bold')) return 700;
  if (normalized.includes('extra bold') || normalized.includes('ultra bold')) return 800;
  if (normalized.includes('black') || normalized.includes('heavy')) return 900;

  return 400;
}

function getFontStyleFromName(styleName) {
  const normalized = styleName.toLowerCase();
  return normalized.includes('italic') || normalized.includes('oblique') ? 'italic' : 'normal';
}

function getFabricCharSpacing(letterSpacingPx, fontSize) {
  const spacing = Number(letterSpacingPx);
  const size = Number(fontSize) || DEFAULT_TEXT_SIZE;

  if (!Number.isFinite(spacing)) {
    return 0;
  }

  return Math.round((spacing / size) * 1000);
}

function getPreferredFontStyle(styles, preferred = 'Regular') {
  return (
    styles.find((style) => style.label.toLowerCase() === preferred.toLowerCase()) ||
    styles.find((style) => style.label.toLowerCase().includes(preferred.toLowerCase())) ||
    styles.find((style) => style.weight === 500) ||
    styles[0] ||
    FALLBACK_FONT_STYLES[0]
  );
}

function isImageObject(object) {
  return object?.editorRole === 'image' || object?.editorRole === 'logo';
}

function isPhotoObject(object) {
  return object?.editorRole === 'image';
}

function isTextObject(object) {
  return object?.editorRole === 'text';
}

function isTemplateTextObject(object) {
  return isTextObject(object) && object.editorIsTemplate === true;
}

function isLayerObject(object) {
  return ['image', 'logo', 'text'].includes(object?.editorRole);
}

function fitObjectToCanvas(object, size, maxFill = 0.9) {
  const center = getArtboardCenter(size);
  const scale = Math.min(
    (size.width * maxFill) / (object.width || 1),
    (size.height * maxFill) / (object.height || 1),
  );

  object.set({
    originX: 'center',
    originY: 'center',
    left: center.x,
    top: center.y,
    scaleX: scale,
    scaleY: scale,
  });
}

function positionObjectInSafeArea(object, size, edgeInset, horizontalAlign, verticalAlign) {
  const safeArea = getSafeArea(size, edgeInset);
  const originY = getVerticalOrigin(verticalAlign);
  const left = {
    left: safeArea.left + object.getScaledWidth() / 2,
    center: safeArea.left + safeArea.width / 2,
    right: safeArea.left + safeArea.width - object.getScaledWidth() / 2,
  }[horizontalAlign];
  const top = {
    top: safeArea.top + object.getScaledHeight() / 2,
    center: safeArea.top + safeArea.height / 2,
    bottom: safeArea.top + safeArea.height - object.getScaledHeight() / 2,
  }[originY];

  object.set({
    originX: 'center',
    originY: 'center',
    left,
    top,
  });
  object.editorHorizontalAlign = horizontalAlign;
  object.editorVerticalAlign = verticalAlign;
  object.setCoords();
}

function getVerticalOrigin(verticalAlign) {
  return verticalAlign === 'middle' ? 'center' : verticalAlign;
}

function positionTextInSafeArea(text, size, edgeInset, horizontalAlign, verticalAlign) {
  const safeArea = getSafeArea(size, edgeInset);
  const originY = getVerticalOrigin(verticalAlign);
  const left = {
    left: safeArea.left,
    center: safeArea.left + safeArea.width / 2,
    right: safeArea.left + safeArea.width,
  }[horizontalAlign];
  const top = {
    top: safeArea.top,
    center: safeArea.top + safeArea.height / 2,
    bottom: safeArea.top + safeArea.height,
  }[originY];

  text.set({
    width: safeArea.width,
    originX: horizontalAlign,
    originY,
    left,
    top,
    textAlign: horizontalAlign,
  });
  text.editorVerticalAlign = verticalAlign;
  text.setCoords();
}

function applyTextStyleToObject(text, styles) {
  const hasRange =
    text.isEditing &&
    Number.isFinite(text.selectionStart) &&
    Number.isFinite(text.selectionEnd) &&
    text.selectionStart !== text.selectionEnd;

  if (hasRange && typeof text.setSelectionStyles === 'function') {
    text.setSelectionStyles(styles, text.selectionStart, text.selectionEnd);
  } else {
    text.set(styles);
  }

  text.dirty = true;
  text.setCoords();
}

function getImageCoverScale(object, size) {
  return Math.max(
    size.width / (object.width || 1),
    size.height / (object.height || 1),
  );
}

function coverImageToFrame(object, size) {
  if (!isPhotoObject(object)) return;

  const scale = getImageCoverScale(object, size);
  object.set({
    originX: 'center',
    originY: 'center',
    scaleX: scale,
    scaleY: scale,
    left: BLEED_SIZE + size.width / 2,
    top: BLEED_SIZE + size.height / 2,
  });
  setImageClip(object, size);
  constrainImageToFrame(object, size);
  object.setCoords();
}

function keepImageProportional(object) {
  if (!isPhotoObject(object)) return;

  const scale = Math.max(Number(object.scaleX) || 1, Number(object.scaleY) || 1);
  object.set({
    scaleX: scale,
    scaleY: scale,
    skewX: 0,
    skewY: 0,
  });
}

function alignActiveImageToEdge(object, size, edge) {
  if (!isPhotoObject(object)) return;

  const scaledWidth = object.getScaledWidth();
  const scaledHeight = object.getScaledHeight();
  const center = getArtboardCenter(size);
  const updates = {
    top: { top: BLEED_SIZE + scaledHeight / 2 },
    centerY: { top: center.y },
    bottom: { top: BLEED_SIZE + size.height - scaledHeight / 2 },
    left: { left: BLEED_SIZE + scaledWidth / 2 },
    centerX: { left: center.x },
    right: { left: BLEED_SIZE + size.width - scaledWidth / 2 },
  }[edge];

  object.set(updates);
  constrainImageToFrame(object, size);
  object.setCoords();
}

function setImageClip(object, size) {
  if (!isPhotoObject(object)) return;

  object.clipPath = new Rect({
    originX: 'left',
    originY: 'top',
    left: BLEED_SIZE,
    top: BLEED_SIZE,
    width: size.width,
    height: size.height,
    absolutePositioned: true,
  });
  object.dirty = true;
}

function constrainImageToFrame(object, size) {
  if (!isPhotoObject(object)) return;

  object.setCoords();

  const coverScale = getImageCoverScale(object, size);
  if (object.getScaledWidth() < size.width || object.getScaledHeight() < size.height) {
    object.set({
      scaleX: coverScale,
      scaleY: coverScale,
    });
    object.setCoords();
  }

  const frame = {
    left: BLEED_SIZE,
    top: BLEED_SIZE,
    right: BLEED_SIZE + size.width,
    bottom: BLEED_SIZE + size.height,
  };
  const bounds = object.getBoundingRect();
  let nextLeft = object.left || 0;
  let nextTop = object.top || 0;

  if (bounds.width <= size.width) {
    if (bounds.left < frame.left) nextLeft += frame.left - bounds.left;
    if (bounds.left + bounds.width > frame.right) {
      nextLeft += frame.right - (bounds.left + bounds.width);
    }
  } else {
    if (bounds.left > frame.left) nextLeft += frame.left - bounds.left;
    if (bounds.left + bounds.width < frame.right) {
      nextLeft += frame.right - (bounds.left + bounds.width);
    }
  }

  if (bounds.height <= size.height) {
    if (bounds.top < frame.top) nextTop += frame.top - bounds.top;
    if (bounds.top + bounds.height > frame.bottom) {
      nextTop += frame.bottom - (bounds.top + bounds.height);
    }
  } else {
    if (bounds.top > frame.top) nextTop += frame.top - bounds.top;
    if (bounds.top + bounds.height < frame.bottom) {
      nextTop += frame.bottom - (bounds.top + bounds.height);
    }
  }

  object.set({ left: nextLeft, top: nextTop });
  object.setCoords();
}

function constrainObjectToFrame(object, size) {
  if (!object || object.editorRole === 'background' || object.editorRole === 'overlay') return;

  if (isPhotoObject(object)) {
    constrainImageToFrame(object, size);
    return;
  }

  object.setCoords();

  const frame = {
    left: BLEED_SIZE,
    top: BLEED_SIZE,
    right: BLEED_SIZE + size.width,
    bottom: BLEED_SIZE + size.height,
  };
  const bounds = object.getBoundingRect();
  let nextLeft = object.left || 0;
  let nextTop = object.top || 0;

  if (bounds.left < frame.left) nextLeft += frame.left - bounds.left;
  if (bounds.top < frame.top) nextTop += frame.top - bounds.top;
  if (bounds.left + bounds.width > frame.right) {
    nextLeft -= bounds.left + bounds.width - frame.right;
  }
  if (bounds.top + bounds.height > frame.bottom) {
    nextTop -= bounds.top + bounds.height - frame.bottom;
  }

  object.set({ left: nextLeft, top: nextTop });
  object.setCoords();
}

function constrainActiveObjectToFrame(object, size) {
  if (!object) return;

  if (typeof object.getObjects === 'function' && !isLayerObject(object)) {
    constrainObjectToFrame(object, size);
    object.setCoords();
    return;
  }

  constrainObjectToFrame(object, size);
}

function styleControls(object) {
  object.set({
    borderColor: 'rgba(34, 62, 144, 0.85)',
    cornerColor: '#223e90',
    cornerStrokeColor: '#ffffff',
    cornerSize: 18,
    transparentCorners: false,
  });
}

function dataUrlToBytes(dataUrl) {
  const [, base64 = ''] = dataUrl.split(',');
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function textToBytes(text) {
  const bytes = new Uint8Array(text.length);

  for (let index = 0; index < text.length; index += 1) {
    bytes[index] = text.charCodeAt(index) & 0xff;
  }

  return bytes;
}

function createPdfFromJpeg(jpegDataUrl, width, height) {
  const imageBytes = dataUrlToBytes(jpegDataUrl);
  const pageWidth = Math.max(1, Math.round(width));
  const pageHeight = Math.max(1, Math.round(height));
  const content = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;
  const chunks = [];
  const offsets = [];
  let length = 0;

  const addText = (text) => {
    const bytes = textToBytes(text);
    chunks.push(bytes);
    length += bytes.length;
  };

  const addBytes = (bytes) => {
    chunks.push(bytes);
    length += bytes.length;
  };

  const startObject = (id) => {
    offsets[id] = length;
    addText(`${id} 0 obj\n`);
  };

  addText('%PDF-1.4\n');

  startObject(1);
  addText('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  startObject(2);
  addText('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  startObject(3);
  addText(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`,
  );

  startObject(4);
  addText(
    `<< /Type /XObject /Subtype /Image /Width ${pageWidth} /Height ${pageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`,
  );
  addBytes(imageBytes);
  addText('\nendstream\nendobj\n');

  startObject(5);
  addText(`<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);

  const xrefOffset = length;
  addText('xref\n0 6\n');
  addText('0000000000 65535 f \n');

  for (let id = 1; id <= 5; id += 1) {
    addText(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
  }

  addText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return new Blob(chunks, { type: 'application/pdf' });
}

function setLogoColor(object, color) {
  if (!object) return;

  if ('fill' in object) {
    object.set({ fill: color });
  }

  if (typeof object.getObjects === 'function') {
    object.getObjects().forEach((child) => setLogoColor(child, color));
  }

  object.editorLogoColor = color;
  object.dirty = true;
}

function getLayerLabel(object) {
  if (object.editorRole === 'image') {
    return object.editorName || 'Изображение';
  }

  if (object.editorRole === 'logo') {
    return object.editorName || 'Логотип Эталон';
  }

  if (object.editorRole === 'text') {
    const text = object.text?.trim();
    return text ? `Текст: ${text.slice(0, 18)}` : 'Текст';
  }

  return 'Слой';
}

function getCornerKey(horizontalAlign, verticalAlign) {
  return `${horizontalAlign}-${verticalAlign}`;
}

function getBlockedLogoCornerKeys(canvas) {
  if (!canvas) return new Set();

  return new Set(
    canvas
      .getObjects()
      .filter(isTextObject)
      .map((object) =>
        getCornerKey(object.textAlign || 'left', object.editorVerticalAlign || 'top'),
      )
      .filter((key) =>
        LOGO_CORNERS.some((corner) => getCornerKey(corner.horizontal, corner.vertical) === key),
      ),
  );
}

function getAvailableLogoCorner(canvas, preferredHorizontal, preferredVertical) {
  const blockedCorners = getBlockedLogoCornerKeys(canvas);
  const preferred = LOGO_CORNERS.find(
    (corner) =>
      corner.horizontal === preferredHorizontal &&
      corner.vertical === preferredVertical &&
      !blockedCorners.has(getCornerKey(corner.horizontal, corner.vertical)),
  );

  return (
    preferred ||
    LOGO_CORNERS.find(
      (corner) => !blockedCorners.has(getCornerKey(corner.horizontal, corner.vertical)),
    ) ||
    LOGO_CORNERS[0]
  );
}

function lockLogoObject(logo) {
  logo.set({
    hasControls: false,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
  });
}

function getImageFileFromList(files) {
  return Array.from(files || []).find((file) => file?.type?.startsWith('image/')) || null;
}

function getImageFileFromItems(items) {
  return (
    Array.from(items || [])
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .find((file) => file?.type?.startsWith('image/')) || null
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function ColorPalette({ value, onChange, disabled = false, visible = true }) {
  if (!visible) return null;

  return (
    <div className="colorPalette">
      {COLOR_PRESETS.map((color) => (
        <button
          key={color}
          type="button"
          className={value.toLowerCase() === color ? 'active' : ''}
          disabled={disabled}
          style={{ '--swatch-color': color }}
          aria-label={`Выбрать цвет ${color}`}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  );
}

function syncCanvasLayers(canvas, overlay, background) {
  if (!canvas || !overlay) return;

  const backgroundObject =
    background || canvas.getObjects().find((object) => object.editorRole === 'background');

  if (backgroundObject && !canvas.getObjects().includes(backgroundObject)) {
    canvas.add(backgroundObject);
  }

  if (!canvas.getObjects().includes(overlay)) {
    canvas.add(overlay);
  }

  const cropGuide = canvas.getObjects().find((object) => object.editorRole === 'cropGuide');
  const images = canvas.getObjects().filter((object) => object.editorRole === 'image');
  const foreground = canvas
    .getObjects()
    .filter((object) => object.editorRole === 'logo' || object.editorRole === 'text');

  let layerIndex = 0;

  if (backgroundObject) {
    canvas.moveObjectTo(backgroundObject, layerIndex);
    layerIndex += 1;
  }

  images.forEach((object) => {
    canvas.moveObjectTo(object, layerIndex);
    layerIndex += 1;
  });

  canvas.moveObjectTo(overlay, layerIndex);
  layerIndex += 1;

  foreground.forEach((object) => {
    canvas.moveObjectTo(object, layerIndex);
    layerIndex += 1;
  });

  if (cropGuide) {
    canvas.bringObjectToFront(cropGuide);
  }

}

function App() {
  const canvasElementRef = useRef(null);
  const canvasRef = useRef(null);
  const backgroundRef = useRef(null);
  const overlayRef = useRef(null);
  const cropGuideRef = useRef(null);
  const canvasSizeRef = useRef(PRESETS[0]);
  const edgeInsetRef = useRef(getDefaultSafeInset(PRESETS[0]));
  const objectIdRef = useRef(1);
  const imageInputRef = useRef(null);
  const aiPromptInputRef = useRef(null);
  const resizeDragRef = useRef(null);
  const imageMoveStartRef = useRef(null);
  const addImageFromFileRef = useRef(null);
  const historyRef = useRef([]);
  const isRestoringHistoryRef = useRef(false);
  const textHistoryTimerRef = useRef(null);
  const guideStartedRef = useRef(false);
  const pushHistorySnapshotRef = useRef(null);
  const undoLastActionRef = useRef(null);

  const [activePresetId, setActivePresetId] = useState(PRESETS[0].id);
  const [canvasSize, setCanvasSize] = useState(PRESETS[0]);
  const [customWidth, setCustomWidth] = useState(PRESETS[0].width);
  const [customHeight, setCustomHeight] = useState(PRESETS[0].height);
  const [edgeInset, setEdgeInset] = useState(getDefaultSafeInset(PRESETS[0]));
  const [showFontPrompt, setShowFontPrompt] = useState(true);
  const [viewportSize, setViewportSize] = useState(() => ({
    width: typeof window === 'undefined' ? 1440 : window.innerWidth,
    height: typeof window === 'undefined' ? 900 : window.innerHeight,
  }));
  const [overlayEnabled, setOverlayEnabled] = useState(false);
  const [overlayColor, setOverlayColor] = useState(DEFAULT_OVERLAY_COLOR);
  const [overlayOpacity, setOverlayOpacity] = useState(DEFAULT_OVERLAY_OPACITY);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND_COLOR);
  const [logoColor, setLogoColorState] = useState(DEFAULT_LOGO_COLOR);
  const [logoOpacity, setLogoOpacity] = useState(DEFAULT_LOGO_OPACITY);
  const [logoAlign, setLogoAlign] = useState('right');
  const [logoVerticalAlign, setLogoVerticalAlign] = useState('bottom');
  const [fontOptions, setFontOptions] = useState(FALLBACK_FONTS);
  const [fontStyleOptions, setFontStyleOptions] = useState({
    [DEFAULT_FONT]: FALLBACK_FONT_STYLES,
  });
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [selectedFont, setSelectedFont] = useState(DEFAULT_FONT);
  const [selectedFontStyle, setSelectedFontStyle] = useState(
    getFontStyleValue(getPreferredFontStyle(FALLBACK_FONT_STYLES)),
  );
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);
  const [textSize, setTextSize] = useState(DEFAULT_TEXT_SIZE);
  const [textAlign, setTextAlign] = useState('left');
  const [textVerticalAlign, setTextVerticalAlign] = useState('top');
  const [fontStatus, setFontStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState('none');
  const [layers, setLayers] = useState([]);
  const [blockedLogoCorners, setBlockedLogoCorners] = useState([]);
  const [floatingMenu, setFloatingMenu] = useState({ visible: false, x: 0, y: 0, role: null });
  const [workspaceZoom, setWorkspaceZoom] = useState(1);
  const [exportFormat, setExportFormat] = useState('png');
  const [exportScale, setExportScale] = useState(1);
  const [activeColorPalette, setActiveColorPalette] = useState(null);
  const [isImageDragOver, setIsImageDragOver] = useState(false);
  const [showResizeFormats, setShowResizeFormats] = useState(false);
  const [resizeFormatId, setResizeFormatId] = useState('free');
  const [showGuide, setShowGuide] = useState(false);
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(WORKFLOW_STEPS[0].id);
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiGenerationError, setAiGenerationError] = useState('');

  const hasTextSelection = selectedRole === 'text';
  const hasLogoSelection = selectedRole === 'logo';
  const hasLogoLayer = layers.some((layer) => layer.role === 'logo');
  const hasImageLayer = layers.some((layer) => layer.role === 'image');
  const hasCanvasObjects = layers.length > 0;
  const activeResizeFormat =
    RESIZE_FORMATS.find((format) => format.id === resizeFormatId) || RESIZE_FORMATS[0];
  const activeGuideStep = GUIDE_STEPS[guideStepIndex] || GUIDE_STEPS[0];
  const currentStepIndex = Math.max(
    0,
    WORKFLOW_STEPS.findIndex((step) => step.id === currentStep),
  );
  const activeWorkflowStep = WORKFLOW_STEPS[currentStepIndex] || WORKFLOW_STEPS[0];
  const canGoNext = currentStep !== 'image' || hasImageLayer;
  const showFloatingMenu = false;
  const showCustomSizeControls = activePresetId === CUSTOM_PRESET.id;
  const workspaceSize = getWorkspaceSize(canvasSize);
  const sidebarWidth = viewportSize.width <= 900 ? 0 : 300;
  const isStackedLayout = viewportSize.width <= 900;
  const availableWorkspaceWidth = Math.max(
    260,
    viewportSize.width - sidebarWidth - (isStackedLayout ? 32 : 64),
  );
  const availableWorkspaceHeight = Math.max(
    260,
    viewportSize.height - (isStackedLayout ? 360 : 64),
  );
  const basePreviewScale = Math.min(
    availableWorkspaceWidth / canvasSize.width,
    availableWorkspaceHeight / canvasSize.height,
    1,
  );
  const previewScale = basePreviewScale * workspaceZoom;
  const frameWidth = Math.floor(canvasSize.width * previewScale);
  const frameHeight = Math.floor(canvasSize.height * previewScale);
  const workspaceDisplayWidth = Math.floor(workspaceSize.width * previewScale);
  const workspaceDisplayHeight = Math.floor(workspaceSize.height * previewScale);
  const canvasOffset = -Math.floor(BLEED_SIZE * previewScale);
  const safeInsetDisplay = Math.round(getSafeInset(canvasSize, edgeInset) * previewScale);
  const selectedFontStyles = fontStyleOptions[selectedFont] || FALLBACK_FONT_STYLES;

  function registerLayerObject(object, role, name) {
    object.editorRole = role;
    object.editorId = object.editorId || `layer-${objectIdRef.current}`;
    object.editorName = name || object.editorName || getLayerLabel(object);
    objectIdRef.current += 1;
  }

  const refreshLayers = useCallback((canvas = canvasRef.current) => {
    if (!canvas) {
      setLayers([]);
      setBlockedLogoCorners([]);
      return;
    }

    const activeId = canvas.getActiveObject()?.editorId || null;
    const nextLayers = canvas
      .getObjects()
      .filter(isLayerObject)
      .slice()
      .reverse()
      .map((object) => ({
        id: object.editorId,
        role: object.editorRole,
        label: getLayerLabel(object),
        visible: object.visible !== false,
        selected: object.editorId === activeId,
      }));

    setLayers(nextLayers);
    setBlockedLogoCorners([...getBlockedLogoCornerKeys(canvas)]);
  }, []);

  function updateFloatingMenu(canvas = canvasRef.current) {
    const activeObject = canvas?.getActiveObject();

    if (!canvas || !isLayerObject(activeObject)) {
      setFloatingMenu((current) => ({ ...current, visible: false }));
      return;
    }

    const wrapperRect = canvas.wrapperEl?.getBoundingClientRect();
    if (!wrapperRect) return;

    const scale = wrapperRect.width / canvas.getWidth();
    const bounds = activeObject.getBoundingRect();

    setFloatingMenu({
      visible: true,
      role: activeObject.editorRole,
      x: Math.round(wrapperRect.left + (bounds.left + bounds.width) * scale + 10),
      y: Math.round(wrapperRect.top + bounds.top * scale),
    });
  }

  function syncSelectionPanel(canvas = canvasRef.current) {
    const activeObject = canvas?.getActiveObject();

    if (isImageObject(activeObject)) {
      setSelectedRole(activeObject.editorRole);

      if (activeObject.editorRole === 'logo') {
        setLogoOpacity(Math.round((activeObject.opacity ?? 1) * 100));
        setLogoColorState(activeObject.editorLogoColor || logoColor);
        setLogoAlign(activeObject.editorHorizontalAlign || 'right');
        setLogoVerticalAlign(activeObject.editorVerticalAlign || 'bottom');
      }

      updateFloatingMenu(canvas);
      return;
    }

    if (isTextObject(activeObject)) {
      setSelectedRole('text');
      setSelectedFont(activeObject.fontFamily || DEFAULT_FONT);
      setTextColor(activeObject.fill || DEFAULT_TEXT_COLOR);
      setTextSize(Math.round(activeObject.fontSize || DEFAULT_TEXT_SIZE));
      setTextAlign(activeObject.textAlign || 'left');
      setTextVerticalAlign(activeObject.editorVerticalAlign || 'top');
      setSelectedFontStyle(
        getFontStyleValue({
          label: activeObject.editorFontStyleLabel || DEFAULT_FONT_STYLE,
          weight: activeObject.fontWeight || 400,
          style: activeObject.fontStyle || 'normal',
        }),
      );
      updateFloatingMenu(canvas);
      return;
    }

    setSelectedRole('none');
    refreshLayers(canvas);
    updateFloatingMenu(canvas);
  }

  function openColorPalette(paletteId, disabled = false) {
    if (!disabled) {
      setActiveColorPalette(paletteId);
    }
  }

  function removeUnusedTemplateText(canvas = canvasRef.current) {
    if (!canvas) return;

    const templateText = canvas.getObjects().find(isTemplateTextObject);
    if (!templateText) return;

    canvas.remove(templateText);
    canvas.discardActiveObject();
    syncCanvasLayers(canvas, overlayRef.current, backgroundRef.current);
    syncSelectionPanel(canvas);
    refreshLayers(canvas);
    canvas.requestRenderAll();
  }

  function getHistorySnapshot(canvas = canvasRef.current) {
    if (!canvas) return null;

    const size = canvasSizeRef.current;

    return {
      canvas: canvas.toJSON(HISTORY_PROPS),
      size: { ...size },
      activePresetId: size.id || CUSTOM_PRESET.id,
      edgeInset: edgeInsetRef.current,
      overlayEnabled,
      overlayColor,
      overlayOpacity,
      backgroundColor,
      logoColor,
      logoOpacity,
      logoAlign,
      logoVerticalAlign,
    };
  }

  function pushHistorySnapshot(canvas = canvasRef.current) {
    if (!canvas || isRestoringHistoryRef.current) return;

    const snapshot = getHistorySnapshot(canvas);
    if (!snapshot) return;

    const serialized = JSON.stringify(snapshot);
    const history = historyRef.current;
    const lastSnapshot = history[history.length - 1];

    if (lastSnapshot?.serialized === serialized) return;

    historyRef.current = [...history, { ...snapshot, serialized }].slice(-60);
  }

  function restoreCanvasObjectMetadata(canvas) {
    let maxObjectId = 0;

    canvas.getObjects().forEach((object) => {
      const numericId = Number(String(object.editorId || '').replace('layer-', ''));
      if (Number.isFinite(numericId)) {
        maxObjectId = Math.max(maxObjectId, numericId);
      }

      if (object.editorRole === 'background') {
        object.set({
          selectable: false,
          evented: false,
          hoverCursor: 'default',
          excludeFromExport: false,
        });
        backgroundRef.current = object;
      } else if (object.editorRole === 'overlay') {
        object.set({
          selectable: false,
          evented: false,
          hoverCursor: 'default',
          excludeFromExport: false,
        });
        overlayRef.current = object;
      } else if (object.editorRole === 'cropGuide') {
        object.set({
          fill: 'rgba(255, 255, 255, 0)',
          stroke: '#1e242e',
          strokeWidth: 4,
          selectable: false,
          evented: false,
          hoverCursor: 'default',
          objectCaching: false,
        });
        cropGuideRef.current = object;
      } else if (isPhotoObject(object)) {
        setImageClip(object, canvasSizeRef.current);
        styleControls(object);
        object.set({
          lockRotation: true,
          lockScalingFlip: true,
        });
      } else if (object.editorRole === 'logo') {
        styleControls(object);
        lockLogoObject(object);
      } else if (isTextObject(object)) {
        styleControls(object);
      }

      object.setCoords();
    });

    objectIdRef.current = Math.max(objectIdRef.current, maxObjectId + 1);
  }

  async function undoLastAction() {
    const canvas = canvasRef.current;
    const history = historyRef.current;
    if (!canvas || history.length < 2) return;

    history.pop();
    const snapshot = history[history.length - 1];
    const size = snapshot.size;

    isRestoringHistoryRef.current = true;

    try {
      setActivePresetId(snapshot.activePresetId);
      setCanvasSize(size);
      setCustomWidth(size.width);
      setCustomHeight(size.height);
      setEdgeInset(snapshot.edgeInset);
      edgeInsetRef.current = snapshot.edgeInset;
      setOverlayEnabled(snapshot.overlayEnabled);
      setOverlayColor(snapshot.overlayColor);
      setOverlayOpacity(snapshot.overlayOpacity);
      setBackgroundColor(snapshot.backgroundColor);
      setLogoColorState(snapshot.logoColor);
      setLogoOpacity(snapshot.logoOpacity);
      setLogoAlign(snapshot.logoAlign);
      setLogoVerticalAlign(snapshot.logoVerticalAlign);
      canvasSizeRef.current = size;

      canvas.discardActiveObject();
      canvas.setDimensions(getWorkspaceSize(size));
      await canvas.loadFromJSON(snapshot.canvas);
      restoreCanvasObjectMetadata(canvas);
      syncCanvasLayers(canvas, overlayRef.current, backgroundRef.current);
      setSelectedRole('none');
      refreshLayers(canvas);
      updateFloatingMenu(canvas);
      canvas.calcOffset();
      canvas.requestRenderAll();
    } finally {
      isRestoringHistoryRef.current = false;
    }
  }

  function updateArtboardSize(nextSize, { recordHistory = true } = {}) {
    const canvas = canvasRef.current;
    const background = backgroundRef.current;
    const overlay = overlayRef.current;
    const cropGuide = cropGuideRef.current;
    const normalizedSize = {
      id: nextSize.id || 'custom',
      label: nextSize.label || CUSTOM_PRESET.label,
      width: clampCanvasDimension(nextSize.width),
      height: clampCanvasDimension(nextSize.height),
    };
    const nextEdgeInset = getDefaultSafeInset(normalizedSize);

    setActivePresetId(normalizedSize.id);
    setCanvasSize(normalizedSize);
    setCustomWidth(normalizedSize.width);
    setCustomHeight(normalizedSize.height);
    setEdgeInset(nextEdgeInset);
    edgeInsetRef.current = nextEdgeInset;
    canvasSizeRef.current = normalizedSize;

    if (!canvas || !overlay || !cropGuide) return;

    const workspace = getWorkspaceSize(normalizedSize);
    canvas.setDimensions(workspace);

    [background, overlay, cropGuide].filter(Boolean).forEach((object) => {
      object.set({
        originX: 'left',
        originY: 'top',
        left: BLEED_SIZE,
        top: BLEED_SIZE,
        width: normalizedSize.width,
        height: normalizedSize.height,
        scaleX: 1,
        scaleY: 1,
      });
      object.setCoords();
    });
    canvas
      .getObjects()
      .filter((object) => ['image', 'logo', 'text'].includes(object.editorRole))
      .forEach((object) => {
        if (object.editorRole === 'image') {
          coverImageToFrame(object, normalizedSize);
        } else if (object.editorRole === 'logo') {
          positionObjectInSafeArea(
            object,
            normalizedSize,
            nextEdgeInset,
            object.editorHorizontalAlign || logoAlign,
            object.editorVerticalAlign || logoVerticalAlign,
          );
        } else if (object.editorRole === 'text') {
          positionTextInSafeArea(
            object,
            normalizedSize,
            nextEdgeInset,
            object.textAlign || textAlign,
            object.editorVerticalAlign || textVerticalAlign,
          );
        }
        object.setCoords();
      });

    syncCanvasLayers(canvas, overlay, background);
    syncSelectionPanel(canvas);
    refreshLayers(canvas);
    canvas.calcOffset();
    canvas.requestRenderAll();
    if (recordHistory) {
      pushHistorySnapshot(canvas);
    }
  }

  function activateCustomCanvasSize() {
    setActivePresetId(CUSTOM_PRESET.id);
    setCustomWidth(canvasSizeRef.current.width);
    setCustomHeight(canvasSizeRef.current.height);
  }

  function updateCustomCanvasSize(widthValue, heightValue) {
    setCustomWidth(widthValue);
    setCustomHeight(heightValue);

    const width = Math.round(Number(widthValue));
    const height = Math.round(Number(heightValue));

    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width < MIN_CANVAS_SIZE ||
      height < MIN_CANVAS_SIZE
    ) {
      return;
    }

    updateArtboardSize({
      id: CUSTOM_PRESET.id,
      label: CUSTOM_PRESET.label,
      width,
      height,
    });
  }

  function applyResizeFormat(format) {
    setShowResizeFormats(true);
    setResizeFormatId(format.id);

    if (!format.ratio && !format.width) return;

    if (format.width && format.height) {
      updateArtboardSize({
        id: 'custom',
        label: format.label,
        width: format.width,
        height: format.height,
      });
      return;
    }

    const width = clampCanvasDimension(canvasSizeRef.current.width);
    const height = clampCanvasDimension(width / format.ratio);

    updateArtboardSize({
      id: 'custom',
      label: format.label,
      width,
      height,
    });
  }

  function handleCanvasResizePointerDown(event) {
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();
    setShowResizeFormats(true);

    const dragState = {
      startX: event.clientX,
      startY: event.clientY,
      startWidth: canvasSizeRef.current.width,
      startHeight: canvasSizeRef.current.height,
      scale: previewScale || 1,
      ratio: activeResizeFormat.ratio,
    };

    resizeDragRef.current = dragState;

    const handlePointerMove = (moveEvent) => {
      const currentDrag = resizeDragRef.current;
      if (!currentDrag) return;

      const deltaX = (moveEvent.clientX - currentDrag.startX) / currentDrag.scale;
      const deltaY = (moveEvent.clientY - currentDrag.startY) / currentDrag.scale;
      let width = clampCanvasDimension(currentDrag.startWidth + deltaX);
      let height = clampCanvasDimension(currentDrag.startHeight + deltaY);

      if (currentDrag.ratio) {
        if (Math.abs(deltaX) >= Math.abs(deltaY * currentDrag.ratio)) {
          height = clampCanvasDimension(width / currentDrag.ratio);
        } else {
          width = clampCanvasDimension(height * currentDrag.ratio);
        }
      }

      if (width === canvasSizeRef.current.width && height === canvasSizeRef.current.height) return;

      updateArtboardSize({
        id: 'custom',
        label: CUSTOM_PRESET.label,
        width,
        height,
      }, { recordHistory: false });
    };

    const handlePointerUp = () => {
      pushHistorySnapshot(canvasRef.current);
      resizeDragRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }

  useEffect(() => {
    pushHistorySnapshotRef.current = pushHistorySnapshot;
    undoLastActionRef.current = undoLastAction;
  });

  useEffect(() => {
    const workspace = getWorkspaceSize(canvasSizeRef.current);
    const canvas = new Canvas(canvasElementRef.current, {
      width: workspace.width,
      height: workspace.height,
      backgroundColor: 'rgba(255, 255, 255, 0)',
      preserveObjectStacking: true,
      selection: true,
    });

    const background = new Rect({
      originX: 'left',
      originY: 'top',
      left: BLEED_SIZE,
      top: BLEED_SIZE,
      width: canvasSizeRef.current.width,
      height: canvasSizeRef.current.height,
      scaleX: 1,
      scaleY: 1,
      fill: DEFAULT_BACKGROUND_COLOR,
      selectable: false,
      evented: false,
      hoverCursor: 'default',
      excludeFromExport: false,
    });

    const overlay = new Rect({
      originX: 'left',
      originY: 'top',
      left: BLEED_SIZE,
      top: BLEED_SIZE,
      width: canvasSizeRef.current.width,
      height: canvasSizeRef.current.height,
      scaleX: 1,
      scaleY: 1,
      fill: DEFAULT_OVERLAY_COLOR,
      opacity: DEFAULT_OVERLAY_OPACITY / 100,
      visible: false,
      selectable: false,
      evented: false,
      hoverCursor: 'default',
      excludeFromExport: false,
    });

    const cropGuide = new Rect({
      originX: 'left',
      originY: 'top',
      left: BLEED_SIZE,
      top: BLEED_SIZE,
      width: canvasSizeRef.current.width,
      height: canvasSizeRef.current.height,
      scaleX: 1,
      scaleY: 1,
      fill: 'rgba(255, 255, 255, 0)',
      stroke: '#1e242e',
      strokeWidth: 4,
      visible: false,
      selectable: false,
      evented: false,
      hoverCursor: 'default',
      objectCaching: false,
    });

    background.editorRole = 'background';
    overlay.editorRole = 'overlay';
    cropGuide.editorRole = 'cropGuide';

    canvasRef.current = canvas;
    backgroundRef.current = background;
    overlayRef.current = overlay;
    cropGuideRef.current = cropGuide;

    canvas.add(background, overlay, cropGuide);
    syncCanvasLayers(canvas, overlay, background);
    const initialSnapshot = {
      canvas: canvas.toJSON(HISTORY_PROPS),
      size: { ...canvasSizeRef.current },
      activePresetId: PRESETS[0].id,
      edgeInset: getDefaultSafeInset(canvasSizeRef.current),
      overlayEnabled: false,
      overlayColor: DEFAULT_OVERLAY_COLOR,
      overlayOpacity: DEFAULT_OVERLAY_OPACITY,
      backgroundColor: DEFAULT_BACKGROUND_COLOR,
      logoColor: DEFAULT_LOGO_COLOR,
      logoOpacity: DEFAULT_LOGO_OPACITY,
      logoAlign: 'right',
      logoVerticalAlign: 'bottom',
    };
    historyRef.current = [
      {
        ...initialSnapshot,
        serialized: JSON.stringify(initialSnapshot),
      },
    ];

    const updateSelection = () => {
      const activeObject = canvas.getActiveObject();

      if (isImageObject(activeObject)) {
        setSelectedRole(activeObject.editorRole);

        if (activeObject.editorRole === 'logo') {
          setLogoOpacity(Math.round((activeObject.opacity ?? 1) * 100));
          setLogoColorState(activeObject.editorLogoColor || DEFAULT_LOGO_COLOR);
          setLogoAlign(activeObject.editorHorizontalAlign || 'right');
          setLogoVerticalAlign(activeObject.editorVerticalAlign || 'bottom');
        }

        refreshLayers(canvas);
        updateFloatingMenu(canvas);
        return;
      }

      if (isTextObject(activeObject)) {
        setSelectedRole('text');
        setSelectedFont(activeObject.fontFamily || DEFAULT_FONT);
        setTextColor(activeObject.fill || DEFAULT_TEXT_COLOR);
        setTextSize(Math.round(activeObject.fontSize || DEFAULT_TEXT_SIZE));
        setTextAlign(activeObject.textAlign || 'left');
        setTextVerticalAlign(activeObject.editorVerticalAlign || 'top');
        setSelectedFontStyle(
          getFontStyleValue({
            label: activeObject.editorFontStyleLabel || DEFAULT_FONT_STYLE,
            weight: activeObject.fontWeight || 400,
            style: activeObject.fontStyle || 'normal',
          }),
        );
        refreshLayers(canvas);
        updateFloatingMenu(canvas);
        return;
      }

      setSelectedRole('none');
      refreshLayers(canvas);
      updateFloatingMenu(canvas);
    };

    const refreshCanvasOffset = () => {
      canvas.calcOffset();
      canvas.requestRenderAll();
    };

    const handleObjectModified = () => {
      const activeObject = canvas.getActiveObject();

      if (isPhotoObject(activeObject)) {
        keepImageProportional(activeObject);
      }
      constrainActiveObjectToFrame(activeObject, canvasSizeRef.current);

      syncCanvasLayers(canvas, overlay);
      updateSelection();
      refreshLayers(canvas);
      updateFloatingMenu(canvas);
      canvas.requestRenderAll();
      pushHistorySnapshotRef.current?.(canvas);
    };

    const handleObjectTransform = () => {
      const activeObject = canvas.getActiveObject();

      if (isPhotoObject(activeObject)) {
        keepImageProportional(activeObject);
      }
      constrainActiveObjectToFrame(activeObject, canvasSizeRef.current);

      updateSelection();
      canvas.requestRenderAll();
    };

    const rememberImageMoveStart = (event) => {
      if (!isPhotoObject(event.target)) {
        imageMoveStartRef.current = null;
        return;
      }

      imageMoveStartRef.current = {
        object: event.target,
        left: event.target.left || 0,
        top: event.target.top || 0,
      };
    };

    const clearImageMoveStart = () => {
      imageMoveStartRef.current = null;
    };

    const constrainShiftImageMove = (event) => {
      const activeObject = event.target || canvas.getActiveObject();
      const moveStart = imageMoveStartRef.current;

      if (!isPhotoObject(activeObject) || !event.e?.shiftKey || moveStart?.object !== activeObject) {
        return;
      }

      const deltaX = (activeObject.left || 0) - moveStart.left;
      const deltaY = (activeObject.top || 0) - moveStart.top;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        activeObject.set({ top: moveStart.top });
      } else {
        activeObject.set({ left: moveStart.left });
      }

      activeObject.setCoords();
    };

    const handleObjectMoving = (event) => {
      constrainShiftImageMove(event);
      handleObjectTransform();
    };

    const removeSelectedObjects = () => {
      const activeObject = canvas.getActiveObject();
      if (!activeObject || activeObject.isEditing) return;

      const selectedObjects =
        !isLayerObject(activeObject) && typeof activeObject.getObjects === 'function'
          ? activeObject.getObjects()
          : [activeObject];

      selectedObjects.filter(isLayerObject).forEach((object) => canvas.remove(object));
      canvas.discardActiveObject();
      syncCanvasLayers(canvas, overlay);
      updateSelection();
      refreshLayers(canvas);
      canvas.requestRenderAll();
      pushHistorySnapshotRef.current?.(canvas);
    };

    const handleKeyDown = (event) => {
      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable);

      if (isTypingTarget) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        const activeObject = canvas.getActiveObject();
        if (activeObject?.isEditing) return;

        event.preventDefault();
        undoLastActionRef.current?.();
        return;
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        const activeObject = canvas.getActiveObject();
        if (activeObject?.isEditing) return;

        event.preventDefault();
        removeSelectedObjects();
      }
    };

    const observer = new ResizeObserver(refreshCanvasOffset);

    if (canvas.wrapperEl) {
      observer.observe(canvas.wrapperEl);
    }

    canvas.on('selection:created', updateSelection);
    canvas.on('selection:updated', updateSelection);
    canvas.on('selection:cleared', updateSelection);
    canvas.on('mouse:down', rememberImageMoveStart);
    canvas.on('mouse:up', clearImageMoveStart);
    canvas.on('object:scaling', handleObjectTransform);
    canvas.on('object:moving', handleObjectMoving);
    canvas.on('object:rotating', handleObjectTransform);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:added', () => refreshLayers(canvas));
    canvas.on('object:removed', () => refreshLayers(canvas));
    canvas.on('text:changed', (event) => {
      if (isTemplateTextObject(event.target)) {
        event.target.editorIsTemplate = false;
        event.target.excludeFromExport = false;
      }
      refreshLayers(canvas);
      window.clearTimeout(textHistoryTimerRef.current);
      textHistoryTimerRef.current = window.setTimeout(
        () => pushHistorySnapshotRef.current?.(canvas),
        400,
      );
    });
    window.addEventListener('resize', refreshCanvasOffset);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(textHistoryTimerRef.current);
      observer.disconnect();
      window.removeEventListener('resize', refreshCanvasOffset);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.dispose();
      canvasRef.current = null;
      backgroundRef.current = null;
      overlayRef.current = null;
      cropGuideRef.current = null;
    };
  }, [refreshLayers]);

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.calcOffset();
      canvas.requestRenderAll();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [workspaceDisplayWidth, workspaceDisplayHeight]);

  useEffect(() => {
    if (!aiPromptOpen) return;

    const frame = window.requestAnimationFrame(() => {
      aiPromptInputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [aiPromptOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    overlay.set({
      originX: 'left',
      originY: 'top',
      left: BLEED_SIZE,
      top: BLEED_SIZE,
      width: canvasSizeRef.current.width,
      height: canvasSizeRef.current.height,
      scaleX: 1,
      scaleY: 1,
      fill: overlayColor,
      opacity: overlayOpacity / 100,
      visible: overlayEnabled && overlayOpacity > 0,
    });
    overlay.setCoords();

    syncCanvasLayers(canvas, overlay);
    canvas.requestRenderAll();
  }, [overlayColor, overlayEnabled, overlayOpacity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const background = backgroundRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !background) return;

    background.set({ fill: backgroundColor });
    background.setCoords();
    syncCanvasLayers(canvas, overlay, background);
    canvas.requestRenderAll();
  }, [backgroundColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const activeObject = canvas?.getActiveObject();

    if (isTextObject(activeObject)) {
      positionTextInSafeArea(
        activeObject,
        canvasSizeRef.current,
        edgeInset,
        activeObject.textAlign || textAlign,
        activeObject.editorVerticalAlign || textVerticalAlign,
      );
    } else if (activeObject?.editorRole === 'logo') {
      positionObjectInSafeArea(
        activeObject,
        canvasSizeRef.current,
        edgeInset,
        activeObject.editorHorizontalAlign || logoAlign,
        activeObject.editorVerticalAlign || logoVerticalAlign,
      );
    }

    canvas?.requestRenderAll();
  }, [edgeInset, logoAlign, logoVerticalAlign, textAlign, textVerticalAlign]);

  useEffect(() => {
    guideStartedRef.current = false;
  }, []);

  useEffect(() => {
    const handlePaste = (event) => {
      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable);
      const activeObject = canvasRef.current?.getActiveObject();

      if (isTypingTarget || activeObject?.isEditing) return;

      const file = getImageFileFromItems(event.clipboardData?.items);
      if (!file) return;

      event.preventDefault();
      addImageFromFileRef.current?.(file, 'image');
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  async function addImageFromFile(file, role, options = {}) {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !file) return;

    const url = await readFileAsDataUrl(file);

    const image = await FabricImage.fromURL(url);

    registerLayerObject(image, role, file.name || 'Изображение');
    coverImageToFrame(image, canvasSizeRef.current);
    styleControls(image);
    image.set({
      lockRotation: true,
      lockScalingFlip: true,
    });
    image.set(options.fabricOptions || {});

    canvas.add(image);
    syncCanvasLayers(canvas, overlay);
    canvas.setActiveObject(image);
    syncSelectionPanel(canvas);
    refreshLayers(canvas);
    canvas.requestRenderAll();
    pushHistorySnapshot(canvas);
  }

  useEffect(() => {
    addImageFromFileRef.current = addImageFromFile;
  });

  function handleImageUpload(event) {
    addImageFromFile(getImageFileFromList(event.target.files), 'image');
    event.target.value = '';
  }

  async function generateImageWithAi() {
    const prompt = aiPrompt.trim();
    if (!prompt || isGeneratingImage) return;

    setIsGeneratingImage(true);
    setAiGenerationError('');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          width: canvasSizeRef.current.width,
          height: canvasSizeRef.current.height,
        }),
      });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { error: await response.text() };

      if (!response.ok) {
        const isLocalMissingFunction =
          response.status === 404 && window.location.hostname === '127.0.0.1';
        throw new Error(
          isLocalMissingFunction
            ? 'Локальный Vite не запускает Cloudflare Function. Проверьте генерацию онлайн после публикации.'
            : data.error || 'Не удалось сгенерировать изображение.',
        );
      }

      if (!data.image) {
        throw new Error('Сервис вернул пустой результат.');
      }

      const imageBytes = dataUrlToBytes(data.image);
      const imageFile = new File([imageBytes], 'ai-generated-image.png', { type: 'image/png' });
      await addImageFromFile(imageFile, 'image');
      setAiPromptOpen(false);
    } catch (error) {
      setAiGenerationError(error.message || 'Не удалось сгенерировать изображение.');
    } finally {
      setIsGeneratingImage(false);
    }
  }

  function handleCanvasDragOver(event) {
    if (!event.dataTransfer?.types?.includes('Files')) return;

    event.preventDefault();
    setIsImageDragOver(true);
  }

  function handleCanvasDragLeave(event) {
    if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) {
      return;
    }

    setIsImageDragOver(false);
  }

  function handleCanvasDrop(event) {
    event.preventDefault();
    setIsImageDragOver(false);

    const file = getImageFileFromList(event.dataTransfer?.files);
    if (file) {
      addImageFromFile(file, 'image');
    }
  }

  async function addEtalonLogo() {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas) return;

    const { objects, options } = await loadSVGFromString(ETALON_LOGO_SVG);
    const logoObjects = objects.filter(Boolean);
    if (logoObjects.length === 0) return;

    const logo = new Group(logoObjects, options);
    registerLayerObject(logo, 'logo', 'Логотип Эталон');
    logo.editorLogoColor = logoColor;
    const nextCorner = getAvailableLogoCorner(canvas, logoAlign, logoVerticalAlign);

    fitObjectToCanvas(logo, canvasSizeRef.current, 0.22);
    positionObjectInSafeArea(
      logo,
      canvasSizeRef.current,
      edgeInset,
      nextCorner.horizontal,
      nextCorner.vertical,
    );
    setLogoColor(logo, logoColor);
    styleControls(logo);
    logo.set({ opacity: logoOpacity / 100 });
    lockLogoObject(logo);
    setLogoAlign(nextCorner.horizontal);
    setLogoVerticalAlign(nextCorner.vertical);

    canvas.add(logo);
    syncCanvasLayers(canvas, overlay);
    canvas.setActiveObject(logo);
    syncSelectionPanel(canvas);
    refreshLayers(canvas);
    canvas.requestRenderAll();
    pushHistorySnapshot(canvas);
  }

  function addText({ isTemplate = false, recordHistory = true } = {}) {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas) return;

    const text = new Textbox(TEXT_TEMPLATE_VALUE, {
      width: getSafeArea(canvasSizeRef.current, edgeInset).width,
      fill: textColor,
      fontFamily: selectedFont,
      fontSize: textSize,
      fontWeight: 700,
      lineHeight: DEFAULT_TEXT_LINE_HEIGHT,
      charSpacing: getFabricCharSpacing(DEFAULT_TEXT_LETTER_SPACING, textSize),
      textAlign,
      padding: 8,
    });
    const fontStyle = parseFontStyleValue(selectedFontStyle);

    registerLayerObject(text, 'text', 'Текст');
    text.editorIsTemplate = isTemplate;
    text.set({
      fontWeight: fontStyle.weight,
      fontStyle: fontStyle.style,
      excludeFromExport: isTemplate,
    });
    text.editorFontStyleLabel = fontStyle.label;
    text.editorVerticalAlign = textVerticalAlign;
    positionTextInSafeArea(
      text,
      canvasSizeRef.current,
      edgeInset,
      textAlign,
      textVerticalAlign,
    );
    styleControls(text);

    canvas.add(text);
    resolveLogoCornerConflicts(canvas);
    syncCanvasLayers(canvas, overlay);
    canvas.setActiveObject(text);
    syncSelectionPanel(canvas);
    refreshLayers(canvas);
    canvas.requestRenderAll();
    if (recordHistory) {
      pushHistorySnapshot(canvas);
    }
  }

  async function loadSystemFonts({ closePrompt = false } = {}) {
    if (!('queryLocalFonts' in window)) {
      setFontStatus('Список системных шрифтов недоступен в этом браузере');
      if (closePrompt) setShowFontPrompt(false);
      return;
    }

    try {
      const fonts = await window.queryLocalFonts();
      const families = [...new Set(fonts.map((font) => font.family))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

      if (families.length > 0) {
        const nextStyles = {};

        fonts.forEach((font) => {
          if (!font.family) return;

          const label = font.style || DEFAULT_FONT_STYLE;
          const option = {
            label,
            weight: getFontWeightFromStyle(label),
            style: getFontStyleFromName(label),
          };

          nextStyles[font.family] = nextStyles[font.family] || [];

          if (!nextStyles[font.family].some((item) => item.label === label)) {
            nextStyles[font.family].push(option);
          }
        });

        setFontOptions(families);
        setFontsLoaded(true);
        setFontStyleOptions((current) => ({
          ...current,
          ...nextStyles,
        }));
        setSelectedFont((current) => {
          const gilroyFamily =
            families.find((family) => family.toLowerCase() === 'gilroy') ||
            families.find((family) => family.toLowerCase().includes('gilroy'));
          const nextFamily = gilroyFamily || (families.includes(current) ? current : families[0]);
          const nextStyle = getPreferredFontStyle(
            nextStyles[nextFamily] || FALLBACK_FONT_STYLES,
            gilroyFamily ? 'Medium' : DEFAULT_FONT_STYLE,
          );
          setSelectedFontStyle(getFontStyleValue(nextStyle));
          return nextFamily;
        });
        setShowFontPrompt(false);
      }

      setFontStatus(`Загружено шрифтов: ${families.length}`);
    } catch {
      setFontStatus('Доступ к шрифтам не предоставлен');
    } finally {
      if (closePrompt) setShowFontPrompt(false);
    }
  }

  function applyFont(fontFamily) {
    const canvas = canvasRef.current;
    const activeObject = canvas?.getActiveObject();

    setSelectedFont(fontFamily);
    const nextStyle = getPreferredFontStyle(fontStyleOptions[fontFamily] || FALLBACK_FONT_STYLES);
    setSelectedFontStyle(getFontStyleValue(nextStyle));

    if (isTextObject(activeObject)) {
      applyTextStyleToObject(activeObject, {
        fontFamily,
        fontWeight: nextStyle.weight,
        fontStyle: nextStyle.style,
      });
      activeObject.editorFontStyleLabel = nextStyle.label;
      canvas.requestRenderAll();
      pushHistorySnapshot(canvas);
    }
  }

  function applyFontStyle(styleValue) {
    const canvas = canvasRef.current;
    const activeObject = canvas?.getActiveObject();
    const fontStyle = parseFontStyleValue(styleValue);

    setSelectedFontStyle(styleValue);

    if (isTextObject(activeObject)) {
      applyTextStyleToObject(activeObject, {
        fontWeight: fontStyle.weight,
        fontStyle: fontStyle.style,
      });
      activeObject.editorFontStyleLabel = fontStyle.label;
      canvas.requestRenderAll();
      pushHistorySnapshot(canvas);
    }
  }

  function applyTextColor(color) {
    const canvas = canvasRef.current;
    const activeObject = canvas?.getActiveObject();

    setTextColor(color);

    if (isTextObject(activeObject)) {
      applyTextStyleToObject(activeObject, { fill: color });
      canvas.requestRenderAll();
      pushHistorySnapshot(canvas);
    }
  }

  function applyTextSize(value) {
    const canvas = canvasRef.current;
    const activeObject = canvas?.getActiveObject();
    const numericSize = Number(value);

    setTextSize(value);

    if (!Number.isFinite(numericSize) || numericSize <= 0) return;

    if (isTextObject(activeObject)) {
      applyTextStyleToObject(activeObject, { fontSize: numericSize });
      activeObject.set({
        charSpacing: getFabricCharSpacing(DEFAULT_TEXT_LETTER_SPACING, numericSize),
      });
      positionTextInSafeArea(
        activeObject,
        canvasSizeRef.current,
        edgeInset,
        activeObject.textAlign || textAlign,
        activeObject.editorVerticalAlign || textVerticalAlign,
      );
      canvas.requestRenderAll();
      pushHistorySnapshot(canvas);
    }
  }

  function applyTextPosition(horizontalAlign, verticalAlign) {
    const canvas = canvasRef.current;
    const activeObject = canvas?.getActiveObject();

    setTextAlign(horizontalAlign);
    setTextVerticalAlign(verticalAlign);

    if (isTextObject(activeObject)) {
      activeObject.editorVerticalAlign = verticalAlign;
      positionTextInSafeArea(
        activeObject,
        canvasSizeRef.current,
        edgeInset,
        horizontalAlign,
        verticalAlign,
      );
      resolveLogoCornerConflicts(canvas);
      refreshLayers(canvas);
      canvas.requestRenderAll();
      pushHistorySnapshot(canvas);
    }
  }

  function applyLogoColor(color) {
    const canvas = canvasRef.current;
    const activeObject = canvas?.getActiveObject();

    setLogoColorState(color);

    if (hasLogoSelection && activeObject?.editorRole === 'logo') {
      setLogoColor(activeObject, color);
      canvas.requestRenderAll();
      pushHistorySnapshot(canvas);
    }
  }

  function applyOverlayOpacity(value) {
    setOverlayOpacity(clampPercent(value));
  }

  function applyLogoOpacity(value) {
    const canvas = canvasRef.current;
    const activeObject = canvas?.getActiveObject();
    const nextOpacity = clampPercent(value);

    setLogoOpacity(nextOpacity);

    if (hasLogoSelection && activeObject?.editorRole === 'logo') {
      activeObject.set({ opacity: nextOpacity / 100 });
      canvas.requestRenderAll();
      pushHistorySnapshot(canvas);
    }
  }

  function resolveLogoCornerConflicts(canvas = canvasRef.current) {
    if (!canvas) return;

    const blockedCorners = getBlockedLogoCornerKeys(canvas);

    canvas
      .getObjects()
      .filter((object) => object.editorRole === 'logo')
      .forEach((logo) => {
        const currentHorizontal = logo.editorHorizontalAlign || logoAlign;
        const currentVertical = logo.editorVerticalAlign || logoVerticalAlign;
        const currentKey = getCornerKey(currentHorizontal, currentVertical);

        if (!blockedCorners.has(currentKey)) return;

        const nextCorner =
          LOGO_CORNERS.find(
            (corner) => !blockedCorners.has(getCornerKey(corner.horizontal, corner.vertical)),
          ) || LOGO_CORNERS[0];

        positionObjectInSafeArea(
          logo,
          canvasSizeRef.current,
          edgeInset,
          nextCorner.horizontal,
          nextCorner.vertical,
        );

        if (canvas.getActiveObject()?.editorId === logo.editorId) {
          setLogoAlign(nextCorner.horizontal);
          setLogoVerticalAlign(nextCorner.vertical);
        }
      });
  }

  function applyLogoCorner(horizontalAlign, verticalAlign) {
    const canvas = canvasRef.current;
    const activeObject = canvas?.getActiveObject();
    const blockedCorners = getBlockedLogoCornerKeys(canvas);

    if (blockedCorners.has(getCornerKey(horizontalAlign, verticalAlign))) return;

    setLogoAlign(horizontalAlign);
    setLogoVerticalAlign(verticalAlign);

    if (hasLogoSelection && activeObject?.editorRole === 'logo') {
      positionObjectInSafeArea(
        activeObject,
        canvasSizeRef.current,
        edgeInset,
        horizontalAlign,
        verticalAlign,
      );
      refreshLayers(canvas);
      canvas.requestRenderAll();
      pushHistorySnapshot(canvas);
    }
  }

  function fillSelectedImageFrame() {
    const canvas = canvasRef.current;
    const activeObject = canvas?.getActiveObject();

    if (!isPhotoObject(activeObject)) return;

    coverImageToFrame(activeObject, canvasSizeRef.current);
    syncSelectionPanel(canvas);
    canvas.requestRenderAll();
    pushHistorySnapshot(canvas);
  }

  function alignSelectedImage(edge) {
    const canvas = canvasRef.current;
    const activeObject = canvas?.getActiveObject();

    if (!isImageObject(activeObject)) return;

    alignActiveImageToEdge(activeObject, canvasSizeRef.current, edge);
    syncSelectionPanel(canvas);
    canvas.requestRenderAll();
    pushHistorySnapshot(canvas);
  }

  function getExportDataUrl(format = exportFormat, scale = exportScale) {
    const canvas = canvasRef.current;
    if (!canvas) return '';

    const activeObject = canvas.getActiveObject();
    const fabricFormat = format === 'jpg' ? 'jpeg' : 'png';
    const size = canvasSizeRef.current;

    canvas.discardActiveObject();
    canvas.requestRenderAll();

    const dataUrl = canvas.toDataURL({
      format: fabricFormat,
      left: BLEED_SIZE,
      top: BLEED_SIZE,
      width: size.width,
      height: size.height,
      multiplier: Number(scale),
      quality: 0.95,
      filter: (object) =>
        object.editorRole !== 'cropGuide',
    });

    if (activeObject) {
      canvas.setActiveObject(activeObject);
      canvas.requestRenderAll();
    }

    return dataUrl;
  }

  function exportImage() {
    removeUnusedTemplateText();

    const size = canvasSizeRef.current;
    const scale = Number(exportScale) || 1;

    if (exportFormat === 'pdf') {
      const jpegDataUrl = getExportDataUrl('jpg', scale);

      if (!jpegDataUrl) return;

      const pdfBlob = createPdfFromJpeg(jpegDataUrl, size.width * scale, size.height * scale);
      const objectUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `etaon-${size.width}x${size.height}-x${exportScale}.pdf`;
      link.click();
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
      return;
    }

    const dataUrl = getExportDataUrl(exportFormat, scale);

    if (!dataUrl) return;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `etaon-${size.width}x${size.height}-x${exportScale}.${exportFormat}`;
    link.click();
  }

  function handleWorkspaceWheel(event) {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;

    setWorkspaceZoom((current) => {
      const next = current + direction * 0.08;
      return Math.min(3, Math.max(0.25, Number(next.toFixed(2))));
    });
  }

  function closeGuide() {
    setShowGuide(false);
  }

  function showNextGuideStep() {
    if (guideStepIndex >= GUIDE_STEPS.length - 1) {
      closeGuide();
      return;
    }

    setGuideStepIndex((current) => current + 1);
  }

  function goToWorkflowStep(stepId) {
    const nextIndex = WORKFLOW_STEPS.findIndex((step) => step.id === stepId);
    if (nextIndex < 0) return;
    if (!hasImageLayer && nextIndex > 0) return;

    if (currentStep === 'text' && stepId !== 'text') {
      removeUnusedTemplateText();
    }

    if (stepId === 'text' && !canvasRef.current?.getObjects().some(isTextObject)) {
      addText({ isTemplate: true, recordHistory: false });
    }

    setCurrentStep(stepId);
    setShowGuide(false);
    setActiveColorPalette(null);
  }

  function goToPreviousStep() {
    const previousStep = WORKFLOW_STEPS[currentStepIndex - 1];
    if (previousStep) {
      goToWorkflowStep(previousStep.id);
    }
  }

  function goToNextStep() {
    if (!canGoNext) return;

    const nextStep = WORKFLOW_STEPS[currentStepIndex + 1];
    if (nextStep) {
      goToWorkflowStep(nextStep.id);
    }
  }

  return (
    <main className="editorShell">
      <aside className="sidebar">
        <div className="brand">
          <img className="brandIcon" src={APP_ICON_SRC} alt="" />
          <div>
            <h1>ЭТАОН</h1>
          </div>
        </div>

        {hasImageLayer && <nav className="stepRail" aria-label="Шаги создания макета">
          {WORKFLOW_STEPS.map((step, index) => {
            const isLocked = !hasImageLayer && index > 0;

            return (
              <button
                key={step.id}
                type="button"
                className={currentStep === step.id ? 'active' : ''}
                disabled={isLocked}
                aria-label={step.label}
                onClick={() => goToWorkflowStep(step.id)}
              >
                <span className="stepIcon" aria-hidden="true">{step.icon}</span>
              </button>
            );
          })}
        </nav>}
      </aside>

      {hasImageLayer && (
        <aside className="inspector">
        <section className="workflowPanel">
          <div className="workflowHeader">
            <span>{activeWorkflowStep.number}</span>
            <h2>{activeWorkflowStep.title}</h2>
            <p>{activeWorkflowStep.text}</p>
          </div>

          {currentStep === 'image' && (
            <>
              <section className="controlGroup">
                <button
                  type="button"
                  className="uploadHeroButton"
                  onClick={() => imageInputRef.current?.click()}
                >
                  {hasImageLayer ? 'Заменить изображение' : 'Загрузить изображение'}
                </button>
                <div className="presetGrid">
                  {CANVAS_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`${activePresetId === preset.id ? 'active' : ''} ${
                        preset.id === CUSTOM_PRESET.id ? 'customPreset' : ''
                      }`}
                      onClick={() =>
                        preset.id === CUSTOM_PRESET.id
                          ? activateCustomCanvasSize()
                          : updateArtboardSize(getPresetById(preset.id))
                      }
                    >
                      <span className="presetIcon" aria-hidden="true">{preset.icon}</span>
                      <span>{preset.label}</span>
                      {preset.width && <small>{preset.width}x{preset.height}</small>}
                    </button>
                  ))}
                </div>
                {showCustomSizeControls && (
                  <>
                    <div className="resizeFormatList inlineResizeFormats">
                      {RESIZE_FORMATS.filter((format) => format.id !== 'free').map((format) => (
                        <button
                          key={format.id}
                          type="button"
                          className={resizeFormatId === format.id ? 'active' : ''}
                          onClick={() => applyResizeFormat(format)}
                        >
                          {format.label}
                        </button>
                      ))}
                    </div>
                    <div className="sizeGrid">
                      <label className="field">
                        <span>Ширина</span>
                        <input
                          type="number"
                          min={MIN_CANVAS_SIZE}
                          value={customWidth}
                          onChange={(event) =>
                            updateCustomCanvasSize(event.target.value, customHeight)
                          }
                        />
                      </label>
                      <label className="field">
                        <span>Высота</span>
                        <input
                          type="number"
                          min={MIN_CANVAS_SIZE}
                          value={customHeight}
                          onChange={(event) =>
                            updateCustomCanvasSize(customWidth, event.target.value)
                          }
                        />
                      </label>
                    </div>
                  </>
                )}
              </section>
              <section className="controlGroup inspectorToolGroup">
                <h2>Подгонка</h2>
                <button
                  type="button"
                  className="fitIconButton"
                  title="Заполнить холст"
                  aria-label="Заполнить холст изображением"
                  onClick={fillSelectedImageFrame}
                >
                  ⤢
                </button>
                <div className="floatingSegment imageAlignGrid" aria-label="Выравнивание изображения">
                  {IMAGE_ALIGNMENTS.map(([edge, label]) => (
                    <button key={edge} type="button" onClick={() => alignSelectedImage(edge)}>
                      {label}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {currentStep === 'text' && (
            <>
              <section className="controlGroup">
                <label className="field">
                  <span>Шрифт</span>
                  <select value={selectedFont} onChange={(event) => applyFont(event.target.value)}>
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Начертание</span>
                  <select
                    value={selectedFontStyle}
                    onChange={(event) => applyFontStyle(event.target.value)}
                  >
                    {selectedFontStyles.map((fontStyle) => (
                      <option key={getFontStyleValue(fontStyle)} value={getFontStyleValue(fontStyle)}>
                        {fontStyle.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="sizeGrid">
                  <label className="field">
                    <span>Размер</span>
                    <input
                      type="number"
                      min="1"
                      value={textSize}
                      onChange={(event) => applyTextSize(event.target.value)}
                    />
                  </label>
                  <label className="colorControl textColorControl">
                    <span>Цвет</span>
                    <input
                      type="color"
                      value={textColor}
                      onFocus={() => openColorPalette('text')}
                      onClick={() => openColorPalette('text')}
                      onChange={(event) => applyTextColor(event.target.value)}
                    />
                  </label>
                </div>
                <ColorPalette
                  value={textColor}
                  visible={activeColorPalette === 'text'}
                  onChange={applyTextColor}
                />
                {!fontsLoaded && (
                  <button type="button" onClick={loadSystemFonts}>
                    Загрузить системные шрифты
                  </button>
                )}
                <p className="statusText">
                  {hasTextSelection ? 'Изменится выбранный текст' : fontStatus}
                </p>
              </section>
              <section className="controlGroup inspectorToolGroup">
                <h2>Позиция текста</h2>
                <div className="positionGrid" aria-label="Расположение текста">
                  {TEXT_POSITIONS.map((position) => (
                    <button
                      key={`${position.horizontal}-${position.vertical}`}
                      type="button"
                      className={
                        textAlign === position.horizontal && textVerticalAlign === position.vertical
                          ? 'active'
                          : ''
                      }
                      onClick={() => applyTextPosition(position.horizontal, position.vertical)}
                    >
                      {position.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="controlGroup">
                <h2>Цвет подложки</h2>
                <label className="checkRow">
                  <input
                    type="checkbox"
                    checked={overlayEnabled}
                    onChange={(event) => setOverlayEnabled(event.target.checked)}
                  />
                  <span>Включить подложку</span>
                </label>
                {overlayEnabled && (
                  <>
                    <label className="colorControl">
                      <span>Цвет</span>
                      <input
                        type="color"
                        value={overlayColor}
                        onFocus={() => openColorPalette('overlay')}
                        onClick={() => openColorPalette('overlay')}
                        onChange={(event) => setOverlayColor(event.target.value)}
                      />
                    </label>
                    <ColorPalette
                      value={overlayColor}
                      visible={activeColorPalette === 'overlay'}
                      onChange={setOverlayColor}
                    />
                    <label className="field">
                      <span>Прозрачность</span>
                      <div className="rangeRow">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={overlayOpacity}
                          onChange={(event) => applyOverlayOpacity(event.target.value)}
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={overlayOpacity}
                          aria-label="Прозрачность оверлея"
                          onChange={(event) => applyOverlayOpacity(event.target.value)}
                        />
                      </div>
                    </label>
                  </>
                )}
              </section>
            </>
          )}

          {currentStep === 'logo' && (
            <section className="controlGroup">
              <button type="button" className="primaryButton" onClick={addEtalonLogo}>
                {hasLogoLayer ? 'Добавить ещё логотип' : 'Добавить логотип'}
              </button>
              {hasLogoLayer ? (
                <>
                  <label className="colorControl">
                    <span>Цвет</span>
                    <input
                      type="color"
                      value={logoColor}
                      onFocus={() => openColorPalette('logo')}
                      onClick={() => openColorPalette('logo')}
                      onChange={(event) => applyLogoColor(event.target.value)}
                    />
                  </label>
                  <ColorPalette
                    value={logoColor}
                    visible={activeColorPalette === 'logo'}
                    onChange={applyLogoColor}
                  />
                  <label className="field">
                    <span>Прозрачность</span>
                    <div className="rangeRow">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={logoOpacity}
                        onChange={(event) => applyLogoOpacity(Number(event.target.value))}
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={logoOpacity}
                        aria-label="Прозрачность логотипа"
                        onChange={(event) => applyLogoOpacity(event.target.value)}
                      />
                    </div>
                  </label>
                  <p className="statusText">
                    {hasLogoSelection ? 'Изменится выбранный логотип' : 'Выберите логотип на холсте'}
                  </p>
                  <div className="cornerGrid" aria-label="Угол логотипа">
                    {LOGO_CORNERS.map((corner) => {
                      const cornerKey = getCornerKey(corner.horizontal, corner.vertical);
                      const isBlocked = blockedLogoCorners.includes(cornerKey);

                      return (
                        <button
                          key={cornerKey}
                          type="button"
                          className={
                            logoAlign === corner.horizontal && logoVerticalAlign === corner.vertical
                              ? 'active'
                              : ''
                          }
                          disabled={isBlocked}
                          title={
                            isBlocked ? 'В этом углу уже расположен текст' : 'Поставить логотип в угол'
                          }
                          onClick={() => applyLogoCorner(corner.horizontal, corner.vertical)}
                        >
                          {corner.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="statusText">Логотип появится в свободном углу и не перекроет текст.</p>
              )}
            </section>
          )}

          {currentStep === 'export' && (
            <section className="controlGroup exportGroup">
              <div className="segmented exportFormatSegment">
                {['png', 'jpg', 'pdf'].map((format) => (
                  <button
                    key={format}
                    type="button"
                    className={exportFormat === format ? 'active' : ''}
                    onClick={() => setExportFormat(format)}
                  >
                    {format}
                  </button>
                ))}
              </div>
              <div className="segmented">
                {[1, 2, 3].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    className={exportScale === scale ? 'active' : ''}
                    onClick={() => setExportScale(scale)}
                  >
                    x{scale}
                  </button>
                ))}
              </div>
              <button type="button" className="primaryButton exportButton" onClick={exportImage}>
                Скачать макет
              </button>
            </section>
          )}
        </section>

        <div className="stepActions">
          <button type="button" onClick={goToPreviousStep} disabled={currentStepIndex === 0}>
            Назад
          </button>
          {currentStep === 'export' ? (
            <button type="button" className="primaryButton" onClick={exportImage}>
              Скачать
            </button>
          ) : (
            <button
              type="button"
              className="primaryButton"
              onClick={goToNextStep}
              disabled={!canGoNext}
            >
              Далее
            </button>
          )}
        </div>
        </aside>
      )}

      {showFontPrompt && !fontsLoaded && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h2>Загрузить системные шрифты</h2>
            <p>
              Редактор может запросить у браузера список шрифтов, установленных на этом компьютере.
            </p>
            <button
              type="button"
              className="primaryButton"
              onClick={() => loadSystemFonts({ closePrompt: true })}
            >
              Загрузить шрифты
            </button>
            <button type="button" onClick={() => setShowFontPrompt(false)}>
              Пропустить
            </button>
          </div>
        </div>
      )}

      {showGuide && !showFontPrompt && (
        <div className={`guideBubble ${activeGuideStep.placement}`}>
          <strong>{activeGuideStep.title}</strong>
          <p>{activeGuideStep.text}</p>
          <div className="guideActions">
            <button type="button" onClick={closeGuide}>
              Пропустить
            </button>
            <button type="button" className="primaryButton" onClick={showNextGuideStep}>
              {guideStepIndex >= GUIDE_STEPS.length - 1 ? 'Готово' : 'Далее'}
            </button>
          </div>
        </div>
      )}

      {showFloatingMenu && (
        <div
          className="floatingMenu"
          style={{
            left: `${floatingMenu.x}px`,
            top: `${floatingMenu.y}px`,
          }}
        >
          {floatingMenu.role === 'text' && (
            <>
              <div className="floatingMenuRow">
                <select
                  value={selectedFontStyle}
                  onChange={(event) => applyFontStyle(event.target.value)}
                  aria-label="Начертание текста"
                >
                  {selectedFontStyles.map((fontStyle) => (
                    <option key={getFontStyleValue(fontStyle)} value={getFontStyleValue(fontStyle)}>
                      {fontStyle.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={textSize}
                  aria-label="Размер текста"
                  onChange={(event) => applyTextSize(event.target.value)}
                />
                <input
                  type="color"
                  value={textColor}
                  aria-label="Цвет текста"
                  onChange={(event) => applyTextColor(event.target.value)}
                />
              </div>
              <div className="positionGrid compact" aria-label="Расположение текста">
                {TEXT_POSITIONS.map((position) => (
                  <button
                    key={`${position.horizontal}-${position.vertical}`}
                    type="button"
                    className={
                      textAlign === position.horizontal && textVerticalAlign === position.vertical
                        ? 'active'
                        : ''
                    }
                    onClick={() => applyTextPosition(position.horizontal, position.vertical)}
                  >
                    {position.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {floatingMenu.role === 'image' && (
            <>
              <button
                type="button"
                className="fitIconButton"
                title="Заполнить холст"
                aria-label="Заполнить холст изображением"
                onClick={fillSelectedImageFrame}
              >
                ⤢
              </button>
              <div className="floatingSegment imageAlignGrid" aria-label="Выравнивание изображения">
                {IMAGE_ALIGNMENTS.map(([edge, label]) => (
                  <button
                    key={edge}
                    type="button"
                    onClick={() => alignSelectedImage(edge)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {floatingMenu.role === 'logo' && (
            <>
              <div className="floatingMenuRow logoFloatingRow">
                <input
                  type="color"
                  value={logoColor}
                  aria-label="Цвет логотипа"
                  onChange={(event) => applyLogoColor(event.target.value)}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={logoOpacity}
                  aria-label="Прозрачность логотипа"
                  onChange={(event) => applyLogoOpacity(Number(event.target.value))}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={logoOpacity}
                  aria-label="Прозрачность логотипа в процентах"
                  onChange={(event) => applyLogoOpacity(event.target.value)}
                />
              </div>
              <div className="cornerGrid" aria-label="Угол логотипа">
                {LOGO_CORNERS.map((corner) => {
                  const cornerKey = getCornerKey(corner.horizontal, corner.vertical);
                  const isBlocked = blockedLogoCorners.includes(cornerKey);

                  return (
                  <button
                    key={cornerKey}
                    type="button"
                    className={
                      logoAlign === corner.horizontal && logoVerticalAlign === corner.vertical
                        ? 'active'
                        : ''
                    }
                    disabled={isBlocked}
                    onClick={() => applyLogoCorner(corner.horizontal, corner.vertical)}
                  >
                    {corner.label}
                  </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      <section
        className={`workspace ${!hasImageLayer ? 'isEmpty' : ''} ${
          isImageDragOver ? 'isImageDragOver' : ''
        }`}
        onWheel={handleWorkspaceWheel}
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
        onDrop={handleCanvasDrop}
      >
        <div className="workspaceStage">
        <div
          className={`canvasFrame ${edgeInset > 0 ? 'showSafeInset' : ''}`}
          style={{
            '--frame-width': `${frameWidth}px`,
            '--frame-height': `${frameHeight}px`,
            '--workspace-display-width': `${workspaceDisplayWidth}px`,
            '--workspace-display-height': `${workspaceDisplayHeight}px`,
            '--canvas-offset': `${canvasOffset}px`,
            '--safe-inset': `${safeInsetDisplay}px`,
          }}
        >
          <input
            ref={imageInputRef}
            className="hiddenInput"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <canvas
            ref={canvasElementRef}
            width={workspaceSize.width}
            height={workspaceSize.height}
          />
          <div className="safeInsetGuide" aria-hidden="true" />
          {currentStep === 'image' && (
            <button
              type="button"
              className={`canvasUploadButton ${
                hasImageLayer ? 'iconOnly' : hasCanvasObjects ? 'compact' : 'emptyState'
              } ${showGuide && activeGuideStep.id === 'upload' ? 'guideTarget' : ''}`}
              aria-label="Добавить изображение"
              onClick={() => imageInputRef.current?.click()}
            >
              {hasImageLayer ? (
                <span aria-hidden="true">+</span>
              ) : (
                <>
                  <span aria-hidden="true" className="uploadGlyph">+</span>
                  <span>Добавьте изображение</span>
                  <small>Нажмите на холст, перетащите файл или вставьте из буфера</small>
                </>
              )}
            </button>
          )}
          {currentStep === 'image' && (
            <button
              type="button"
              className="aiGenerateButton"
              title="Сгенерировать изображение с ИИ"
              aria-label="Сгенерировать изображение с ИИ"
              disabled={isGeneratingImage}
              onClick={() => {
                setAiGenerationError('');
                setAiPromptOpen(true);
              }}
            >
              <span aria-hidden="true">✦</span>
            </button>
          )}
          {isImageDragOver && (
            <div className="dropOverlay" aria-hidden="true">
              Отпустите изображение на холст
            </div>
          )}
          {currentStep === 'image' && (
            <button
              type="button"
              className="canvasResizeHandle"
              aria-label="Изменить размер холста"
              onPointerDown={handleCanvasResizePointerDown}
            />
          )}
          {currentStep === 'image' && showResizeFormats && (
            <div className="resizeFormatPanel">
              <div className="resizeFormatPanelHeader">
                <span>Формат при перетягивании</span>
              </div>
              <div className="resizeFormatList">
                {RESIZE_FORMATS.map((format) => (
                  <button
                    key={format.id}
                    type="button"
                    className={resizeFormatId === format.id ? 'active' : ''}
                    onClick={() => applyResizeFormat(format)}
                  >
                    {format.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {aiPromptOpen && (
            <div className="aiPromptPanel" role="dialog" aria-modal="true">
              <div className="aiPromptHeader">
                <strong>Сгенерировать изображение</strong>
                <button
                  type="button"
                  aria-label="Закрыть генерацию"
                  onClick={() => setAiPromptOpen(false)}
                >
                  ×
                </button>
              </div>
              <textarea
                ref={aiPromptInputRef}
                value={aiPrompt}
                rows={4}
                placeholder="Например: современный жилой комплекс у парка, мягкий дневной свет, фотореализм"
                onChange={(event) => setAiPrompt(event.target.value)}
              />
              {aiGenerationError && <p className="aiPromptError">{aiGenerationError}</p>}
              <button
                type="button"
                className="primaryButton"
                disabled={!aiPrompt.trim() || isGeneratingImage}
                onClick={generateImageWithAi}
              >
                {isGeneratingImage ? 'Генерирую...' : 'Сгенерировать'}
              </button>
            </div>
          )}
        </div>
        </div>
      </section>
    </main>
  );
}

export default App;
