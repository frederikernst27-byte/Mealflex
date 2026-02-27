# MVP Ticketliste – Fitness Mealplan App

## Ziel des MVP
Ein neuer User kann:
1. Onboarding in < 2 Minuten abschließen  
2. automatisch einen Wochenplan sehen  
3. eine Einkaufsliste öffnen und abhaken  
4. ein Rezept öffnen und als „gekocht“ markieren  
5. Like/Dislike geben und nächste Woche Plan neu generieren  

---

## Sprint 1 (Foundation + Core Flow)

### EPIC 1: Projekt-Setup & Basis

#### T1 – Projekt initialisieren (Mobile + Backend)
**Prio:** Must  
**Aufwand:** M  
**Beschreibung:** App-Grundgerüst, Routing, State-Management, Backend-Projekt einrichten.  
**Akzeptanzkriterien:**
- App startet lokal auf iOS/Android
- Basisnavigation funktioniert
- Backend-Verbindung steht (Dev/Stage)

#### T2 – Auth (MVP-light)
**Prio:** Must  
**Aufwand:** M  
**Beschreibung:** E-Mail Login/Sign-up oder anonymer Guest-Start mit späterem Upgrade.  
**Akzeptanzkriterien:**
- User kann Session starten
- Session bleibt nach App-Neustart erhalten
- Logout möglich

#### T3 – Design System (minimal)
**Prio:** Should  
**Aufwand:** S  
**Beschreibung:** Farben, Typography, Buttons, Input-Komponenten, Spacing-Tokens.  
**Akzeptanzkriterien:**
- Wiederverwendbare UI-Komponenten vorhanden
- Konsistenter Look auf allen Kernscreens

---

### EPIC 2: Onboarding & Profil

#### T4 – Onboarding Wizard Scaffold
**Prio:** Must  
**Aufwand:** S  
**Beschreibung:** Mehrstufiger Onboarding-Flow mit Progress-Anzeige.  
**Akzeptanzkriterien:**
- 5 Schritte navigierbar (vor/zurück)
- Fortschritt sichtbar
- Daten bleiben zwischen Schritten erhalten

#### T5 – Ziel-Auswahl (Cut/Muskelaufbau/Healthy)
**Prio:** Must  
**Aufwand:** S  
**Beschreibung:** Auswahl des Ernährungsziels.  
**Akzeptanzkriterien:**
- Genau 1 Ziel auswählbar
- Auswahl wird im Profil gespeichert

#### T6 – Kochstil-Auswahl (Mealprep vs Daily)
**Prio:** Must  
**Aufwand:** S  
**Beschreibung:** Auswahl Kochstil als zentrale Planlogik.  
**Akzeptanzkriterien:**
- 1 Stil auswählbar
- Persistenz im Profil

#### T7 – Allergien + No-Go Zutaten
**Prio:** Must  
**Aufwand:** M  
**Beschreibung:** Allergien und Blacklist erfassen.  
**Akzeptanzkriterien:**
- Mehrfachauswahl + Freitext möglich
- Werte werden gespeichert
- Blacklist wird später im Generator berücksichtigt

#### T8 – Zeitbudget-Auswahl (z. B. 15/30/45 Min)
**Prio:** Must  
**Aufwand:** S  
**Beschreibung:** Maximale Zubereitungszeit pro Rezept erfassen.  
**Akzeptanzkriterien:**
- Zeitlimit auswählbar
- Wert im Profil gespeichert

#### T9 – Spracheinstellung (DE/EN)
**Prio:** Should  
**Aufwand:** S  
**Beschreibung:** Sprachpräferenz im Profil speichern.  
**Akzeptanzkriterien:**
- DE/EN auswählbar
- UI liest gespeicherte Sprache

#### T10 – Onboarding Abschluss + „Plan wird erstellt“
**Prio:** Must  
**Aufwand:** S  
**Beschreibung:** Abschluss-Screen, Trigger für ersten Mealplan.  
**Akzeptanzkriterien:**
- Bei Abschluss wird Plan-Generierung gestartet
- User landet danach auf Home mit Plan

---

### EPIC 3: Rezept- und Datenbasis

#### T11 – Rezeptdatenmodell + Seed (30–60 Rezepte)
**Prio:** Must  
**Aufwand:** L  
**Beschreibung:** Kuratierter initialer Rezeptpool inkl. Tags und Makros.  
**Akzeptanzkriterien:**
- Mind. 30 Rezepte im System
- Jedes Rezept hat: Zutaten, Steps, Zeit, Portionen, Tags, kcal/makros
- Daten über Admin-Script seedbar

#### T12 – Zutatenstandardisierung (Einheiten + Normalisierung)
**Prio:** Must  
**Aufwand:** M  
**Beschreibung:** Einheitliche Schreibweisen für Zutaten/Einheiten zur Listenaggregation.  
**Akzeptanzkriterien:**
- Mapping für Synonyme (z. B. Paprika rot/rote Paprika)
- Standard-Einheiten definiert (g, ml, stk)
- Testfälle für Aggregation bestehen

---

### EPIC 4: Mealplan Generator (MVP-Heuristik)

#### T13 – Generator-Service (Regel-basiert)
**Prio:** Must  
**Aufwand:** L  
**Beschreibung:** Wochengenerierung basierend auf Ziel, Kochstil, Zeitbudget, Allergien/Blacklist.  
**Akzeptanzkriterien:**
- Liefert 7-Tage-Plan mit Meal-Slots
- Filter schließt verbotene Rezepte strikt aus
- Ergebnis enthält Tages-/Wochensumme kcal/makros

#### T14 – Mealprep vs Daily Logik
**Prio:** Must  
**Aufwand:** M  
**Beschreibung:** Kochstil beeinflusst Vielfalt/Repeat-Frequenz.  
**Akzeptanzkriterien:**
- Mealprep: weniger Gerichte, mehr Wiederholung
- Daily: höhere Varianz über Woche
- Verhalten per Unit-Test nachweisbar

#### T15 – Plan speichern + Versionierung (Woche X)
**Prio:** Must  
**Aufwand:** M  
**Beschreibung:** Generierter Plan wird dem User und einer Kalenderwoche zugeordnet.  
**Akzeptanzkriterien:**
- Pro Woche 1 aktiver Plan
- Neuer Plan überschreibt nicht alte Historie
- Home lädt immer „aktuelle Woche“

---

## Sprint 2 (UI + Shopping + Feedback)

### EPIC 5: Home & Mealplan UI

#### T16 – Home Dashboard
**Prio:** Must  
**Aufwand:** M  
**Beschreibung:** Anzeige „Dein aktueller Plan“, CTA zur Einkaufsliste, Plan öffnen.  
**Akzeptanzkriterien:**
- Aktive Woche sichtbar
- CTA zu Shoppinglist vorhanden
- Planstatus geladen ohne Fehler

#### T17 – Mealplan Detail Screen
**Prio:** Must  
**Aufwand:** M  
**Beschreibung:** Tage + Meals anzeigen, Klick auf Rezeptdetail.  
**Akzeptanzkriterien:**
- Alle 7 Tage mit Meals sichtbar
- Tap öffnet korrektes Rezept
- Basic Loading/Empty/Error States vorhanden

#### T18 – Swap-Meal (optional aber wertvoll)
**Prio:** Should  
**Aufwand:** M  
**Beschreibung:** Pro Meal 3–5 passende Alternativen anzeigen und ersetzen.  
**Akzeptanzkriterien:**
- Alternativen respektieren alle Constraints
- Auswahl ersetzt Meal im Plan
- Shoppinglist aktualisiert sich danach korrekt

---

### EPIC 6: Shoppinglist

#### T19 – Einkaufslisten-Generator (Aggregation)
**Prio:** Must  
**Aufwand:** L  
**Beschreibung:** Zutaten über alle Planrezepte konsolidieren (Menge + Einheit).  
**Akzeptanzkriterien:**
- Duplikate zusammengeführt (z. B. Eier 6 statt 3×2)
- Liste pro aktivem Wochenplan generierbar
- Kategorie-Feld vorbereitet (Produce, Dairy etc.)

#### T20 – Shoppinglist Screen + Checkbox
**Prio:** Must  
**Aufwand:** M  
**Beschreibung:** Anzeige der Liste, Items abhaken/unabhaken.  
**Akzeptanzkriterien:**
- Check-Status persistiert
- UI bleibt stabil bei langen Listen
- Fortschritt (x/y gekauft) sichtbar

---

### EPIC 7: Rezeptansicht & Kochstatus

#### T21 – Recipe Detail Screen
**Prio:** Must  
**Aufwand:** M  
**Beschreibung:** Zutaten, Steps, Zeiten, Portionen, Makros, Tags.  
**Akzeptanzkriterien:**
- Vollständige Rezeptinfos sichtbar
- Scroll/Lesbarkeit mobil optimiert
- Von Mealplan korrekt verlinkt

#### T22 – „Cooked“ markieren
**Prio:** Must  
**Aufwand:** S  
**Beschreibung:** User kann Rezept als gekocht markieren.  
**Akzeptanzkriterien:**
- Cooked-Status pro Plan-Meal gespeichert
- Status im Mealplan sichtbar (z. B. Badge/Check)

---

### EPIC 8: Feedback & Iteration

#### T23 – Like/Dislike auf Rezept
**Prio:** Must  
**Aufwand:** S  
**Beschreibung:** Minimales Feedback je Rezept.  
**Akzeptanzkriterien:**
- Like/Dislike speicherbar
- Status im Rezeptscreen sichtbar
- Event wird für spätere Empfehlung geloggt

#### T24 – Favorit speichern
**Prio:** Should  
**Aufwand:** S  
**Beschreibung:** Rezept als Favorit markieren.  
**Akzeptanzkriterien:**
- Favorit-Status persistiert
- Favoritenfilter im Backend verfügbar

---

### EPIC 9: Qualität, Tracking, Release

#### T25 – Analytics Events (MVP)
**Prio:** Must  
**Aufwand:** M  
**Beschreibung:** Kernereignisse messen für Produktentscheidungen.  
**Akzeptanzkriterien:**
- Events: onboarding_completed, plan_generated, swap_used, item_checked, recipe_cooked, feedback_given
- Events enthalten user_id + week_id

#### T26 – QA Testplan (Happy Path + Edge Cases)
**Prio:** Must  
**Aufwand:** M  
**Beschreibung:** Testfälle für Core Loop, Allergie-Filter, leere Daten, Netzwerkfehler.  
**Akzeptanzkriterien:**
- Testdokument vorhanden
- Kritische Flows abgenommen
- Keine blocker Bugs vor Release

#### T27 – MVP Release Candidate
**Prio:** Must  
**Aufwand:** M  
**Beschreibung:** Build erstellen, Smoke-Test, internes Rollout.  
**Akzeptanzkriterien:**
- Installierbare Builds (iOS/Android)
- Core Loop Ende-zu-Ende lauffähig
- Go/No-Go Entscheidung dokumentiert

---

## Nice-to-have nach MVP
- Smarte Lernlogik aus Verhalten (gekocht/geliked/getauscht)
- Kategorie-Sortierung in Shoppinglist
- HealthKit/Wearables Integrationen
- Challenges/Streaks
- Community/Sharing Features

---

## Definition of Done (Produkt-Ebene)
- Onboarding Completion Rate ≥ 70%
- Plan wird bei >95% der neuen User erfolgreich generiert
- Mind. 60% öffnen die Shoppingliste in Woche 1
- Mind. 40% markieren mindestens 1 Rezept als gekocht
- Feedback-Event (Like/Dislike) bei mind. 25% der aktiven User
