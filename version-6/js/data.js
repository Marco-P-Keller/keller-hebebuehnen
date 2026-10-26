/* =========================================================================
   Keller Immo AG – Vermietung Hebebühnen
   Zentrale Daten: Maschinen, technische Daten, Preise, Kontakt.
   Alle Werte stammen aus der Broschüre „Vermietung Hebebühnen“.
   ========================================================================= */
(function () {
  'use strict';

  var CONFIG = {
    company: 'Keller Immo AG',
    tagline: 'Vermietung Hebebühnen',
    operator: 'Keller Holzbau AG',
    street: 'Wilerstrasse 82',
    city: '8370 Sirnach TG',
    phone: '071 966 26 11',
    phoneHref: 'tel:+41719662611',
    email: 'info@keller-holzbau.ch',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Wilerstrasse+82,+8370+Sirnach',

    /* Anfragen gehen an Stefan, Kopie an Marco. */
    inquiryTo: 'stefan@keller-holzbau.ch',
    inquiryCc: 'marco.p.keller@gmail.com',
    /* Versand 1 (bevorzugt): Google Apps Script im Konto marco.p.keller@gmail.com
       – gestaltete HTML-Mails an Keller + Bestätigung an den Kunden.
       Leer lassen, solange das Skript nicht bereitgestellt ist. */
    appsScriptUrl: '',
    /* Versand 2 (Ersatz): FormSubmit.co, aktiviert für marco.p.keller@gmail.com
       (Kennung statt E-Mail-Adresse), Kopie an stefan@keller-holzbau.ch. */
    formEndpoint: 'https://formsubmit.co/ajax/364e41efe9791e42e9e6a31193586875',
    formCc: 'stefan@keller-holzbau.ch',

    vatRate: 0.081,          /* Schweizer MwSt. seit 1.1.2024 */
    deductible: 1000,        /* Versicherung Selbstbehalt CHF */
    longRentDays: 6          /* Günstiger Tagespreis ab 6 Tagen */
  };

  var MACHINES = [
    {
      id: 'atj180',
      name: '180 ATJ',
      brand: 'Manitou',
      type: 'Gelenk-Teleskopbühne',
      typeShort: 'Gelenkbühne',
      heightClass: '18 m',
      workHeight: 18.19,
      platformHeight: 16.19,
      reach: 10.51,
      payload: 230,
      persons: 2,
      weight: 7430,
      basket: '1.80 × 0.80 m',
      width: 2.32,
      drive: 'Allrad, Diesel',
      priceDay: 350,
      priceLong: 250,
      pitch: 'Die Höchste der Flotte: 18 Meter Arbeitshöhe und über 10 Meter seitliche Reichweite – für Dach, Fassade und Baumpflege.',
      highlights: ['18.19 m Arbeitshöhe', '10.51 m seitliche Reichweite', 'Allradantrieb & Allradlenkung', 'Steigfähigkeit 45 %'],
      specs: [
        { group: 'Kapazität', rows: [
          ['Arbeitshöhe', 'h21', '18.19 m'],
          ['Plattformhöhe', 'h7', '16.19 m'],
          ['Maximale seitliche Reichweite', '', '10.51 m'],
          ['Überhang / Knickpunkt Gelenk', '', '7.55 m'],
          ['Korbarm-Drehwinkel', '', '+59.50°'],
          ['Tragfähigkeit des Arbeitskorbs', 'Q', '230 kg'],
          ['Drehung des Oberwagens', '', '350°'],
          ['Drehung des Arbeitskorbs (rechts / links)', '', '90° / 90°'],
          ['Anzahl Personen (innen / aussen)', '', '2 / 2']
        ]},
        { group: 'Gewicht & Abmessungen', rows: [
          ['Gewicht der Arbeitsbühne*', '', '7’430 kg'],
          ['Arbeitskorb (Länge × Breite)', 'lp / ep', '1.80 × 0.80 m'],
          ['Gesamtbreite', 'b1', '2.32 m'],
          ['Gesamtlänge', 'l1', '7.79 m'],
          ['Gesamthöhe', 'h17', '2.47 m'],
          ['Gesamtlänge eingefahren', 'l9', '5.56 m'],
          ['Bauhöhe eingefahren', 'h18', '2.56 m'],
          ['Bodenfreiheit (Zugang)', 'h20', '0.40 m'],
          ['Gegengewicht Versatz (Oberwagen bei 90°)', 'a7', '0.22 m'],
          ['Innerer Wenderadius', 'b13', '1.38 m'],
          ['Äusserer Wenderadius', 'Wa3', '3.75 m'],
          ['Bodenfreiheit Mitte Radstand', 'm2', '0.40 m'],
          ['Radstand', 'y', '2.20 m']
        ]},
        { group: 'Leistung', rows: [
          ['Fahrgeschwindigkeit – Transportmodus', '', '5 km/h'],
          ['Fahrgeschwindigkeit – Arbeitsmodus', '', '1 km/h'],
          ['Steigfähigkeit', '', '45 %'],
          ['Zulässige Neigung im Arbeitsmodus', '', '5°']
        ]},
        { group: 'Reifen', rows: [
          ['Bereifung', '', 'Schaumgefüllt'],
          ['Reifengrösse (vorne / hinten)', '', '908 × 370 mm'],
          ['Antriebsräder (vorne / hinten)', '', '2 / 2'],
          ['Lenkräder (vorne / hinten)', '', '2 / 2'],
          ['Gebremste Räder / Räder', '', '0 / 2']
        ]},
        { group: 'Motor', rows: [
          ['Hersteller / Motormodell', '', 'Kubota D1105-E4B'],
          ['Motornorm', '', 'Vorläufige Stufe 4'],
          ['Nennleistung', '', '24.8 PS / 18.5 kW'],
          ['Fassungsvermögen Kraftstofftank', '', '52 l'],
          ['Täglicher Verbrauch**', '', '4.26 l']
        ]},
        { group: 'Diverse', rows: [
          ['Bodendruck', '', '10 daN/cm²'],
          ['Hydraulikdruck', '', '340 bar']
        ]}
      ],
      footnote: '* Variiert und ist abhängig von den länderspezifischen Optionen. ** Richtwert. Entspricht den europäischen Richtlinien 2006/42/EG (EN 280:2013), 2004/108/EG (EMV) und 2006/95/EG (Niederspannung).',
      /* Arbeitsbereich gemäss Lastdiagramm: [seitlicher Abstand ab Drehmitte, Arbeitshöhe] in m */
      envelope: [[0, 0], [0, 18.19], [3.9, 18.19], [5, 17.6], [6, 17], [7, 15.9], [8, 14.6], [9, 12.9], [9.6, 11.8], [10.1, 10.4], [10.4, 9], [10.51, 7.5], [10.51, 2.5], [10.35, 1.5], [9.9, 0.6], [9, 0]]
    },
    {
      id: 'atj160',
      name: '160 ATJ',
      brand: 'Manitou',
      type: 'Gelenk-Teleskopbühne',
      typeShort: 'Gelenkbühne',
      heightClass: '16 m',
      workHeight: 16.21,
      platformHeight: 14.21,
      reach: 8.52,
      payload: 408,
      persons: 3,
      weight: 7500,
      basket: '2.30 × 0.90 m',
      width: 2.45,
      drive: 'Allrad, Diesel',
      priceDay: 350,
      priceLong: 250,
      pitch: 'Der Kraftprotz: 408 kg Korblast und Platz für drei Personen im grössten Arbeitskorb – ideal, wenn Material mit nach oben muss.',
      highlights: ['408 kg Korblast', 'Bis 3 Personen im Korb', 'Grosser Korb 2.30 × 0.90 m', 'Motor nach Stufe V'],
      specs: [
        { group: 'Kapazität', rows: [
          ['Arbeitshöhe', 'h21', '16.21 m'],
          ['Plattformhöhe', 'h7', '14.21 m'],
          ['Maximale seitliche Reichweite', '', '8.52 m'],
          ['Überhang / Knickpunkt Gelenk', '', '7.40 m'],
          ['Korbarm-Drehwinkel (oben / Boden)', '', '+66.50° / −65.80°'],
          ['Tragfähigkeit des Arbeitskorbs', 'Q', '408 kg'],
          ['Drehung des Oberwagens', '', '350°'],
          ['Drehung des Arbeitskorbs (rechts / links)', '', '90° / 90°'],
          ['Anzahl Personen (innen / aussen)', '', '3 / 3']
        ]},
        { group: 'Gewicht & Abmessungen', rows: [
          ['Gewicht der Arbeitsbühne*', '', '7’500 kg'],
          ['Arbeitskorb (Länge × Breite)', 'lp / ep', '2.30 × 0.90 m'],
          ['Gesamtbreite', 'b1', '2.45 m'],
          ['Gesamtlänge', 'l1', '7.09 m'],
          ['Gesamthöhe', 'h17', '2.47 m'],
          ['Gesamtlänge eingefahren', 'l9', '4.89 m'],
          ['Bauhöhe eingefahren', 'h18', '2.94 m'],
          ['Bodenfreiheit (Zugang)', 'h20', '0.38 m'],
          ['Gegengewicht Versatz (Oberwagen bei 90°)', 'a7', '0.15 m'],
          ['Innerer Wenderadius', 'b13', '1.28 m'],
          ['Äusserer Wenderadius', 'Wa3', '4.09 m'],
          ['Bodenfreiheit Mitte Radstand', 'm2', '0.40 m'],
          ['Radstand', 'y', '2.20 m']
        ]},
        { group: 'Leistung', rows: [
          ['Fahrgeschwindigkeit – Transportmodus', '', '5 km/h'],
          ['Fahrgeschwindigkeit – Arbeitsmodus', '', '1 km/h'],
          ['Steigfähigkeit', '', '45 %'],
          ['Zulässige Neigung im Arbeitsmodus', '', '5°']
        ]},
        { group: 'Reifen', rows: [
          ['Bereifung', '', 'Schaumgefüllt'],
          ['Reifengrösse (vorne / hinten)', '', '908 × 370 mm'],
          ['Antriebsräder (vorne / hinten)', '', '2 / 2'],
          ['Lenkräder (vorne / hinten)', '', '2 / 2'],
          ['Gebremste Räder / Räder', '', '0 / 2']
        ]},
        { group: 'Motor', rows: [
          ['Hersteller / Motormodell', '', 'Kubota D1105-E4B'],
          ['Motornorm', '', 'Stufe V'],
          ['Nennleistung', '', '24.5 PS / 18.5 kW'],
          ['Fassungsvermögen Kraftstofftank', '', '51 l'],
          ['Täglicher Verbrauch**', '', '7 l']
        ]},
        { group: 'Diverse', rows: [
          ['Bodendruck', '', '11.60 daN/cm²'],
          ['Hydraulikdruck', '', '340 bar'],
          ['Umgebungsgeräusch (LwA)', '', '< 105 dB'],
          ['Schwingungsbelastung Hand / Arm', '', '< 0.50 m/s²']
        ]}
      ],
      footnote: '* Variiert und ist abhängig von den länderspezifischen Optionen. ** Richtwert. Entspricht den europäischen Richtlinien 2006/42/EG (EN 280:2013), 2004/108/EG (EMV) und 2006/95/EG (Niederspannung).',
      envelope: [[0, 0], [0, 16.21], [3.3, 16.21], [4, 16], [5, 15.4], [6, 14.7], [7, 13.9], [7.6, 13], [8, 12], [8.3, 11], [8.45, 10], [8.52, 9], [8.52, 3], [8.4, 2], [8, 1.1], [7.3, 0.3], [7, 0]]
    },
    {
      id: 'goldlift',
      name: 'Goldlift 14.70',
      brand: 'Hinowa',
      type: 'Raupen-Arbeitsbühne',
      typeShort: 'Raupenbühne',
      heightClass: '14 m',
      workHeight: 14.0,
      platformHeight: 12.0,
      reach: 7.0,
      payload: 200,
      persons: 2,
      weight: 1700,
      basket: '1.40 × 0.70 m',
      width: 0.78,
      drive: 'Raupe, Benzin & 230 V',
      priceDay: 250,
      priceLong: 200,
      pitch: 'Der Kompakte: auf Raupen, nur 1’700 kg leicht und mit Durchfahrt ab 85 cm – kommt durch Gartentore und Türen, auf Wunsch abgasfrei mit 230-V-Elektromotor.',
      highlights: ['Durchfahrt ab 0.85 m', 'Leichte 1’700 kg', 'Elektromotor 230 V', 'Abstützbar bis 10° Neigung'],
      specs: [
        { group: 'Korblast 120 kg (1 Person + Werkzeug)', rows: [
          ['Arbeitshöhe max.', '', 'ca. 14.00 m'],
          ['Plattformhöhe max.', '', 'ca. 12.00 m'],
          ['Seitliche Reichweite', '', 'ca. 7.00 m'],
          ['Arbeitskorb (L × B × H)', '', '1.40 × 0.70 × 1.10 m']
        ]},
        { group: 'Korblast 200 kg (2 Personen + Werkzeug)', rows: [
          ['Arbeitshöhe max.', '', 'ca. 12.60 m'],
          ['Plattformhöhe max.', '', 'ca. 10.60 m'],
          ['Seitliche Reichweite', '', 'ca. 5.70 m'],
          ['Arbeitskorb (L × B × H)', '', '1.40 × 0.70 × 1.10 m']
        ]},
        { group: 'Abmessungen & Gewicht', rows: [
          ['Gesamtlänge', '', 'ca. 3.98 m'],
          ['Gesamthöhe', '', 'ca. 1.98 m'],
          ['Durchfahrtsbreite min.', '', 'ca. 0.85 m'],
          ['Raupenfahrwerk eingefahren', '', 'ca. 0.78 m'],
          ['Raupenfahrwerk ausgefahren (verbreitert)', '', 'ca. 1.08 m'],
          ['Gewicht Standardausführung', '', 'ca. 1’700 kg']
        ]},
        { group: 'Abstützung & Bodendruck', rows: [
          ['Max. Flächenpunktdruck auf einer Stütze', '', 'ca. 1.9 daN/cm²'],
          ['Max. Flächendruck auf einer Stütze', '', 'ca. 1’330 daN'],
          ['Max. Flächendruck der Raupe', '', 'ca. 1’700 daN / 0.50 daN/cm²'],
          ['Abstützfläche (Mitte bis Mitte Teller)', '', '2.7 × 2.7 m'],
          ['Abstützteller (Durchmesser)', '', '300 mm'],
          ['Abstützbar bis Geländeneigung', '', 'ca. 10° / 18 %'],
          ['Bodenfreiheit (abgestützt)', '', '0.28 m']
        ]},
        { group: 'Fahrwerk & Betrieb', rows: [
          ['Drehbereich Drehturm', '', 'ca. 360°'],
          ['Antriebsart', '', 'Raupe'],
          ['Fahrgeschwindigkeit', '', '0 – 1.5 km/h'],
          ['Steigfähigkeit bis max.', '', 'ca. 24° / 43 %'],
          ['Max. zulässige Windbelastung', '', '12.5 m/s'],
          ['Max. Schrägstellung im Arbeitsbühnenbetrieb', '', '1°']
        ]},
        { group: 'Antrieb', rows: [
          ['Benzinmotor', '', 'Honda iGX 440, 1 Zylinder, 15 PS bei 3’000 U/min'],
          ['Elektromotor', '', '230 V / 2.2 kW / 13.5 Ah']
        ]}
      ],
      footnote: 'Leistungsdaten abhängig von der Korblast: 120 kg (1 Person à 80 kg + 40 kg Werkzeug) bzw. 200 kg (2 Personen à 80 kg + 40 kg Werkzeug).',
      /* 1 Person (120 kg) bzw. 2 Personen (200 kg) */
      envelope: [[0, 0], [0, 14], [1, 14], [2, 13.6], [3, 13.1], [4, 12.3], [5, 11], [5.6, 10], [5.95, 9], [6.15, 8], [6.25, 7.2], [6, 6.5], [5.2, 5.7], [4.6, 5], [4.5, 4.4], [6, 4.3], [6, 0.6], [5.6, 0]],
      envelope2: [[0, 0], [0, 12.6], [1.9, 12.6], [3, 11.9], [4, 10.9], [5, 9.3], [5.5, 8], [5.7, 6.8], [5.3, 5.9], [4.4, 5], [4.2, 4.2], [4.15, 3], [4.15, 0.6], [3.8, 0]]
    }
  ];

  var PRICE_NOTES = [
    'Preise pro Tag, exkl. 8.1 % MwSt.',
    'Exkl. Treibstoff',
    'Versicherung mit Selbstbehalt CHF 1’000.–',
    'Transport nach Aufwand'
  ];

  /* ---------- Hilfsfunktionen ---------- */
  function chf(n, decimals) {
    var fixed = Number(n).toFixed(decimals ? 2 : 0);
    var parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '’');
    return decimals ? parts.join('.') : parts[0] + '.–';
  }

  function byId(id) {
    for (var i = 0; i < MACHINES.length; i++) if (MACHINES[i].id === id) return MACHINES[i];
    return null;
  }

  /* Richtpreis: Kalendertage inkl. Start- und Endtag. Ab 6 Tagen gilt
     der günstigere Tagespreis für die ganze Mietdauer. */
  function estimate(machineId, days) {
    var m = byId(machineId);
    if (!m || !days || days < 1) return null;
    var long = days >= CONFIG.longRentDays;
    var rate = long ? m.priceLong : m.priceDay;
    var net = rate * days;
    var vat = Math.round(net * CONFIG.vatRate * 20) / 20; /* auf 5 Rappen */
    return { machine: m, days: days, rate: rate, long: long, net: net, vat: vat, gross: net + vat };
  }

  window.KELLER = {
    CONFIG: CONFIG,
    MACHINES: MACHINES,
    PRICE_NOTES: PRICE_NOTES,
    chf: chf,
    byId: byId,
    estimate: estimate
  };
})();
