/* =========================================================================
   KReach – «Wie weit kommt die Bühne?»
   Zeigt die Arbeitsbereiche (Lastdiagramme) aller drei Bühnen übereinander.
   Ein ziehbarer Punkt (oder zwei Schieberegler) prüft, welche Bühne einen
   Arbeitspunkt erreicht: Arbeitshöhe + seitlicher Abstand ab Drehmitte.

   KReach.create(container, { onRequest(id) })
   Benötigt data.js (window.KELLER).
   ========================================================================= */
(function () {
  'use strict';

  var K = window.KELLER;
  var NS = 'http://www.w3.org/2000/svg';
  var S = 100;                      /* 1 m = 100 Einheiten */
  var XMAX = 11.5, YMAX = 19.5;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var uid = 0;

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function h(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function f1(v) { return v.toFixed(1); }
  function f2(v) { return v.toFixed(2); }

  /* Punkt im Polygon (Ray-Casting) */
  function inside(poly, x, y) {
    var c = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
    }
    return c;
  }
  /* grösste seitliche Reichweite auf Höhe y */
  function reachAt(poly, y) {
    var best = -1;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var a = poly[j], b = poly[i];
      if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) {
        var x = a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]);
        if (x > best) best = x;
      } else if (a[1] === y && b[1] === y) best = Math.max(best, a[0], b[0]);
    }
    return best;
  }
  function topOf(poly) { return Math.max.apply(null, poly.map(function (p) { return p[1]; })); }
  function pathOf(poly) { return poly.map(function (p, i) { return (i ? 'L' : 'M') + (p[0] * S).toFixed(1) + ',' + (-p[1] * S).toFixed(1); }).join(' ') + ' Z'; }

  function create(root, opts) {
    opts = opts || {};
    var id = 'rx' + (++uid);
    var state = { x: 6, y: 9, persons: 1 };
    var M = K.MACHINES;

    root.classList.add('rx');
    root.innerHTML = '';

    /* ---------- Diagramm ---------- */
    var chart = h('div', 'rx-chart');
    var svg = el('svg', { preserveAspectRatio: 'xMidYMid meet', viewBox: [-170, -YMAX * S - 30, XMAX * S + 230, YMAX * S + 150].join(' '), role: 'img', 'aria-label': 'Arbeitsbereiche der drei Hebebühnen: Arbeitshöhe über seitlichem Abstand' }, chart);
    var grid = el('g', { 'class': 'rx-grid' }, svg);
    for (var gx = 0; gx <= 11; gx++) el('line', { x1: gx * S, x2: gx * S, y1: 0, y2: -YMAX * S, 'class': gx % 2 ? 'rx-gl' : 'rx-gl rx-gl--major' }, grid);
    for (var gy = 0; gy <= 19; gy++) el('line', { x1: 0, x2: XMAX * S, y1: -gy * S, y2: -gy * S, 'class': gy % 2 ? 'rx-gl' : 'rx-gl rx-gl--major' }, grid);
    for (gy = 2; gy <= 18; gy += 2) { var ty = el('text', { x: -26, y: -gy * S + 14, 'text-anchor': 'end', 'class': 'rx-ax' }, grid); ty.textContent = gy + ' m'; }
    for (gx = 0; gx <= 10; gx += 2) { var tx = el('text', { x: gx * S, y: 72, 'text-anchor': 'middle', 'class': 'rx-ax' }, grid); tx.textContent = gx + ' m'; }
    el('line', { x1: 0, x2: XMAX * S, y1: 0, y2: 0, 'class': 'rx-ground' }, svg);
    el('line', { x1: 0, x2: 0, y1: 0, y2: -YMAX * S, 'class': 'rx-axis' }, svg);
    var axl = el('text', { x: 16, y: -YMAX * S + 40, 'class': 'rx-ax rx-ax--title' }, svg); axl.textContent = 'Arbeitshöhe';
    var axb = el('text', { x: XMAX * S, y: 128, 'text-anchor': 'end', 'class': 'rx-ax rx-ax--title' }, svg); axb.textContent = 'Seitlicher Abstand ab Drehmitte';

    /* Flächen (grösste zuerst) */
    var shapes = {};
    var layer = el('g', { 'class': 'rx-shapes' }, svg);
    ['atj180', 'atj160', 'goldlift'].forEach(function (mid, i) {
      var g = el('g', { 'class': 'rx-shape rx-shape--' + (i + 1), 'data-id': mid }, layer);
      var p = el('path', { d: pathOf(K.byId(mid).envelope), 'class': 'rx-fill' }, g);
      var o = el('path', { d: pathOf(K.byId(mid).envelope), 'class': 'rx-line', pathLength: 1 }, g);
      shapes[mid] = { g: g, fill: p, line: o };
    });

    /* Drehmitte / Fahrzeug-Symbol */
    var base = el('g', { 'class': 'rx-base' }, svg);
    el('rect', { x: -42, y: -40, width: 84, height: 30, rx: 7 }, base);
    el('circle', { cx: -22, cy: -9, r: 9 }, base);
    el('circle', { cx: 22, cy: -9, r: 9 }, base);

    /* Zielpunkt */
    var tgt = el('g', { 'class': 'rx-target' }, svg);
    var hx = el('line', { 'class': 'rx-guide', x1: 0, y1: 0, x2: 0, y2: 0 }, tgt);
    var hy = el('line', { 'class': 'rx-guide', x1: 0, y1: 0, x2: 0, y2: 0 }, tgt);
    var halo = el('circle', { r: 46, 'class': 'rx-halo' }, tgt);
    var dot = el('circle', { r: 20, 'class': 'rx-dot', tabindex: 0, role: 'slider', 'aria-label': 'Arbeitspunkt verschieben' }, tgt);
    var lbl = el('text', { 'class': 'rx-tlabel', x: 0, y: 0 }, tgt);

    /* ---------- Bedienung & Ergebnis ---------- */
    var side = h('div', 'rx-side');
    side.innerHTML =
      '<div class="rx-ctrl"><label for="' + id + '-y">Arbeitshöhe <output data-out="y"></output></label>' +
      '<input class="rx-range" id="' + id + '-y" type="range" min="0" max="19" step="0.1" data-in="y"></div>' +
      '<div class="rx-ctrl"><label for="' + id + '-x">Seitlicher Abstand <output data-out="x"></output></label>' +
      '<input class="rx-range" id="' + id + '-x" type="range" min="0" max="11" step="0.1" data-in="x"></div>' +
      '<div class="rx-ctrl"><span class="rx-label" id="' + id + '-p">Personen im Korb</span>' +
      '<div class="rx-seg" role="radiogroup" aria-labelledby="' + id + '-p">' +
        [1, 2, 3].map(function (n) { return '<label><input type="radio" name="' + id + '-persons" value="' + n + '"' + (n === 1 ? ' checked' : '') + '><span>' + n + '</span></label>'; }).join('') +
      '</div></div>' +
      '<ul class="rx-results" aria-live="polite"></ul>' +
      '<p class="rx-note">Arbeitshöhe = Plattformhöhe + 2 m. Abstand gemessen ab Drehmitte der Bühne – die Bühnen drehen 350° bzw. 360°. Richtwerte gemäss Lastdiagrammen der Hersteller; im Zweifel beraten wir Sie gerne.</p>';
    root.appendChild(chart);
    root.appendChild(side);

    var inY = side.querySelector('[data-in="y"]'), inX = side.querySelector('[data-in="x"]');
    var outY = side.querySelector('[data-out="y"]'), outX = side.querySelector('[data-out="x"]');
    var list = side.querySelector('.rx-results');
    var items = {};
    ['atj180', 'atj160', 'goldlift'].forEach(function (mid, i) {
      var m = K.byId(mid);
      var li = h('li', 'rx-item rx-item--' + (i + 1));
      li.innerHTML = '<span class="rx-key" aria-hidden="true"></span><span class="rx-iname"><b>' + m.name + '</b> ' + m.brand + '</span>' +
        '<span class="rx-istate"></span>' + (opts.onRequest ? '<button type="button" class="rx-ibtn" data-rx-request="' + mid + '">Anfragen</button>' : '');
      list.appendChild(li);
      items[mid] = { li: li, state: li.querySelector('.rx-istate'), m: m };
    });
    if (opts.onRequest) list.addEventListener('click', function (e) { var b = e.target.closest('[data-rx-request]'); if (b) opts.onRequest(b.getAttribute('data-rx-request')); });

    function envOf(mid) { var m = K.byId(mid); return mid === 'goldlift' && state.persons >= 2 ? m.envelope2 : m.envelope; }

    function update(fromInput) {
      var x = state.x, y = state.y;
      if (!fromInput) { inY.value = y; inX.value = x; }
      outY.textContent = f1(y) + ' m'; outX.textContent = f1(x) + ' m';
      [[inY, 19], [inX, 11]].forEach(function (p) { p[0].style.setProperty('--p', (p[0].value / p[1] * 100) + '%'); });
      tgt.setAttribute('transform', 'translate(' + (x * S) + ' ' + (-y * S) + ')');
      hx.setAttribute('x2', -x * S); hy.setAttribute('y2', y * S);
      lbl.setAttribute('x', x > 6.5 ? -40 : 40); lbl.setAttribute('y', -36);
      lbl.setAttribute('text-anchor', x > 6.5 ? 'end' : 'start');
      lbl.textContent = f1(y) + ' m hoch · ' + f1(x) + ' m seitlich';
      dot.setAttribute('aria-valuetext', lbl.textContent);

      Object.keys(items).forEach(function (mid) {
        var env = envOf(mid);
        shapes[mid].fill.setAttribute('d', pathOf(env));
        shapes[mid].line.setAttribute('d', pathOf(env));
        var it = items[mid], ok = true, txt;
        var tooMany = state.persons > it.m.persons;
        var r = reachAt(env, y), top = topOf(env);
        if (tooMany) { ok = false; txt = 'Höchstens ' + it.m.persons + ' Personen im Korb'; }
        else if (y > top) { ok = false; txt = 'Zu hoch – max. ' + f2(top) + ' m'; }
        else if (inside(env, x, y) || (x <= 0.05 && y <= top)) { txt = 'Erreichbar – auf dieser Höhe bis ' + (Math.floor(r * 10) / 10).toFixed(1) + ' m seitlich'; }
        else { ok = false; txt = 'Zu weit – auf ' + f1(y) + ' m nur ' + (Math.floor(Math.max(0, r) * 10) / 10).toFixed(1) + ' m seitlich'; }
        it.li.classList.toggle('is-ok', ok);
        it.li.classList.toggle('is-no', !ok);
        it.state.textContent = txt;
        shapes[mid].g.classList.toggle('is-ok', ok);
        shapes[mid].g.classList.toggle('is-off', tooMany);
      });
      var any = Object.keys(items).some(function (k) { return items[k].li.classList.contains('is-ok'); });
      tgt.classList.toggle('is-none', !any);
    }

    /* Ziehen im Diagramm */
    var dragging = false;
    function toModel(e) {
      var ctm = svg.getScreenCTM(); if (!ctm) return;
      var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      var p = pt.matrixTransform(ctm.inverse());
      state.x = Math.round(clamp(p.x / S, 0, 11) * 10) / 10;
      state.y = Math.round(clamp(-p.y / S, 0, 19) * 10) / 10;
      update();
    }
    svg.addEventListener('pointerdown', function (e) {
      /* Touch: nur am Punkt ziehen, sonst normal scrollen */
      if (e.pointerType !== 'mouse' && e.target !== dot && e.target !== halo) return;
      dragging = true; svg.setPointerCapture(e.pointerId); toModel(e); e.preventDefault();
      tgt.classList.add('is-drag');
    });
    svg.addEventListener('pointermove', function (e) { if (dragging) toModel(e); });
    function end() { dragging = false; tgt.classList.remove('is-drag'); }
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    dot.addEventListener('keydown', function (e) {
      var d = e.shiftKey ? 1 : .1, used = true;
      if (e.key === 'ArrowUp') state.y = clamp(state.y + d, 0, 19);
      else if (e.key === 'ArrowDown') state.y = clamp(state.y - d, 0, 19);
      else if (e.key === 'ArrowRight') state.x = clamp(state.x + d, 0, 11);
      else if (e.key === 'ArrowLeft') state.x = clamp(state.x - d, 0, 11);
      else used = false;
      if (used) { e.preventDefault(); state.x = Math.round(state.x * 10) / 10; state.y = Math.round(state.y * 10) / 10; update(); }
    });
    inY.addEventListener('input', function () { state.y = +inY.value; update(true); });
    inX.addEventListener('input', function () { state.x = +inX.value; update(true); });
    side.addEventListener('change', function (e) { if (e.target.name === id + '-persons') { state.persons = +e.target.value; update(); } });

    update();

    /* Einblenden: Umrisse zeichnen sich nacheinander */
    function reveal() { root.classList.add('is-in'); }
    if (reduce || !('IntersectionObserver' in window)) reveal();
    else {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { reveal(); io.disconnect(); } }, { threshold: .3 });
      io.observe(chart);
    }

    return {
      set: function (x, y) { state.x = x; state.y = y; update(); },
      el: root
    };
  }

  window.KReach = { create: create, inside: inside, reachAt: reachAt };
})();
