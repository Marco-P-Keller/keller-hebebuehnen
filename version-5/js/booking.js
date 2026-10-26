/* =========================================================================
   KBooking – Mietzeitraum-Kalender, Richtpreis und Versand der Anfrage.
   Benötigt data.js (window.KELLER).

   KBooking.calendar(el, { onChange })      -> { set(start,end), clear(), get() }
   KBooking.form(formEl, { calendar, onSuccess, onEstimate })
   ========================================================================= */
(function () {
  'use strict';

  var K = window.KELLER;
  var DAY = 864e5;
  var MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var MONTHS_SHORT = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];
  var WD = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  var WD_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var WD_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); x.setHours(0, 0, 0, 0); return x; }
  function same(a, b) { return a && b && a.getTime() === b.getTime(); }
  function diffDays(a, b) { return Math.round((b - a) / DAY); }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function fmtLong(d) { return WD_SHORT[d.getDay()] + ', ' + d.getDate() + '. ' + MONTHS_SHORT[d.getMonth()] + ' ' + d.getFullYear(); }
  function fmtNum(d) { return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear(); }
  function fmtAria(d) { return WD_LONG[d.getDay()] + ', ' + d.getDate() + '. ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
  function h(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  var ICON_PREV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_NEXT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------------------------------------------------------------------
     Kalender
     --------------------------------------------------------------------- */
  function calendar(root, opts) {
    opts = opts || {};
    var min = today();
    var max = addDays(min, 365 * 2);
    var start = null, end = null, hover = null;
    var view = new Date(min.getFullYear(), min.getMonth(), 1);
    var focusDate = null;

    root.classList.add('bk-cal');
    root.innerHTML = '';
    var head = h('div', 'bk-cal-head');
    var prev = h('button', 'bk-cal-nav bk-cal-prev'); prev.type = 'button'; prev.innerHTML = ICON_PREV; prev.setAttribute('aria-label', 'Vorheriger Monat');
    var next = h('button', 'bk-cal-nav bk-cal-next'); next.type = 'button'; next.innerHTML = ICON_NEXT; next.setAttribute('aria-label', 'Nächster Monat');
    var live = h('div', 'bk-sr'); live.setAttribute('aria-live', 'polite');
    head.appendChild(prev); head.appendChild(next);
    var months = h('div', 'bk-cal-months');
    var quick = h('div', 'bk-cal-quick');
    [['1 Tag', 1], ['3 Tage', 3], ['1 Woche', 7], ['2 Wochen', 14]].forEach(function (q) {
      var b = h('button', 'bk-chip', q[0]); b.type = 'button'; b.dataset.days = q[1];
      b.addEventListener('click', function () {
        var s = start || nextWorkday();
        start = s; end = addDays(s, q[1] - 1);
        ensureVisible(start); render(); emit();
      });
      quick.appendChild(b);
    });
    var summary = h('div', 'bk-cal-summary');
    root.appendChild(head); root.appendChild(months); root.appendChild(quick); root.appendChild(summary); root.appendChild(live);

    function nextWorkday() {
      var d = addDays(min, 1);
      while (d.getDay() === 0 || d.getDay() === 6) d = addDays(d, 1);
      return d;
    }
    function monthsToShow() { return root.clientWidth >= (opts.twoMonthsFrom || 600) ? 2 : 1; }
    function ensureVisible(d) {
      var n = monthsToShow();
      var first = new Date(view), last = new Date(view.getFullYear(), view.getMonth() + n, 0);
      if (d < first || d > last) view = new Date(d.getFullYear(), d.getMonth(), 1);
    }

    function render() {
      var n = monthsToShow();
      root.classList.toggle('bk-cal--two', n === 2);
      months.innerHTML = '';
      var firstOfMin = new Date(min.getFullYear(), min.getMonth(), 1);
      prev.disabled = view <= firstOfMin;
      next.disabled = new Date(view.getFullYear(), view.getMonth() + n, 1) > max;
      var rangeEnd = end || (start && hover && hover > start ? hover : null);
      for (var mi = 0; mi < n; mi++) {
        var m = new Date(view.getFullYear(), view.getMonth() + mi, 1);
        var box = h('div', 'bk-month');
        var title = h('div', 'bk-month-title', MONTHS[m.getMonth()] + ' ' + m.getFullYear());
        title.id = 'bk-m-' + iso(m) + '-' + Math.random().toString(36).slice(2, 6);
        box.appendChild(title);
        var grid = h('div', 'bk-grid'); grid.setAttribute('role', 'grid'); grid.setAttribute('aria-labelledby', title.id);
        WD.forEach(function (w) { var c = h('div', 'bk-wd', w); c.setAttribute('aria-hidden', 'true'); grid.appendChild(c); });
        var offset = (m.getDay() + 6) % 7;
        for (var e = 0; e < offset; e++) grid.appendChild(h('div', 'bk-day bk-day--empty'));
        var daysIn = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
        for (var d = 1; d <= daysIn; d++) {
          var date = new Date(m.getFullYear(), m.getMonth(), d);
          var b = h('button', 'bk-day');
          b.type = 'button';
          b.innerHTML = '<span>' + d + '</span>';
          b.dataset.date = iso(date);
          b.setAttribute('aria-label', fmtAria(date));
          b.tabIndex = -1;
          var dis = date < min || date > max;
          if (dis) { b.disabled = true; b.classList.add('is-disabled'); }
          if (same(date, min)) b.classList.add('is-today');
          var wd = date.getDay(); if (wd === 0 || wd === 6) b.classList.add('is-weekend');
          var isStart = same(date, start), isEnd = same(date, end);
          if (isStart) b.classList.add('is-start');
          if (isEnd) b.classList.add('is-end');
          if (start && rangeEnd && date > start && date < rangeEnd) b.classList.add('is-in');
          if (start && !end && hover && same(date, hover) && hover > start) b.classList.add('is-preview-end');
          if (start && rangeEnd && !same(start, rangeEnd)) { if (isStart) b.classList.add('has-range'); }
          if (isStart || isEnd) b.setAttribute('aria-pressed', 'true');
          grid.appendChild(b);
        }
        box.appendChild(grid);
        months.appendChild(box);
      }
      /* Fokus-Element (roving tabindex) */
      var target = focusDate || start || min;
      var tb = months.querySelector('[data-date="' + iso(target) + '"]:not([disabled])') || months.querySelector('.bk-day:not([disabled]):not(.bk-day--empty)');
      if (tb) tb.tabIndex = 0;
      renderSummary();
    }

    function renderSummary() {
      var days = start ? (end ? diffDays(start, end) + 1 : 1) : 0;
      if (!start) {
        summary.innerHTML = '<span class="bk-sum-hint">Wählen Sie den <b>ersten Miettag</b> im Kalender.</span>';
      } else {
        summary.innerHTML =
          '<div class="bk-sum-range"><span class="bk-sum-label">Von</span><b>' + fmtLong(start) + '</b></div>' +
          '<span class="bk-sum-arrow" aria-hidden="true">→</span>' +
          '<div class="bk-sum-range"><span class="bk-sum-label">Bis</span><b>' + (end ? fmtLong(end) : '<em>Enddatum wählen</em>') + '</b></div>' +
          '<div class="bk-sum-days"><b>' + days + '</b> ' + (days === 1 ? 'Tag' : 'Tage') + '</div>' +
          '<button type="button" class="bk-sum-clear" aria-label="Auswahl löschen">Zurücksetzen</button>';
        summary.querySelector('.bk-sum-clear').addEventListener('click', function () { clear(); });
      }
      Array.prototype.forEach.call(quick.children, function (c) {
        c.classList.toggle('is-active', !!(start && end && diffDays(start, end) + 1 === +c.dataset.days));
      });
    }

    function emit() {
      var days = start ? (end ? diffDays(start, end) + 1 : 1) : 0;
      var detail = { start: start, end: end || start, days: days, complete: !!(start && end) };
      if (opts.onChange) opts.onChange(detail);
      root.dispatchEvent(new CustomEvent('bk:change', { detail: detail, bubbles: true }));
    }

    function pick(date) {
      if (!start || (start && end)) { start = date; end = null; }
      else if (date < start) { start = date; }
      else { end = date; }
      hover = null;
      focusDate = date;
      live.textContent = end ? 'Zeitraum ' + fmtAria(start) + ' bis ' + fmtAria(end) + ' gewählt.' : 'Startdatum ' + fmtAria(start) + ' gewählt. Bitte Enddatum wählen.';
      render(); emit();
      var fb = months.querySelector('[data-date="' + iso(date) + '"]'); if (fb) fb.focus({ preventScroll: true });
    }

    months.addEventListener('click', function (e) {
      var b = e.target.closest('.bk-day'); if (!b || b.disabled || !b.dataset.date) return;
      var p = b.dataset.date.split('-');
      pick(new Date(+p[0], +p[1] - 1, +p[2]));
    });
    months.addEventListener('mouseover', function (e) {
      if (!start || end) return;
      var b = e.target.closest('.bk-day'); if (!b || !b.dataset.date) return;
      var p = b.dataset.date.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]);
      if (!same(d, hover)) {
        hover = d;
        /* nur Klassen aktualisieren, kein komplettes Re-Render */
        Array.prototype.forEach.call(months.querySelectorAll('.bk-day[data-date]'), function (x) {
          var q = x.dataset.date.split('-'); var dd = new Date(+q[0], +q[1] - 1, +q[2]);
          x.classList.toggle('is-in', hover > start && dd > start && dd < hover);
          x.classList.toggle('is-preview-end', hover > start && same(dd, hover));
        });
        var sb = months.querySelector('.is-start'); if (sb) sb.classList.toggle('has-range', hover > start);
      }
    });
    months.addEventListener('mouseleave', function () {
      if (!hover) return; hover = null;
      Array.prototype.forEach.call(months.querySelectorAll('.is-in, .is-preview-end'), function (x) { x.classList.remove('is-in', 'is-preview-end'); });
      var sb = months.querySelector('.is-start'); if (sb && !end) sb.classList.remove('has-range');
    });
    months.addEventListener('keydown', function (e) {
      var b = e.target.closest('.bk-day'); if (!b || !b.dataset.date) return;
      var p = b.dataset.date.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]);
      var map = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (map[e.key] != null) {
        e.preventDefault();
        var nd = addDays(d, map[e.key]);
        if (nd < min || nd > max) return;
        focusDate = nd;
        ensureVisible(nd); render();
        var nb = months.querySelector('[data-date="' + iso(nd) + '"]'); if (nb) nb.focus();
      }
    });
    prev.addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); focusDate = null; render(); });
    next.addEventListener('click', function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); focusDate = null; render(); });

    /* Wischen auf Touch-Geräten */
    var tx = null;
    months.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    months.addEventListener('touchend', function (e) {
      if (tx == null) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 60) { (dx < 0 ? next : prev).click(); }
    });

    var lastN = 0;
    function onResize() { var n = monthsToShow(); if (n !== lastN) { lastN = n; render(); } }
    if (window.ResizeObserver) new ResizeObserver(onResize).observe(root); else window.addEventListener('resize', onResize);

    function clear() { start = end = hover = null; render(); emit(); }
    render(); lastN = monthsToShow();

    return {
      get: function () { var days = start ? (end ? diffDays(start, end) + 1 : 1) : 0; return { start: start, end: end || start, days: days, complete: !!(start && end) }; },
      set: function (s, e2) { start = s; end = e2 || null; ensureVisible(s); render(); emit(); },
      clear: clear,
      el: root
    };
  }

  /* ---------------------------------------------------------------------
     Formular
     --------------------------------------------------------------------- */
  function form(f, opts) {
    opts = opts || {};
    var cfg = K.CONFIG;
    var cal = opts.calendar;
    var status = f.querySelector('[data-status]');
    var submit = f.querySelector('[type="submit"]');
    var estEls = document.querySelectorAll(opts.estimateScope ? opts.estimateScope + ' [data-est]' : '[data-est]');

    function machineId() { var r = f.querySelector('input[name="maschine"]:checked'); return r ? r.value : null; }

    function updateEstimate() {
      var range = cal ? cal.get() : { days: 0 };
      var id = machineId();
      var est = id && range.days ? K.estimate(id, range.days) : null;
      var m = id ? K.byId(id) : null;
      var vals = {
        machine: m ? m.name : '–',
        brand: m ? m.brand : '',
        days: range.days ? range.days + (range.days === 1 ? ' Tag' : ' Tage') : '–',
        period: range.start ? fmtNum(range.start) + (range.days > 1 ? ' – ' + fmtNum(range.end) : '') : 'Noch kein Datum',
        rate: est ? 'CHF ' + K.chf(est.rate) + ' / Tag' : (m ? 'ab CHF ' + K.chf(m.priceLong) + ' / Tag' : '–'),
        net: est ? 'CHF ' + K.chf(est.net) : 'Noch offen',
        vat: est ? 'CHF ' + K.chf(est.vat, true) : '–',
        gross: est ? 'CHF ' + K.chf(est.gross, true) : '–',
        tier: est ? (est.long ? 'Langzeit-Tarif ab ' + cfg.longRentDays + ' Tagen' : 'Tagestarif · ab ' + cfg.longRentDays + ' Tagen CHF ' + K.chf(m.priceLong) + ' / Tag') : ''
      };
      Array.prototype.forEach.call(estEls, function (n) {
        var k = n.getAttribute('data-est');
        if (vals[k] != null) n.textContent = vals[k];
      });
      var wrap = document.querySelectorAll('[data-est-state]');
      Array.prototype.forEach.call(wrap, function (w) { w.setAttribute('data-est-state', est ? 'ready' : 'empty'); });
      if (opts.onEstimate) opts.onEstimate(est, range, m);
      return est;
    }

    if (cal) cal.el.addEventListener('bk:change', function () {
      updateEstimate();
      var w = f.querySelector('[data-field="zeitraum"]');
      if (w && w.classList.contains('is-invalid')) validateField(w);
    });

    f.addEventListener('change', function (e) {
      if (e.target.name === 'maschine') { clearError(f.querySelector('[data-field="maschine"]')); updateEstimate(); }
      if (e.target.name === 'datenschutz') { var w = e.target.closest('[data-field]'); if (w && w.classList.contains('is-invalid')) validateField(w); }
    });

    /* Validierung */
    function setError(wrap, msg) {
      if (!wrap) return;
      wrap.classList.add('is-invalid');
      var m = wrap.querySelector('.bk-error');
      if (!m) { m = h('div', 'bk-error'); m.setAttribute('role', 'alert'); wrap.appendChild(m); }
      m.textContent = msg;
      var inp = wrap.querySelector('input, textarea, select');
      if (inp) inp.setAttribute('aria-invalid', 'true');
    }
    function clearError(wrap) {
      if (!wrap) return;
      wrap.classList.remove('is-invalid');
      var m = wrap.querySelector('.bk-error'); if (m) m.remove();
      var inp = wrap.querySelector('[aria-invalid]'); if (inp) inp.removeAttribute('aria-invalid');
    }
    f.addEventListener('input', function (e) { var w = e.target.closest('[data-field]'); if (w && w.classList.contains('is-invalid')) validateField(w); });

    function val(name) { var n = f.elements[name]; return n ? String(n.value || '').trim() : ''; }

    function validateField(w) {
      var name = w.getAttribute('data-field');
      var ok = true, msg = '';
      if (name === 'maschine') { ok = !!machineId(); msg = 'Bitte wählen Sie eine Hebebühne.'; }
      else if (name === 'zeitraum') { ok = !!(cal && cal.get().days); msg = 'Bitte wählen Sie den Mietzeitraum im Kalender.'; }
      else if (name === 'name') { ok = val('name').length >= 2; msg = 'Bitte geben Sie Ihren Namen an.'; }
      else if (name === 'email') { ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email')); msg = val('email') ? 'Diese E-Mail-Adresse scheint nicht zu stimmen.' : 'Bitte geben Sie Ihre E-Mail-Adresse an.'; }
      else if (name === 'telefon') { ok = val('telefon').replace(/[^\d+]/g, '').length >= 9; msg = val('telefon') ? 'Bitte prüfen Sie die Telefonnummer.' : 'Bitte geben Sie eine Telefonnummer an, damit wir Sie erreichen.'; }
      else if (name === 'einsatzort') { ok = val('einsatzort').length >= 2; msg = 'Bitte geben Sie den Einsatzort (PLZ / Ort) an.'; }
      else if (name === 'datenschutz') { ok = !!(f.elements.datenschutz && f.elements.datenschutz.checked); msg = 'Bitte bestätigen Sie die Datenschutzhinweise.'; }
      if (ok) clearError(w); else setError(w, msg);
      return ok;
    }

    function validate() {
      var first = null;
      Array.prototype.forEach.call(f.querySelectorAll('[data-field]'), function (w) {
        if (!validateField(w) && !first) first = w;
      });
      if (first) {
        var y = first.getBoundingClientRect().top + window.pageYOffset - (opts.scrollOffset || 110);
        window.scrollTo({ top: y, behavior: 'smooth' });
        var inp = first.querySelector('input:not([type=hidden]):not([type=radio]), textarea, button.bk-day[tabindex="0"], input[type=radio]');
        if (inp) setTimeout(function () { inp.focus({ preventScroll: true }); }, 450);
      }
      return !first;
    }

    function setStatus(type, html) {
      if (!status) return;
      status.className = 'bk-status' + (type ? ' bk-status--' + type : '');
      status.innerHTML = html || '';
    }

    function buildPayload() {
      var r = cal.get();
      var m = K.byId(machineId());
      var est = K.estimate(m.id, r.days);
      var transport = f.querySelector('input[name="transport"]:checked');
      var period = fmtNum(r.start) + (r.days > 1 ? ' – ' + fmtNum(r.end) : '');
      var who = val('firma') || val('name');
      return {
        _subject: 'Anfrage Hebebühne: ' + m.name + ' · ' + period + ' · ' + who,
        _cc: cfg.formCc,
        _template: 'box',
        _captcha: 'false',
        _honey: val('_honey'),
        _replyto: val('email'),
        _autoresponse: 'Guten Tag ' + val('name') + '\n\nVielen Dank für Ihre Anfrage – sie ist bei uns eingegangen.\n\n' +
          'Hebebühne: ' + m.brand + ' ' + m.name + '\nZeitraum: ' + fmtLong(r.start) + ' – ' + fmtLong(r.end) + ' (' + r.days + (r.days === 1 ? ' Tag' : ' Tage') + ')\n' +
          'Richtpreis: CHF ' + K.chf(est.net) + ' exkl. MwSt. (ohne Treibstoff und Transport)\nEinsatzort: ' + val('einsatzort') + '\n\n' +
          'Wir prüfen die Verfügbarkeit und melden uns so rasch wie möglich bei Ihnen. Diese Nachricht bestätigt den Eingang Ihrer Anfrage und ist noch keine Reservation.\n\n' +
          'Freundliche Grüsse\n' + cfg.company + ' – ' + cfg.tagline + '\n' + cfg.operator + ', ' + cfg.street + ', ' + cfg.city + '\nTel. ' + cfg.phone + ' · ' + cfg.email,
        'Maschine': m.brand + ' ' + m.name + ' (' + m.type + ', ' + m.workHeight.toFixed(2) + ' m Arbeitshöhe)',
        'Mietbeginn': fmtLong(r.start),
        'Mietende': fmtLong(r.end),
        'Mietdauer': r.days + (r.days === 1 ? ' Tag' : ' Tage'),
        'Richtpreis exkl. MwSt.': 'CHF ' + K.chf(est.net) + ' (' + r.days + ' × CHF ' + K.chf(est.rate) + ')',
        'Richtpreis inkl. 8.1 % MwSt.': 'CHF ' + K.chf(est.gross, true) + ' (exkl. Treibstoff und Transport)',
        'Transport': transport ? transport.value : '–',
        'Einsatzort': val('einsatzort'),
        'Name': val('name'),
        'Firma': val('firma') || '–',
        'email': val('email'),
        'Telefon': val('telefon'),
        'Nachricht': val('nachricht') || '–',
        'Gesendet von': location.href.split('#')[0]
      };
    }

    /* Strukturierte Daten für das Google-Apps-Script */
    function scriptData() {
      var r = cal.get();
      var m = K.byId(machineId());
      var est = K.estimate(m.id, r.days);
      var transport = f.querySelector('input[name="transport"]:checked');
      return {
        machine: m.name, brand: m.brand, workHeight: m.workHeight.toFixed(2),
        period: fmtNum(r.start) + (r.days > 1 ? ' – ' + fmtNum(r.end) : ''),
        start: fmtLong(r.start), end: fmtLong(r.end), days: r.days,
        rate: 'CHF ' + K.chf(est.rate) + ' / Tag', net: 'CHF ' + K.chf(est.net), gross: 'CHF ' + K.chf(est.gross, true),
        transport: transport ? transport.value : '', einsatzort: val('einsatzort'),
        name: val('name'), firma: val('firma'), email: val('email'), telefon: val('telefon'), nachricht: val('nachricht'),
        page: location.href.split('#')[0], honey: val('_honey')
      };
    }

    function mailtoFor(payload) {
      var lines = [];
      for (var k in payload) if (k.charAt(0) !== '_') lines.push(k + ': ' + payload[k]);
      return 'mailto:' + cfg.inquiryTo + '?cc=' + encodeURIComponent(cfg.inquiryCc) +
        '&subject=' + encodeURIComponent(payload._subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    }

    f.setAttribute('novalidate', '');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');
      if (!validate()) { setStatus('error', 'Bitte ergänzen Sie die markierten Angaben.'); return; }
      var payload = buildPayload();
      if (payload._honey) { if (opts.onSuccess) opts.onSuccess(payload); return; }
      submit.disabled = true;
      f.classList.add('is-sending');
      submit.setAttribute('aria-busy', 'true');
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
      var useScript = !!cfg.appsScriptUrl;
      fetch(useScript ? cfg.appsScriptUrl : cfg.formEndpoint, useScript ? {
        method: 'POST',
        body: JSON.stringify(scriptData()), /* text/plain: kein CORS-Preflight */
        signal: ctrl ? ctrl.signal : undefined
      } : {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (j) { return { ok: res.ok, j: j }; });
      }).then(function (r) {
        clearTimeout(timer);
        var success = r.ok && (r.j.success === true || r.j.success === 'true');
        if (!success) throw new Error(r.j && r.j.message ? r.j.message : 'Versand fehlgeschlagen');
        f.classList.remove('is-sending');
        submit.disabled = false; submit.removeAttribute('aria-busy');
        if (opts.onSuccess) opts.onSuccess(payload);
      }).catch(function () {
        clearTimeout(timer);
        f.classList.remove('is-sending');
        submit.disabled = false; submit.removeAttribute('aria-busy');
        setStatus('error', 'Die Anfrage konnte gerade nicht gesendet werden. ' +
          '<a href="' + mailtoFor(payload) + '">Per E-Mail-Programm senden</a> oder rufen Sie uns an: ' +
          '<a href="' + cfg.phoneHref + '">' + cfg.phone + '</a>.');
      });
    });

    /* Maschine von aussen vorwählen */
    function selectMachine(id) {
      var r = f.querySelector('input[name="maschine"][value="' + id + '"]');
      if (r) { r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }
    }

    function reset() {
      f.reset(); if (cal) cal.clear(); setStatus('', '');
      Array.prototype.forEach.call(f.querySelectorAll('.is-invalid'), clearError);
      updateEstimate();
    }

    /* Nur einen Teil prüfen (z. B. einen Schritt im Assistenten) */
    function check(scope) {
      var first = null;
      Array.prototype.forEach.call(scope.querySelectorAll('[data-field]'), function (w) { if (!validateField(w) && !first) first = w; });
      if (first) {
        var inp = first.querySelector('input:not([type=hidden]):not([type=radio]), textarea, input[type=radio]');
        if (inp) inp.focus({ preventScroll: true });
        var r = first.getBoundingClientRect();
        if (r.top < 80 || r.bottom > window.innerHeight) window.scrollTo({ top: r.top + window.pageYOffset - (opts.scrollOffset || 110), behavior: 'smooth' });
      }
      return !first;
    }

    updateEstimate();
    return { update: updateEstimate, selectMachine: selectMachine, reset: reset, check: check, payload: function () { return buildPayload(); } };
  }

  window.KBooking = { calendar: calendar, form: form, fmtLong: fmtLong, fmtNum: fmtNum };
})();
