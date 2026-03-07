-- Cyprus Winter: push subscriptions for opt-in reminders
-- Run in Supabase SQL Editor or via `supabase db push`

create table if not exists public.push_subscriptions (
  id text primary key,
  client_id text not null,
  subscription jsonb not null,
  trip_start_date date,
  push_trip_countdown boolean not null default true,
  last_push_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_push_subscriptions_client_id on public.push_subscriptions (client_id);
create index if not exists idx_push_subscriptions_trip on public.push_subscriptions (trip_start_date) where trip_start_date is not null;

alter table public.push_subscriptions enable row level security;
