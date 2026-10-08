# Keller Immo AG – Website Vermietung Hebebühnen

Vier Entwürfe für die Vermietungs-Website der drei Hebebühnen (Manitou 180 ATJ, Manitou 160 ATJ, Hinowa Goldlift 14.70).

| Ordner | Entwurf |
|---|---|
| `version-1/` | Messlatte – hell, technisch, massstabsgetreue Maschinen mit Höhenlinie |
| `version-2/` | Feierabend – dunkle Abendszene, Bühne fährt beim Scrollen hoch, Anfrage in 3 Schritten |
| `version-3/` | Werkhof – Weiss/Waldgrün/Logo-Rot, aufklappbare Tafeln, Empfehlungs-Assistent |
| `version-4/` | Klarheit – Mischung aus 1 und 3, alles offen auf einer Seite |

Jeder Ordner ist eigenständig (HTML, CSS, JS, Logo) und kann direkt auf einen Webserver kopiert werden. `shared/` enthält die gemeinsamen Quelldateien (Daten, Zeichnungen, Formular); nach Änderungen dort in die `js/`-Ordner der Versionen kopieren.

## Anfrageformular & E-Mails

Anfragen gehen an **stefan@keller-holzbau.ch**, Kopie an **marco.p.keller@gmail.com**; der Kunde erhält eine Eingangsbestätigung.

Zwei Versandwege (Einstellung in `shared/data.js`):

1. **Google Apps Script** (`appsScriptUrl`, bevorzugt): gestaltete HTML-Mails, versendet aus dem Konto marco.p.keller@gmail.com. Code: `backend/apps-script.gs` (Projekt „Keller Hebebühnen – Anfragen“ im Google-Konto). Bereitstellen als Web-App (Ausführen als: Ich, Zugriff: Jeder) und die `/exec`-URL bei `appsScriptUrl` eintragen.
2. **FormSubmit** (`formEndpoint`, Ersatz – aktiv, solange `appsScriptUrl` leer ist): aktiviert für marco.p.keller@gmail.com, Kopie an Stefan, Vorlage „box“, Text-Bestätigung an den Kunden.

## Reichweiten-Rechner

`shared/reach.js` + `reach.css`: Arbeitsbereiche der drei Bühnen aus den Lastdiagrammen (`envelope` in `shared/data.js`, Werte abgelesen, Richtwerte).

## Vor dem Livegang

- `<meta name="robots" content="noindex, nofollow">` aus den HTML-Dateien entfernen, damit Google die Seite findet.
- Impressum und Datenschutz prüfen (Firmenname, UID-Nummer).
