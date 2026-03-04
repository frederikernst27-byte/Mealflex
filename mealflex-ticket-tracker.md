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
- [ ] E12-T01 Datenmodell für UGC-Rezepte (`recipes`, `recipe_ingredients`, `recipe_steps`, `recipe_tags`, `recipe_ratings`)
- [ ] E12-T02 Upload-Flow „Rezept hinzufügen“ (UI + Validierung + Persistenz)
- [ ] E12-T03 Moderation/Qualität (Status: draft/pending/approved/rejected + Duplikatcheck)
- [ ] E12-T04 Recommendation Engine v2 mit UGC-Pool (Profil/Fit/Allergie/Zeit/Feedback)
- [ ] E12-T05 Swap-Integration mit UGC-Alternativen (inkl. persistentes Replace)
- [ ] E12-T06 Feedback-Loop für UGC (Like/Dislike/Rating -> Ranking)
- [ ] E12-T07 Rezeptsuche & Filter (Titel/Zutat/Tags, Zeit, kcal, cuisine, diet)
- [ ] E12-T08 Security/RLS für eigene Drafts vs. public approved Rezepte
- [ ] E12-T09 QA + Seed + Rollout (Testdaten, E2E, Feature Flag)

## EPIC 13 – Community-First UX & Save-to-Swap Flow
- [ ] E13-T01 Community als Einstieg redesignen: zuerst Feed/Grid mit Rezeptkarten statt Upload-Form im Fokus
- [ ] E13-T02 Rezeptkarten mit Quick-Actions: „Speichern“, „Gefällt mir“, „Details“, „Für Swap merken“
- [ ] E13-T03 Saved-Rezepte Bereich bauen (eigener Tab/Section), inkl. Filter (goal/style/tags)
- [ ] E13-T04 Swap-Engine priorisiert gespeicherte Community-Rezepte vor generischen Alternativen
- [ ] E13-T05 „Zu Swap hinzufügen“ Flow beim Upload integrieren (optional direkt nach Einreichung)
- [ ] E13-T06 Upload-Form UX vereinfachen (Schritt-für-Schritt, klare Labels, bessere Reihenfolge)
- [ ] E13-T07 Empty/Loading/Error States für Community und Saved sauber gestalten
- [ ] E13-T08 Empfehlungslogik um Saved-Signale erweitern (`saved_at`, `save_count`, `personal_save_boost`)
- [ ] E13-T09 Analytics Events für Community-Funnel (`view_feed`, `save_recipe`, `add_to_swap`, `swap_pick`)
- [ ] E13-T10 QA: End-to-End „Community finden -> speichern -> im Swap auswählen -> Mealplan ersetzen"
- [ ] E13-T11 Foto-Upload für Community-Rezepte (Supabase Storage + Bild-URL in `recipes`)
  - [ ] Upload-Komponente in Upload-Flow (Kamera/Galerie)
  - [ ] Storage Bucket + Public/Signed URL-Strategie
  - [ ] Bild-Preview in Feed, Detailansicht und Saved-Rezepte
  - [ ] Fallback-Placeholder bei fehlendem Bild
  - [ ] Basic Validierung (Format/Größe) + Fehlerhandling
- [ ] E13-T12 Smart-Suche mit Autosuggest für Cuisine/Diet/Goal
  - [ ] Typeahead-Vorschläge während Eingabe anzeigen
  - [ ] Vorschlags-Chips: `cut`, `bulk`, `healthy`, `keto`, `vegan`, `high-protein`, typische Cuisines
  - [ ] Klick auf Vorschlag setzt sofort aktive Filter
  - [ ] Ranking: exakte Treffer vor Teiltreffer
  - [ ] Debounce + Empty-State „keine Vorschläge gefunden"

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
