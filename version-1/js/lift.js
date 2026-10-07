/* =========================================================================
   KLift – animierbare Vektor-Zeichnungen der drei Hebebühnen.
   Einheiten: 1 = 1 cm. Boden liegt bei y = 0, nach oben ist y negativ.
   Die Auslegerlänge wird so berechnet, dass die gezeichnete Plattformhöhe
   bei voller Ausfahrt exakt dem Datenblatt entspricht.

   KLift.create(container, {
     model: 'atj180' | 'atj160' | 'goldlift',
     ruler: false,      // Höhenlineal links
     person: false,     // 1.80-m-Person als Grössenvergleich
     crew: true,        // Arbeiter im Korb
     progress: 0,       // 0 = eingefahren, 1 = voll ausgefahren
     onUpdate: fn({progress, platform, work})
   }) -> { svg, setProgress(t), animateTo(t, ms), progress() }
   ========================================================================= */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  var MODELS = {
    atj180: {
      kind: 'atj', platform: 1619, work: 1819,
      armA: 300, armB: 300, boom: 470, jib: 140, basket: 180,
      ext: { a1: 80, a2: 80, a3: 76, a4: 48 },
      stow: { a1: 0, a2: 180, a3: 0, a4: -70 },
      label: '180 ATJ'
    },
    atj160: {
      kind: 'atj', platform: 1421, work: 1621,
      armA: 285, armB: 285, boom: 430, jib: 130, basket: 230,
      ext: { a1: 80, a2: 80, a3: 76, a4: 50 },
      stow: { a1: 0, a2: 180, a3: 0, a4: -68 },
      label: '160 ATJ'
    },
    goldlift: {
      kind: 'spider', platform: 1200, work: 1400,
      armA: 230, armB: 230, boom: 320, jib: 100, basket: 140,
      ext: { a1: 81, a2: 81, a3: 77, a4: 50 },
      stow: { a1: 0, a2: 180, a3: 0, a4: -70 },
      label: 'Goldlift 14.70'
    }
  };

  /* ---------- kleine Helfer ---------- */
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function rad(d) { return d * Math.PI / 180; }
  function dir(a) { return [Math.cos(rad(a)), -Math.sin(rad(a))]; }
  function nrm(a) { return [-Math.sin(rad(a)), -Math.cos(rad(a))]; } /* links vom Richtungsvektor (visuell oben bei 0°) */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function phase(t, a, b) { return ease(clamp((t - a) / (b - a), 0, 1)); }
  function place(g, x, y, a) { g.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') rotate(' + (-a).toFixed(3) + ')'); }

  /* Farben über CSS-Variablen, damit jede Website-Version sie anpassen kann */
  var C = {
    red: 'var(--lift-red, #C9362B)',
    redDark: 'var(--lift-red-dark, #8E1F17)',
    boom: 'var(--lift-boom, #2A2C31)',
    boomHi: 'var(--lift-boom-hi, #474B53)',
    steel: 'var(--lift-steel, #9EA4AB)',
    steelDark: 'var(--lift-steel-dark, #6B7178)',
    tire: 'var(--lift-tire, #18191B)',
    rim: 'var(--lift-rim, #5B6067)',
    chrome: 'var(--lift-chrome, #D9DDE1)',
    edge: 'var(--lift-edge, rgba(0,0,0,.28))',
    ink: 'var(--lift-ink, currentColor)',
    accent: 'var(--lift-accent, #C9362B)',
    vest: 'var(--lift-vest, #F08A24)',
    helmet: 'var(--lift-helmet, #F4F4F2)',
    person: 'var(--lift-person, #2B2D31)'
  };

  function gradients(defs, p) {
    function lg(id, stops, x2, y2) {
      var g = el('linearGradient', { id: p + id, x1: 0, y1: 0, x2: x2 || 0, y2: y2 == null ? 1 : y2 }, defs);
      stops.forEach(function (s) { el('stop', { offset: s[0], style: 'stop-color:' + s[1] + ';stop-opacity:' + (s[2] == null ? 1 : s[2]) }, g); });
    }
    lg('body', [[0, 'var(--lift-red-hi, #E4503F)'], [.55, C.red], [1, C.redDark]]);
    lg('boom', [[0, C.boomHi], [.45, C.boom], [1, C.boom]]);
    lg('redboom', [[0, 'var(--lift-red-hi, #E4503F)'], [.5, C.red], [1, C.redDark]]);
    lg('sheen', [[0, '#fff', .38], [.5, '#fff', 0]]);
    var r = el('radialGradient', { id: p + 'shadow', cx: .5, cy: .5, r: .5 }, defs);
    el('stop', { offset: 0, style: 'stop-color:var(--lift-shadow, #000);stop-opacity:.32' }, r);
    el('stop', { offset: 1, style: 'stop-color:var(--lift-shadow, #000);stop-opacity:0' }, r);
  }

  /* Rechteckiger Ausleger entlang +x, Drehpunkt bei (0,0) */
  function arm(parent, len, th, fill, p, opts) {
    opts = opts || {};
    var g = el('g', null, parent);
    var o = opts.over == null ? th * .7 : opts.over;
    el('rect', { x: -o, y: -th / 2, width: len + o * 2, height: th, rx: th / 2.2, fill: fill, stroke: C.edge, 'stroke-width': 1.2 }, g);
    el('rect', { x: -o + 4, y: -th / 2 + 2.5, width: len + o * 2 - 8, height: th * .32, rx: th * .16, fill: 'url(#' + p + 'sheen)' }, g);
    if (opts.stripe) el('rect', { x: len * .18, y: th * .12, width: len * .5, height: Math.max(2.5, th * .12), rx: 1.5, fill: opts.stripe }, g);
    if (opts.pins !== false) {
      [0, len].forEach(function (x) {
        el('circle', { cx: x, cy: 0, r: th * .34, fill: C.steelDark, stroke: C.edge, 'stroke-width': 1 }, g);
        el('circle', { cx: x, cy: 0, r: th * .14, fill: C.chrome }, g);
      });
    }
    return g;
  }

  function wheel(parent, x, y, r) {
    var g = el('g', { transform: 'translate(' + x + ' ' + y + ')' }, parent);
    el('circle', { r: r, fill: C.tire }, g);
    el('circle', { r: r - 3.5, fill: 'none', stroke: 'rgba(255,255,255,.07)', 'stroke-width': 6, 'stroke-dasharray': '7 6' }, g);
    el('circle', { r: r * .6, fill: C.rim, stroke: 'rgba(0,0,0,.35)', 'stroke-width': 2 }, g);
    el('circle', { r: r * .43, fill: 'none', stroke: 'rgba(255,255,255,.18)', 'stroke-width': 2 }, g);
    for (var i = 0; i < 6; i++) {
      var a = i * 60 * Math.PI / 180;
      el('circle', { cx: Math.cos(a) * r * .3, cy: Math.sin(a) * r * .3, r: 2.4, fill: 'rgba(0,0,0,.45)' }, g);
    }
    el('circle', { r: r * .14, fill: C.chrome }, g);
    return g;
  }

  /* Arbeitskorb: Befestigung links (x=0), Boden 35 cm unter dem Korbarm */
  function basket(parent, len, p, crew) {
    var g = el('g', null, parent);
    var fy = 35, rail = 110;
    /* Rotator */
    el('rect', { x: -14, y: -12, width: 26, height: fy + 6, rx: 4, fill: C.boom, stroke: C.edge }, g);
    /* Bedienpult */
    el('rect', { x: 6, y: fy - 98, width: 20, height: 34, rx: 3, fill: C.boom }, g);
    el('rect', { x: 9, y: fy - 94, width: 14, height: 7, rx: 1.5, fill: C.accent }, g);
    if (crew) {
      var cx = len * .52;
      var pc = el('g', { transform: 'translate(' + cx + ' ' + fy + ')' }, g);
      el('path', { d: 'M-17,-60 L-15,-128 Q-14,-142 0,-142 Q14,-142 15,-128 L17,-60 Z', fill: C.person }, pc);
      el('path', { d: 'M-15.5,-126 Q-14,-141 0,-141 Q14,-141 15.5,-126 L16,-96 L-16,-96 Z', fill: C.vest }, pc);
      el('rect', { x: -15.5, y: -116, width: 31, height: 4, fill: 'rgba(255,255,255,.75)' }, pc);
      el('circle', { cx: 1, cy: -156, r: 11, fill: 'var(--lift-skin, #C99A7A)' }, pc);
      el('path', { d: 'M-12,-157 Q-11,-172 1,-172 Q13,-172 14,-157 L17,-155 L-14,-155 Z', fill: C.helmet, stroke: 'rgba(0,0,0,.18)', 'stroke-width': 1 }, pc);
      el('path', { d: 'M14,-128 Q32,-122 38,-104', fill: 'none', stroke: C.person, 'stroke-width': 8, 'stroke-linecap': 'round' }, pc);
    }
    /* Geländer */
    var rs = { stroke: C.steel, 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none' };
    var top = el('path', { d: 'M0,' + (fy - rail) + ' H' + len }, g); for (var k in rs) top.setAttribute(k, rs[k]);
    var mid = el('path', { d: 'M0,' + (fy - rail / 2) + ' H' + len }, g); for (k in rs) mid.setAttribute(k, rs[k]);
    mid.setAttribute('stroke-width', 3.5);
    var posts = Math.max(2, Math.round(len / 60));
    for (var i = 0; i <= posts; i++) {
      var px = len * i / posts;
      var po = el('path', { d: 'M' + px + ',' + (fy - rail) + ' V' + fy }, g); for (k in rs) po.setAttribute(k, rs[k]);
      po.setAttribute('stroke-width', i === 0 || i === posts ? 5 : 3.5);
    }
    /* Fussleiste & Boden */
    el('rect', { x: -2, y: fy - 16, width: len + 4, height: 16, rx: 2, fill: C.steelDark, stroke: C.edge }, g);
    el('rect', { x: -4, y: fy - 2, width: len + 8, height: 6, rx: 2, fill: C.boom }, g);
    return g;
  }

  function cylinder(parent) {
    var g = el('g', null, parent);
    var rod = el('line', { stroke: C.chrome, 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    var bar = el('line', { stroke: C.steelDark, 'stroke-width': 12, 'stroke-linecap': 'round' }, g);
    return function (x1, y1, x2, y2) {
      var mx = x1 + (x2 - x1) * .58, my = y1 + (y2 - y1) * .58;
      rod.setAttribute('x1', mx); rod.setAttribute('y1', my); rod.setAttribute('x2', x2); rod.setAttribute('y2', y2);
      bar.setAttribute('x1', x1); bar.setAttribute('y1', y1); bar.setAttribute('x2', mx); bar.setAttribute('y2', my);
    };
  }

  /* ---------- Fahrgestelle ---------- */
  function atjBase(root, p) {
    var g = el('g', null, root);
    /* Chassis */
    el('rect', { x: -176, y: -84, width: 352, height: 34, rx: 10, fill: C.boom, stroke: C.edge }, g);
    el('rect', { x: -186, y: -80, width: 40, height: 26, rx: 6, fill: C.red }, g);
    el('rect', { x: 146, y: -80, width: 40, height: 26, rx: 6, fill: C.red }, g);
    el('rect', { x: -130, y: -72, width: 260, height: 5, rx: 2.5, fill: 'rgba(255,255,255,.08)' }, g);
    wheel(g, -110, -45.4, 45.4);
    wheel(g, 110, -45.4, 45.4);
    /* Drehkranz */
    el('rect', { x: -70, y: -94, width: 130, height: 12, rx: 3, fill: C.steelDark }, g);
    /* Oberwagen */
    el('path', { d: 'M-150,-90 L62,-90 Q78,-90 78,-106 L78,-150 Q78,-180 48,-180 L-118,-180 Q-170,-180 -170,-135 Q-170,-90 -150,-90 Z', fill: 'url(#' + p + 'body)', stroke: C.edge, 'stroke-width': 1.2 }, g);
    el('path', { d: 'M-160,-118 L70,-118', stroke: 'rgba(0,0,0,.22)', 'stroke-width': 2 }, g);
    el('path', { d: 'M-150,-172 Q-120,-176 -60,-176 L40,-176', stroke: 'rgba(255,255,255,.35)', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
    for (var i = 0; i < 4; i++) el('rect', { x: -128 + i * 16, y: -158, width: 8, height: 30, rx: 3, fill: 'rgba(0,0,0,.28)' }, g);
    el('rect', { x: 22, y: -160, width: 40, height: 30, rx: 5, fill: C.boom }, g);
    el('rect', { x: 28, y: -154, width: 12, height: 8, rx: 2, fill: C.accent }, g);
    el('circle', { cx: 52, cy: -150, r: 3.5, fill: C.chrome }, g);
    el('rect', { x: -60, y: -112, width: 70, height: 14, rx: 3, fill: 'rgba(0,0,0,.18)' }, g);
    return { g: g, p0: [-36, -192], cylBase: [40, -150] };
  }

  function spiderBase(root, p, back) {
    /* Raupen + Unterwagen (wird beim Abstützen angehoben) */
    var g = el('g', null, root);
    el('rect', { x: -102, y: -38, width: 204, height: 38, rx: 19, fill: C.tire }, g);
    el('rect', { x: -96, y: -33, width: 192, height: 28, rx: 14, fill: 'none', stroke: 'rgba(255,255,255,.08)', 'stroke-width': 5, 'stroke-dasharray': '6 7' }, g);
    [-80, -40, 0, 40, 80].forEach(function (x, i) {
      el('circle', { cx: x, cy: -19, r: i === 0 || i === 4 ? 14 : 9, fill: C.rim, stroke: 'rgba(0,0,0,.4)' }, g);
      el('circle', { cx: x, cy: -19, r: 3, fill: C.chrome }, g);
    });
    el('rect', { x: -96, y: -62, width: 192, height: 26, rx: 6, fill: C.boom, stroke: C.edge }, g);
    el('rect', { x: -86, y: -56, width: 172, height: 4, rx: 2, fill: 'rgba(255,255,255,.1)' }, g);
    /* Drehturm */
    el('rect', { x: -40, y: -70, width: 80, height: 10, rx: 3, fill: C.steelDark }, g);
    el('path', { d: 'M-78,-70 L44,-70 Q58,-70 58,-84 L58,-104 Q58,-118 44,-118 L-64,-118 Q-78,-118 -78,-104 Z', fill: 'url(#' + p + 'body)', stroke: C.edge }, g);
    el('rect', { x: -70, y: -112, width: 44, height: 34, rx: 5, fill: C.boom }, g);
    for (var i = 0; i < 3; i++) el('rect', { x: -64, y: -106 + i * 9, width: 32, height: 4, rx: 2, fill: 'rgba(255,255,255,.14)' }, g);
    el('rect', { x: 18, y: -108, width: 30, height: 22, rx: 4, fill: 'rgba(0,0,0,.25)' }, g);
    el('rect', { x: 23, y: -103, width: 10, height: 6, rx: 1.5, fill: C.accent }, g);
    return { g: g, p0: [-20, -126], cylBase: [30, -104] };
  }

  /* Stütze: Drehpunkt (0,0), Länge len, Teller bleibt waagrecht */
  function outrigger(parent, len, muted) {
    var g = el('g', { opacity: muted ? .55 : 1 }, parent);
    var legG = el('g', null, g);
    el('rect', { x: -8, y: -8, width: len + 8, height: 16, rx: 7, fill: C.steelDark, stroke: C.edge }, legG);
    el('rect', { x: len * .45, y: -5.5, width: len * .55, height: 11, rx: 5, fill: C.steel }, legG);
    el('circle', { r: 6, fill: C.chrome }, legG);
    var pad = el('g', null, g);
    el('rect', { x: -15, y: 0, width: 30, height: 9, rx: 3, fill: C.boom }, pad);
    el('rect', { x: -3, y: -8, width: 6, height: 10, fill: C.steelDark }, pad);
    return function (px, py, a) {
      place(legG, 0, 0, a);
      g.setAttribute('transform', 'translate(' + px.toFixed(2) + ' ' + py.toFixed(2) + ')');
      var d = dir(a);
      pad.setAttribute('transform', 'translate(' + (d[0] * len).toFixed(2) + ' ' + (d[1] * len + 6).toFixed(2) + ')');
    };
  }

  /* ---------- Fabrik ---------- */
  function create(container, opts) {
    opts = opts || {};
    var M = MODELS[opts.model] || MODELS.atj180;
    var p = 'kl' + (++uid) + '-';
    var spider = M.kind === 'spider';
    var boomFill = spider ? 'url(#' + p + 'redboom)' : 'url(#' + p + 'boom)';
    var armTh = spider ? 22 : 28, boomTh = spider ? 24 : 32, jibTh = spider ? 15 : 18;

    var top = M.work + 60;
    var x0 = opts.ruler ? -420 : (opts.person ? -330 : -230);
    var x1 = opts.right || 690;
    var vb = opts.viewBox || [x0, -top, x1 - x0, top + 40];
    var svg = el('svg', {
      viewBox: vb.join(' '),
      'class': 'klift klift--' + opts.model,
      role: 'img',
      'aria-label': (opts.label || M.label) + ' – technische Illustration',
      preserveAspectRatio: opts.align || 'xMidYMax meet'
    });
    svg.style.overflow = 'visible';
    var defs = el('defs', null, svg);
    gradients(defs, p);

    /* Boden */
    if (opts.ground !== false) {
      el('ellipse', { cx: spider ? 40 : 60, cy: 2, rx: spider ? 260 : 330, ry: 16, fill: 'url(#' + p + 'shadow)' }, svg);
    }

    /* Massstab-Person */
    if (opts.person) {
      var pg = el('g', { transform: 'translate(' + (opts.ruler ? -265 : -270) + ' 0)', 'class': 'klift-person' }, svg);
      el('circle', { cx: 0, cy: -166, r: 12, fill: C.person }, pg);
      el('path', { d: 'M-13,-168 Q-12,-184 0,-184 Q12,-184 13,-168 Z', fill: C.helmet, stroke: 'rgba(0,0,0,.2)' }, pg);
      el('path', { d: 'M-21,-148 Q-21,-152 -16,-152 L16,-152 Q21,-152 21,-148 L24,-80 L15,-80 L13,-6 L4,-6 L1,-78 L-1,-78 L-4,-6 L-13,-6 L-15,-80 L-24,-80 Z', fill: C.person }, pg);
      el('rect', { x: -19, y: -150, width: 38, height: 40, rx: 4, fill: C.vest }, pg);
      el('rect', { x: -19, y: -134, width: 38, height: 4, fill: 'rgba(255,255,255,.8)' }, pg);
      if (opts.personLabel !== false) {
        var t = el('text', { x: 0, y: 22, 'text-anchor': 'middle', 'class': 'klift-label' }, pg);
        t.textContent = '1.80 m';
      }
    }

    var root = el('g', { 'class': 'klift-machine' }, svg);
    var outBack = [], outFront = [];
    var backLayer = el('g', null, root);
    var base = spider ? spiderBase(root, p) : atjBase(root, p);
    if (spider) {
      outBack.push(outrigger(backLayer, 84, true), outrigger(backLayer, 84, true));
    }
    var cylA = cylinder(root);
    var gA = arm(root, M.armA, armTh, boomFill, p);
    var gB = arm(root, M.armB, armTh, boomFill, p);
    var head = el('path', { fill: boomFill, stroke: C.edge }, root);
    var cylM = cylinder(root);
    var inner = el('g', null, root);
    var innerLen = M.boom * .96;
    el('rect', { x: 0, y: -boomTh * .36, width: innerLen, height: boomTh * .72, rx: 5, fill: spider ? C.redDark : C.steelDark, stroke: C.edge }, inner);
    el('rect', { x: 0, y: -boomTh * .36 + 2, width: innerLen, height: 3, fill: 'rgba(255,255,255,.18)' }, inner);
    var gM = arm(root, M.boom, boomTh, boomFill, p, { pins: false, stripe: spider ? 'rgba(255,255,255,.65)' : C.red });
    var pinM = el('g', null, root);
    el('circle', { r: boomTh * .34, fill: C.steelDark }, pinM);
    el('circle', { r: boomTh * .14, fill: C.chrome }, pinM);
    var gJ = arm(root, M.jib, jibTh, boomFill, p);
    var gK = basket(root, M.basket, p, opts.crew !== false);
    if (spider) {
      outFront.push(outrigger(root, 84), outrigger(root, 84));
    }

    /* Lineal & Höhenanzeige */
    var marker = null, markerText = null, markerLine = null;
    if (opts.ruler) {
      var rg = el('g', { 'class': 'klift-ruler' }, svg);
      var rx = -360, maxM = Math.floor((M.work + 50) / 100);
      el('line', { x1: rx, y1: 0, x2: rx, y2: -maxM * 100, 'class': 'klift-ruler-axis' }, rg);
      for (var m = 0; m <= maxM; m++) {
        var big = m % 2 === 0;
        el('line', { x1: rx, x2: rx + (big ? 30 : 16), y1: -m * 100, y2: -m * 100, 'class': big ? 'klift-tick klift-tick--big' : 'klift-tick' }, rg);
        if (big) {
          var tx = el('text', { x: rx - 14, y: -m * 100 + 9, 'text-anchor': 'end', 'class': 'klift-label' }, rg);
          tx.textContent = m + ' m';
        }
        if (m < maxM) el('line', { x1: rx, x2: rx + 9, y1: -m * 100 - 50, y2: -m * 100 - 50, 'class': 'klift-tick klift-tick--minor' }, rg);
      }
      marker = el('g', { 'class': 'klift-marker' }, svg);
      markerLine = el('line', { x1: rx, x2: 0, y1: 0, y2: 0, 'class': 'klift-marker-line' }, marker);
      el('path', { d: 'M' + rx + ',0 l-14,-9 v18 z', 'class': 'klift-marker-head' }, marker);
      markerText = el('text', { x: rx + 40, y: -14, 'class': 'klift-marker-text' }, marker);
    }

    var state = { t: 0 };
    var raf = null;

    function setProgress(t) {
      t = clamp(t, 0, 1);
      state.t = t;
      var S = M.stow, E = M.ext;
      var lift = 0;
      var tt = t;
      if (spider) {
        /* 0–0.25: Stützen ausfahren und anheben, danach Ausleger */
        var so = phase(t, 0, .18), up = phase(t, .14, .26);
        lift = up * 28;
        tt = clamp((t - .22) / .78, 0, 1);
        var stowA = [72, 108], depA = [-58, 238];
        outFront.forEach(function (f, i) { f(i ? -86 : 86, -50 - lift, lerp(stowA[i], depA[i], so)); });
        outBack.forEach(function (f, i) { f(i ? -74 : 74, -56 - lift, lerp(stowA[i], depA[i], so)); });
        base.g.setAttribute('transform', 'translate(0 ' + (-lift).toFixed(2) + ')');
      }
      var p1 = phase(tt, 0, .5), p2 = phase(tt, .25, .78), p3 = phase(tt, .5, 1);
      var a1 = lerp(S.a1, E.a1, p1);
      var a2 = lerp(S.a2, E.a2, p1);
      var a3 = lerp(S.a3, E.a3, p2);
      var a4 = lerp(S.a4, E.a4, p3);

      var P0 = [base.p0[0], base.p0[1] - lift];
      place(gA, P0[0], P0[1], a1);
      var dA = dir(a1), nA = nrm(a1);
      var endA = [P0[0] + dA[0] * M.armA, P0[1] + dA[1] * M.armA];
      var off = armTh + 2;
      var PB = [endA[0] + nA[0] * off, endA[1] + nA[1] * off];
      place(gB, PB[0], PB[1], a2);
      var dB = dir(a2), nB = nrm(a2);
      var endB = [PB[0] + dB[0] * M.armB, PB[1] + dB[1] * M.armB];
      var hoff = (armTh + boomTh) / 2 + 4;
      var PM = [endB[0] - nB[0] * hoff, endB[1] - nB[1] * hoff];

      /* Knickgelenk-Kopf */
      var hw = armTh * .75;
      head.setAttribute('d', 'M' + (endB[0] - dB[0] * hw) + ',' + (endB[1] - dB[1] * hw) +
        ' L' + (PM[0] - dB[0] * hw) + ',' + (PM[1] - dB[1] * hw) +
        ' L' + (PM[0] + dB[0] * hw) + ',' + (PM[1] + dB[1] * hw) +
        ' L' + (endB[0] + dB[0] * hw) + ',' + (endB[1] + dB[1] * hw) + ' Z');

      /* Teleskop: Länge so, dass die Plattformhöhe stimmt */
      var dM = dir(a3);
      var jibD = dir(a4);
      var ext = calibrated() * p3;
      place(gM, PM[0], PM[1], a3);
      place(inner, PM[0] + dM[0] * (M.boom - innerLen + ext), PM[1] + dM[1] * (M.boom - innerLen + ext), a3);
      pinM.setAttribute('transform', 'translate(' + PM[0] + ' ' + PM[1] + ')');
      var tipM = [PM[0] + dM[0] * (M.boom + ext), PM[1] + dM[1] * (M.boom + ext)];
      place(gJ, tipM[0], tipM[1], a4);
      var tipJ = [tipM[0] + jibD[0] * M.jib, tipM[1] + jibD[1] * M.jib];
      gK.setAttribute('transform', 'translate(' + tipJ[0].toFixed(2) + ' ' + tipJ[1].toFixed(2) + ')');

      /* Zylinder */
      var cA = [P0[0] + dA[0] * M.armA * .38 + nA[0] * -4, P0[1] + dA[1] * M.armA * .38 + nA[1] * -4];
      cylA(base.cylBase[0], base.cylBase[1] - lift, cA[0], cA[1]);
      var cm1 = [endB[0] - dB[0] * M.armB * .25, endB[1] - dB[1] * M.armB * .25];
      var cm2 = [PM[0] + dM[0] * M.boom * .3, PM[1] + dM[1] * M.boom * .3];
      cylM(cm1[0], cm1[1], cm2[0], cm2[1]);

      var platform = Math.max(0, -(tipJ[1] + 35));
      var work = platform + 200;
      if (marker) {
        marker.setAttribute('transform', 'translate(0 ' + (-work).toFixed(2) + ')');
        markerLine.setAttribute('x2', tipJ[0] + M.basket / 2);
        markerText.textContent = (work / 100).toFixed(2) + ' m';
      }
      if (opts.onUpdate) opts.onUpdate({ progress: t, platform: platform / 100, work: work / 100, basket: [tipJ[0], tipJ[1]], basketLen: M.basket });
    }

    /* Benötigte Teleskop-Länge für die Datenblatt-Plattformhöhe */
    var _cal = null;
    function calibrated() {
      if (_cal != null) return _cal;
      var E = M.ext, lift = spider ? 28 : 0;
      var P0y = base.p0[1] - lift;
      var dA = dir(E.a1), nA = nrm(E.a1), dB = dir(E.a2), nB = nrm(E.a2), dM = dir(E.a3), dJ = dir(E.a4);
      var off = armTh + 2, hoff = (armTh + boomTh) / 2 + 4;
      var y = P0y + dA[1] * M.armA + nA[1] * off + dB[1] * M.armB - nB[1] * hoff + dM[1] * M.boom + dJ[1] * M.jib + 35;
      var floor = -y;
      _cal = Math.max(0, (M.platform - floor) / -dM[1]);
      return _cal;
    }

    function animateTo(target, ms, done) {
      if (raf) cancelAnimationFrame(raf);
      var from = state.t, start = null;
      ms = ms == null ? 2400 : ms;
      if (ms <= 0) { setProgress(target); if (done) done(); return; }
      function step(ts) {
        if (start == null) start = ts;
        var k = clamp((ts - start) / ms, 0, 1);
        var e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        setProgress(lerp(from, target, e));
        if (k < 1) raf = requestAnimationFrame(step); else { raf = null; if (done) done(); }
      }
      raf = requestAnimationFrame(step);
    }

    container.appendChild(svg);
    setProgress(opts.progress || 0);
    return {
      svg: svg,
      model: M,
      setProgress: setProgress,
      animateTo: animateTo,
      progress: function () { return state.t; },
      extension: calibrated,
      stop: function () { if (raf) cancelAnimationFrame(raf); raf = null; }
    };
  }

  window.KLift = { create: create, MODELS: MODELS };
})();
