/* Version 3 – «Werkhof» */
(function () {
  'use strict';

  var K = window.KELLER;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var html = document.documentElement;
  function smooth(y) { window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); }
  function toEl(el, off) { smooth(el.getBoundingClientRect().top + window.pageYOffset - (off == null ? 90 : off)); }

  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ---------- Header & Menü ---------- */
  var header = $('[data-header]');
  var menuBtn = $('[data-menu-btn]'), menu = $('[data-menu]');
  function menuOpen() { return menuBtn.getAttribute('aria-expanded') === 'true'; }
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    $('.sr', menuBtn).textContent = open ? 'Menü schliessen' : 'Menü öffnen';
    if (open) { menu.hidden = false; requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); }); html.style.overflow = 'hidden'; }
    else { menu.classList.remove('is-open'); html.style.overflow = ''; setTimeout(function () { if (!menuOpen()) menu.hidden = true; }, 450); }
    updateBar();
  }
  menuBtn.addEventListener('click', function () { setMenu(!menuOpen()); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen()) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1080 && menuOpen()) setMenu(false); });

  var navLinks = $$('.nav a');
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['maschinen', 'finder', 'preise', 'anfrage', 'kontakt'].forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ---------- Intro-Titel zeilenweise ---------- */
  var title = $('.intro-title');
  if (title && !reduce) {
    var words = title.textContent.trim().split(/\s+/);
    title.innerHTML = words.map(function (w, i) { return '<span class="ln" style="display:inline-block"><span style="--i:' + i + '">' + w + '</span></span>'; }).join(' ');
  }

  /* ---------- Maschinen-Tafeln ---------- */
  var boardsEl = $('[data-boards]');
  var tones = { atj180: 'forest', atj160: 'sage', goldlift: 'stone' };
  var boards = {}, openId = null;
  var mqStack = window.matchMedia('(max-width: 860px)');

  K.MACHINES.forEach(function (m) {
    var b = document.createElement('article');
    b.className = 'board board--' + tones[m.id];
    b.dataset.id = m.id;
    b.innerHTML =
      '<button class="board-toggle" type="button" aria-expanded="false" aria-controls="board-' + m.id + '"><span class="sr">' + m.brand + ' ' + m.name + ' öffnen</span></button>' +
      '<div class="board-closed" aria-hidden="true">' +
        '<span class="board-closed-name">' + m.name + ' <span>' + m.brand + '</span></span>' +
        '<span class="board-closed-h">' + Math.floor(m.workHeight) + '<small>m</small></span>' +
        '<span class="board-closed-plus"></span>' +
      '</div>' +
      '<div class="board-open" id="board-' + m.id + '">' +
        '<div class="board-info">' +
          '<p class="board-brand">' + m.brand + ' · ' + m.type + '</p>' +
          '<h2 class="board-name">' + m.name + '</h2>' +
          '<p class="board-pitch">' + m.pitch + '</p>' +
          '<dl class="board-specs">' +
            '<div><dt>Arbeitshöhe</dt><dd>' + m.workHeight.toFixed(2) + ' m</dd></div>' +
            '<div><dt>Seitliche Reichweite</dt><dd>' + m.reach.toFixed(2) + ' m</dd></div>' +
            '<div><dt>Korblast</dt><dd>' + m.payload + ' kg</dd></div>' +
            '<div><dt>Personen im Korb</dt><dd>' + m.persons + '</dd></div>' +
            '<div><dt>Breite</dt><dd>' + m.width.toFixed(2) + ' m</dd></div>' +
            '<div><dt>Gewicht</dt><dd>' + K.chf(m.weight).replace('.–', '') + ' kg</dd></div>' +
          '</dl>' +
          '<p class="board-price"><b>CHF ' + K.chf(m.priceDay) + '</b><span>pro Tag · ab 6 Tagen CHF ' + K.chf(m.priceLong) + '</span></p>' +
          '<div class="board-actions">' +
            '<button class="btn btn--rust" type="button" data-request="' + m.id + '">Anfragen</button>' +
            '<button class="btn btn--line" type="button" data-sheet-open>Technische Daten</button>' +
          '</div>' +
        '</div>' +
        '<div class="board-art"></div>' +
      '</div>' +
      '<div class="board-sheet" role="region" aria-label="Technische Daten ' + m.name + '" inert>' +
        '<div class="board-sheet-head"><h3>Technische Daten</h3><button class="round-btn" type="button" data-sheet-close aria-label="Technische Daten schliessen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div>' +
        '<div class="board-sheet-grid">' + m.specs.map(function (g) {
          return '<section class="spec-group"><h4>' + g.group + '</h4><table class="spec-table"><tbody>' +
            g.rows.map(function (r) { return '<tr><th scope="row">' + r[0] + (r[1] ? '<small>' + r[1] + '</small>' : '') + '</th><td>' + r[2] + '</td></tr>'; }).join('') + '</tbody></table></section>';
        }).join('') + '<p class="spec-foot">' + m.footnote + '</p></div>' +
      '</div>';
    boardsEl.appendChild(b);
    var lift = KLift.create($('.board-art', b), { model: m.id, ruler: true, person: true, label: m.brand + ' ' + m.name });
    boards[m.id] = { el: b, lift: lift };
    $('.board-open', b).setAttribute('inert', '');
  });

  function openBoard(id, opts) {
    opts = opts || {};
    if (openId === id) return;
    var prev = openId; openId = id;
    Object.keys(boards).forEach(function (k) {
      var B = boards[k], on = k === id;
      B.el.classList.toggle('is-open', on);
      B.el.classList.remove('show-sheet');
      $('.board-sheet', B.el).setAttribute('inert', '');
      $('.board-toggle', B.el).setAttribute('aria-expanded', on ? 'true' : 'false');
      if (on) $('.board-open', B.el).removeAttribute('inert'); else $('.board-open', B.el).setAttribute('inert', '');
    });
    if (prev) { var pl = boards[prev].lift; setTimeout(function () { pl.setProgress(0); }, reduce ? 0 : 400); }
    var L = boards[id].lift;
    L.setProgress(0);
    if (reduce) L.setProgress(1); else setTimeout(function () { L.animateTo(1, 2600); }, opts.delay != null ? opts.delay : 450);
    if (opts.scroll && mqStack.matches) setTimeout(function () { toEl(boards[id].el, 86); }, 380);
  }
  boardsEl.addEventListener('click', function (e) {
    var t = e.target.closest('.board-toggle');
    if (t) { openBoard(t.closest('.board').dataset.id, { scroll: true }); return; }
    var s = e.target.closest('[data-sheet-open]');
    if (s) { var b = s.closest('.board'); b.classList.add('show-sheet'); var sh = $('.board-sheet', b); sh.removeAttribute('inert'); sh.scrollTop = 0; setTimeout(function () { $('[data-sheet-close]', b).focus({ preventScroll: true }); }, 300); return; }
    var c = e.target.closest('[data-sheet-close]');
    if (c) { var b2 = c.closest('.board'); b2.classList.remove('show-sheet'); $('.board-sheet', b2).setAttribute('inert', ''); $('[data-sheet-open]', b2).focus({ preventScroll: true }); }
  });
  /* Hover auf dem Desktop öffnet nicht automatisch – Klick ist bewusster */
  openBoard('atj180', { delay: 900 });

  /* ---------- Finder ---------- */
  var verdict = $('[data-verdict]'), vArt = $('[data-verdict-art]');
  var vTitle = $('[data-verdict-title]'), vKicker = $('[data-verdict-kicker]'), vWhy = $('[data-verdict-why]'), vActions = $('[data-verdict-actions]');
  var vLifts = {}, vCurrent = null, recommended = null;
  var empty = document.createElement('div'); empty.className = 'verdict-art-empty'; empty.textContent = 'Hier erscheint die passende Bühne.';
  vArt.appendChild(empty);
  K.MACHINES.forEach(function (m) {
    var l = KLift.create(vArt, { model: m.id, viewBox: [-260, -1900, 980, 1940], label: m.brand + ' ' + m.name });
    l.svg.classList.add('is-hidden');
    vLifts[m.id] = l;
  });
  function showVerdictLift(id) {
    if (vCurrent === id) return;
    if (vCurrent) { vLifts[vCurrent].svg.classList.add('is-hidden'); vLifts[vCurrent].setProgress(0); }
    vCurrent = id;
    empty.style.opacity = id ? 0 : 1;
    if (!id) return;
    var l = vLifts[id]; l.svg.classList.remove('is-hidden'); l.setProgress(0); l.animateTo(1, reduce ? 0 : 2000);
  }

  function answers() {
    var g = function (n) { var r = $('input[name="q-' + n + '"]:checked'); return r ? r.value : null; };
    return { height: g('height'), access: g('access'), load: g('load') };
  }
  var hLabel = { '12': 'bis 12 m', '14': '12 – 14 m', '16': '14 – 16 m', '18': '16 – 18 m' };

  function evaluate() {
    var a = answers(), n = (a.height ? 1 : 0) + (a.access ? 1 : 0) + (a.load ? 1 : 0);
    verdict.classList.remove('is-none');
    if (!n) { vKicker.textContent = 'Ihre Empfehlung'; vTitle.textContent = 'Beantworten Sie die Fragen links.'; vWhy.innerHTML = ''; vActions.hidden = true; showVerdictLift(null); recommended = null; return; }
    var need = a.height ? +a.height : 0, load = a.load ? +a.load : 1;
    var fits = K.MACHINES.filter(function (m) {
      var reach = m.id === 'goldlift' && load >= 2 ? 12.6 : m.workHeight;
      if (need && reach < need) return false;
      if (a.access === 'narrow' && m.id !== 'goldlift') return false;
      if (load === 3 && m.id !== 'atj160') return false;
      return true;
    });
    var best = fits.sort(function (x, y) { return x.priceDay - y.priceDay || x.workHeight - y.workHeight; })[0];
    var why = [];
    if (!best) {
      verdict.classList.add('is-none');
      vKicker.textContent = 'Keine Bühne erfüllt alles';
      vTitle.textContent = 'Rufen Sie uns an – wir finden eine Lösung.';
      if (a.access === 'narrow' && need > 14) why.push(['warn', 'Durch enge Zufahrten passt nur die Goldlift – sie reicht bis 14 m.']);
      if (a.access === 'narrow' && load === 3) why.push(['warn', 'Die Goldlift trägt höchstens 2 Personen bzw. 200 kg.']);
      if (load === 3 && need > 16.21) why.push(['warn', 'Für 3 Personen eignet sich die 160 ATJ – sie reicht bis 16.21 m.']);
      if (load === 2 && a.access === 'narrow' && need > 12.6) why.push(['warn', 'Mit 2 Personen erreicht die Goldlift 12.60 m.']);
      vWhy.innerHTML = why.map(function (w) { return '<li class="is-warn">' + w[1] + '</li>'; }).join('');
      vActions.hidden = false;
      $('[data-verdict-request]').textContent = '071 966 26 11 anrufen';
      recommended = 'call';
      showVerdictLift(null);
      empty.textContent = 'Keine passende Bühne gefunden.';
      return;
    }
    empty.textContent = 'Hier erscheint die passende Bühne.';
    vKicker.textContent = n === 3 ? 'Unsere Empfehlung' : 'Zwischenstand – ' + (3 - n) + (3 - n === 1 ? ' Frage offen' : ' Fragen offen');
    vTitle.textContent = best.brand + ' ' + best.name;
    var reachB = best.id === 'goldlift' && load >= 2 ? 12.6 : best.workHeight;
    if (need) why.push(reachB.toFixed(2) + ' m Arbeitshöhe – reicht für ' + hLabel[a.height]);
    if (a.access === 'narrow') why.push('Durchfahrt ab 85 cm, nur 1’700 kg – schont den Untergrund');
    else if (a.access === 'wide') why.push('Allradantrieb, ' + best.width.toFixed(2) + ' m breit');
    if (load === 3) why.push('Grösster Korb (2.30 × 0.90 m) mit 408 kg Tragkraft');
    else if (load === 2) why.push('Platz für 2 Personen im Korb');
    else if (a.load) why.push(best.payload + ' kg Korblast');
    why.push('CHF ' + K.chf(best.priceDay) + ' pro Tag, ab 6 Tagen CHF ' + K.chf(best.priceLong));
    if (best.id === 'goldlift' && need > 12.6 && load < 2) why.push('Über 12.60 m nur mit 1 Person im Korb (max. 120 kg)');
    vWhy.innerHTML = why.map(function (w) { return '<li>' + w + '</li>'; }).join('');
    vActions.hidden = false;
    $('[data-verdict-request]').textContent = 'Diese Bühne anfragen';
    recommended = best.id;
    showVerdictLift(best.id);
  }
  $('#finder').addEventListener('change', function (e) { if (e.target.name && e.target.name.indexOf('q-') === 0) evaluate(); });
  $('[data-verdict-request]').addEventListener('click', function () {
    if (recommended === 'call') { window.location.href = 'tel:+41719662611'; return; }
    if (recommended) requestMachine(recommended);
  });
  $('[data-verdict-reset]').addEventListener('click', function () {
    $$('#finder input[type=radio]').forEach(function (r) { r.checked = false; });
    evaluate(); toEl($('#finder'), 80);
  });

  /* ---------- Anfrage ---------- */
  var pills = $('[data-pills]'), minis = {};
  K.MACHINES.forEach(function (m) {
    var l = document.createElement('label'); l.className = 'pill';
    l.innerHTML = '<input type="radio" name="maschine" value="' + m.id + '"><span class="pill-box"><span class="pill-art"></span><span class="pill-text"><b>' + m.name + '</b><span>' + m.brand + ' · ' + m.heightClass + ' · ab CHF ' + K.chf(m.priceLong) + '</span></span></span>';
    pills.appendChild(l);
    minis[m.id] = KLift.create($('.pill-art', l), { model: m.id, crew: false, ground: false, viewBox: [-215, -330, 890, 350] });
  });
  pills.addEventListener('change', function (e) {
    Object.keys(minis).forEach(function (id) { minis[id].animateTo(e.target.value === id ? .1 : 0, reduce ? 0 : 900); });
  });

  var form = $('[data-form]'), thanks = $('[data-success]');
  var cal = KBooking.calendar($('[data-calendar]'), { twoMonthsFrom: 620 });
  var bf = KBooking.form(form, {
    calendar: cal, scrollOffset: 100,
    onSuccess: function (p) {
      $('[data-success-text]').innerHTML = 'Ihre Anfrage für die <b>' + p['Maschine'].split(' (')[0] + '</b> vom ' + p['Mietbeginn'] + ' bis ' + p['Mietende'] + ' ist bei uns. Wir melden uns so rasch wie möglich unter ' + p['Telefon'] + ' oder ' + p['email'] + '.';
      form.hidden = true; thanks.hidden = false;
      toEl($('.request-card'), 90);
      thanks.focus({ preventScroll: true });
    }
  });
  $('[data-success-reset]').addEventListener('click', function () {
    bf.reset(); thanks.hidden = true; form.hidden = false;
    Object.keys(minis).forEach(function (id) { minis[id].setProgress(0); });
  });
  function requestMachine(id) { bf.selectMachine(id); toEl($('#anfrage'), 70); }
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

  /* ---------- Scroll: Header & Mobile-Leiste ---------- */
  var mbar = $('[data-mobile-bar]'), zones = [$('#anfrage'), $('.site-footer')];
  function updateBar() {
    var vh = window.innerHeight, hide = menuOpen() || window.scrollY < 200;
    zones.forEach(function (z) { var r = z.getBoundingClientRect(); if (r.top < vh - 40 && r.bottom > 80) hide = true; });
    mbar.classList.toggle('is-hidden', hide);
  }
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); updateBar(); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
