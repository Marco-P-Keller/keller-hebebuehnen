# Keller Immo AG – Website Vermietung Hebebühnen

Vier Entwürfe für die Vermietungs-Website der drei Hebebühnen (Manitou 180 ATJ, Manitou 160 ATJ, Hinowa Goldlift 14.70).

| Ordner | Entwurf |
|---|---|
| `version-1/` | Messlatte – hell, technisch, massstabsgetreue Maschinen mit Höhenlinie |
| `version-2/` | Feierabend – dunkle Abendszene, Bühne fährt beim Scrollen hoch, Anfrage in 3 Schritten |
| `version-3/` | Werkhof – Weiss/Waldgrün/Logo-Rot, aufklappbare Tafeln, Empfehlungs-Assistent |
| `version-4/` | Klarheit – Mischung aus 1 und 3, alles offen auf einer Seite |

Jeder Ordner ist eigenständig (HTML, CSS, JS, Logo) und kann direkt auf einen Webserver kopiert werden. `shared/` enthält die gemeinsamen Quelldateien (Daten, Zeichnungen, Formular); nach Änderungen dort in die `js/`-Ordner der Versionen kopieren.

## Anfrageformular

Anfragen werden über [FormSubmit](https://formsubmit.co) per E-Mail an **marco.p.keller@gmail.com** geschickt, mit Kopie an **stefan@keller-leimbau.com**. Der Kunde erhält automatisch eine Bestätigung.

Einmalig nötig: Beim **ersten** Absenden schickt FormSubmit eine Bestätigungs-Mail an marco.p.keller@gmail.com. Den Link darin anklicken – danach werden alle Anfragen zugestellt.

Einstellungen (Empfänger, MwSt.-Satz, Preise, Telefonnummer) stehen in `shared/data.js`.

## Vor dem Livegang

- `<meta name="robots" content="noindex, nofollow">` aus den HTML-Dateien entfernen, damit Google die Seite findet.
- Impressum und Datenschutz prüfen (Firmenname, UID-Nummer).
