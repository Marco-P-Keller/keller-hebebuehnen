/* Version 2 – «Feierabend» */
(function () {
  'use strict';

  var K = window.KELLER;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(y) { window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); }

  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ---------- Header, Menü ---------- */
  var header = $('[data-header]');
  var menuBtn = $('[data-menu-btn]'), menu = $('[data-menu]');
  function menuOpen() { return menuBtn.getAttribute('aria-expanded') === 'true'; }
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    $('.sr', menuBtn).textContent = open ? 'Menü schliessen' : 'Menü öffnen';
    if (open) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('is-open'); }); html.style.overflow = 'hidden'; header.classList.add('is-solid'); }
    else { menu.classList.remove('is-open'); html.style.overflow = ''; setTimeout(function () { if (!menuOpen()) menu.hidden = true; }, 300); onScroll(); }
  }
  menuBtn.addEventListener('click', function () { setMenu(!menuOpen()); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen()) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1100 && menuOpen()) setMenu(false); });

  var navLinks = $$('.nav a');
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'flotte', 'reichweite', 'preise', 'anfrage', 'kontakt'].forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ---------- Szene ---------- */
  var scene = $('[data-scene]'), svg = $('[data-scene-svg]');
  var num = $('[data-scene-num]'), hint = $('[data-scene-hint]');
  var defs = el('defs', {}, svg);
  var g1 = el('linearGradient', { id: 'cone', x1: 0, y1: 0, x2: 1, y2: .4 }, defs);
  el('stop', { offset: 0, 'stop-color': '#FFD48A', 'stop-opacity': .55 }, g1);
  el('stop', { offset: 1, 'stop-color': '#FFB347', 'stop-opacity': 0 }, g1);
  var rg = el('radialGradient', { id: 'glow' }, defs);
  el('stop', { offset: 0, 'stop-color': '#FFC56B', 'stop-opacity': .55 }, rg);
  el('stop', { offset: 1, 'stop-color': '#FFC56B', 'stop-opacity': 0 }, rg);
  var wg = el('linearGradient', { id: 'win', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: 0, 'stop-color': '#FFD38C' }, wg);
  el('stop', { offset: 1, 'stop-color': '#E8933F' }, wg);

  /* Hügel und Bäume */
  el('path', { d: 'M-6000,-260 C-4200,-620 -3000,-380 -1800,-520 C-600,-660 400,-360 1600,-470 C2800,-580 3800,-330 6000,-520 L6000,40 L-6000,40 Z', fill: '#1A2642' }, svg);
  el('path', { d: 'M-6000,-120 C-4000,-300 -2600,-170 -1400,-250 C-200,-330 1200,-160 2600,-240 C3800,-300 5000,-170 6000,-230 L6000,40 L-6000,40 Z', fill: '#141E35' }, svg);
  [[-1500, 820], [-1320, 640], [-1160, 900], [-2050, 700], [-2350, 860], [2380, 760], [2600, 980], [2850, 700], [3150, 880]].forEach(function (t) {
    var x = t[0], h = t[1], w = h * .36;
    el('path', { d: 'M' + x + ',' + (-h) + ' L' + (x + w / 2) + ',0 L' + (x - w / 2) + ',0 Z', fill: '#0F172A' }, svg);
  });

  /* Holzbau im Rohbau: fünf Geschosse, unten verkleidet, oben offener Rahmen */
  var house = el('g', { 'class': 'house' }, svg);
  var HX0 = 640, HX1 = 1760, FL = 320, TOP = -1640;
  el('rect', { x: HX0 - 20, y: -40, width: HX1 - HX0 + 40, height: 40, fill: '#1B2438' }, house);
  el('rect', { x: HX0, y: -960, width: HX1 - HX0, height: 920, fill: '#18213A' }, house);
  for (var bx = HX0 + 10; bx < HX1; bx += 24) el('rect', { x: bx, y: -960, width: 6, height: 920, fill: '#1C2742' }, house);
  for (var sx = HX0; sx <= HX1 - 8; sx += 58) el('rect', { x: sx, y: -1620, width: 9, height: 660, fill: '#2F3D5C' }, house);
  [-1298, -978].forEach(function (y) { el('rect', { x: HX0, y: y - 14, width: HX1 - HX0, height: 14, fill: '#36466A' }, house); });
  for (var f = 1; f <= 5; f++) el('rect', { x: HX0 - 14, y: -f * FL - 22, width: HX1 - HX0 + 28, height: 22, fill: '#2A3758' }, house);
  el('rect', { x: HX0 - 14, y: TOP - 40, width: HX1 - HX0 + 28, height: 40, fill: '#2A3758' }, house);
  el('rect', { x: HX0 - 14, y: TOP - 40, width: HX1 - HX0 + 28, height: 4, fill: '#F4A63A', opacity: .35 }, house);
  var windows = [];
  for (var fl = 0; fl < 3; fl++) {
    for (var wx = HX0 + 110; wx < HX1 - 150; wx += 250) {
      var wy = -fl * FL - 262;
      el('rect', { x: wx - 8, y: wy - 8, width: 156, height: 196, fill: '#121A2E' }, house);
      var w = el('rect', { x: wx, y: wy, width: 140, height: 180, fill: 'url(#win)', opacity: 0 }, house);
      el('rect', { x: wx + 68, y: wy, width: 4, height: 180, fill: '#121A2E' }, house);
      windows.push({ el: w, at: Math.random() < .72 ? .05 + Math.random() * .8 : 2 });
    }
  }
  /* Gerüstlose Fassade oben: Kranhaken-Licht */
  var houseGlow = el('ellipse', { cx: HX0 + 200, cy: -1450, rx: 560, ry: 420, fill: 'url(#glow)', opacity: 0 }, svg);

  /* Boden */
  el('rect', { x: -6000, y: 0, width: 12000, height: 1200, fill: '#0B1120' }, svg);
  el('rect', { x: -6000, y: 0, width: 12000, height: 3, fill: '#26324E' }, svg);
  var groundGlow = el('ellipse', { cx: 120, cy: 10, rx: 700, ry: 60, fill: 'url(#glow)', opacity: .25 }, svg);

  var cone = el('path', { fill: 'url(#cone)', 'class': 'light-cone', opacity: 0 }, null);
  var lamp = el('circle', { r: 16, fill: '#FFE3A8', opacity: 0 }, null);
  var lampHalo = el('circle', { r: 90, fill: 'url(#glow)', opacity: 0 }, null);

  var heroLift = KLift.create(svg, {
    model: 'atj180', crew: true,
    onUpdate: function (u) {
      num.textContent = u.work.toFixed(2);
      var bx = u.basket[0], by = u.basket[1];
      var lx = bx + u.basketLen - 6, ly = by - 70;
      lamp.setAttribute('cx', lx); lamp.setAttribute('cy', ly);
      lampHalo.setAttribute('cx', lx); lampHalo.setAttribute('cy', ly);
      cone.setAttribute('d', 'M' + lx + ',' + ly + ' L' + (lx + 820) + ',' + (ly + 60) + ' L' + (lx + 640) + ',' + (ly + 760) + ' Z');
      var on = clamp((u.progress - .82) / .16, 0, 1);
      cone.setAttribute('opacity', on * .9); lamp.setAttribute('opacity', on); lampHalo.setAttribute('opacity', on * .9);
      houseGlow.setAttribute('opacity', on * .8);
      windows.forEach(function (w) { w.el.setAttribute('opacity', u.progress > w.at ? .92 : 0); });
    }
  });
  var ls = heroLift.svg;
  var vb = ls.getAttribute('viewBox').split(' ').map(Number);
  ls.setAttribute('x', vb[0]); ls.setAttribute('y', vb[1]); ls.setAttribute('width', vb[2]); ls.setAttribute('height', vb[3]);
  svg.appendChild(cone); svg.appendChild(lampHalo); svg.appendChild(lamp);
  windows.forEach(function (w) { w.el.style.transition = 'opacity .6s ease'; });

  function sizeScene() {
    var w = svg.clientWidth || window.innerWidth, h = svg.clientHeight || window.innerHeight;
    var a = w / h, H, x0, yTop;
    if (a >= 1) { H = 2250; yTop = -2100; var W = H * a; x0 = -W * (a > 1.9 ? .5 : .47); svg.setAttribute('viewBox', [x0, yTop, W, H].join(' ')); }
    else {
      H = a < .62 ? 3700 : 3000; yTop = 150 - H; var W2 = H * a;
      x0 = -W2 * (a < .62 ? .33 : .38);
      svg.setAttribute('viewBox', [x0, yTop, W2, H].join(' '));
    }
    svg.setAttribute('preserveAspectRatio', 'xMidYMax slice');
  }
  sizeScene();
  window.addEventListener('resize', sizeScene);

  var ticking = false;
  function sceneProgress() {
    ticking = false;
    var r = scene.getBoundingClientRect();
    var span = scene.offsetHeight - window.innerHeight;
    var p = span > 0 ? clamp(-r.top / span, 0, 1) : 1;
    heroLift.setProgress(clamp((p - .03) / .82, 0, 1));
    hint.style.opacity = p > .03 ? 0 : 1;
  }
  function onScroll() {
    if (!menuOpen()) header.classList.toggle('is-solid', window.scrollY > 40);
    if (!reduce && !ticking) { ticking = true; requestAnimationFrame(sceneProgress); }
    updateBar();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (reduce) heroLift.setProgress(1); else sceneProgress();

  /* ---------- Flotte ---------- */
  var tabsEl = $('[data-fleet-tabs]'), stage = $('[data-fleet-stage]');
  var specsBtn = $('[data-fleet-specs]'), specsBody = $('[data-fleet-specs-body]');
  var fleetLifts = {}, current = null, fleetSeen = false;
  K.MACHINES.forEach(function (m, i) {
    var b = document.createElement('button');
    b.className = 'fleet-tab'; b.type = 'button'; b.id = 'tab-' + m.id;
    b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', 'false'); b.setAttribute('aria-controls', 'fleet-panel'); b.tabIndex = -1;
    b.dataset.id = m.id;
    b.innerHTML = '<span class="fleet-tab-brand">' + m.brand + '</span><span class="fleet-tab-name">' + m.name + '</span>' +
      '<span class="fleet-tab-meta"><span><b>' + m.workHeight.toFixed(2) + ' m</b> Arbeitshöhe</span><span>ab CHF ' + K.chf(m.priceLong) + '</span></span><span class="fleet-tab-bar"></span>';
    tabsEl.appendChild(b);
    var l = KLift.create(stage, { model: m.id, ruler: true, person: true, label: m.brand + ' ' + m.name, viewBox: [-420, -1900, 1110, 1940] });
    l.svg.classList.add('is-hidden');
    fleetLifts[m.id] = l;
  });
  $('[data-fleet-panel]').id = 'fleet-panel';

  function renderSpecs(m) {
    var h = '';
    m.specs.forEach(function (g) {
      h += '<section class="spec-group"><h3>' + g.group + '</h3><table class="spec-table"><tbody>' +
        g.rows.map(function (r) { return '<tr><th scope="row">' + r[0] + (r[1] ? '<small>' + r[1] + '</small>' : '') + '</th><td>' + r[2] + '</td></tr>'; }).join('') + '</tbody></table></section>';
    });
    specsBody.innerHTML = h + '<p class="spec-foot">' + m.footnote + '</p>';
  }

  function selectFleet(id, focus) {
    if (current === id) return;
    var m = K.byId(id), prev = current;
    current = id;
    $$('.fleet-tab', tabsEl).forEach(function (t) {
      var on = t.dataset.id === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    $('[data-fleet-panel]').setAttribute('aria-labelledby', 'tab-' + id);
    $('[data-fleet-type]').textContent = m.brand + ' ' + m.name + ' – ' + m.type;
    $('[data-fleet-pitch]').textContent = m.pitch;
    $('[data-fleet-stats]').innerHTML =
      '<div><dt>Arbeitshöhe</dt><dd>' + m.workHeight.toFixed(2) + '<small>m</small></dd></div>' +
      '<div><dt>Seitliche Reichweite</dt><dd>' + m.reach.toFixed(2) + '<small>m</small></dd></div>' +
      '<div><dt>Korblast</dt><dd>' + m.payload + '<small>kg</small></dd></div>' +
      '<div><dt>Personen im Korb</dt><dd>' + m.persons + '<small>max.</small></dd></div>' +
      '<div><dt>Gewicht</dt><dd>' + K.chf(m.weight).replace('.–', '') + '<small>kg</small></dd></div>' +
      '<div><dt>Miete pro Tag, ab 6 Tagen</dt><dd>' + m.priceLong + '<small>CHF</small></dd></div>';
    renderSpecs(m);
    if (prev) {
      var pl = fleetLifts[prev];
      pl.svg.classList.add('is-hidden');
      pl.animateTo(0, reduce ? 0 : 500);
    }
    var nl = fleetLifts[id];
    nl.svg.classList.remove('is-hidden');
    if (fleetSeen) { nl.setProgress(0); nl.animateTo(1, reduce ? 0 : 2200); }
  }
  tabsEl.addEventListener('click', function (e) { var t = e.target.closest('.fleet-tab'); if (t) selectFleet(t.dataset.id); });
  tabsEl.addEventListener('keydown', function (e) {
    var ids = K.MACHINES.map(function (m) { return m.id; }), i = ids.indexOf(current);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); selectFleet(ids[(i + 1) % 3], true); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); selectFleet(ids[(i + 2) % 3], true); }
  });
  selectFleet('atj180');
  if ('IntersectionObserver' in window) {
    var fo = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { fleetSeen = true; fleetLifts[current].animateTo(1, reduce ? 0 : 2400); fo.disconnect(); }
    }, { threshold: .35 });
    fo.observe(stage);
  } else { fleetSeen = true; fleetLifts[current].setProgress(1); }

  specsBtn.addEventListener('click', function () {
    var open = specsBody.hidden;
    specsBody.hidden = !open;
    specsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    specsBtn.textContent = open ? 'Technische Daten ausblenden' : 'Alle technischen Daten';
    if (open) setTimeout(function () { var r = specsBody.getBoundingClientRect(); if (r.top > window.innerHeight * .7) smooth(r.top + window.pageYOffset - 120); }, 30);
  });
  $('[data-fleet-request]').addEventListener('click', function () { requestMachine(current); });

  /* ---------- Reichweite ---------- */
  KReach.create($('[data-reach]'), { onRequest: function (id) { requestMachine(id); } });

  /* ---------- Preise ---------- */
  var cardsEl = $('[data-price-cards]'), amounts = [];
  K.MACHINES.forEach(function (m) {
    var c = document.createElement('article'); c.className = 'price-card';
    c.innerHTML = '<div class="price-card-top"><div><h3>' + m.name + '</h3><span class="brand">' + m.brand + ' · ' + m.typeShort + '</span></div><span class="height">' + m.heightClass + '</span></div>' +
      '<p class="price-amount"><span class="cur">CHF</span><span data-amount>' + m.priceDay + '</span><small>.– / Tag</small></p>' +
      '<p class="price-alt" data-alt>ab 6 Tagen CHF ' + K.chf(m.priceLong) + ' pro Tag</p>' +
      '<button class="btn btn--ghost" type="button" data-request="' + m.id + '">Anfragen</button>';
    cardsEl.appendChild(c);
    amounts.push({ m: m, el: $('[data-amount]', c), alt: $('[data-alt]', c), val: m.priceDay });
    c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
  var sw = $('.switch');
  sw.addEventListener('change', function (e) {
    var long = e.target.value === 'long';
    sw.classList.toggle('is-long', long);
    amounts.forEach(function (a) {
      var from = a.val, to = long ? a.m.priceLong : a.m.priceDay, t0 = performance.now();
      a.val = to;
      a.alt.textContent = long ? 'gilt ab dem 6. Miettag für die ganze Dauer' : 'ab 6 Tagen CHF ' + K.chf(a.m.priceLong) + ' pro Tag';
      if (reduce) { a.el.textContent = to; return; }
      (function step() {
        var k = Math.min(1, (performance.now() - t0) / 500), e2 = 1 - Math.pow(1 - k, 3);
        a.el.textContent = Math.round(from + (to - from) * e2);
        if (k < 1) requestAnimationFrame(step);
      })();
    });
  });

  /* ---------- Anfrage-Assistent ---------- */
  var choices = $('[data-choices]');
  K.MACHINES.forEach(function (m) {
    var l = document.createElement('label'); l.className = 'choice';
    l.innerHTML = '<input type="radio" name="maschine" value="' + m.id + '"><span class="choice-card"><span><span class="choice-name">' + m.name + '</span>' +
      '<span class="choice-meta">' + m.brand + ' · ' + m.workHeight.toFixed(2) + ' m Arbeitshöhe</span></span>' +
      '<span class="choice-price">ab <b>CHF ' + K.chf(m.priceLong) + '</b> / Tag</span></span><span class="choice-dot" aria-hidden="true"></span>';
    choices.appendChild(l);
  });

  var form = $('[data-form]'), wizard = $('[data-wizard]');
  var steps = $$('.wstep', form), dots = $$('[data-step-dot]'), bar = $('[data-wizard-bar]');
  var cal = KBooking.calendar($('[data-calendar]'), { twoMonthsFrom: 640 });
  var stepIdx = 0;
  var bf = KBooking.form(form, {
    calendar: cal, scrollOffset: 100,
    onSuccess: function (p) {
      form.hidden = true; $('.wizard-steps').hidden = true; $('.wizard-bar').hidden = true;
      var done = $('[data-success]'); done.hidden = false;
      $('[data-success-text]').innerHTML = 'Ihre Anfrage für die <b>' + p['Maschine'].split(' (')[0] + '</b> vom ' + p['Mietbeginn'] + ' bis ' + p['Mietende'] + ' ist bei uns. Wir melden uns so rasch wie möglich unter ' + p['Telefon'] + '.';
      var holder = $('[data-done-lift]'); holder.innerHTML = '';
      var id = form.querySelector('input[name="maschine"]:checked').value;
      var dl = KLift.create(holder, { model: id, crew: true, viewBox: [-260, -1900, 960, 1940] });
      dl.animateTo(1, reduce ? 0 : 2600);
      smooth(wizard.getBoundingClientRect().top + window.pageYOffset - 100);
      done.focus({ preventScroll: true });
    }
  });

  function showStep(i) {
    var back = i < stepIdx;
    steps.forEach(function (s, k) { s.hidden = k !== i; s.classList.toggle('is-active', k === i); s.classList.toggle('is-back', back && k === i); });
    dots.forEach(function (d, k) { d.classList.toggle('is-current', k === i); d.classList.toggle('is-done', k < i); });
    bar.style.width = ((i + 1) / 3 * 100) + '%';
    stepIdx = i;
    if (i === 2) renderReview();
    var top = wizard.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * .5) smooth(top + window.pageYOffset - 90);
  }

  function renderReview() {
    var p = bf.payload();
    var rows = [['Maschine', p['Maschine'].split(' (')[0]], ['Zeitraum', p['Mietbeginn'] + ' – ' + p['Mietende']], ['Mietdauer', p['Mietdauer']], ['Transport', p['Transport']],
      ['Einsatzort', p['Einsatzort']], ['Name', p['Name']], ['Firma', p['Firma']], ['E-Mail', p['email']], ['Telefon', p['Telefon']], ['Nachricht', p['Nachricht']]];
    var esc = function (s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
    $('[data-review]').innerHTML = rows.map(function (r) { return '<div><span class="k">' + r[0] + '</span><span class="v">' + esc(r[1]) + '</span></div>'; }).join('') +
      '<p class="review-edit"><button type="button" data-goto="0">Bühne oder Datum ändern</button><button type="button" data-goto="1">Angaben ändern</button></p>';
  }

  form.addEventListener('click', function (e) {
    if (e.target.closest('[data-next]')) { if (bf.check(steps[stepIdx])) showStep(stepIdx + 1); }
    else if (e.target.closest('[data-prev]')) showStep(stepIdx - 1);
    else if (e.target.closest('[data-goto]')) showStep(+e.target.closest('[data-goto]').getAttribute('data-goto'));
  });
  /* Enter in einem Feld: zum nächsten Schritt statt absenden */
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && stepIdx < 2) { e.preventDefault(); if (bf.check(steps[stepIdx])) showStep(stepIdx + 1); }
  });

  $('[data-success-reset]').addEventListener('click', function () {
    bf.reset(); form.hidden = false; $('.wizard-steps').hidden = false; $('.wizard-bar').hidden = false; $('[data-success]').hidden = true; showStep(0);
  });

  function requestMachine(id) {
    bf.selectMachine(id);
    if (stepIdx !== 0 && !form.hidden) showStep(0);
    smooth($('#anfrage').getBoundingClientRect().top + window.pageYOffset - 60);
  }
  document.addEventListener('click', function (e) { var r = e.target.closest('[data-request]'); if (r) requestMachine(r.getAttribute('data-request')); });

  /* ---------- Rechtliches ---------- */
  var legal = $('[data-legal]');
  function closeLegal() {
    if (reduce) { legal.close(); html.style.overflow = ''; return; }
    legal.classList.add('is-closing');
    setTimeout(function () { legal.classList.remove('is-closing'); legal.close(); html.style.overflow = ''; }, 240);
  }
  $$('[data-open-legal]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-open-legal');
      $('[data-legal-title]').textContent = k === 'impressum' ? 'Impressum' : 'Datenschutz';
      $('[data-legal-body]').innerHTML = document.getElementById('legal-' + k).innerHTML;
      if (legal.showModal) { legal.showModal(); html.style.overflow = 'hidden'; } else legal.setAttribute('open', '');
    });
  });
  $('[data-legal-close]').addEventListener('click', closeLegal);
  legal.addEventListener('cancel', function (e) { e.preventDefault(); closeLegal(); });
  legal.addEventListener('click', function (e) { if (e.target === legal) closeLegal(); });

  /* ---------- Mobile-Leiste ---------- */
  var mbar = $('[data-mobile-bar]'), zones = [$('#anfrage'), $('.site-footer')];
  function updateBar() {
    var vh = window.innerHeight, hide = menuOpen() || window.scrollY < scene.offsetHeight - vh * .8;
    zones.forEach(function (z) { var r = z.getBoundingClientRect(); if (r.top < vh - 40 && r.bottom > 80) hide = true; });
    mbar.classList.toggle('is-hidden', hide);
  }
  onScroll();
})();
