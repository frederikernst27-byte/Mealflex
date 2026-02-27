# Technische Architektur + Datenbank-Schema (MVP)

## 1) Architektur (MVP, pragmatisch)

### Empfohlener Stack
- **App:** React Native (Expo) + TypeScript
- **Backend:** Supabase (Postgres + Auth + Row Level Security)
- **API-Logik:** Supabase Edge Functions (TypeScript)
- **Analytics:** PostHog oder Mixpanel
- **Jobs/Scheduling:** Supabase Cron / pg_cron (wöchentliche Plan-Generierung optional)

### High-Level Komponenten
1. **Mobile App**
   - Onboarding
   - Mealplan UI
   - Shoppinglist UI
   - Recipe Detail + Feedback

2. **API Layer (Edge Functions)**
   - `generate-plan`
   - `swap-meal`
   - `build-shopping-list`
   - `submit-feedback`

3. **Postgres**
   - User Profile + Preferences
   - Recipe Catalog
   - Weekly Mealplans + Meals
   - Shopping Items
   - Feedback / Cooked Events

---

## 2) Datenmodell (Entities)

- **users** (kommt aus Supabase Auth)
- **profiles** (ziel, stil, zeitbudget, sprache)
- **user_restrictions** (allergien + no-go Zutaten)
- **recipes**
- **recipe_ingredients**
- **meal_plans** (pro Woche pro User)
- **meal_plan_items** (einzelne Slots/Meals)
- **shopping_lists**
- **shopping_list_items**
- **recipe_feedback** (like/dislike)
- **recipe_cooked_events** (gekocht markiert)

---

## 3) SQL-Schema (MVP)

```sql
-- Enums
create type goal_type as enum ('cut', 'muscle_gain', 'healthy');
create type cooking_style as enum ('mealprep', 'daily');
create type meal_slot as enum ('breakfast', 'lunch', 'dinner', 'snack');
create type feedback_type as enum ('like', 'dislike');

-- Profiles (1:1 zu auth.users)
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  goal goal_type not null default 'healthy',
  cooking_style cooking_style not null default 'daily',
  max_prep_time_min int not null default 30,
  language_code text not null default 'de',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Allergien / Blacklist
create table user_restrictions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  restriction_type text not null check (restriction_type in ('allergy', 'blacklist')),
  value text not null,
  created_at timestamptz not null default now(),
  unique(user_id, restriction_type, value)
);

-- Rezepte
create table recipes (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  description text,
  prep_time_min int not null,
  cook_time_min int not null,
  total_time_min int generated always as (prep_time_min + cook_time_min) stored,
  servings int not null default 1,
  kcal_per_serving int,
  protein_g_per_serving numeric(6,2),
  carbs_g_per_serving numeric(6,2),
  fat_g_per_serving numeric(6,2),
  tags text[] not null default '{}', -- z.B. {high_protein,quick,vegetarian}
  steps jsonb not null,               -- [{order:1,text:"..."},...]
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Zutaten pro Rezept
create table recipe_ingredients (
  id bigserial primary key,
  recipe_id bigint not null references recipes(id) on delete cascade,
  ingredient_key text not null,      -- normalisiert: z.B. "egg", "oats"
  ingredient_name text not null,     -- Anzeige
  qty numeric(10,3) not null,
  unit text not null,                -- g, ml, pcs
  category text,                     -- produce, dairy, meat ...
  optional boolean not null default false
);

create index idx_recipe_ingredients_recipe_id on recipe_ingredients(recipe_id);
create index idx_recipe_ingredients_key on recipe_ingredients(ingredient_key);

-- Wochenplan
create table meal_plans (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start_date date not null,  -- Montag der Woche
  status text not null default 'active' check (status in ('active', 'archived')),
  total_kcal int,
  total_protein_g numeric(8,2),
  total_carbs_g numeric(8,2),
  total_fat_g numeric(8,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, week_start_date)
);

-- Einzelne Meals im Plan
create table meal_plan_items (
  id bigserial primary key,
  meal_plan_id bigint not null references meal_plans(id) on delete cascade,
  day_of_week int not null check (day_of_week between 1 and 7), -- 1=Mon
  slot meal_slot not null,
  recipe_id bigint not null references recipes(id),
  servings numeric(6,2) not null default 1,
  source text not null default 'generated' check (source in ('generated', 'swapped')),
  cooked boolean not null default false,
  cooked_at timestamptz,
  unique(meal_plan_id, day_of_week, slot)
);

create index idx_meal_plan_items_plan_id on meal_plan_items(meal_plan_id);
create index idx_meal_plan_items_recipe_id on meal_plan_items(recipe_id);

-- Shoppingliste (pro Plan eine aktive Liste)
create table shopping_lists (
  id bigserial primary key,
  meal_plan_id bigint not null unique references meal_plans(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table shopping_list_items (
  id bigserial primary key,
  shopping_list_id bigint not null references shopping_lists(id) on delete cascade,
  ingredient_key text not null,
  ingredient_name text not null,
  total_qty numeric(10,3) not null,
  unit text not null,
  category text,
  checked boolean not null default false,
  unique(shopping_list_id, ingredient_key, unit)
);

create index idx_shopping_list_items_list_id on shopping_list_items(shopping_list_id);

-- Feedback
create table recipe_feedback (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id bigint not null references recipes(id) on delete cascade,
  feedback feedback_type not null,
  created_at timestamptz not null default now(),
  unique(user_id, recipe_id)
);

-- Cooked Events (historisch)
create table recipe_cooked_events (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id bigint not null references recipes(id) on delete cascade,
  meal_plan_item_id bigint references meal_plan_items(id) on delete set null,
  cooked_at timestamptz not null default now()
);
```

---

## 4) API-Endpunkte / Functions

### `POST /generate-plan`
**Input:** user_id, week_start_date(optional)

**Logik:**
1. Profile + Restrictions laden
2. Rezepte filtern:
   - Allergien/Blacklist strikt raus
   - `total_time_min <= max_prep_time_min`
3. Ranking nach Goal:
   - `muscle_gain` → high_protein priorisieren
   - `cut` → niedrigere kcal priorisieren
4. Stil anwenden:
   - mealprep: mehr Wiederholung, weniger verschiedene Rezepte
   - daily: mehr Varianz
5. Plan speichern + Makro-Summen berechnen
6. Shoppingliste erzeugen

### `POST /swap-meal`
**Input:** meal_plan_item_id

**Output:** 3–5 Alternativen, danach Replace

**Regel:** gleiche Constraints wie oben

### `POST /build-shopping-list`
Aggregiert Zutaten aus `meal_plan_items` + `recipe_ingredients`, konsolidiert nach `(ingredient_key, unit)`.

### `POST /feedback`
Like/Dislike speichern (upsert).

---

## 5) RLS (wichtig)

Für alle user-bezogenen Tabellen:
- User darf **nur eigene Daten** lesen/schreiben (`auth.uid() = user_id`)
- Rezeptkatalog darf jeder authentifizierte User lesen (`recipes.is_active = true`)
- Schreibzugriffe auf Recipe-Catalog nur Service Role/Admin.

---

## 6) MVP-Heuristik (einfach & robust)

**Score-Beispiel:**
- Base score = 100
- +20 wenn Tag passt (`high_protein` bei muscle_gain)
- +15 wenn `total_time_min` deutlich unter Limit
- -1000 bei Allergie/Blacklist Match (hart ausschließen)
- +Varianzbonus bei daily / +Wiederholungsbonus bei mealprep

So habt ihr eine nachvollziehbare, testbare Logik ohne „Blackbox-AI“.
