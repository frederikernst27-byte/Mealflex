# Zusammenfassung – MealFlex Setup, Architektur & aktueller Stand

## 1) Produktkonzept (MVP)
Ihr habt ein klares MVP für **MealFlex** definiert:
- Fitness-orientierte Koch-App
- Automatische Generierung von Wochen-Mealplan + Einkaufsliste
- Fokus auf Zeitersparnis, Personalisierung, Kalorien-/Makrologik

### Core Loop
1. Onboarding (Ziel, Stil, Allergien/No-Gos, Zeit, Sprache)
2. Automatischer Wochenplan
3. Automatische Einkaufsliste
4. Kochen / abhaken / bewerten
5. Später: Lernlogik aus Verhalten

---

## 2) Deliverables, die bereits erstellt wurden

### A) MVP-Architektur + DB-Schema (Markdown)
Datei:
- `mvp-architektur-datenbank-schema.md`

Inhalt:
- Empfohlener Stack (Expo RN + Supabase)
- Datenmodell (profiles, restrictions, recipes, meal_plans, shopping_lists, feedback)
- SQL-Tabellenstruktur
- API/Function-Ideen (`generate-plan`, `swap-meal`, `build-shopping-list`, `feedback`)
- RLS-Hinweise
- MVP-Heuristik

### B) MVP-Ticketliste (Markdown)
Datei:
- `mvp-ticketliste.md`

Inhalt:
- 27 Tickets in sinnvoller Reihenfolge
- Sprint 1 + Sprint 2
- Prioritäten (Must/Should)
- Aufwand (S/M/L)
- Akzeptanzkriterien
- Produkt-Definition of Done

---

## 3) Git/GitHub Setup Status

### Lokal umgesetzt
- Git-Repo im Workspace initialisiert
- Commit-Identität gesetzt:
  - `user.name`: `frederikernst27-byte`
  - `user.email`: `frederik.ernst27@gmail.com`

### GitHub Repo verbunden
- Remote: `https://github.com/frederikernst27-byte/Mealflex.git`
- Branch: `main`
- Push erfolgreich

### Bereits gepushte Dateien
- `mvp-architektur-datenbank-schema.md`
- `mvp-ticketliste.md`
- `skills/github-autopush/SKILL.md`
- `skills/github-autopush/scripts/create_repo_and_push.sh`
- `skills/github-autopush/scripts/quick_push.sh`

---

## 4) Zusätzlich gebaut: GitHub-AutoPush Skill
Es wurde ein eigener Skill angelegt:
- `skills/github-autopush/`

Ziel:
- Repo erstellen/pushen
- Quick commit + push
- Basis-Workflow für Branch/PR

Hinweis:
- Für vollautomatische GitHub-Operationen war `gh` Installation + Auth erforderlich
- Konfigurationsrechte wurden korrigiert (`GH_CONFIG_DIR` / Besitzrechte)

---

## 5) Mobile Dev Setup (Windows + iPhone)

### Gewählter Dev-Flow
- Entwicklung auf Windows-Laptop
- Test auf echtem iPhone über **Expo Go**

### Typische Probleme & Lösungen
1. **`exp://...` im Browser geöffnet** → falsch
   - `exp://` gehört in Expo Go, nicht in Google/Chrome

2. **Expo Go Inkompatibilitätsfehler**
   - Ursache: SDK/Expo-Go Versions-Mismatch
   - Lösung: Expo-Version zurücksetzen/fixen (SDK kompatibel machen)

3. **Tunnel-/ngrok-Themen**
   - `@expo/ngrok` installiert
   - Start via `npx expo start --tunnel --clear`

---

## 6) Supabase Integration Status

### Umgesetzt
- `@supabase/supabase-js` + `react-native-url-polyfill` eingebunden
- `.env` mit:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `lib/supabase.ts` Client erstellt

### Wichtig gelernt
- URL/Key kommen aus **Project Settings → Data API / API Keys**
- Nur **publishable/anon key** ins Frontend
- Nicht `service_role` im Client verwenden

### Fehlerbehebung
- Fehler: `Could not find table public.profiles in schema cache`
- Lösung: Tabelle in Supabase SQL Editor anlegen
- Danach Read-Test funktionierte

---

## 7) Auth (T2) Status
- Basis Login/Signup-Flow eingebaut
- App zeigt Session-Status und Logout
- Import/Export-Fehler (`Element type is invalid`) wurde als likely default/named Import Problem identifiziert und behoben
- Ergebnis: Auth-Basis scheint zu funktionieren

---

## 8) Produktive Arbeitsweise (empfohlen)
- Erst funktionalen Core bauen, dann Design-Polish
- Nächster sinnvoller Schritt:
  - Onboarding Step 1 (`goal`) bauen
  - In `profiles` speichern
  - Danach weitere Onboarding-Schritte

---

## 9) Tooling-Entscheidung (Diskussion)
- Für schnelles MVP-Bauen: **Expo + Supabase + AI-Editor**
- Cursor vs Claude Code:
  - Cursor: sehr stark als täglicher Coding-Driver
  - Claude/Claude Code: stark bei Architektur/Refactor/komplexen Aufgaben

---

## 10) Offene nächste Schritte
1. T2 stabil verifizieren (Signup/Login inkl. Confirm-Flow)
2. `profiles` realistisch modellieren (z. B. `id = auth.users.id`)
3. Onboarding Step 1 implementieren (Goal-Auswahl)
4. Goal in DB speichern/laden
5. Danach Mealplan Generator MVP (regelbasiert)

---

## Kurzfazit
Ihr habt in kurzer Zeit eine sehr gute Basis gelegt:
- Produktkonzept klar
- Ticketplan + Architektur dokumentiert
- Repo live auf GitHub
- Mobile Dev läuft auf iPhone
- Supabase-Verbindung + Auth-Grundlage steht

Das Projekt ist jetzt in einer sehr guten Position, um direkt in die ersten echten MVP-Features zu gehen.
