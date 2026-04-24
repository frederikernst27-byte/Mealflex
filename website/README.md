# Pizzeria Castello - Website

Eine statische Website für die Pizzeria Castello (Bahnhofstraße 42, 46145 Oberhausen)
mit Admin-Panel zum Verwalten der Speisekarte.

## Funktionen

### Öffentliche Website (`index.html`)
- Hero-Bereich mit Restaurant-Info (Adresse, Telefon, Bewertungen, Status)
- Speisekarte mit Kategorie-Filter (Pizza, Pasta, Salate, Dessert, Getränke)
- Klickbare Speisen-Karten mit Detail-Modal
- Über-uns- und Kontakt-Sektion
- Vollständig responsiv

### Admin-Panel (`admin.html`)
- Passwort-geschützt (Standard: `castello2026`)
- Speisen hinzufügen, bearbeiten, löschen
- Bild-Upload pro Speise (als Data-URL, bis 2 MB)
- Verfügbarkeit pro Speise umschalten
- Kategorie-Statistiken
- Restaurant-Einstellungen (Name, Adresse, Telefon, Status)
- Passwort ändern
- Speisekarte auf Standardwerte zurücksetzen

## Nutzung

Einfach `website/index.html` im Browser öffnen - keine Installation nötig.

Alternativ mit einem lokalen Server:

```bash
cd website
python3 -m http.server 8000
```

Dann `http://localhost:8000` aufrufen. Das Admin-Panel ist unter
`http://localhost:8000/admin.html` erreichbar.

## Speicherung

Alle Daten (Speisen, Bilder, Einstellungen) werden im `localStorage` des Browsers
gespeichert. Änderungen bleiben also erhalten, sind aber pro Browser/Gerät lokal.

Für einen Live-Betrieb mit mehreren Nutzern wäre ein Backend nötig (z.B. das
bereits im Projekt verwendete Supabase).

## Dateistruktur

```
website/
├── index.html         # Öffentliche Website
├── admin.html         # Admin-Panel
├── css/
│   ├── style.css      # Gemeinsame Styles
│   └── admin.css      # Admin-spezifische Styles
└── js/
    ├── data.js        # Datenmodul (Storage + Standardwerte)
    ├── app.js         # Logik für die öffentliche Seite
    └── admin.js       # Admin-Panel-Logik
```
