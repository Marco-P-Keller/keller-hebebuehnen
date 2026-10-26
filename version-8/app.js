/* Version 8 – «Seriös», Bühnen-Karten mit eigenen Fotos (Basis Version 7) */
(function () {
  'use strict';

  var K = window.KELLER;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var NS = 'http://www.w3.org/2000/svg';
  var hasIO = 'IntersectionObserver' in window;
  function svgEl(tag, attrs, parent) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; }
  function smooth(y) { window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); }
  function toEl(el, off) { smooth(el.getBoundingClientRect().top + window.pageYOffset - (off == null ? 80 : off)); }
  function fmt(n, dec) { var s = n.toFixed(dec); var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '’'); return p.join('.'); }
  function onView(el, fn, threshold) {
    if (!hasIO || reduce) { fn(); return; }
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); fn(); } }, { threshold: threshold == null ? .3 : threshold });
    io.observe(el);
  }
  function countUp(el, to, dec, dur) {
    if (reduce) { el.textContent = fmt(to, dec); return; }
    var t0 = performance.now(); dur = dur || 1400;
    (function step() {
      var k = Math.min(1, (performance.now() - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(to * e, dec);
      if (k < 1) requestAnimationFrame(step);
    })();
  }

  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ---------- Fotos ---------- */
  var IMG = 'assets/img/';
  /* Name: [Breite, Höhe, verfügbare Breiten als WebP] */
  var PH = {
    '180-werkhof': [2400, 3200, [800, 1400]], '180-dach': [2400, 1800, [800, 1600]], '180-holzlager': [2400, 1800, [800, 1600]], 'transport': [2400, 1800, [800, 1600]],
    '160-fassade': [2400, 1800, [800, 1600]], '160-wohnblock': [2400, 1800, [800, 1600]],
    'goldlift-fassade': [2400, 3200, [800, 1400]], 'goldlift-halle': [2400, 1800, [800, 1600]], 'goldlift-stuetzen': [2400, 1800, [800, 1600]], 'goldlift-transport': [2400, 1800, [800, 1600]],
    'einsatz-altbau': [2400, 3200, [800, 1400]], 'einsatz-wohnhaus': [2400, 1800, [800, 1600]], 'einsatz-holzbau': [2400, 1800, [800, 1600]],
    'einsatz-hinterhof': [2400, 3200, [800, 1400]], 'einsatz-buero': [2400, 3200, [800, 1400]], 'einsatz-festzelt': [2400, 1800, [800, 1600]], 'einsatz-halle': [2400, 3200, [800, 1400]],
    'fleet-180': [1200, 1500, [600, 1000]], 'fleet-160': [1200, 1500, [600, 1000]], 'fleet-goldlift': [1200, 1500, [600, 1000]],
    'c-goldlift': [2400, 1600, [800, 1600]], 'c-maler': [1729, 2306, [700, 1300]]
  };
  /* Symbol- und Beispielbilder von Wikimedia Commons – Lizenz verlangt Namensnennung */
  var BYSA3 = 'https://creativecommons.org/licenses/by-sa/3.0/deed.de', BYSA4 = 'https://creativecommons.org/licenses/by-sa/4.0/deed.de';
  var COMMONS = {
    'c-hero': { author: 'Manitou Group', file: 'Nacelle_élévatrice_Manitou.jpg', lic: 'CC BY-SA 3.0', licUrl: BYSA3, title: 'Manitou-Gelenkteleskopbühne im Hallenbau (Titelbild)' },
    'c-goldlift': { author: 'Frank Vincentz', file: 'Pájara_La_Lajita_-_Oasis_Park_29_ies.jpg', lic: 'CC BY-SA 3.0', licUrl: BYSA3, title: 'Hinowa Goldlift 14.70, eingefahren' },
    'c-maler': { author: 'Traumrune', file: 'Peintre_facade_2.JPG', lic: 'CC BY-SA 3.0', licUrl: BYSA3, title: 'Malerarbeiten an einer Fassade' }
  };
  function srcset(n) { return PH[n][2].map(function (w) { return IMG + n + '-' + w + '.webp ' + w + 'w'; }).join(', '); }
  function large(n) { var z = PH[n][2].filter(function (w) { return w <= 1600; }); return IMG + n + '-' + (z.length ? z[z.length - 1] : PH[n][2][0]) + '.webp'; }
  function img(n, alt, sizes) {
    var d = PH[n];
    return '<img src="' + IMG + n + '-' + d[2][0] + '.webp" srcset="' + srcset(n) + '" sizes="' + sizes + '" width="' + d[0] + '" height="' + d[1] + '" alt="' + alt + '" loading="lazy" decoding="async">';
  }
  function credit(n) {
    var c = COMMONS[n]; if (!c) return '';
    return 'Foto: <a href="https://commons.wikimedia.org/wiki/File:' + encodeURI(c.file) + '" target="_blank" rel="noopener">' + c.author + '</a>, <a href="' + c.licUrl + '" target="_blank" rel="noopener">' + c.lic + '</a>';
  }
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function capText(n, cap) { var c = COMMONS[n]; return cap + (c ? ' – Foto: ' + c.author + ', ' + c.lic + ', Wikimedia Commons' : ''); }

  /* ---------- Header, Fortschritt, Menü ---------- */
  var header = $('[data-header]'), prog = $('[data-progress]');
  var menuBtn = $('[data-menu-btn]'), menu = $('[data-menu]');
  function menuOpen() { return menuBtn.getAttribute('aria-expanded') === 'true'; }
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    $('.sr', menuBtn).textContent = open ? 'Menü schliessen' : 'Menü öffnen';
    if (open) { menu.hidden = false; requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); }); html.style.overflow = 'hidden'; }
    else { menu.classList.remove('is-open'); html.style.overflow = ''; setTimeout(function () { if (!menuOpen()) menu.hidden = true; }, 320); }
    updateBar();
  }
  menuBtn.addEventListener('click', function () { setMenu(!menuOpen()); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen()) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1160 && menuOpen()) setMenu(false); });

  var navLinks = $$('.nav a');
  if (hasIO) {
    var so = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'flotte', 'einsatzbereiche', 'finder', 'reichweite', 'vergleich', 'preise', 'maschinen', 'anfrage', 'kontakt'].forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ---------- Hero-Titel wortweise ---------- */
  var ht = $('[data-split]');
  if (ht && !reduce) {
    var i = 0;
    ht.innerHTML = ht.innerHTML.split(/\s+/).map(function (w) { return '<span class="w" style="--i:' + (i++) + '">' + w + '</span>'; }).join(' ');
  }

  /* ---------- Gruppenbild: alle drei massstabsgetreu ---------- */
  var group = $('[data-group]'), glabels = $('[data-group-labels]');
  var POS = { atj180: 1540, atj160: 770, goldlift: 0 };
  var GX0 = -440, GX1 = 2250, GY0 = -1960, GY1 = 70;
  var gsvg = svgEl('svg', { viewBox: [GX0, GY0, GX1 - GX0, GY1 - GY0].join(' '), role: 'img', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMax meet' });
  group.insertBefore(gsvg, glabels);
  svgEl('rect', { x: GX0, y: 0, width: GX1 - GX0, height: GY1, 'class': 'g-floor' }, gsvg);
  svgEl('line', { x1: -380, x2: -380, y1: 0, y2: -1800, 'class': 'g-tick' }, gsvg);
  for (var m = 0; m <= 18; m++) {
    svgEl('line', { x1: -380, x2: m % 2 ? -362 : -350, y1: -m * 100, y2: -m * 100, 'class': 'g-tick' }, gsvg);
    if (m % 2 === 0) { var tx = svgEl('text', { x: -396, y: -m * 100 + 10, 'text-anchor': 'end', 'class': 'klift-label' }, gsvg); tx.textContent = m + ' m'; }
  }
  var gLifts = {};
  ['atj180', 'atj160', 'goldlift'].forEach(function (id) {
    var mm = K.byId(id);
    var lab = document.createElement('div'); lab.className = 'glabel';
    lab.style.left = ((POS[id] + 70 - GX0) / (GX1 - GX0) * 100) + '%';
    lab.innerHTML = '<b><i data-gnum>0.00</i> m</b><em>' + mm.brand + ' ' + mm.name + '</em>';
    glabels.appendChild(lab);
    var num = $('[data-gnum]', lab);
    var L = KLift.create(gsvg, { model: id, onUpdate: function (u) { num.textContent = u.work.toFixed(2); } });
    var vb = L.svg.getAttribute('viewBox').split(' ').map(Number);
    L.svg.setAttribute('x', POS[id] + vb[0]); L.svg.setAttribute('y', vb[1]); L.svg.setAttribute('width', vb[2]); L.svg.setAttribute('height', vb[3]);
    gLifts[id] = L;
  });
  var spacer = document.createElement('div'); spacer.className = 'group-spacer'; group.parentNode.appendChild(spacer);
  onView(group, function () {
    if (reduce) Object.keys(gLifts).forEach(function (k) { gLifts[k].setProgress(1); });
    else ['goldlift', 'atj160', 'atj180'].forEach(function (id, k) { setTimeout(function () { gLifts[id].animateTo(1, 2800); }, 150 + k * 380); });
  }, .3);

  /* ---------- Bühnen: drei Karten mit eigenen Fotos ---------- */
  var FLEET_PH = { atj180: 'fleet-180', atj160: 'fleet-160', goldlift: 'fleet-goldlift' };
  var FLEET_ALT = { atj180: 'Unsere Manitou 180 ATJ an der Dachuntersicht eines Gebäudes', atj160: 'Unsere Manitou 160 ATJ vor einem Mehrfamilienhaus, der Korb an der Dachkante', goldlift: 'Unsere Hinowa Goldlift 14.70 an der Fassade eines Mehrfamilienhauses' };
  $('[data-fleet-list]').innerHTML = K.MACHINES.map(function (mm) {
    return '<li data-reveal><a class="fleet-card" href="#m-' + mm.id + '">' +
      '<span class="fleet-card-img">' + img(FLEET_PH[mm.id], FLEET_ALT[mm.id], '(max-width: 760px) 80vw, 33vw') + '</span>' +
      '<span class="fleet-card-body"><small>' + mm.brand + ' · ' + mm.type + '</small><b>' + mm.name + '</b>' +
      '<span class="fleet-card-facts"><span><i>' + mm.workHeight.toFixed(2) + ' m</i>Arbeitshöhe</span><span><i>' + mm.payload + ' kg</i>Korblast</span><span><i>ab CHF ' + K.chf(mm.priceLong) + '</i>pro Tag</span></span>' +
      '<span class="fleet-card-more">Mehr Fotos und Daten</span></span></a></li>';
  }).join('');

  /* ---------- Finder ---------- */
  var VB = [-200, -1900, 860, 1930];
  var canvas = $('[data-lineup-canvas]');
  var gridLayer = document.createElement('div'); gridLayer.className = 'lineup-grid'; gridLayer.setAttribute('aria-hidden', 'true');
  var cols = document.createElement('div'); cols.className = 'lineup-cols';
  var hl = document.createElement('div'); hl.className = 'lineup-hl'; hl.setAttribute('aria-hidden', 'true');
  var hlTag = document.createElement('span'); hlTag.className = 'lineup-hl-tag'; hl.appendChild(hlTag);
  canvas.appendChild(gridLayer); canvas.appendChild(cols); canvas.appendChild(hl);
  var verdictsEl = $('[data-verdicts]');
  var F = {};
  K.MACHINES.forEach(function (mm) {
    var c = document.createElement('div'); c.className = 'lineup-col'; cols.appendChild(c);
    var cur = 0;
    var L = KLift.create(c, { model: mm.id, viewBox: VB, label: mm.brand + ' ' + mm.name, onUpdate: function (u) { cur = u.work; } });
    /* Tabelle Fortschritt → Arbeitshöhe, um gezielt eine Höhe anzufahren */
    var table = [], max = 0;
    for (var s = 0; s <= 160; s++) { L.setProgress(s / 160); max = Math.max(max, cur); table.push(max); }
    L.setProgress(0);
    var v = document.createElement('article'); v.className = 'verdict';
    v.innerHTML = '<span class="verdict-badge">Empfehlung</span><p class="verdict-brand">' + mm.brand + '</p><h3 class="verdict-name">' + mm.name + '</h3>' +
      '<p class="verdict-state" data-state></p><p class="verdict-price"><b>CHF ' + K.chf(mm.priceDay) + '</b> pro Tag, ab 6 Tagen CHF ' + K.chf(mm.priceLong) + '</p>' +
      '<button class="btn btn--line btn--sm" type="button" data-request="' + mm.id + '">Anfragen</button>';
    verdictsEl.appendChild(v);
    F[mm.id] = { m: mm, col: c, lift: L, table: table, card: v, state: $('[data-state]', v) };
  });
  function tFor(id, h) {
    var tb = F[id].table;
    if (h <= tb[0]) return 0;
    for (var k = 1; k < tb.length; k++) {
      if (tb[k] >= h) { var a = tb[k - 1], b = tb[k]; return (k - 1 + (b > a ? (h - a) / (b - a) : 0)) / (tb.length - 1); }
    }
    return 1;
  }
  function yFor(meters) {
    var s = F.atj180.lift.svg, ctm = s.getScreenCTM(); if (!ctm) return 0;
    var pt = s.createSVGPoint(); pt.x = 0; pt.y = -meters * 100;
    return pt.matrixTransform(ctm).y - canvas.getBoundingClientRect().top;
  }
  function drawGrid() {
    gridLayer.innerHTML = '';
    for (var mm = 0; mm <= 18; mm += 2) {
      var gl = document.createElement('div'); gl.className = 'lineup-gl' + (mm === 0 ? ' lineup-gl--ground' : '');
      gl.style.top = yFor(mm) + 'px';
      if (mm) { var sp = document.createElement('span'); sp.textContent = mm + ' m'; gl.appendChild(sp); }
      gridLayer.appendChild(gl);
    }
    hl.style.top = yFor(need) + 'px';
  }

  var range = $('[data-need]'), needOut = $('[data-need-out]'), result = $('[data-fx-result]');
  var need = parseFloat(range.value), finderSeen = false, recommended = null;
  function opt(name) { var r = $('input[name="' + name + '"]:checked'); return r ? r.value : null; }
  function updateFinder() {
    need = Math.round(parseFloat(range.value) * 10) / 10;
    range.style.setProperty('--p', ((need - range.min) / (range.max - range.min) * 100) + '%');
    needOut.innerHTML = need.toFixed(1) + '<small>m</small>';
    hlTag.textContent = need.toFixed(1) + ' m';
    hl.style.top = yFor(need) + 'px';
    var access = opt('access'), persons = +opt('persons');
    var fits = [];
    Object.keys(F).forEach(function (id) {
      var f = F[id], mm = f.m;
      var reach = id === 'goldlift' && persons >= 2 ? 12.6 : mm.workHeight;
      var why = '', ok = true;
      if (access === 'narrow' && id !== 'goldlift') { ok = false; why = 'Zu breit für enge Zufahrten (' + mm.width.toFixed(2) + ' m)'; }
      else if (persons === 3 && id !== 'atj160') { ok = false; why = 'Höchstens 2 Personen im Korb'; }
      else if (reach < need) { ok = false; why = id === 'goldlift' && persons >= 2 ? 'Mit 2 Personen nur bis 12.60 m' : 'Reicht nur bis ' + reach.toFixed(2) + ' m'; }
      else why = 'Passt – reicht bis ' + reach.toFixed(2) + ' m';
      f.state.textContent = why;
      f.state.className = 'verdict-state ' + (ok ? 'is-ok' : 'is-no');
      f.col.classList.toggle('is-out', !ok);
      if (ok) fits.push(mm);
      var target = Math.min(need, reach);
      if (finderSeen) { var t = tFor(id, target); if (reduce) f.lift.setProgress(t); else f.lift.animateTo(t, 650); }
    });
    var best = fits.sort(function (a, b) { return a.priceDay - b.priceDay || a.workHeight - b.workHeight; })[0];
    recommended = best ? best.id : null;
    Object.keys(F).forEach(function (id) {
      var on = best && best.id === id;
      F[id].card.classList.toggle('is-best', !!on);
      var b = $('[data-request]', F[id].card); b.className = 'btn btn--sm ' + (on ? 'btn--rust' : 'btn--line');
    });
    result.innerHTML = best
      ? 'Für <b>' + need.toFixed(1) + ' m</b> empfehlen wir die <b>' + best.brand + ' ' + best.name + '</b> – ab CHF ' + K.chf(best.priceLong) + ' pro Tag.'
      : 'Für diese Kombination passt keine unserer Bühnen. Rufen Sie uns an: <a href="tel:+41719662611">071 966 26 11</a>';
  }
  range.addEventListener('input', updateFinder);
  $('.fx').addEventListener('change', function (e) { if (e.target.name === 'access' || e.target.name === 'persons') updateFinder(); });
  updateFinder();
  requestAnimationFrame(drawGrid);
  window.addEventListener('resize', drawGrid);
  if (window.ResizeObserver) new ResizeObserver(drawGrid).observe(canvas);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawGrid);
  onView(canvas, function () { finderSeen = true; updateFinder(); }, .3);

  /* ---------- Reichweite ---------- */
  KReach.create($('[data-reach]'), { onRequest: function (id) { requestMachine(id); } });

  /* ---------- Maschinen-Spotlights ---------- */
  var SPOT = {
    atj180: { photos: [['180-dach', 'Arbeiten an der Dachuntersicht – seitlich weit ausgefahren'], ['180-holzlager', 'Über das Holzlager hinweg bis zur Terrasse'], ['180-werkhof', '«Miete mich!» – voll ausgefahren vor unserem Werkhof in Sirnach'], ['transport', 'Verladen auf dem Tieflader']],
      tag: 'Grösste Arbeitshöhe', pitch: '18 Meter Arbeitshöhe und über 10 Meter seitliche Reichweite – für Dach, Fassade und Baumpflege.', tone: '', facts: ['Allradantrieb & Allradlenkung', 'Korb 1.80 × 0.80 m', 'Kubota-Diesel, 18.5 kW', 'Oberwagen dreht 350°'], stats: [[18.19, 2, 'm', 'Arbeitshöhe'], [10.51, 2, 'm', 'Seitliche Reichweite'], [230, 0, 'kg', 'Korblast'], [45, 0, '%', 'Steigfähigkeit']] },
    atj160: { photos: [['160-fassade', 'Fassade am Mehrfamilienhaus – der Korb reicht bis unters Dach'], ['160-wohnblock', 'Über die Balkone hinweg bis an die Dachkante']],
      tag: 'Grösste Korblast', pitch: '408 kg Korblast und Platz für drei Personen im grössten Arbeitskorb – geeignet, wenn Material mit nach oben muss.', tone: 'stone', flip: true, facts: ['Grösster Korb: 2.30 × 0.90 m', 'Allradantrieb', 'Motor nach Stufe V', 'Steigfähigkeit 45 %'], stats: [[408, 0, 'kg', 'Korblast'], [3, 0, 'Pers.', 'Im Arbeitskorb'], [16.21, 2, 'm', 'Arbeitshöhe'], [8.52, 2, 'm', 'Seitliche Reichweite']] },
    goldlift: { photos: [['goldlift-fassade', 'Bis unters Dach eines Mehrfamilienhauses'], ['goldlift-halle', 'In der Halle – auf Raupen über den Industrieboden'], ['goldlift-stuetzen', 'Abgestützt auf vier Tellern – die Raupen heben vom Boden ab'], ['goldlift-transport', 'Eingefahren: nur 78 cm breit']],
      tag: 'Schmalste Bauweise', pitch: 'Auf Raupen, rund 1’700 kg leicht und mit Durchfahrt ab 85 cm – kommt durch Gartentore und Türen, auf Wunsch abgasfrei mit 230-V-Elektromotor.', tone: 'dark', facts: ['Raupenfahrwerk', 'Durchfahrt ab 0.85 m', 'Abstützbar bis 10° Neigung', 'Benzin- und Elektromotor'], stats: [[0.78, 2, 'm', 'Breite eingefahren'], [14, 2, 'm', 'Arbeitshöhe'], [1700, 0, 'kg', 'Gewicht'], [230, 0, 'V', 'Elektromotor, abgasfrei']] }
  };
  var spots = $('[data-spots]');
  K.MACHINES.forEach(function (mm) {
    var S = SPOT[mm.id];
    var sec = document.createElement('section');
    sec.className = 'spot' + (S.tone ? ' spot--' + S.tone : '') + (S.flip ? ' spot--flip' : '');
    sec.id = 'm-' + mm.id;
    sec.setAttribute('aria-labelledby', 'm-' + mm.id + '-title');
    sec.innerHTML =
      '<div class="wrap spot-grid">' +
        '<div class="spot-copy">' +
          '<p class="spot-tag" data-reveal>' + S.tag + '</p>' +
          '<h2 class="spot-name" id="m-' + mm.id + '-title" data-reveal><span class="spot-brand">' + mm.brand + ' · ' + mm.type + '</span>' + mm.name + '</h2>' +
          '<p class="spot-pitch" data-reveal>' + (S.pitch || mm.pitch) + '</p>' +
          '<dl class="spot-stats">' + S.stats.map(function (s) {
            return '<div data-reveal><dd><span data-count="' + s[0] + '" data-dec="' + s[1] + '">' + fmt(0, s[1]) + '</span><small>' + s[2] + '</small></dd><dt>' + s[3] + '</dt></div>';
          }).join('') + '</dl>' +
          '<ul class="spot-hl" data-reveal>' + S.facts.map(function (h) { return '<li>' + h + '</li>'; }).join('') + '</ul>' +
          '<div class="spot-foot" data-reveal>' +
            '<p class="spot-price"><b>CHF ' + K.chf(mm.priceDay) + ' pro Tag</b>ab 6 Tagen CHF ' + K.chf(mm.priceLong) + '</p>' +
            '<button class="btn btn--rust" type="button" data-request="' + mm.id + '">Anfragen</button>' +
            '<a class="btn btn--line" href="#vergleich">Alle Daten</a>' +
          '</div>' +
        '</div>' +
        '<div class="spot-media" data-reveal>' +
          '<div class="media-tabs" role="tablist" aria-label="Ansicht ' + mm.name + '">' +
            '<button type="button" role="tab" id="t-' + mm.id + '-p" aria-controls="p-' + mm.id + '-p" aria-selected="true" data-tab="photo">Fotos</button>' +
            '<button type="button" role="tab" id="t-' + mm.id + '-s" aria-controls="p-' + mm.id + '-s" aria-selected="false" tabindex="-1" data-tab="scale">Massstab</button>' +
          '</div>' +
          '<div class="media-panel media-photo" role="tabpanel" id="p-' + mm.id + '-p" aria-labelledby="t-' + mm.id + '-p" data-panel="photo">' +
            '<button class="media-main zoom" type="button" data-lb-open="spot-' + mm.id + '" data-idx="0" aria-label="Foto vergrössern">' + img(S.photos[0][0], esc(S.photos[0][1]), '(max-width: 1024px) 100vw, 50vw') + '</button>' +
            '<p class="media-cap" data-media-cap></p>' +
            '<div class="media-thumbs">' + S.photos.map(function (ph, k) {
              return '<button class="media-thumb' + (k ? '' : ' is-on') + '" type="button" data-lb="spot-' + mm.id + '" data-src="' + large(ph[0]) + '" data-cap="' + esc(capText(ph[0], ph[1])) + '" data-ph="' + ph[0] + '" data-alt="' + esc(ph[1]) + '" data-credit="' + esc(credit(ph[0])) + '" aria-label="Foto ' + (k + 1) + ': ' + esc(ph[1]) + '" aria-pressed="' + (k ? 'false' : 'true') + '">' + img(ph[0], '', '110px') + '</button>';
            }).join('') + '</div>' +
          '</div>' +
          '<div class="media-panel spot-art" role="tabpanel" id="p-' + mm.id + '-s" aria-labelledby="t-' + mm.id + '-s" data-panel="scale" hidden></div>' +
        '</div>' +
      '</div>';
    spots.appendChild(sec);
    setupMedia(sec, mm);
    onView($('.spot-stats', sec), function () {
      $$('[data-count]', sec).forEach(function (n, k) { setTimeout(function () { countUp(n, parseFloat(n.getAttribute('data-count')), +n.getAttribute('data-dec'), 1500); }, k * 110); });
    }, .4);
  });

  function setupMedia(sec, mm) {
    var main = $('.media-main', sec), cap = $('[data-media-cap]', sec), thumbs = $$('.media-thumb', sec);
    var tabs = $$('[role="tab"]', sec), art = $('.spot-art', sec), L = null;
    function show(k) {
      var t = thumbs[k], n = t.getAttribute('data-ph');
      thumbs.forEach(function (b, j) { b.classList.toggle('is-on', j === k); b.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
      main.setAttribute('data-idx', k);
      main.innerHTML = img(n, t.getAttribute('data-alt'), '(max-width: 1024px) 100vw, 50vw');
      main.classList.toggle('is-tall', PH[n][1] > PH[n][0]);
      cap.innerHTML = t.getAttribute('data-alt') + (t.getAttribute('data-credit') ? '<small>' + t.getAttribute('data-credit') + '</small>' : '');
    }
    thumbs.forEach(function (b, k) { b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); show(k); }); });
    show(0);
    function select(which) {
      tabs.forEach(function (t) { var on = t.getAttribute('data-tab') === which; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
      $$('[data-panel]', sec).forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== which; });
      if (which === 'scale') {
        if (!L) L = KLift.create(art, { model: mm.id, ruler: true, person: true, label: mm.brand + ' ' + mm.name });
        L.setProgress(0); L.animateTo(1, reduce ? 0 : 2600);
      }
    }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { select(t.getAttribute('data-tab')); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var o = tabs[(k + 1) % tabs.length]; o.focus(); select(o.getAttribute('data-tab'));
      });
    });
  }

  /* ---------- Einsatzbereiche (Beispielbilder) ---------- */
  function figure(n, title, text, group, sizes, small) {
    return '<figure class="photo" data-reveal><button class="zoom" type="button" data-lb="' + group + '" data-src="' + large(n) + '" data-cap="' + esc(capText(n, title)) + '" aria-label="' + esc(title) + ' vergrössern">' +
      img(n, esc(title), sizes) + '</button>' +
      '<figcaption><b>' + title + '</b>' + (text ? '<span>' + text + '</span>' : '') + (small ? '<small>' + small + '</small>' : '') + '</figcaption></figure>';
  }
  var AREAS = [
    ['c-maler', 'Fassade', 'Der Gelenkarm führt den Korb über das Vordach hinweg an die Wand.', '(max-width: 760px) 100vw, 25vw'],
    ['c-goldlift', 'Garten und Park', 'Eine Hinowa Goldlift 14.70 – dasselbe Modell wie unsere – fährt auf Raupen über Wege und Rasen.', '(max-width: 760px) 100vw, 50vw']
  ];
  $('[data-areas]').innerHTML = AREAS.map(function (d) {
    return figure(d[0], d[1], d[2], 'bereiche', d[3], 'Beispielbild · ' + credit(d[0]));
  }).join('') +
    '<div class="areas-list" data-reveal><h3>Typische Arbeiten</h3><ul><li>Fassaden streichen und reinigen</li><li>Dachrinnen, Dachuntersichten und Kamine</li><li>Fenster und Glasfassaden</li><li>Baum- und Heckenpflege</li><li>Montage von Storen, Leuchten und Schildern</li><li>Innenausbau in Hallen und Kirchen</li></ul></div>';

  /* ---------- Im Einsatz (eigene Fotos, Originalformat) ---------- */
  var OWN = [
    ['einsatz-wohnhaus', 'Dachrand und Fenster am Wohnhaus'], ['einsatz-holzbau', 'Auf dem Holzbau-Rohbau'], ['einsatz-festzelt', 'Montage unter dem Festzeltdach'],
    ['einsatz-altbau', 'Fassade am Altbau'], ['einsatz-hinterhof', 'Enger Hinterhof'], ['einsatz-buero', 'Bürogebäude, Fensterfront'], ['einsatz-halle', 'Innenausbau in der Halle']
  ];
  OWN.forEach(function (o) {
    var wide = PH[o[0]][0] > PH[o[0]][1];
    $(wide ? '[data-own-wide]' : '[data-own-tall]').insertAdjacentHTML('beforeend', figure(o[0], o[1], '', 'einsatz', wide ? '(max-width: 760px) 100vw, 33vw' : '(max-width: 760px) 50vw, 25vw', 'Hinowa Goldlift 14.70'));
  });

  $('[data-credits]').innerHTML = Object.keys(COMMONS).map(function (n) {
    var c = COMMONS[n];
    return '<li>' + c.title + ' – <a href="https://commons.wikimedia.org/wiki/File:' + encodeURI(c.file) + '" target="_blank" rel="noopener">' + c.author + '</a>, Lizenz <a href="' + c.licUrl + '" target="_blank" rel="noopener">' + c.lic + '</a></li>';
  }).join('');

  /* ---------- Lightbox ---------- */
  var lb = $('[data-lightbox]'), lbImg = $('[data-lb-img]'), lbCap = $('[data-lb-cap]'), lbCount = $('[data-lb-count]');
  var lbItems = [], lbIdx = 0, lbReturn = null;
  function lbShow(k) {
    lbIdx = (k + lbItems.length) % lbItems.length;
    var it = lbItems[lbIdx];
    lbImg.classList.remove('is-loaded');
    lbImg.onload = function () { lbImg.classList.add('is-loaded'); };
    lbImg.src = it.src; lbImg.alt = it.cap;
    lbCap.textContent = it.cap;
    lbCount.textContent = lbItems.length > 1 ? (lbIdx + 1) + ' / ' + lbItems.length : '';
    lb.classList.toggle('is-single', lbItems.length < 2);
  }
  function lbOpen(group, k, from) {
    var seen = {};
    lbItems = $$('[data-lb="' + group + '"]').filter(function (el) { var s = el.getAttribute('data-src'); if (seen[s]) return false; seen[s] = 1; return true; })
      .map(function (el) { return { src: el.getAttribute('data-src'), cap: el.getAttribute('data-cap') }; });
    if (!lbItems.length) return;
    lbReturn = from;
    lbShow(k);
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
    html.style.overflow = 'hidden';
  }
  function lbClose() { if (lb.close) lb.close(); else { lb.removeAttribute('open'); lbAfterClose(); } }
  function lbAfterClose() { html.style.overflow = ''; if (lbReturn) lbReturn.focus({ preventScroll: true }); }
  lb.addEventListener('close', lbAfterClose);
  $('[data-lb-close]').addEventListener('click', lbClose);
  $('[data-lb-prev]').addEventListener('click', function () { lbShow(lbIdx - 1); });
  $('[data-lb-next]').addEventListener('click', function () { lbShow(lbIdx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-fig')) lbClose(); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
    else if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
  });
  var tx0 = null;
  lb.addEventListener('touchstart', function (e) { tx0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx0 == null) return; var dx = e.changedTouches[0].clientX - tx0; tx0 = null;
    if (Math.abs(dx) > 50 && lbItems.length > 1) lbShow(lbIdx + (dx < 0 ? 1 : -1));
  });
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-lb-open]');
    if (o) { lbOpen(o.getAttribute('data-lb-open'), +o.getAttribute('data-idx') || 0, o); return; }
    var z = e.target.closest('[data-lb]');
    if (z && !z.classList.contains('media-thumb')) {
      var g = z.getAttribute('data-lb'), list = $$('[data-lb="' + g + '"]'), seen = {}, k = 0, idx = 0;
      list.forEach(function (el) { var s = el.getAttribute('data-src'); if (seen[s]) return; seen[s] = 1; if (el === z) idx = k; k++; });
      lbOpen(g, idx, z);
    }
  });

  /* ---------- Vergleich ---------- */
  var IDS = ['atj180', 'atj160', 'goldlift'];
  var CMP = [
    ['Kapazität'],
    ['Arbeitshöhe', ['18.19 m', '16.21 m', '14.00 m|12.60 m mit 2 Personen'], [18.19, 16.21, 14]],
    ['Plattformhöhe', ['16.19 m', '14.21 m', '12.00 m|10.60 m mit 2 Personen'], [16.19, 14.21, 12]],
    ['Seitliche Reichweite', ['10.51 m', '8.52 m', '7.00 m|5.70 m mit 2 Personen'], [10.51, 8.52, 7]],
    ['Tragfähigkeit Korb', ['230 kg', '408 kg', '200 kg|120 kg bei max. Höhe'], [230, 408, 200]],
    ['Personen im Korb', ['2', '3', '2|1 bei max. Höhe'], [2, 3, 2]],
    ['Arbeitskorb', ['1.80 × 0.80 m', '2.30 × 0.90 m', '1.40 × 0.70 m']],
    ['Überhang / Knickpunkt', ['7.55 m', '7.40 m', '–']],
    ['Drehung Oberwagen', ['350°', '350°', 'ca. 360°']],
    ['Drehung Arbeitskorb', ['90° / 90°', '90° / 90°', '–']],
    ['Korbarm-Drehwinkel', ['+59.50°', '+66.50° / −65.80°', '–']],
    ['Abmessungen & Gewicht'],
    ['Gewicht', ['7’430 kg', '7’500 kg', 'ca. 1’700 kg'], [7430, 7500, 1700], 'min'],
    ['Gesamtbreite', ['2.32 m', '2.45 m', '0.78 m|ausgefahren 1.08 m'], [2.32, 2.45, .78], 'min'],
    ['Durchfahrtsbreite min.', ['–', '–', 'ca. 0.85 m']],
    ['Gesamtlänge', ['7.79 m', '7.09 m', 'ca. 3.98 m']],
    ['Gesamtlänge eingefahren', ['5.56 m', '4.89 m', '–']],
    ['Gesamthöhe', ['2.47 m', '2.47 m', 'ca. 1.98 m']],
    ['Bauhöhe eingefahren', ['2.56 m', '2.94 m', '–']],
    ['Bodenfreiheit', ['0.40 m', '0.38 m', '0.28 m|abgestützt']],
    ['Radstand', ['2.20 m', '2.20 m', '–']],
    ['Wenderadius innen / aussen', ['1.38 / 3.75 m', '1.28 / 4.09 m', '–']],
    ['Fahren & Gelände'],
    ['Antrieb', ['Allrad, 4 Räder', 'Allrad, 4 Räder', 'Raupe']],
    ['Bereifung', ['Schaumgefüllt, 908 × 370 mm', 'Schaumgefüllt, 908 × 370 mm', '–']],
    ['Fahrgeschwindigkeit', ['5 km/h|Arbeitsmodus 1 km/h', '5 km/h|Arbeitsmodus 1 km/h', '0 – 1.5 km/h']],
    ['Steigfähigkeit', ['45 %', '45 %', 'ca. 43 %|ca. 24°']],
    ['Zulässige Neigung im Betrieb', ['5°', '5°', '1°|abstützbar bis 10° / 18 %']],
    ['Abstützung', ['–', '–', '2.7 × 2.7 m|Teller Ø 300 mm']],
    ['Bodendruck', ['10 daN/cm²', '11.60 daN/cm²', 'Raupe 0.50 daN/cm²|Stütze max. 1.9 daN/cm²']],
    ['Max. Windbelastung', ['–', '–', '12.5 m/s']],
    ['Antrieb & Verbrauch'],
    ['Motor', ['Kubota D1105-E4B|Diesel, 18.5 kW', 'Kubota D1105-E4B|Diesel, 18.5 kW', 'Honda iGX 440|Benzin, 15 PS']],
    ['Elektromotor', ['–', '–', '230 V, 2.2 kW']],
    ['Motornorm', ['Vorläufige Stufe 4', 'Stufe V', '–']],
    ['Kraftstofftank', ['52 l', '51 l', '–']],
    ['Täglicher Verbrauch', ['4.26 l', '7 l', '–']],
    ['Hydraulikdruck', ['340 bar', '340 bar', '–']],
    ['Umgebungsgeräusch', ['–', '< 105 dB', '–']],
    ['Miete'],
    ['1 – 5 Tage, pro Tag', ['CHF 350.–', 'CHF 350.–', 'CHF 250.–']],
    ['ab 6 Tagen, pro Tag', ['CHF 250.–', 'CHF 250.–', 'CHF 200.–']]
  ];
  var cmp = $('[data-compare]');
  var head = '<div class="cmp-head" role="row"><div role="columnheader">Modell</div>' + IDS.map(function (id) { var mm = K.byId(id); return '<div role="columnheader"><b>' + mm.name + '</b>' + mm.brand + '</div>'; }).join('') + '</div>';
  var body = CMP.map(function (r) {
    if (r.length === 1) return '<div class="cmp-group" role="row"><span role="rowheader">' + r[0] + '</span></div>';
    var mx = r[2] ? Math.max.apply(null, r[2]) : 0, best = r[2] ? (r[3] === 'min' ? Math.min.apply(null, r[2]) : mx) : null;
    return '<div class="cmp-row' + (/^(1|ab)/.test(r[0]) ? ' cmp-row--price' : '') + '" role="row"><div role="rowheader">' + r[0] + '</div>' + r[1].map(function (v, k) {
      var parts = v.split('|');
      var bar = r[2] ? '<span class="cmp-bar" aria-hidden="true"><i style="--w:' + (r[2][k] / mx * 100).toFixed(1) + '%;--d:' + (k * .12) + 's"></i></span>' : '';
      return '<div class="cmp-cell' + (parts[0] === '–' ? ' is-na' : '') + (r[2] && r[2][k] === best ? ' is-max' : '') + '" role="cell">' + parts[0] + (parts[1] ? '<small>' + parts[1] + '</small>' : '') + bar + '</div>';
    }).join('') + '</div>';
  }).join('');
  cmp.innerHTML = head + body;
  if (hasIO && !reduce) {
    var ro = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); } }); }, { threshold: .6 });
    $$('.cmp-row', cmp).forEach(function (r) { if ($('.cmp-bar', r)) ro.observe(r); });
  } else $$('.cmp-row', cmp).forEach(function (r) { r.classList.add('is-in'); });

  /* ---------- Preise ---------- */
  var prices = $('[data-prices]');
  K.MACHINES.forEach(function (mm, k) {
    var c = document.createElement('article'); c.className = 'price-card'; c.setAttribute('data-reveal', ''); c.style.setProperty('--d', (k * .1) + 's');
    c.innerHTML = '<h3>' + mm.name + '</h3><span class="pc-brand">' + mm.brand + ' · ' + mm.heightClass + '</span>' +
      '<p class="pc-amount"><span data-count="' + mm.priceDay + '" data-dec="0">0</span>.–<small>CHF pro Tag</small></p>' +
      '<p class="pc-long">ab 6 Tagen CHF ' + K.chf(mm.priceLong) + ' pro Tag</p>' +
      '<p class="pc-example">Beispiel 7 Tage: CHF ' + K.chf(mm.priceLong * 7) + ' exkl. MwSt.</p>' +
      '<button class="btn btn--line" type="button" data-request="' + mm.id + '">Anfragen</button>';
    prices.appendChild(c);
  });
  onView(prices, function () { $$('[data-count]', prices).forEach(function (n) { countUp(n, +n.getAttribute('data-count'), 0, 1200); }); }, .4);

  /* ---------- Ablauf ---------- */
  var steps = $('[data-steps]'), stepEls = $$('li', steps);
  function stepProgress() {
    var r = steps.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (vh * .5)));
    steps.style.setProperty('--progress', p.toFixed(3));
    stepEls.forEach(function (s, k) { s.classList.toggle('is-on', p >= k / stepEls.length + .02 || p >= .98); });
  }
  if (reduce) { steps.style.setProperty('--progress', 1); stepEls.forEach(function (s) { s.classList.add('is-on'); }); }

  /* ---------- Anfrage ---------- */
  var picks = $('[data-picks]'), minis = {};
  K.MACHINES.forEach(function (mm) {
    var l = document.createElement('label'); l.className = 'pick';
    l.innerHTML = '<input type="radio" name="maschine" value="' + mm.id + '"><span class="pick-card"><span class="pick-art"></span><span><span class="pick-name">' + mm.name + '</span>' +
      '<span class="pick-meta">' + mm.brand + ' · ' + mm.heightClass + ' · ab CHF ' + K.chf(mm.priceLong) + '</span></span></span>';
    picks.appendChild(l);
    minis[mm.id] = KLift.create($('.pick-art', l), { model: mm.id, crew: false, viewBox: [-215, -330, 890, 350] });
  });
  picks.addEventListener('change', function (e) { Object.keys(minis).forEach(function (id) { minis[id].animateTo(e.target.value === id ? .1 : 0, reduce ? 0 : 900); }); });

  var form = $('[data-form]'), grid = $('[data-request-grid]'), thanks = $('[data-success]');
  var cal = KBooking.calendar($('[data-calendar]'), { twoMonthsFrom: 600 });
  var bf = KBooking.form(form, {
    calendar: cal, scrollOffset: 100,
    onSuccess: function (p) {
      $('[data-success-text]').innerHTML = 'Ihre Anfrage für die <b>' + p['Maschine'].split(' (')[0] + '</b> vom ' + p['Mietbeginn'] + ' bis ' + p['Mietende'] + ' ist eingegangen.' +
        ' Wir melden uns so rasch wie möglich bei Ihnen. Fragen? <a href="' + K.CONFIG.phoneHref + '">' + K.CONFIG.phone + '</a> oder <a href="mailto:' + K.CONFIG.inquiryTo + '">' + K.CONFIG.inquiryTo + '</a>' + '.';
      grid.hidden = true; thanks.hidden = false; $('#anfrage .head').hidden = true;
      toEl($('#anfrage'), 70); thanks.focus({ preventScroll: true });
    }
  });
  $('[data-success-reset]').addEventListener('click', function () {
    bf.reset(); thanks.hidden = true; grid.hidden = false; $('#anfrage .head').hidden = false;
    Object.keys(minis).forEach(function (id) { minis[id].setProgress(0); });
  });
  var summary = $('.summary'), submitRow = $('.submit-row', form);
  var mq = window.matchMedia('(max-width: 1024px)');
  function placeSummary() { if (mq.matches) form.insertBefore(summary, submitRow); else if (summary.parentNode !== grid) grid.appendChild(summary); }
  if (mq.addEventListener) mq.addEventListener('change', placeSummary); else mq.addListener(placeSummary);
  placeSummary();
  function requestMachine(id) { bf.selectMachine(id); toEl($('#anfrage'), 60); }
  document.addEventListener('click', function (e) { var r = e.target.closest('[data-request]'); if (r) requestMachine(r.getAttribute('data-request')); });

  /* ---------- Einblenden ---------- */
  var reveals = $$('[data-reveal]');
  reveals.forEach(function (el) {
    if (el.style.getPropertyValue('--d')) return;
    var sib = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.hasAttribute('data-reveal'); });
    el.style.setProperty('--d', (Math.max(0, sib.indexOf(el)) * .08) + 's');
  });
  if (hasIO && !reduce) {
    var rv = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rv.unobserve(e.target); } }); }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { rv.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add('is-in'); });

  /* ---------- Scroll ---------- */
  var mbar = $('[data-mobile-bar]'), zones = [$('#anfrage'), $('.site-footer')];
  function updateBar() {
    var vh = window.innerHeight, hide = menuOpen() || window.scrollY < 260;
    zones.forEach(function (z) { var r = z.getBoundingClientRect(); if (r.top < vh - 40 && r.bottom > 80) hide = true; });
    mbar.classList.toggle('is-hidden', hide);
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0).toFixed(4) + ')';
      if (!reduce) stepProgress();
      updateBar();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
