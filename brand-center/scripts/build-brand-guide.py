from __future__ import annotations

import base64
from pathlib import Path

from weasyprint import HTML

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "downloads" / "Etalon_Brand_Guide_2025.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

DOWNLOAD_BASE = "https://etaon.ivankamaldinov.workers.dev/downloads"
DOWNLOAD_BAR = f"""
<div class="download-bar" aria-label="Материалы для скачивания">
  <a href="{DOWNLOAD_BASE}/Etalon_Brand_Guide_2025.pdf">Фирменный стиль <b>↓</b></a>
  <a href="{DOWNLOAD_BASE}/Etalon_Logos_All_Formats.zip">Логотипы <b>↓</b></a>
  <a href="{DOWNLOAD_BASE}/Etalon_Symbol_All_Formats.zip">Знак <b>↓</b></a>
  <a href="{DOWNLOAD_BASE}/Etalon_Map_All_Formats.zip">Карта <b>↓</b></a>
  <a href="{DOWNLOAD_BASE}/Gilroy.zip">Gilroy <b>↓</b></a>
</div>
"""

map_svg = (ROOT / "assets" / "regions-map.svg").read_text(encoding="utf-8")
map_svg = map_svg.replace("#F5F5FA", "#E1E5ED").replace("#f5f5fa", "#E1E5ED")
map_data_uri = "data:image/svg+xml;base64," + base64.b64encode(map_svg.encode("utf-8")).decode("ascii")

html = r'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<style>
@font-face{font-family:Gilroy;src:url('fonts/Gilroy-Regular.ttf')}@font-face{font-family:Gilroy;src:url('fonts/Gilroy-Medium.ttf');font-weight:500}
@page{size:A4 landscape;margin:0}
*{box-sizing:border-box}
body{margin:0;font-family:Gilroy,Arial,sans-serif;color:#1e242e;background:#f6f7fa}
.page{width:297mm;height:210mm;padding:16mm 20mm 28mm;page-break-after:always;position:relative;overflow:hidden;background:#f6f7fa}
.page:last-child{page-break-after:auto}
.blue{background:#223e90;color:white}
.eyebrow{font-size:10pt;letter-spacing:.18em;text-transform:uppercase}
.section-title{display:flex;align-items:center;gap:5mm;margin-bottom:8mm}
.section-title span{font-size:9pt;color:#929aa8}
.section-title i{display:block;width:9mm;height:.35mm;background:#aeb7c7;transform:rotate(-45deg)}
h2{font-size:31pt;font-weight:500;line-height:1;margin:0 0 7mm}
h3{font-size:17pt;font-weight:500;margin:0 0 3mm}
.muted{color:#737d8d}
.body-copy{font-size:14pt;line-height:1.48;color:#596270}
.footer{position:absolute;right:20mm;bottom:5mm;font-size:7.5pt;color:#99a1af}
.blue .footer{color:rgba(255,255,255,.58)}
.download-bar{position:absolute;left:20mm;right:20mm;bottom:9mm;height:11mm;display:grid;grid-template-columns:1.45fr 1fr .75fr .8fr .8fr;gap:2.4mm;z-index:20}
.download-bar a{display:flex;align-items:center;justify-content:space-between;padding:0 4mm;border:1px solid #d9dee8;border-radius:999px;background:rgba(255,255,255,.88);color:#223e90;text-decoration:none;font-size:8pt;white-space:nowrap}
.download-bar b{font-size:11pt;font-weight:400;line-height:1}
.blue .download-bar a,.map-page .download-bar a{border-color:rgba(255,255,255,.45);background:rgba(255,255,255,.9);color:#223e90}
.cover h1{font-size:44pt;line-height:.96;font-weight:500;margin:40mm 0 9mm;max-width:220mm}
.cover>p{font-size:18pt;color:rgba(255,255,255,.76);max-width:175mm}
.logo-grid{display:grid;grid-template-columns:1fr 1fr;gap:7mm}
.logo-card{height:59mm;border:1px solid #dfe3eb;border-radius:6mm;background:white;padding:8mm;display:flex;align-items:center;justify-content:center;position:relative}
.logo-card img{max-width:64%;max-height:27mm}
.logo-card small{position:absolute;left:7mm;bottom:5mm;color:#737d8d;font-size:9pt}
.palette-featured{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-bottom:5mm}
.palette-support{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}
.swatch{border-radius:5mm;padding:6mm;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7mm;align-items:end;overflow:hidden}
.palette-featured .swatch{height:61mm}
.palette-support .swatch{height:55mm}
.swatch h3{font-size:17pt;margin:0 0 1mm}
.swatch .hex{font-size:15pt;font-weight:500;white-space:nowrap}
.swatch dl{margin:0;display:grid;gap:1.2mm;font-size:8.5pt}
.swatch dl div{display:flex;justify-content:space-between;gap:5mm;border-top:1px solid rgba(255,255,255,.28);padding-top:1.2mm}
.swatch dt{opacity:.72}.swatch dd{margin:0;text-align:right}
.swatch.light{color:#223e90}.swatch.light dl div{border-color:rgba(34,62,144,.18)}
.type-demo{display:grid;grid-template-columns:.8fr 1.2fr;gap:14mm}
.big-aa{font-size:86pt;color:#223e90;line-height:1}
.slogan{font-size:39pt;line-height:1.02;color:#223e90;margin:7mm 0}
.rules{display:grid;grid-template-columns:1.55fr .9fr;gap:8mm}
.safe{height:126mm;background:white;border:1px solid #dfe3eb;border-radius:6mm;display:flex;align-items:center;justify-content:center;position:relative}
.safe-diagram{position:relative;width:125mm;height:68mm;display:flex;align-items:center;justify-content:center;border:1.1px dashed #9da6b5}
.safe-logo{width:80mm;display:block}
.safe-o{position:absolute;width:14.2mm;height:13mm;opacity:.12}
.safe-o-top{left:50%;top:0;transform:translate(-50%,-100%)}
.safe-o-right{right:0;top:50%;transform:translate(100%,-50%)}
.safe-o-bottom{left:50%;bottom:0;transform:translate(-50%,100%)}
.safe-o-left{left:0;top:50%;transform:translate(-100%,-50%)}
.safe-caption{position:absolute;bottom:8mm;left:0;right:0;text-align:center;color:#737d8d;font-size:9pt}
.dont{height:126mm;background:white;border:1px solid #dfe3eb;border-radius:6mm;padding:8mm}
.dont h3{margin-bottom:8mm}
.dont ul{margin:0;padding:0}
.dont li{display:flex;align-items:center;gap:4mm;height:21mm;border-top:1px solid #e2e5eb;list-style:none;font-size:11pt;white-space:nowrap}
.dont li::before{content:'×';color:#ff4d00;font-size:15pt;line-height:1;flex:0 0 auto}
.map-page{padding:0;background:white}
.map-visual{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden}
.map-visual img{width:332mm;height:210mm;max-width:none;object-fit:contain;transform:scale(1.08)}
.map-copy{position:absolute;z-index:3;left:20mm;top:16mm;width:114mm;padding:9mm 10mm 8mm;border:1px solid rgba(218,223,232,.9);border-radius:6mm;background:rgba(255,255,255,.92)}
.map-copy h2{margin-bottom:5mm}
.map-copy .body-copy{font-size:12pt;margin:0}
.map-page .footer{z-index:20;background:rgba(255,255,255,.8);padding:1mm 2mm;border-radius:2mm}
</style>
</head>
<body>
<section class="page blue cover">
  <div class="eyebrow">Группа «Эталон»</div>
  <h1>Руководство<br>по фирменному стилю</h1>
  <p>Логотипы, цвета, типографика, правила использования и готовые материалы.</p>
  {{DOWNLOAD_BAR}}
  <div class="footer">Центр бренда · 2025</div>
</section>

<section class="page">
  <div class="section-title"><span>01</span><i></i><span>ОСНОВА БРЕНДА</span></div>
  <h2>Логотипы</h2>
  <div class="logo-grid">
    <div class="logo-card"><img src="assets/group-etalon.svg"><small>Группа «Эталон» · полная версия</small></div>
    <div class="logo-card"><img src="assets/etalon-ru.svg"><small>Кириллический логотип</small></div>
    <div class="logo-card"><img src="assets/etalon-en.svg"><small>Английский логотип</small></div>
    <div class="logo-card"><img src="assets/symbol-etalon.svg"><small>Фирменный знак</small></div>
  </div>
  {{DOWNLOAD_BAR}}
  <div class="footer">Группа «Эталон»</div>
</section>

<section class="page blue">
  <div class="section-title"><span style="color:#b9c5e5">02</span><i style="background:#8298d1"></i><span>ВИЗУАЛЬНЫЙ ЯЗЫК</span></div>
  <h2>Фирменные цвета</h2>
  <div class="palette-featured">
    <article class="swatch" style="background:#223E90;border:1px solid #7184bd">
      <div><h3>Фирменный синий</h3><div class="hex">#223E90</div></div>
      <dl><div><dt>RGB</dt><dd>34, 62, 144</dd></div><div><dt>CMYK</dt><dd>100, 85, 0, 0</dd></div><div><dt>Pantone</dt><dd>2728 C</dd></div><div><dt>RAL</dt><dd>5005</dd></div></dl>
    </article>
    <article class="swatch" style="background:#1E242E">
      <div><h3>Графитовый</h3><div class="hex">#1E242E</div></div>
      <dl><div><dt>RGB</dt><dd>30, 36, 46</dd></div><div><dt>CMYK</dt><dd>86, 72, 54, 68</dd></div><div><dt>Pantone</dt><dd>7547 C</dd></div><div><dt>RAL</dt><dd>7021</dd></div></dl>
    </article>
  </div>
  <div class="palette-support">
    <article class="swatch light" style="background:#919FC8"><div><h3>Синий 50%</h3><div class="hex">#919FC8</div></div><dl><div><dt>RGB</dt><dd>145, 159, 200</dd></div><div><dt>CMYK</dt><dd>50, 43, 0, 0</dd></div></dl></article>
    <article class="swatch light" style="background:#DEE2EE"><div><h3>Синий 15%</h3><div class="hex">#DEE2EE</div></div><dl><div><dt>RGB</dt><dd>222, 226, 238</dd></div><div><dt>CMYK</dt><dd>15, 13, 0, 0</dd></div></dl></article>
    <article class="swatch" style="background:#FF4D00;color:#1E242E"><div><h3>Акцентный оранжевый</h3><div class="hex">#FF4D00</div></div><dl><div><dt>RGB</dt><dd>255, 77, 0</dd></div><div><dt>CMYK</dt><dd>0, 79, 94, 0</dd></div></dl></article>
  </div>
  {{DOWNLOAD_BAR}}
  <div class="footer">Группа «Эталон»</div>
</section>

<section class="page">
  <div class="section-title"><span>03</span><i></i><span>ТИПОГРАФИКА</span></div>
  <h2>Gilroy</h2>
  <div class="type-demo">
    <div><div class="big-aa">Аа</div><p class="muted">Gilroy Medium<br>для заголовков и акцентов</p></div>
    <div><div class="slogan">Создаем<br>пространство<br>для жизни</div><p class="body-copy">Gilroy Regular используется для основного текста. Типографика должна оставаться ясной, современной и легко читаемой во всех коммуникациях.</p></div>
  </div>
  {{DOWNLOAD_BAR}}
  <div class="footer">Группа «Эталон»</div>
</section>

<section class="page">
  <div class="section-title"><span>04</span><i></i><span>ПРАВИЛА</span></div>
  <h2>Охранное поле</h2>
  <div class="rules">
    <div class="safe">
      <div class="safe-diagram">
        <img class="safe-logo" src="assets/safe-logo.svg">
        <img class="safe-o safe-o-top" src="assets/logo-o.svg">
        <img class="safe-o safe-o-right" src="assets/logo-o.svg">
        <img class="safe-o safe-o-bottom" src="assets/logo-o.svg">
        <img class="safe-o safe-o-left" src="assets/logo-o.svg">
      </div>
      <div class="safe-caption">Охранное поле равно высоте буквы «О»</div>
    </div>
    <div class="dont">
      <h3>Не допускается</h3>
      <ul>
        <li>Искажать пропорции</li>
        <li>Менять фирменные цвета</li>
        <li>Добавлять тени и эффекты</li>
        <li>Поворачивать или наклонять</li>
      </ul>
    </div>
  </div>
  {{DOWNLOAD_BAR}}
  <div class="footer">Группа «Эталон»</div>
</section>

<section class="page map-page">
  <div class="map-visual"><img src="{{MAP_DATA_URI}}"></div>
  <div class="map-copy">
    <div class="section-title"><span>05</span><i></i><span>ГЕОГРАФИЯ</span></div>
    <h2>Карта присутствия</h2>
    <p class="body-copy">Используйте чистую векторную карту без точек и подписей. Территории присутствия выделяются фирменным синим.</p>
  </div>
  {{DOWNLOAD_BAR}}
  <div class="footer">Группа «Эталон»</div>
</section>
</body>
</html>'''

html = html.replace("{{DOWNLOAD_BAR}}", DOWNLOAD_BAR).replace("{{MAP_DATA_URI}}", map_data_uri)
HTML(string=html, base_url=str(ROOT)).write_pdf(str(OUTPUT))
print(OUTPUT)
