#!/usr/bin/env python3
from __future__ import annotations

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import re
import sys

AUDITOR = Path(__file__).resolve()
ROOT = AUDITOR.parents[1]
INDEX = ROOT / "index.html"
ALLOWED_EXTERNAL_HOSTS = {"etaon.ivankamaldinov.workers.dev", "t.me"}


class Element:
    def __init__(self, tag: str, attrs: dict[str, str | None]) -> None:
        self.tag = tag
        self.attrs = attrs
        self.text: list[str] = []


class AuditParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[Element] = []
        self.ids: list[str] = []
        self.refs: list[tuple[str, str, str, dict[str, str | None]]] = []
        self.errors: list[str] = []
        self.stylesheets: list[str] = []
        self.scripts: list[str] = []
        self.html_lang: str | None = None
        self.has_viewport = False
        self.has_description = False
        self.has_icon = False

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = dict(attrs_list)
        element = Element(tag, attrs)
        self.stack.append(element)

        if tag == "html":
            self.html_lang = attrs.get("lang")
        if tag == "meta":
            if attrs.get("name") == "viewport":
                self.has_viewport = True
            if attrs.get("name") == "description" and attrs.get("content", "").strip():
                self.has_description = True
        if tag == "link":
            rel = (attrs.get("rel") or "").split()
            href = attrs.get("href")
            if "icon" in rel and href:
                self.has_icon = True
            if "stylesheet" in rel and href:
                self.stylesheets.append(href)
        if tag == "script" and attrs.get("src"):
            self.scripts.append(attrs["src"] or "")
        if attrs.get("id"):
            self.ids.append(attrs["id"] or "")
        if tag == "img" and "alt" not in attrs:
            self.errors.append(f"Изображение без alt: {attrs.get('src', '<без src>')}")
        if "onclick" in attrs:
            self.errors.append(f"Встроенный onclick запрещен: <{tag}>")

        for attr in ("href", "src"):
            value = attrs.get(attr)
            if value:
                self.refs.append((tag, attr, value, attrs))

    def handle_startendtag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs_list)
        self.handle_endtag(tag)

    def handle_data(self, data: str) -> None:
        for element in self.stack:
            element.text.append(data)

    def handle_endtag(self, tag: str) -> None:
        for index in range(len(self.stack) - 1, -1, -1):
            element = self.stack[index]
            if element.tag != tag:
                continue
            del self.stack[index:]
            if tag in {"a", "button"}:
                name = (element.attrs.get("aria-label") or "").strip()
                text = " ".join("".join(element.text).split())
                if not name and not text:
                    self.errors.append(f"Интерактивный элемент без доступного имени: <{tag}>")
            return


def local_path(value: str, base: Path) -> Path | None:
    parsed = urlparse(value)
    if parsed.scheme in {"http", "https", "mailto", "tel", "data"} or value.startswith("//"):
        return None
    clean = unquote(parsed.path)
    if not clean:
        return None
    if clean.startswith("/"):
        return ROOT / clean.lstrip("/")
    return (base / clean).resolve()


def audit_css(css_path: Path, errors: list[str]) -> None:
    text = css_path.read_text(encoding="utf-8")
    without_comments = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    if without_comments.count("{") != without_comments.count("}"):
        errors.append(f"Несбалансированные фигурные скобки в {css_path.relative_to(ROOT)}")

    for raw in re.findall(r"url\(([^)]+)\)", without_comments):
        value = raw.strip().strip("'\"")
        path = local_path(value, css_path.parent)
        if path and not path.is_file():
            errors.append(f"CSS ссылается на отсутствующий файл: {css_path.name} → {value}")


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    html = INDEX.read_text(encoding="utf-8")
    parser = AuditParser()
    parser.feed(html)
    errors.extend(parser.errors)

    if parser.html_lang != "ru":
        errors.append("У html должен быть lang=ru")
    if not parser.has_viewport:
        errors.append("Нет meta viewport")
    if not parser.has_description:
        errors.append("Нет meta description")
    if not parser.has_icon:
        errors.append("Нет favicon")

    duplicate_ids = [item for item, count in Counter(parser.ids).items() if count > 1]
    if duplicate_ids:
        errors.append(f"Повторяющиеся id: {', '.join(sorted(duplicate_ids))}")

    id_set = set(parser.ids)
    for tag, attr, value, attrs in parser.refs:
        if value.startswith("#"):
            anchor = value[1:]
            if anchor and anchor not in id_set:
                errors.append(f"Битый якорь: {value}")
            continue

        parsed = urlparse(value)
        if parsed.scheme in {"http", "https"}:
            if parsed.netloc and parsed.netloc not in ALLOWED_EXTERNAL_HOSTS:
                errors.append(f"Внешняя ссылка в интерфейсе: {value}")
            continue

        path = local_path(value, INDEX.parent)
        if path and not path.is_file():
            errors.append(f"Отсутствует локальный файл: {tag}[{attr}]={value}")

        if tag == "a" and "download" in attrs and parsed.scheme in {"http", "https"}:
            errors.append(f"download используется для внешней ссылки: {value}")

    for duplicate in (parser.stylesheets, parser.scripts):
        repeated = [item for item, count in Counter(duplicate).items() if count > 1]
        if repeated:
            errors.append(f"Повторно подключены ресурсы: {', '.join(repeated)}")

    for stylesheet in parser.stylesheets:
        path = local_path(stylesheet, INDEX.parent)
        if path and path.is_file():
            audit_css(path, errors)

    text_files = [
        INDEX,
        ROOT / "app.js",
        ROOT / "language-switch-fix.js",
        *sorted((ROOT / "scripts").glob("*")),
    ]
    for path in text_files:
        if path.resolve() == AUDITOR:
            continue
        if not path.is_file() or path.suffix.lower() in {".pdf", ".zip", ".ttf"}:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        if "at.adobe.com" in text:
            errors.append(f"Осталась зависимость от Adobe: {path.relative_to(ROOT)}")
        if re.search(r"\b(?:TODO|FIXME)\b", text):
            warnings.append(f"Есть TODO/FIXME: {path.relative_to(ROOT)}")

    required_downloads = [
        "Etalon_Brand_Guide_2025.pdf",
        "Etalon_Logos_All_Formats.zip",
        "Etalon_Symbol_All_Formats.zip",
        "Etalon_Map_All_Formats.zip",
        "Gilroy.zip",
    ]
    for filename in required_downloads:
        path = ROOT / "downloads" / filename
        if not path.is_file() or path.stat().st_size == 0:
            errors.append(f"Не собран файл для скачивания: downloads/{filename}")

    print(f"Проверено ссылок и ресурсов: {len(parser.refs)}")
    print(f"Проверено якорей: {sum(1 for _, _, value, _ in parser.refs if value.startswith('#'))}")
    print(f"Проверено CSS-файлов: {len(parser.stylesheets)}")
    if warnings:
        print("Предупреждения:")
        for warning in warnings:
            print(f"  - {warning}")
    if errors:
        print("Ошибки аудита:", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print("Статический аудит пройден без ошибок.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
