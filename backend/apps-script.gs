/**
 * Keller Immo AG – Anfragen Hebebühnen
 * Google Apps Script Web-App: empfängt Anfragen der Website und versendet
 *  1) eine gestaltete Benachrichtigung an Keller (mit Kopie),
 *  2) eine gestaltete Eingangsbestätigung an den Kunden.
 *
 * Bereitstellen: Bereitstellen → Neue Bereitstellung → Web-App,
 * Ausführen als: Ich (marco.p.keller@gmail.com), Zugriff: Jeder. URL in shared/data.js eintragen.
 */
var CONFIG = {
  to: 'stefan@keller-holzbau.ch',
  cc: 'marco.p.keller@gmail.com',
  replyTo: 'stefan@keller-holzbau.ch',
  senderName: 'Keller Immo AG – Hebebühnen',
  phone: '071 966 26 11',
  phoneHref: 'tel:+41719662611',
  mail: 'info@keller-holzbau.ch',
  address: 'Keller Holzbau AG · Wilerstrasse 82 · 8370 Sirnach TG',
  logo: 'https://marco-p-keller.github.io/keller-hebebuehnen/version-4/assets/keller-logo.png',
  site: 'https://marco-p-keller.github.io/keller-hebebuehnen/',
  maxPerHour: 40
};

var C = { forest: '#17342A', rust: '#A03402', ink: '#15201B', ink2: '#4A5751', ink3: '#7B8781', line: '#E3E6E1', stone: '#F1F2EE', sage: '#DDE4D7' };

function doGet() {
  return json({ ok: true, service: 'keller-hebebuehnen' });
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents || '{}');
    if (d.honey) return json({ success: true });

    var cache = CacheService.getScriptCache();
    var count = Number(cache.get('count') || 0);
    if (count >= CONFIG.maxPerHour) return json({ success: false, message: 'Zu viele Anfragen – bitte später erneut versuchen.' });
    cache.put('count', String(count + 1), 3600);

    var err = check(d);
    if (err) return json({ success: false, message: err });

    var subject = 'Anfrage ' + d.machine + ' · ' + d.period + ' · ' + (d.firma || d.name);
    MailApp.sendEmail({
      to: CONFIG.to,
      cc: CONFIG.cc,
      replyTo: d.email,
      name: CONFIG.senderName,
      subject: subject,
      htmlBody: ownerHtml(d),
      body: ownerText(d)
    });

    MailApp.sendEmail({
      to: d.email,
      replyTo: CONFIG.replyTo,
      name: CONFIG.senderName,
      subject: 'Ihre Anfrage für die ' + d.brand + ' ' + d.machine + ' ist bei uns',
      htmlBody: customerHtml(d),
      body: customerText(d)
    });

    return json({ success: true });
  } catch (x) {
    return json({ success: false, message: String(x) });
  }
}

function check(d) {
  var req = ['machine', 'brand', 'period', 'start', 'end', 'days', 'name', 'email', 'telefon', 'einsatzort'];
  for (var i = 0; i < req.length; i++) if (!d[req[i]]) return 'Feld fehlt: ' + req[i];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(d.email))) return 'E-Mail ungültig';
  for (var k in d) if (String(d[k]).length > 2000) return 'Eingabe zu lang';
  return null;
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}

/* ---------- Bausteine ---------- */
function shell(preheader, inner) {
  return '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>' +
    '<body style="margin:0;padding:0;background:' + C.stone + ';">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' + esc(preheader) + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + C.stone + ';"><tr><td align="center" style="padding:28px 12px;">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;font-family:Helvetica,Arial,sans-serif;color:' + C.ink + ';">' +
    '<tr><td style="padding:4px 4px 18px;"><img src="' + CONFIG.logo + '" width="128" alt="Keller" style="display:block;width:128px;height:auto;border:0;"></td></tr>' +
    inner +
    '<tr><td style="padding:22px 6px 6px;font-size:12px;line-height:18px;color:' + C.ink3 + ';">Keller Immo AG – Vermietung Hebebühnen<br>' + esc(CONFIG.address) + '<br>' +
    '<a href="' + CONFIG.phoneHref + '" style="color:' + C.ink3 + ';">' + CONFIG.phone + '</a> · <a href="mailto:' + CONFIG.mail + '" style="color:' + C.ink3 + ';">' + CONFIG.mail + '</a></td></tr>' +
    '</table></td></tr></table></body></html>';
}

function card(inner, bg) {
  return '<tr><td style="background:' + (bg || '#ffffff') + ';border-radius:18px;padding:28px 28px 26px;">' + inner + '</td></tr><tr><td style="height:12px;line-height:12px;font-size:0;">&nbsp;</td></tr>';
}

function rows(list) {
  var h = '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:21px;">';
  list.forEach(function (r) {
    if (!r[1] || r[1] === '–') return;
    h += '<tr><td style="padding:10px 0;border-bottom:1px solid ' + C.line + ';color:' + C.ink3 + ';width:38%;vertical-align:top;">' + esc(r[0]) + '</td>' +
      '<td style="padding:10px 0;border-bottom:1px solid ' + C.line + ';font-weight:bold;vertical-align:top;">' + (r[2] ? r[1] : esc(r[1])) + '</td></tr>';
  });
  return h + '</table>';
}

function button(href, label, bg, fg) {
  return '<a href="' + href + '" style="display:inline-block;background:' + bg + ';color:' + (fg || '#ffffff') + ';text-decoration:none;font-weight:bold;font-size:15px;line-height:20px;padding:13px 22px;border-radius:999px;margin:0 8px 8px 0;">' + label + '</a>';
}

function hero(d, kicker) {
  return card(
    '<div style="font-size:13px;line-height:18px;color:#cfe0d6;letter-spacing:.02em;">' + esc(kicker) + '</div>' +
    '<div style="font-size:32px;line-height:36px;font-weight:bold;color:#ffffff;margin-top:6px;">' + esc(d.brand + ' ' + d.machine) + '</div>' +
    '<div style="font-size:16px;line-height:22px;color:#ffffff;margin-top:10px;">' + esc(d.start) + ' – ' + esc(d.end) + '</div>' +
    '<div style="font-size:15px;line-height:21px;color:#cfe0d6;margin-top:2px;">' + esc(d.days) + (Number(d.days) === 1 ? ' Miettag' : ' Miettage') + (d.workHeight ? ' · ' + esc(d.workHeight) + ' m Arbeitshöhe' : '') + '</div>' +
    (d.net ? '<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:20px;"><tr><td style="background:#2C4A3F;border-radius:12px;padding:12px 16px;">' +
      '<div style="font-size:12px;line-height:16px;color:#cfe0d6;">Richtpreis exkl. MwSt.</div>' +
      '<div style="font-size:26px;line-height:32px;font-weight:bold;color:#ffffff;">' + esc(d.net) + '</div>' +
      '<div style="font-size:12px;line-height:16px;color:#cfe0d6;">' + esc(d.rate) + ' · inkl. 8.1 % MwSt. ' + esc(d.gross) + '</div></td></tr></table>' : ''),
    C.forest);
}

/* ---------- E-Mail an Keller ---------- */
function ownerHtml(d) {
  var mailSubject = encodeURIComponent('Ihre Anfrage ' + d.brand + ' ' + d.machine + ' (' + d.period + ')');
  var inner =
    hero(d, 'Neue Anfrage über die Website') +
    card(
      '<div style="font-size:19px;line-height:24px;font-weight:bold;margin-bottom:6px;">Kunde</div>' +
      rows([
        ['Name', d.name],
        ['Firma', d.firma],
        ['Telefon', '<a href="tel:' + esc(String(d.telefon).replace(/[^\d+]/g, '')) + '" style="color:' + C.rust + ';text-decoration:none;">' + esc(d.telefon) + '</a>', true],
        ['E-Mail', '<a href="mailto:' + esc(d.email) + '" style="color:' + C.rust + ';text-decoration:none;">' + esc(d.email) + '</a>', true],
        ['Einsatzort', d.einsatzort],
        ['Transport', d.transport],
        ['Nachricht', d.nachricht]
      ]) +
      '<div style="margin-top:20px;">' +
        button('tel:' + String(d.telefon).replace(/[^\d+]/g, ''), 'Kunde anrufen', C.rust) +
        button('mailto:' + d.email + '?subject=' + mailSubject, 'Per E-Mail antworten', C.forest) +
      '</div>'
    ) +
    card(
      '<div style="font-size:14px;line-height:20px;color:' + C.ink2 + ';">Der Kunde hat automatisch eine Eingangsbestätigung erhalten. ' +
      'Richtpreis gemäss Preisliste, exkl. Treibstoff und Transport. Gesendet am ' + esc(Utilities.formatDate(new Date(), 'Europe/Zurich', 'dd.MM.yyyy, HH:mm')) + ' Uhr' +
      (d.page ? ' von <a href="' + esc(d.page) + '" style="color:' + C.ink2 + ';">' + esc(d.page.replace(/^https?:\/\//, '')) + '</a>' : '') + '.</div>',
      '#ffffff');
  return shell('Neue Anfrage: ' + d.machine + ', ' + d.period + ', ' + d.name, inner);
}

function ownerText(d) {
  return 'Neue Anfrage über die Website\n\n' +
    'Hebebühne: ' + d.brand + ' ' + d.machine + '\nZeitraum: ' + d.start + ' – ' + d.end + ' (' + d.days + ' Tage)\n' +
    'Richtpreis: ' + d.net + ' exkl. MwSt. (' + d.gross + ' inkl.)\n\n' +
    'Name: ' + d.name + '\nFirma: ' + (d.firma || '–') + '\nTelefon: ' + d.telefon + '\nE-Mail: ' + d.email + '\n' +
    'Einsatzort: ' + d.einsatzort + '\nTransport: ' + d.transport + '\nNachricht: ' + (d.nachricht || '–');
}

/* ---------- Bestätigung an den Kunden ---------- */
function customerHtml(d) {
  var first = String(d.name).split(' ')[0];
  var inner =
    card(
      '<div style="font-size:26px;line-height:32px;font-weight:bold;">Danke, ' + esc(first) + '.</div>' +
      '<div style="font-size:16px;line-height:24px;color:' + C.ink2 + ';margin-top:10px;">Ihre Anfrage ist bei uns eingegangen. Wir prüfen die Verfügbarkeit und melden uns so rasch wie möglich bei Ihnen – per Telefon unter ' + esc(d.telefon) + ' oder per E-Mail.</div>'
    ) +
    hero(d, 'Ihre Anfrage') +
    card(
      '<div style="font-size:19px;line-height:24px;font-weight:bold;margin-bottom:6px;">Ihre Angaben</div>' +
      rows([
        ['Hebebühne', d.brand + ' ' + d.machine],
        ['Zeitraum', d.start + ' – ' + d.end],
        ['Einsatzort', d.einsatzort],
        ['Transport', d.transport],
        ['Firma', d.firma],
        ['Nachricht', d.nachricht]
      ]) +
      '<div style="font-size:13px;line-height:19px;color:' + C.ink3 + ';margin-top:16px;">Diese E-Mail bestätigt den Eingang Ihrer Anfrage – sie ist noch keine Reservation. Die verbindliche Offerte erhalten Sie von uns. ' +
      'Preise exkl. 8.1 % MwSt. und Treibstoff, Transport nach Aufwand, Versicherung mit Selbstbehalt CHF 1’000.–.</div>'
    ) +
    card(
      '<div style="font-size:19px;line-height:24px;font-weight:bold;">Fragen?</div>' +
      '<div style="font-size:15px;line-height:22px;color:' + C.ink2 + ';margin:6px 0 16px;">Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an.</div>' +
      button(CONFIG.phoneHref, CONFIG.phone + ' anrufen', C.rust) +
      button(CONFIG.site, 'Website öffnen', C.stone, C.ink),
      '#ffffff');
  return shell('Danke für Ihre Anfrage – ' + d.brand + ' ' + d.machine + ', ' + d.period, inner);
}

function customerText(d) {
  return 'Guten Tag ' + d.name + '\n\nVielen Dank für Ihre Anfrage. Wir prüfen die Verfügbarkeit und melden uns so rasch wie möglich.\n\n' +
    'Hebebühne: ' + d.brand + ' ' + d.machine + '\nZeitraum: ' + d.start + ' – ' + d.end + ' (' + d.days + ' Tage)\n' +
    'Richtpreis: ' + d.net + ' exkl. MwSt.\nEinsatzort: ' + d.einsatzort + '\nTransport: ' + d.transport + '\n\n' +
    'Diese E-Mail bestätigt den Eingang Ihrer Anfrage und ist noch keine Reservation.\n\n' +
    'Freundliche Grüsse\nKeller Immo AG – Vermietung Hebebühnen\n' + CONFIG.address + '\nTel. ' + CONFIG.phone;
}

/* Zum Testen im Editor: sendet beide E-Mails an CONFIG.to */
function testSend() {
  var d = { machine: '160 ATJ', brand: 'Manitou', workHeight: '16.21', period: '12.10.2026 – 16.10.2026', start: 'Mo, 12. Okt. 2026', end: 'Fr, 16. Okt. 2026', days: 5,
    rate: 'CHF 350.– / Tag', net: 'CHF 1’750.–', gross: 'CHF 1’891.75', name: 'Test Kunde', firma: 'Muster AG', email: CONFIG.cc, telefon: '071 123 45 67',
    einsatzort: '8370 Sirnach', transport: 'Abholung in Sirnach', nachricht: 'Testanfrage', page: CONFIG.site };
  MailApp.sendEmail({ to: CONFIG.cc, name: CONFIG.senderName, subject: '[Test] Anfrage', htmlBody: ownerHtml(d) });
  MailApp.sendEmail({ to: CONFIG.cc, name: CONFIG.senderName, subject: '[Test] Bestätigung Kunde', htmlBody: customerHtml(d) });
}
