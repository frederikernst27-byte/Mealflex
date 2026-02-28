# Anleitung: Antigravity + Cursor Setup (Windows) für MealFlex

> Ziel: Beide Tools sauber aufsetzen, damit ihr schneller am MVP coden könnt.

---

## 1) Voraussetzungen

- Windows 10/11
- Node.js LTS installiert (`node -v`)
- Git installiert (`git --version`)
- GitHub Account
- Euer Repo: `https://github.com/frederikernst27-byte/Mealflex`

Optional, aber empfohlen:
- iPhone + Expo Go (für Mobile-Tests)
- Supabase Projekt (Auth + DB)

---

## 2) Cursor einrichten

### 2.1 Installation
1. Cursor von der offiziellen Website laden und installieren.
2. Mit eurem Cursor-Account einloggen.

### 2.2 Projekt öffnen
1. Cursor öffnen
2. **Open Folder** → `C:\Users\Frederik\Desktop\mealflex-app`

### 2.3 GitHub Zugriff in Cursor
1. In Cursor GitHub-Login autorisieren
2. Prüfen, dass Remote korrekt ist:

```bash
git remote -v
```

Sollte zeigen:

```bash
origin https://github.com/frederikernst27-byte/Mealflex.git
```

### 2.4 Empfehlenswerte Cursor-Settings (MVP-freundlich)
- Auto-apply nicht blind aktivieren
- Immer Diff prüfen vor Save
- Große Refactors nur dateiweise
- Commit erst nach lokalem App-Test

### 2.5 Empfohlene Prompts in Cursor
- „Baue Onboarding Step 1 (goal) als React Native Screen, TypeScript, clean components.“
- „Erstelle Supabase query function für profiles upsert mit Fehlerbehandlung.“
- „Refactor App.tsx in kleine Komponenten ohne Logikverlust.“

---

## 3) Antigravity einrichten (generisch)

> Da „Antigravity“ je nach Tool-Version unterschiedlich deployed ist, nutze diese stabile Checkliste.

### 3.1 Installation
1. Antigravity-Desktop/Plugin nach offizieller Doku installieren.
2. Mit Account/API-Key einloggen.

### 3.2 Workspace verbinden
- Projektordner auf `mealflex-app` setzen.
- Nur diesen Workspace freigeben (kein Full-Disk Zugriff nötig).

### 3.3 Sicherheits- und Qualitätsregeln
- Auto-run Shell Commands: **aus** (oder „ask first“)
- File overwrite nur nach Preview
- Max change scope pro Run begrenzen (z. B. 1–3 Dateien)
- Keine Secrets in Chat/Prompt posten

### 3.4 Gute Antigravity-Tasks
- Kleine, klar abgegrenzte Änderungen
- Komponentenbau mit bestehenden Patterns
- Test-/Lint-Fixes

### 3.5 Schlechte Antigravity-Tasks
- „Baue komplette App in einem Schritt“
- Unkontrollierte Multi-File Migration ohne Tests
- Infra-/Security-Changes ohne menschliche Freigabe

---

## 4) Empfohlener Workflow mit beiden Tools

### Option A (meist am besten)
- **Cursor**: Haupt-Implementierung (Screens, Flows, Refactors)
- **Antigravity**: kleine Automationen/Fixes, repetitive Tasks

### Option B
- Ein Tool als Primary, das andere nur für Reviews/Gegencheck

### Teamregel (wichtig)
- Immer zuerst lokal testen, dann commit
- Kleine Commits mit klarer Message
- Vor Push: kurz auf iPhone prüfen (Expo Go)

---

## 5) MealFlex-spezifische Start-Tasks

1. Onboarding Step 1 (goal) bauen
2. `profiles.goal` in Supabase speichern
3. Session-basiertes Laden beim App-Start
4. Danach Step 2 (`cooking_style`) und Step 3 (`restrictions`)

---

## 6) Git-Kommandos (PowerShell)

```bash
cd C:\Users\Frederik\Desktop\mealflex-app
git status
git add -A
git commit -m "feat: onboarding step 1 goal selection"
git push
```

---

## 7) Häufige Fehler + Fix

### Fehler: Expo Go inkompatibel
- SDK/Expo-Go Versionen angleichen
- `npx expo install --fix`
- `npx expo start -c`

### Fehler: Supabase Tabelle nicht gefunden
- Tabelle in SQL Editor anlegen (`public.profiles`)

### Fehler: React „Element type is invalid"
- default/named Import prüfen
- Export in Component-Datei prüfen

---

## 8) Kurzempfehlung für euch

Für euer MVP:
- **Cursor als Haupttool**
- Antigravity als Zusatz für kleinere, klar eingegrenzte Aufgaben
- Fokus auf schnelle Feature-Iteration statt Design-Perfektion am Anfang

Damit kommt ihr am schnellsten von „Setup“ zu „echter MealFlex-Userflow läuft“.
