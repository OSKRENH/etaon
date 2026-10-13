#!/usr/bin/env python3
"""Собирает раздел «Проекты» в index.html из projects.json.

Запуск: python3 brand-center/scripts/build-projects.py
Раздел лежит между маркерами <!-- projects:start --> и <!-- projects:end -->,
порядок городов и проектов задаёт projects.json.
"""
import json
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / "projects.json").read_text(encoding="utf-8"))
cities, projects = data["cities"], data["projects"]


def status_label(status):
    return status if status == "Дом сдан" else f"Сдача {status}"


def city_slug(city):
    return str(cities.index(city) + 1)


tabs = []
for i, city in enumerate(cities):
    count = sum(1 for p in projects if p["city"] == city)
    tabs.append(f'<button type="button" class="project-tab{" is-active" if i == 0 else ""}" data-city="{city_slug(city)}" aria-pressed="{"true" if i == 0 else "false"}">{escape(city)} <small>{count}</small></button>')

cards = []
for p in projects:
    done = p["status"] == "Дом сдан"
    cover = (
        f'<span class="project-cover" aria-hidden="true"><b>{escape(p["name"][0])}</b>'
        f'<img src="{escape(p["image"])}" alt="" width="370" height="370" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>'
        if p.get("image")
        else ""
    )
    cards.append(
        f'<a class="project-card" data-city="{city_slug(p["city"])}" href="{escape(p["url"])}" target="_blank" rel="noopener noreferrer">'
        f'{cover}'
        f'<strong>{escape(p["name"])}</strong>'
        f'<span class="project-place">{escape(p["city"])} · {escape(p["district"])}</span>'
        f'<em class="project-status{" is-done" if done else ""}">{escape(status_label(p["status"]))}</em>'
        f'<i aria-hidden="true">↗</i></a>'
    )

search = "проекты жк объекты города " + " ".join(cities + [p["name"] for p in projects])
section = f'''<!-- projects:start -->
    <section class="section projects-section" id="projects" aria-labelledby="projects-title" data-search="{escape(search.lower())}">
      <div class="section-heading"><div><p class="eyebrow section-kicker"><span>04</span><i aria-hidden="true"></i><span>ПРОЕКТЫ</span></p><h2 id="projects-title">Проекты</h2></div><p>Жилые комплексы Группы «Эталон» в {len(cities)} городах. Карточка ведёт на страницу проекта на etalongroup.ru.</p></div>
      <div class="project-tabs" role="group" aria-label="Город">{"".join(tabs)}</div>
      <div class="project-grid">{"".join(cards)}</div>
    </section>
    <!-- projects:end -->'''

path = ROOT / "index.html"
html = path.read_text(encoding="utf-8")
if "<!-- projects:start -->" in html:
    html = re.sub(r"<!-- projects:start -->.*?<!-- projects:end -->", lambda m: section, html, flags=re.S)
else:
    marker = '    <section class="section map-section" id="map"'
    assert marker in html, "не найден раздел карты"
    html = html.replace(marker, section + "\n\n" + marker, 1)
path.write_text(html, encoding="utf-8")
print(f"Проекты в index.html: {len(projects)}, городов: {len(cities)}")
