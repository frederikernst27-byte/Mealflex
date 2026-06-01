-- MealFlex feature-complete helper migration.
-- Run this in Supabase SQL Editor after reviewing existing columns.

alter table public.profiles
    add column if not exists display_name text,
    add column if not exists cooking_style text,
    add column if not exists is_pro boolean not null default false,
    add column if not exists subscription_provider text,
    add column if not exists subscription_status text not null default 'free',
    add column if not exists subscription_expires_at timestamptz,
    add column if not exists coach_opt_in boolean not null default false,
    add column if not exists streak_count integer not null default 0,
    add column if not exists badges jsonb not null default '[]'::jsonb,
    add column if not exists updated_at timestamptz default now();

create table if not exists public.user_saved_meals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    raw_text text,
    parsed_foods jsonb not null default '[]'::jsonb,
    total_kcal numeric not null default 0,
    total_protein_g numeric not null default 0,
    total_carbs_g numeric not null default 0,
    total_fat_g numeric not null default 0,
    total_iron_mg numeric not null default 0,
    created_at timestamptz not null default now()
);

alter table public.user_saved_meals enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'user_saved_meals' and policyname = 'Users can read own saved meals'
    ) then
        create policy "Users can read own saved meals"
        on public.user_saved_meals for select
        using (auth.uid() = user_id);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'user_saved_meals' and policyname = 'Users can write own saved meals'
    ) then
        create policy "Users can write own saved meals"
        on public.user_saved_meals for insert
        with check (auth.uid() = user_id);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'user_saved_meals' and policyname = 'Users can delete own saved meals'
    ) then
        create policy "Users can delete own saved meals"
        on public.user_saved_meals for delete
        using (auth.uid() = user_id);
    end if;
end $$;
