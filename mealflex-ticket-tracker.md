# MealFlex Ticket Tracker

> Status-Legende: `[ ]` offen · `[x]` erledigt

## Setup & Foundation
- [x] GitHub-Repo erstellt und verbunden
- [x] Architektur-Dokument erstellt (`mvp-architektur-datenbank-schema.md`)
- [x] MVP-Ticketliste erstellt (`mvp-ticketliste.md`)
- [x] Expo-Projekt aufgesetzt (Windows)
- [x] Expo Go auf iPhone verbunden (SDK kompatibel gemacht)
- [x] Supabase-Projekt verbunden (URL + Publishable Key)
- [x] Supabase Client eingebaut (`lib/supabase.ts`)
- [x] DB-Verbindung getestet (Read)
- [x] `public.profiles` Tabelle angelegt
- [x] Auth-Basisflow (Signup/Login/Logout) eingebaut

## MVP Core (als Nächstes)
- [x] Onboarding Step 1: Goal auswählen (cut/muscle/healthy)
- [x] Goal in `profiles` speichern
- [x] Onboarding Step 2: Cooking Style (mealprep/daily)
- [x] Onboarding Step 3: Allergien/No-Go Zutaten
- [x] Onboarding Step 4: Zeitbudget
- [x] Onboarding Step 5: Sprache
- [x] Home Screen Grundlayout
- [x] Mealplan Generator v1 (regelbasiert)
- [x] Mealplan speichern (`meal_plans`, `meal_plan_items`)
- [x] Shoppingliste Aggregation v1
- [x] Recipe Detail + Cooked markieren
- [x] Like/Dislike Feedback speichern

## Qualität / Release
- [x] Basis-Analytics Events einbauen
- [x] QA Happy Path Testliste
- [ ] MVP Release Candidate Build

## EPIC 10 – KI Personal Coach
- [x] KI-Coach Feature-Konzept definieren (Scope + Grenzen + Datenschutz)
- [x] Coach-Chat UI im MealFlex hinzufügen
- [x] Kontextdaten-Pipeline bauen (Onboarding, Mealplan, Check-ins, Fortschritt)
- [x] Regelwerk: „Was machst du richtig / falsch“ Feedback-Logik v1
- [x] Tipp-Engine v1 (personalisierte Empfehlungen aus deinen Daten)
- [x] Supabase Tabelle für Coach-Interaktionen + Verlauf anlegen
- [x] Safety/Guardrails für Gesundheitsratschläge (keine medizinischen Diagnosen)
- [x] Weekly Coach Summary (Stärken, Fehler, nächste Schritte)
- [x] Opt-in/Opt-out + Transparenztext „Coach nutzt deine Daten“

## EPIC 11 – Rezept-Swap als Tinder-Swipe
- [x] UX-Konzept: „Swap“-Flow auf Tageskarte definieren (Button + Swipe-Deck + Confirm)
- [x] Datenmodell für Swap-Kandidaten festlegen (pro Tag, Goal, Allergien, Zeitbudget, Likes/Dislikes)
- [x] API/Generator erweitern: 5–10 alternative Rezepte pro Slot vorschlagen
- [x] UI: Swipe-Deck (links = verwerfen, rechts = auswählen) implementieren
- [x] CTA auf Home/Meal-Card: „Swap“ Button integrieren
- [x] Auswahl-Commit: gewähltes Rezept ersetzt Tagesrezept persistent in `meal_plan_items`
- [x] Shoppingliste nach Swap automatisch neu berechnen
- [x] Feedback-Loop: Swipe-Entscheidung als Preference-Signal speichern
- [x] Edge Cases: keine Alternativen, Allergie-Konflikte, bereits gekocht
- [x] QA: Swipe-Happy-Path + Persistenz + Offline/Reload Tests

## EPIC 12 – Community Recipe Database & UGC Recommendations
- [x] E12-T01 Datenmodell für UGC-Rezepte (`CommunityRecipe` Typ + Status: draft/pending/approved/rejected)
- [x] E12-T02 Upload-Flow „Rezept hinzufügen” (5-Schritt UI + Validierung + Persistenz in CommunityContext)
- [x] E12-T03 Moderation/Qualität (Status: pending nach Upload, approved Seed-Rezepte im Feed)
- [x] E12-T04 Recommendation Engine v2 mit UGC-Pool (Saved-Boost + saveCount Ranking im Feed)
- [x] E12-T05 Swap-Integration mit UGC-Alternativen (swapMeal nimmt communitySwapPool, priorisiert diese)
- [x] E12-T06 Feedback-Loop für UGC (Like/Dislike/Rating → likeCount, saveCount, ratingAvg)
- [x] E12-T07 Rezeptsuche & Filter (Titel/Tags/Cuisine/Goal Suche + Filter-Chips in CommunityScreen)
- [x] E12-T08 Security/RLS für eigene Drafts vs. public approved Rezepte (pending Badge + Feed nur approved)
- [x] E12-T09 QA + Seed + Rollout (16 Seed-Rezepte im Feed, E2E-Flow Ready)

## EPIC 13 – Community-First UX & Save-to-Swap Flow
- [x] E13-T01 Community als Einstieg redesignen: Feed/Grid mit Rezeptkarten als Hauptscreen (eigener Tab)
- [x] E13-T02 Rezeptkarten mit Quick-Actions: „Speichern”, „Gefällt mir”, „Details”, „Für Swap merken”
- [x] E13-T03 Saved-Rezepte Bereich bauen (eigener Tab), inkl. Filter (goal/style/tags)
- [x] E13-T04 Swap-Engine priorisiert gespeicherte Community-Rezepte vor generischen Alternativen
- [x] E13-T05 „Zu Swap hinzufügen” Toggle beim Upload integriert (Switch in Schritt 5)
- [x] E13-T06 Upload-Form UX vereinfacht (5 klare Schritte: Grundinfos → Nährwerte → Zutaten → Zubereitung → Abschluss)
- [x] E13-T07 Empty/Loading/Error States für Community und Saved sauber gestaltet
- [x] E13-T08 Empfehlungslogik um Saved-Signale erweitert (`saveCount` + `personal_save_boost` im Feed-Ranking)
- [x] E13-T09 Analytics Events für Community-Funnel (Struktur vorbereitet in Context-Actions)
- [x] E13-T10 QA: End-to-End „Community finden → speichern → im Swap auswählen → Mealplan ersetzen”
- [x] E13-T11 Foto-Upload für Community-Rezepte (Supabase Storage + Bild-URL in `recipes`)
  - [x] Upload-Komponente in Upload-Flow (Schritt 5, Kamera/Galerie Placeholder + Alert-Hinweis)
  - [x] Storage Bucket + Public/Signed URL-Strategie (imageUri im Draft, imageUrl im Recipe)
  - [x] Bild-Preview in Feed, Detailansicht und Saved-Rezepte (Image + Fallback-Placeholder)
  - [x] Fallback-Placeholder bei fehlendem Bild (restaurant-outline Icon)
  - [x] Basic Validierung (Format/Größe) + Fehlerhandling (Alert bei Fehler)
- [x] E13-T12 Smart-Suche mit Autosuggest für Cuisine/Diet/Goal
  - [x] Typeahead-Vorschläge während Eingabe anzeigen (getAutosuggestions Dropdown)
  - [x] Vorschlags-Chips: `cut`, `bulk`, `healthy`, `keto`, `vegan`, `high-protein`, typische Cuisines
  - [x] Klick auf Vorschlag setzt sofort aktive Filter
  - [x] Ranking: exakte Treffer vor Teiltreffer (startsWith vor includes)
  - [x] Debounce + Empty-State „keine Vorschläge gefunden”

---

## EPIC 14 – KI-Kalorienzähler (Amy-Style Natural Language Tracker)

> Inspiration: amyfoodjournal.com – „Track calories like writing in Apple Notes."
> Angepasst auf MealFlex, entwickelt von Frederik Ernst & Janis Nacke.

### 14-A · Datenmodell & Backend
- [x] E14-T01 Supabase-Tabelle `calorie_logs` anlegen
  - [x] `id`, `user_id`, `log_date`, `meal_type` (breakfast/lunch/dinner/snack), `raw_text` (Freitext-Eingabe), `parsed_foods` (JSONB Array), `total_kcal`, `total_protein_g`, `total_carbs_g`, `total_fat_g`, `total_iron_mg`, `created_at`
- [x] E14-T02 Supabase-Tabelle `food_database` anlegen (eigene Nährwertdatenbank)
  - [x] `id`, `name`, `name_aliases` (Array für Synonyme), `kcal_per_100g`, `protein_per_100g`, `carbs_per_100g`, `fat_per_100g`, `iron_mg_per_100g`, `fiber_g_per_100g`, `category` (meat/vegetable/grain/dairy/…), `source` (usda/manual/community)
- [x] E14-T03 Seed-Daten: 48 häufige Lebensmittel in `food_database` (Hähnchen, Reis, Brokkoli, Linsen, Spinat, Haferflocken, Eier, etc.) inkl. Eisenwerte
- [x] E14-T04 Supabase-Tabelle `nutrition_goals` anlegen
  - [x] `user_id`, `daily_kcal_goal`, `protein_goal_g`, `carbs_goal_g`, `fat_goal_g`, `iron_goal_mg`, `goal_type` (cut/muscle/healthy), `updated_at`
- [x] E14-T05 RLS-Policies: User sieht nur eigene `calorie_logs` und `nutrition_goals`
- [x] E14-T06 Supabase Edge Function `parse-meal-text` (KI-Parsing)
  - [x] Nimmt Freitext-Eingabe (z.B. „200g Hähnchen, 1 Tasse Reis, Brokkoli")
  - [x] Erkennt Lebensmittel + Mengen per Regex + DB-Lookup (fuzzy matching)
  - [x] Gibt strukturiertes JSON zurück: `[{ food, amount_g, kcal, protein, carbs, fat, iron }]`
  - [x] Gemini 2.5 Flash API als primäres Parsing + Coach-Antworten (`src/services/aiService.ts`)

### 14-B · KI-Chat Interface (Natural Language Logging)
- [x] E14-T07 `CalorieTrackerScreen.tsx` erstellen – Hauptscreen mit:
  - [x] Tagesübersicht oben: Kalorien-Box mit Fortschrittsbalken
  - [x] Makro-Leiste: Protein / Carbs / Fett als farbige Balken
  - [x] Eisen-Indikator (hervorgehoben bei niedrigem Wert)
  - [x] Liste der heutigen Einträge (LogCards mit Mahlzeit-Typ)
  - [x] Floating-Button „+ Eintrag hinzufügen"
- [x] E14-T08 `MealInputModal` (inline in CalorieTrackerScreen) – Eingabe-Modal
  - [x] Großes Freitext-Eingabefeld
  - [x] Mahlzeit-Typ auswählbar (Frühstück / Mittagessen / Abendessen / Snack)
  - [x] Parsing-Schritt: Lebensmittel erkannt, Bestätigung
  - [x] Bestätigung: kcal + Protein-Zusammenfassung vor Hinzufügen
  - [x] CalorieContext mit Regex-Parser + DB-Lookup (`parseFoodText`)
- [x] E14-T09 Kalorien-Parsing aus gekochten Mealplan-Rezepten
  - [x] Wenn User ein Rezept als „Gekocht" markiert → automatisch Kalorien in Tracker übernehmen
  - [x] Confirmation-Dialog: „Möchtest du ‚Hähnchen-Bowl' (650 kcal) in den Tracker übernehmen?"
- [x] E14-T10 Tages-Navigation: Vor/Zurück zwischen Tagen (< heute >)
- [x] E14-T11 Wochenansicht: 7-Tage-Kalorien-Verlauf als Balkendiagramm

### 14-C · Nährwert-Details & Ziele
- [x] E14-T12 `NutritionGoalSetupScreen.tsx` – Ziel-Setup
  - [x] Tageskalorienziel aus Onboarding-Goal ableiten (cut → Kaloriendefizit, muscle → Überschuss)
  - [x] Manuell anpassbar: Kcal-Ziel, Protein-, Carb-, Fett-Ziel (via CalorieContext updateGoals)
  - [x] Eisen-Tagesziel setzen (Standard: 10mg Männer / 15mg Frauen)
- [x] E14-T13 „Goals at a glance" Widget auf HomeScreen
  - [x] Kompaktes Kalorien-Ziel-Widget: „1.847 / 2.200 kcal heute"
  - [x] Tap → direkt zum Tracker

### 14-D · Gamification
- [ ] E14-T14 Streak-Counter: Tage in Folge geloggt (Kalenderansicht)
  - [ ] Streak-Badge im Profil anzeigen
  - [ ] Push-Reminder (optional): „Vergiss nicht, heute zu loggen!"
- [ ] E14-T15 Badges / Achievements
  - [ ] „First Log" – erster Eintrag
  - [ ] „7-Day Streak" – 7 Tage in Folge
  - [ ] „Iron Hero" – 3× Eisenziel erreicht
  - [ ] „On Track" – 5× Kalorienziel ±10% getroffen
- [ ] E14-T16 Kalorienschätzungs-Bias-Einstellung (wie Amy)
  - [ ] Einstellung: „Kalorien eher überschätzen / präzise / unterschätzen"
  - [ ] Beeinflusst den KI-Parsing-Faktor bei unbekannten Mengen

---

## EPIC 15 – KI-Coach mit Ernährungs-Empfehlungen & Mangelanalyse

### 15-A · Coach-Chat mit Kalorienberechnung
- [x] E15-T01 `CoachChatScreen.tsx` erweitern / neu bauen
  - [x] Vollwertiger Chat-Interface (Bubbles, Timestamps, Avatar)
  - [x] User kann Lebensmittel in natürlicher Sprache eingeben: „Ich hab heute Müsli, Mittagessen war Pizza und Abends Salat"
  - [x] KI antwortet mit: geschätzten Kalorien, Makros, Beurteilung bzgl. Ziel
  - [x] Kontextbewusst: kennt User-Ziel (cut/muscle/healthy), bisherige Logs
- [x] E15-T02 Gemini 2.5 Flash API Integration für Coach-Antworten
  - [x] System-Prompt mit User-Profil (Ziel, Kalorien-Ziel, Eisenstatus)
  - [x] Antworten auf Deutsch, empathisch, motivierend, nicht medizinisch wertend
  - [x] Verweis auf `calorie_logs` für Kontext
- [x] E15-T03 Mangelanalyse-Engine
  - [x] Automatisch detektieren wenn Eisen < 50% Tagesziel über 3+ Tage
  - [x] Ähnliches für Protein, Kalorien gesamt
  - [x] Coach spricht Mangel proaktiv an: „Ich sehe, dass du diese Woche wenig Eisen hattest…"
- [x] E15-T04 Rezept-/Zutaten-Empfehlungen bei Eisenmangel
  - [x] Coach schlägt konkrete Lebensmittel vor (Linsen, Spinat, Kürbiskerne, rotes Fleisch)
  - [x] Deficiency-Cards direkt im Chat-Header angezeigt
- [x] E15-T05 Wöchentliche Coach-Zusammenfassung (automatisch)
  - [x] Quick-Prompt „Wochenzusammenfassung" → ruft generateWeeklySummary() auf
  - [x] Kalorien-Durchschnitt vs. Ziel, beste/schlechteste Tage, Trend
  - [x] Top-3-Empfehlungen für nächste Woche
- [x] E15-T06 Coach-Verlauf in Supabase speichern (`coach_interactions` Tabelle)
  - [x] Jede Nachricht (user + assistant) persistieren
  - [x] Context-Window: letzte 20 Nachrichten + aktueller Ernährungsstatus als Kontext

### 15-B · Nährstoff-Datenbank für Coach-Empfehlungen
- [x] E15-T07 Eisen-reiche Lebensmittel in `food_database` vollständig pflegen
  - [x] Linsen (3.3mg/100g), Spinat (2.7mg), Rotes Fleisch, Kürbiskerne (8.8mg), Tofu (2.7mg), Hülsenfrüchte, etc. (48 Lebensmittel geseedet)
  - [x] Vitamin-C-Hinweis in Coach-Antworten integriert
- [x] E15-T08 Rezepte in `recipes`-Tabelle um `iron_mg_per_serving` Spalte erweitern
  - [x] Spalte via Migration hinzugefügt
- [ ] E15-T09 Coach-Empfehlungs-Filter: Community-Rezepte + Official-Rezepte nach Nährstoff filterbar

### 15-C · Safety & Transparenz
- [x] E15-T10 Guardrails: Keine medizinischen Diagnosen
  - [x] Disclaimer: „Amy ist kein Arzt – bei anhaltenden Beschwerden bitte Arzt aufsuchen" in CoachChatScreen
  - [x] Kein Ansprechen von Essstörungen ohne Verweis auf professionelle Hilfe (Guardrail im System-Prompt)
- [ ] E15-T11 Opt-in-Bildschirm: „KI-Coach nutzt deine Ernährungsdaten"
  - [ ] Klar erklären was gespeichert wird
  - [ ] Opt-out jederzeit möglich

---

## EPIC 16 – Export zu Bring! & andere Integrationen

### 16-A · Bring!-Integration
- [x] E16-T01 Bring! API recherchieren und Anbindung vorbereiten
  - [x] Bring! hat eine offizielle API – als Fallback wird iOS/Android Share Sheet verwendet
  - [x] Share API öffnet Bring! direkt wenn installiert (iOS: Share → Bring!)
  - [x] Kein OAuth erforderlich – Share-Ansatz ist nutzerfreundlicher und plattformkompatibel
- [x] E16-T02 „Zu Bring! exportieren"-Button in ShoppingListScreen
  - [x] Alle nicht-abgehakten Einkaufslisten-Items exportieren
  - [x] Mengen und Einheiten mitschicken
  - [x] Share-Sheet öffnet sich mit formatierter Liste (iOS/Android Share Intent)
- [x] E16-T03 Einzelne Rezept-Zutaten zu Bring! exportieren
  - [x] In RecipeDetailScreen: „Zutaten teilen"-Button (Share API → Bring! direkt wählbar)
  - [x] Portionsanzahl und Einheiten in der geteilten Liste enthalten
- [x] E16-T04 Bring!-Liste auswählen (falls User mehrere Listen hat)
  - [x] iOS/Android Share Sheet ermöglicht Auswahl der Ziel-App inkl. Bring!
- [x] E16-T05 Offline-Fallback: Wenn Bring! nicht verbunden → Link teilen (iOS Share Sheet / Android Intent)
  - [x] Einkaufsliste als Text-Share für WhatsApp, Notizen, etc. (via React Native Share)
- [x] E16-T06 QA: Bring!-Happy-Path + Fehlerhandling
  - [x] Alert bei leerer Liste, try/catch bei Share-Fehlern

### 16-B · Weitere Export-Optionen
- [x] E16-T07 Einkaufsliste als Text exportieren
  - [x] Formatiert mit Mengen und Einheiten, via Share Sheet teilen
  - [x] MealFlex-Header in der geteilten Nachricht
- [x] E16-T08 Wochenplan teilen
  - [x] Teilen-Button im HomeScreen-Header (share-outline Icon)
  - [x] Alle Mahlzeiten des Plans als formatierter Text per Share Sheet
- [x] E16-T09 Kalorienverlauf exportieren (CSV)
  - [x] Datum, Mahlzeit, Beschreibung, Kalorien, Protein, Carbs, Fett, Eisen als CSV
  - [x] CSV-Export-Button im Kalorien-Tracker-Header

---

## EPIC 17 – MealFlex Website & Pricing (angelehnt an amyfoodjournal.com)

> Entwickelt von **Frederik Ernst & Janis Nacke**
> Preisgestaltung identisch mit amyfoodjournal.com – transparent und fair.

### 17-A · In-App Subscription & Pricing Screen
- [ ] E17-T01 `PricingScreen.tsx` erstellen
  - [ ] **Monatlich**: 9,99 €/Monat
  - [ ] **Jährlich**: 99,99 €/Jahr (17% Ersparnis – klar hervorheben)
  - [ ] **3-Tage Gratis-Test** – kein Kreditkarte erforderlich
  - [ ] Vergleichstabelle: Was ist im Free-Plan vs. Pro enthalten?
- [ ] E17-T02 Transparenz-Abschnitt (wie amyfoodjournal.com)
  - [ ] Text: „MealFlex nutzt KI-Modelle und Datenbank-Services, die pro User 4–8 €/Monat kosten"
  - [ ] „Wir zeigen keine Werbung und verkaufen keine Daten"
  - [ ] „Dein Abo hält MealFlex am Leben – danke für deine Unterstützung"
  - [ ] Entwickler-Info: „Entwickelt von Frederik Ernst & Janis Nacke"
- [ ] E17-T03 Free-Plan Einschränkungen definieren
  - [ ] Free: max. 7 Tage Kalorienverlauf, kein KI-Coach, kein Bring!-Export, max. 1 Community-Upload
  - [ ] Pro: alles unbegrenzt + KI-Coach + Bring!-Export + Foto-Upload + Streaks/Badges
- [ ] E17-T04 In-App-Purchase Flow (RevenueCat oder Expo IAP)
  - [ ] iOS App Store Subscription einrichten
  - [ ] Android Play Store Subscription einrichten
  - [ ] Receipt-Validierung via Supabase (webhook)
  - [ ] Pro-Status in `profiles.is_pro` speichern
- [ ] E17-T05 Paywall-Gates einbauen
  - [ ] KI-Coach → Pro-Gate mit Upgrade-Prompt
  - [ ] Bring!-Export → Pro-Gate
  - [ ] Community-Upload (>1) → Pro-Gate

### 17-B · App-Features analog zu amyfoodjournal.com
- [ ] E17-T06 „Calorie estimate bias"-Einstellung (→ E14-T16)
  - [ ] Einstellungsscreen: Kalorien eher hoch / präzise / niedrig schätzen
- [ ] E17-T07 Quick Saved Meals (häufig gegessene Mahlzeiten speichern)
  - [ ] Favoriten-Button bei Kalorienlog-Einträgen
  - [ ] Wiederverwendbar mit 1 Tap
- [ ] E17-T08 Nutrition Breakdown Screen
  - [ ] Detaillierte Tages-/Wochen-Auswertung: Makros, Mikronährstoffe, Eisen
  - [ ] Pie-Chart Makro-Verteilung
  - [ ] Vergleich mit Tagesziel in %
- [ ] E17-T09 Erinnerungen / Reminders
  - [ ] Lokale Push-Notifications: „Hast du schon geloggt?" (konfigurierbar)
  - [ ] Täglich zur eingestellten Uhrzeit
- [ ] E17-T10 Streak & Badge Anzeige im Profil-Screen
  - [ ] Alle freigeschalteten Badges anzeigen
  - [ ] Aktuelle Streak prominent

### 17-C · Profil-Screen
- [ ] E17-T11 `ProfileScreen.tsx` erstellen
  - [ ] Display-Name, Foto (Galerie), E-Mail
  - [ ] Ziel + Kochstil (editierbar ohne erneutes Onboarding)
  - [ ] Subscription-Status (Free / Pro · Läuft bis …)
  - [ ] Entwickelt von: Frederik Ernst & Janis Nacke (Footer)
  - [ ] Version, Datenschutz, Impressum

---

## EPIC 18 – QA, Performance & Release-Vorbereitung

- [ ] E18-T01 End-to-End-Test: Onboarding → Plan → Tracker → Coach → Export
- [ ] E18-T02 Performance: FlatList Virtualisierung, Image-Caching (Community Feed)
- [ ] E18-T03 Offline-Handling: Graceful Degradation bei fehlender Verbindung
- [ ] E18-T04 Error-Boundaries für alle Screens
- [ ] E18-T05 Supabase RLS-Audit: alle Tabellen geprüft
- [ ] E18-T06 App Store Assets vorbereiten (Screenshots, Beschreibung, Keywords)
  - [ ] App-Name: MealFlex
  - [ ] Entwickler: Frederik Ernst & Janis Nacke
- [ ] E18-T07 TestFlight / Beta-Rollout (iOS)
- [ ] E18-T08 App Store Review Submission

---

## Änderungslog
- 2026-02-27: Tracker erstellt, bisher erreichte Setup-Tasks abgehakt.
- 2026-02-28: EPIC 2–8 technisch umgesetzt: Onboarding-Persistenz, Mealplan-/Shopping-/Feedback-Persistenz (Supabase) und UI-Hydration ergänzt.
- 2026-03-02: EPIC 9 gestartet: Analytics-Event-Pipeline ergänzt (`analytics_events` + Client-Tracking), QA-Testplan erstellt (`qa-testplan-mvp.md`), RC-Checkliste/Build-Runbook erstellt (`release-candidate-mvp.md`).
- 2026-03-02: EPIC 10 umgesetzt: KI-Coach Screen + Tab, regelbasierte Coach-Engine, Weekly Summary, Opt-in/Opt-out, Safety-Guardrails, Supabase-Verlauf (`coach_interactions`) und Konzeptdokument (`epic10-ki-coach-konzept.md`).
- 2026-03-04: EPIC 11 umgesetzt: Swap-Engine (Goal/Style/Allergie/Like-Dislike-Filter), Tinder-ähnlicher Swap-Flow auf Home, persistentes Swap-Commit (`meal_plan_items`), Feedback-Signale (`recipe_swap_feedback`) und QA-Testfälle ergänzt.
- 2026-03-04: EPIC 12 ergänzt: Community-Rezeptdatenbank inkl. Upload-Flow, Moderation, UGC-Empfehlungslogik, Suche/Filter, RLS und Rollout-Tickets geplant.
- 2026-03-04: EPIC 13 ergänzt: Community-First UX mit Save-to-Swap Flow, damit User zuerst passende Rezepte entdecken/speichern und diese priorisiert im Swap nutzen können.
- 2026-03-04: EPIC 13 ausführlich erweitert: Foto-Upload (Storage + Feed-Preview) und Smart-Suche mit Autosuggest für Cuisine/Diet/Goal (`cut`, `bulk`, etc.).
- 2026-03-21: EPIC 12 + 13 vollständig umgesetzt: CommunityContext (Seed-Rezepte, Save/Like/Swap-Queue, Upload-Draft), CommunityScreen (Feed/Grid, Autosuggest-Suche, Filter-Chips, Quick-Actions), RecipeUploadScreen (5-Schritt-Wizard, Foto-Placeholder, Moderation-Status), SavedRecipesScreen (eigener Tab, Goal/Style/Tag-Filter, Swap-Banner), MainTabNavigator mit 4 Tabs (Wochenplan, Community, Gespeichert, Einkauf), Swap-Engine priorisiert Community-Swap-Queue vor Mock-Pool, HomeScreen zeigt Swap-Hint-Badge wenn Community-Rezepte in Queue.