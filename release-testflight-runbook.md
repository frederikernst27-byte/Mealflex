# MealFlex Release- und TestFlight-Runbook

## Lokal testen
1. Abhaengigkeiten installieren:
   ```bash
   npm install
   ```
2. Expo starten:
   ```bash
   npm start
   ```
3. Echtes iPhone: QR-Code mit Expo Go scannen.
4. Mac Simulator: Xcode installieren, einmal oeffnen, iOS Simulator installieren, dann im Expo-Terminal `i` druecken.

## Xcode Simulator einrichten
1. Xcode aus dem App Store installieren.
2. Xcode oeffnen und Komponenten/Lizenz bestaetigen.
3. Xcode -> Settings -> Platforms -> iOS Simulator installieren.
4. Optional pruefen:
   ```bash
   open -a Simulator
   ```

## Supabase Checkliste
Die App erwartet diese Tabellen/Features:
- `profiles` mit `id`, `display_name`, `goal`, `cooking_style`, `onboarding_completed`, `is_pro`, `subscription_status`, `subscription_expires_at`, `coach_opt_in`
- `meal_plans`
- `meal_plan_items`
- `recipes`
- `saved_recipes`
- `recipe_likes`
- `calorie_logs`
- `nutrition_goals`
- `coach_interactions`
- Storage Bucket `recipe-photos`

Pruefe in Supabase:
1. Project Settings -> Data API: `EXPO_PUBLIC_SUPABASE_URL` und anon/publishable key stimmen mit `.env` ueberein.
2. Authentication -> Providers: Email ist aktiviert.
3. Authentication -> URL Configuration: spaeter App-Deep-Link und Website-URL eintragen.
4. RLS Policies: User duerfen nur eigene privaten Daten lesen/schreiben; approved Community-Rezepte sind lesbar.

## RevenueCat Setup
Die App hat Pricing und Pro-Gates vorbereitet. Fuer echte Zahlungen:
1. Apple Developer Account einrichten.
2. App Store Connect App + Subscription-Produkte anlegen:
   - Monthly: 9,99 EUR
   - Yearly: 99,99 EUR
3. RevenueCat Projekt anlegen und App Store Produkte verbinden.
4. RevenueCat SDK/API-Key in die App integrieren.
5. RevenueCat Webhook zu Supabase Edge Function verbinden.
6. Webhook aktualisiert `profiles.is_pro`, `subscription_status`, `subscription_expires_at`.

## TestFlight
1. EAS CLI installieren und anmelden:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. EAS konfigurieren:
   ```bash
   eas build:configure
   ```
3. iOS Build starten:
   ```bash
   eas build --platform ios --profile preview
   ```
4. Build in App Store Connect/TestFlight hochladen und auf echtem iPhone testen.

## Manueller Smoke-Test
- Signup mit echter E-Mail
- Login
- Onboarding komplett abschliessen
- Wochenplan sehen
- Rezeptdetail oeffnen
- Rezept als gekocht markieren
- Kalorienlog hinzufuegen
- Coach Opt-in aktivieren
- Einkaufsliste oeffnen
- Community-Rezept speichern
- Profil/Pricing ansehen
