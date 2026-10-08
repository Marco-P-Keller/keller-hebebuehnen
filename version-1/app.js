/* Version 1 – «Messlatte» */
(function () {
  'use strict';

  var K = window.KELLER;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var html = document.documentElement;

  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ---------- Header & Navigation ---------- */
  var header = $('[data-header]');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var navLinks = $$('.nav a');
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['maschinen', 'reichweite', 'preise', 'ablauf', 'anfrage', 'fragen', 'kontakt'].forEach(function (id) { var s = document.getElementById(id); if (s) secObs.observe(s); });
  }

  var menuBtn = $('[data-menu-btn]'), menu = $('[data-menu]');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    $('.sr', menuBtn).textContent = open ? 'Menü schliessen' : 'Menü öffnen';
    if (open) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('is-open'); }); html.style.overflow = 'hidden'; }
    else { menu.classList.remove('is-open'); html.style.overflow = ''; setTimeout(function () { if (menuBtn.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, 300); }
    updateBar();
  }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1180 && menuBtn.getAttribute('aria-expanded') === 'true') setMenu(false); });

  /* ---------- Hero ---------- */
  var title = $('.hero-title');
  if (title && !reduce) {
    var words = title.innerHTML.split(/\s+/), i = 0;
    title.innerHTML = words.map(function (w) { return '<span class="w"><span style="--i:' + (i++) + '">' + w + '</span></span>'; }).join(' ');
  }

  var heroNum = $('[data-hero-num]');
  var replay = $('[data-hero-replay]');
  var hero = KLift.create($('[data-hero-lift]'), {
    model: 'atj180', ruler: true, person: true,
    onUpdate: function (u) { heroNum.textContent = u.work.toFixed(2); }
  });
  function heroRun() {
    replay.classList.remove('is-visible');
    hero.animateTo(1, 3600, function () { replay.classList.add('is-visible'); });
  }
  if (reduce) { hero.setProgress(1); replay.classList.add('is-visible'); }
  else setTimeout(heroRun, 650);
  replay.addEventListener('click', function () {
    replay.classList.remove('is-visible');
    hero.animateTo(0, 1500, function () { setTimeout(heroRun, 200); });
  });

  /* ---------- Maschinen-Lineup ---------- */
  var VB = [-200, -1880, 860, 1910];
  var canvas = $('[data-lineup-canvas]');
  var gridLayer = document.createElement('div'); gridLayer.className = 'lineup-grid'; gridLayer.setAttribute('aria-hidden', 'true');
  var cols = document.createElement('div'); cols.className = 'lineup-cols';
  var hl = document.createElement('div'); hl.className = 'lineup-hl'; hl.setAttribute('aria-hidden', 'true');
  var hlTag = document.createElement('span'); hlTag.className = 'lineup-hl-tag'; hl.appendChild(hlTag);
  canvas.appendChild(gridLayer); canvas.appendChild(cols); canvas.appendChild(hl);

  var lifts = [], colEls = [];
  K.MACHINES.forEach(function (m) {
    var c = document.createElement('div'); c.className = 'lineup-col'; c.dataset.id = m.id;
    cols.appendChild(c);
    lifts.push(KLift.create(c, { model: m.id, viewBox: VB, label: m.brand + ' ' + m.name }));
    colEls.push(c);
  });

  function yFor(meters) {
    var svg = lifts[0].svg, ctm = svg.getScreenCTM(); if (!ctm) return 0;
    var pt = svg.createSVGPoint(); pt.x = 0; pt.y = -meters * 100;
    var p = pt.matrixTransform(ctm);
    return p.y - canvas.getBoundingClientRect().top;
  }
  function metersFor(y) {
    var y0 = yFor(0), y10 = yFor(10);
    return (y0 - y) / ((y0 - y10) / 10);
  }
  function drawGrid() {
    gridLayer.innerHTML = '';
    for (var m = 0; m <= 18; m += 2) {
      var gl = document.createElement('div');
      gl.className = 'lineup-gl' + (m === 0 ? ' lineup-gl--ground' : '');
      gl.style.top = yFor(m) + 'px';
      if (m > 0) { var s = document.createElement('span'); s.textContent = m + ' m'; gl.appendChild(s); }
      gridLayer.appendChild(gl);
    }
    placeLine();
  }

  var range = $('[data-height-range]'), out = $('[data-height-out]'), result = $('[data-height-result]');
  var need = parseFloat(range.value);
  var cards = {};

  function placeLine() { hl.style.top = yFor(need) + 'px'; }
  function setNeed(v, fromRange) {
    need = Math.round(Math.min(18.5, Math.max(3, v)) * 10) / 10;
    if (!fromRange) range.value = need;
    var pct = (need - range.min) / (range.max - range.min) * 100;
    range.style.setProperty('--p', pct + '%');
    var label = need.toFixed(1).replace('.0', '') + ' m';
    out.textContent = need.toFixed(1) + ' m';
    hlTag.textContent = label;
    placeLine();

    var fits = K.MACHINES.filter(function (m) { return m.workHeight >= need; });
    var best = fits.slice().sort(function (a, b) { return a.priceDay - b.priceDay || a.workHeight - b.workHeight; })[0];
    colEls.forEach(function (c) { var m = K.byId(c.dataset.id); c.classList.toggle('is-out', m.workHeight < need); });
    Object.keys(cards).forEach(function (id) { cards[id].classList.toggle('is-best', !!best && best.id === id); });

    if (!best) {
      result.innerHTML = 'Über 18.19 m reicht keine unserer Bühnen. Rufen Sie uns an – wir finden gemeinsam eine Lösung: <a href="tel:+41719662611">071 966 26 11</a>';
    } else {
      var txt = fits.length === 3 ? 'Alle drei Bühnen reichen. ' : (fits.length === 2 ? 'Die beiden Manitou-Bühnen reichen. ' : 'Nur die Manitou 180 ATJ reicht. ');
      txt += 'Am günstigsten: <b>' + best.brand + ' ' + best.name + '</b> ab CHF ' + K.chf(best.priceLong) + ' pro Tag.';
      if (best.id === 'goldlift' && need > 12.6) txt += ' Über 12.60 m mit einer Person im Korb (max. 120 kg).';
      result.innerHTML = txt;
    }
  }
  range.addEventListener('input', function () { setNeed(parseFloat(range.value), true); });

  /* Linie direkt ziehen (Maus überall, Touch am Etikett) */
  var dragging = false;
  function dragTo(e) { var r = canvas.getBoundingClientRect(); setNeed(metersFor(e.clientY - r.top)); }
  canvas.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' && e.target !== hlTag) return;
    dragging = true; canvas.setPointerCapture(e.pointerId); dragTo(e); e.preventDefault();
  });
  canvas.addEventListener('pointermove', function (e) { if (dragging) dragTo(e); });
  canvas.addEventListener('pointerup', function () { dragging = false; });
  canvas.addEventListener('pointercancel', function () { dragging = false; });
  hlTag.style.touchAction = 'none';

  /* Karten */
  var machinesEl = $('[data-machines]');
  K.MACHINES.forEach(function (m) {
    var a = document.createElement('article'); a.className = 'machine'; a.dataset.id = m.id;
    a.innerHTML =
      '<span class="machine-badge">Passt und ist am günstigsten</span>' +
      '<p class="machine-brand">' + m.brand + '</p>' +
      '<h3 class="machine-name">' + m.name + '</h3>' +
      '<p class="machine-type">' + m.type + '</p>' +
      '<ul class="machine-specs">' +
        '<li><b>' + m.workHeight.toFixed(2) + ' m</b><span>Arbeitshöhe</span></li>' +
        '<li><b>' + m.reach.toFixed(2) + ' m</b><span>Seitliche Reichweite</span></li>' +
        '<li><b>' + m.payload + ' kg</b><span>Korblast</span></li>' +
        '<li><b>' + K.chf(m.weight).replace('.–', '') + ' kg</b><span>Gewicht</span></li>' +
      '</ul>' +
      '<p class="machine-pitch">' + m.pitch + '</p>' +
      '<p class="machine-price"><b>CHF ' + K.chf(m.priceDay) + '</b><span>pro Tag, ab 6 Tagen CHF ' + K.chf(m.priceLong) + '</span></p>' +
      '<div class="machine-actions">' +
        '<button class="btn btn--line btn--sm" type="button" data-sheet-open="' + m.id + '">Datenblatt</button>' +
        '<button class="btn btn--red btn--sm" type="button" data-request="' + m.id + '">Anfragen</button>' +
      '</div>';
    machinesEl.appendChild(a);
    cards[m.id] = a;
  });

  setNeed(need);
  requestAnimationFrame(drawGrid);
  window.addEventListener('resize', drawGrid);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawGrid);
  if (window.ResizeObserver) new ResizeObserver(drawGrid).observe(canvas);

  var raised = false;
  function raiseLineup() {
    if (raised) return; raised = true;
    lifts.forEach(function (l, i) {
      if (reduce) l.setProgress(1);
      else setTimeout(function () { l.animateTo(1, 2800); }, 180 * i);
    });
  }
  if ('IntersectionObserver' in window) {
    var lo = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { raiseLineup(); lo.disconnect(); } }, { threshold: .35 });
    lo.observe(canvas);
  } else raiseLineup();

  /* ---------- Dialoge ---------- */
  function openDialog(d) {
    if (typeof d.showModal !== 'function') { d.setAttribute('open', ''); return; }
    d.classList.remove('is-closing'); d.showModal(); html.style.overflow = 'hidden';
  }
  function closeDialog(d, cb) {
    if (!d.open) { if (cb) cb(); return; }
    if (reduce) { d.close(); html.style.overflow = ''; if (cb) cb(); return; }
    d.classList.add('is-closing');
    setTimeout(function () { d.classList.remove('is-closing'); d.close(); html.style.overflow = ''; if (cb) cb(); }, 260);
  }
  $$('dialog').forEach(function (d) {
    d.addEventListener('cancel', function (e) { e.preventDefault(); closeDialog(d); });
    d.addEventListener('click', function (e) { if (e.target === d) closeDialog(d); });
  });

  var sheet = $('[data-sheet]'), sheetId = null;
  function openSheet(id) {
    var m = K.byId(id); sheetId = id;
    $('[data-sheet-brand]').textContent = m.brand + ' · ' + m.type;
    $('[data-sheet-title]').textContent = m.name;
    var body = '<p class="sheet-pitch">' + m.pitch + '</p><ul class="sheet-hl">' + m.highlights.map(function (h) { return '<li>' + h + '</li>'; }).join('') + '</ul>';
    m.specs.forEach(function (g) {
      body += '<section class="spec-group"><h3>' + g.group + '</h3><table class="spec-table"><tbody>' +
        g.rows.map(function (r) { return '<tr><th scope="row">' + r[0] + (r[1] ? '<small>' + r[1] + '</small>' : '') + '</th><td>' + r[2] + '</td></tr>'; }).join('') +
        '</tbody></table></section>';
    });
    body += '<p class="spec-foot">' + m.footnote + '</p>';
    $('[data-sheet-body]').innerHTML = body;
    $('[data-sheet-body]').scrollTop = 0;
    $('[data-sheet-price]').innerHTML = '<b>CHF ' + K.chf(m.priceDay) + '</b> pro Tag · ab 6 Tagen CHF ' + K.chf(m.priceLong);
    openDialog(sheet);
  }
  $('[data-sheet-close]').addEventListener('click', function () { closeDialog(sheet); });
  $('[data-sheet-request]').addEventListener('click', function () { var id = sheetId; closeDialog(sheet, function () { requestMachine(id); }); });

  var legal = $('[data-legal]');
  $$('[data-open-legal]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-open-legal');
      $('[data-legal-title]').textContent = k === 'impressum' ? 'Impressum' : 'Datenschutz';
      $('[data-legal-body]').innerHTML = document.getElementById('legal-' + k).innerHTML;
      openDialog(legal);
    });
  });
  $('[data-legal-close]').addEventListener('click', function () { closeDialog(legal); });

  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-sheet-open]'); if (o) { openSheet(o.getAttribute('data-sheet-open')); return; }
    var r = e.target.closest('[data-request]'); if (r) requestMachine(r.getAttribute('data-request'));
  });

  /* ---------- Anfrage ---------- */
  var picks = $('[data-picks]'), minis = {};
  K.MACHINES.forEach(function (m) {
    var l = document.createElement('label'); l.className = 'pick';
    l.innerHTML = '<input type="radio" name="maschine" value="' + m.id + '"><span class="pick-card"><span class="pick-art"></span>' +
      '<span><span class="pick-name">' + m.name + '</span><span class="pick-meta">' + m.brand + ' · ' + m.workHeight.toFixed(2).replace(/0$/, '') + ' m</span>' +
      '<span class="pick-price">ab CHF ' + K.chf(m.priceLong) + ' / Tag</span></span></span><span class="pick-check" aria-hidden="true"></span>';
    picks.appendChild(l);
    var art = $('.pick-art', l);
    minis[m.id] = KLift.create(art, { model: m.id, crew: false, viewBox: [-210, -330, 880, 345], ground: true });
  });
  picks.addEventListener('change', function (e) {
    Object.keys(minis).forEach(function (id) {
      var on = e.target.value === id;
      if (reduce) minis[id].setProgress(on ? .1 : 0); else minis[id].animateTo(on ? .1 : 0, 900);
    });
  });

  var form = $('[data-form]');
  var cal = KBooking.calendar($('[data-calendar]'));
  var grid = $('.request-grid'), success = $('[data-success]');
  var bf = KBooking.form(form, {
    calendar: cal,
    scrollOffset: 100,
    onSuccess: function (p) {
      $('[data-success-text]').innerHTML = 'Wir haben Ihre Anfrage für die <b>' + p['Maschine'].split(' (')[0] + '</b> vom ' + p['Mietbeginn'] + ' bis ' + p['Mietende'] +
        ' erhalten und melden uns so rasch wie möglich unter ' + p['Telefon'] + ' oder ' + p['email'] + '.';
      grid.hidden = true; success.hidden = false;
      $('#anfrage .section-head').hidden = true;
      var y = $('#anfrage').getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      success.focus({ preventScroll: true });
    }
  });
  $('[data-success-reset]').addEventListener('click', function () {
    bf.reset(); success.hidden = true; grid.hidden = false; $('#anfrage .section-head').hidden = false;
    Object.keys(minis).forEach(function (id) { minis[id].setProgress(0); });
  });

  /* Auf Tablet/Handy: Zusammenfassung direkt vor den Senden-Knopf */
  var summary = $('.summary'), submitRow = $('.form-submit', form);
  var mq = window.matchMedia('(max-width: 1024px)');
  function placeSummary() {
    if (mq.matches) form.insertBefore(summary, submitRow);
    else if (summary.parentNode !== grid) grid.appendChild(summary);
  }
  if (mq.addEventListener) mq.addEventListener('change', placeSummary); else mq.addListener(placeSummary);
  placeSummary();

  function requestMachine(id) {
    bf.selectMachine(id);
    var target = $('#anfrage');
    var y = target.getBoundingClientRect().top + window.pageYOffset - 70;
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------- Reichweite ---------- */
  KReach.create($('[data-reach]'), { onRequest: requestMachine });

  /* ---------- Ablauf: Fortschrittslinie ---------- */
  var steps = $('[data-steps]'), stepEls = $$('.step', steps);
  function stepProgress() {
    var r = steps.getBoundingClientRect(), vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (vh * .55)));
    steps.style.setProperty('--progress', p.toFixed(3));
    stepEls.forEach(function (s, i) { s.classList.toggle('is-on', p >= i / stepEls.length + .02 || (p >= .98)); });
  }
  if (reduce) { steps.style.setProperty('--progress', 1); stepEls.forEach(function (s) { s.classList.add('is-on'); }); }
  else { window.addEventListener('scroll', stepProgress, { passive: true }); stepProgress(); }

  /* ---------- FAQ: weich auf- und zuklappen ---------- */
  $$('.faq details').forEach(function (d) {
    var s = $('summary', d), p = $('p', d);
    s.addEventListener('click', function (e) {
      if (reduce) return;
      e.preventDefault();
      if (d.open) {
        var h = p.offsetHeight;
        p.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0, marginBottom: '0px' }], { duration: 300, easing: 'cubic-bezier(.2,.7,.1,1)' }).onfinish = function () { d.open = false; };
      } else {
        d.open = true;
        var h2 = p.offsetHeight;
        p.animate([{ height: '0px', opacity: 0, marginBottom: '0px' }, { height: h2 + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.1,1)' });
      }
    });
    p.style.overflow = 'hidden';
  });

  /* ---------- Mobile-Leiste ---------- */
  var bar = $('[data-mobile-bar]');
  var hideZones = [$('#anfrage'), $('.site-footer')];
  function updateBar() {
    var vh = window.innerHeight, hide = menuBtn.getAttribute('aria-expanded') === 'true' || window.scrollY < 120;
    hideZones.forEach(function (z) { var r = z.getBoundingClientRect(); if (r.top < vh - 40 && r.bottom > 80) hide = true; });
    bar.classList.toggle('is-hidden', hide);
  }
  window.addEventListener('scroll', updateBar, { passive: true }); updateBar();
})();
