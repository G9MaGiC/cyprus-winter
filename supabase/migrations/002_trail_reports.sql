-- Cyprus Winter: trail_reports table (crowd-sourced conditions)
-- Run in Supabase SQL Editor or via `supabase db push`

create table if not exists public.trail_reports (
  id text primary key,
  trail_id text not null,
  status text not null check (status in ('open', 'caution', 'closed')),
  surface text not null check (surface in ('dry', 'muddy', 'snow', 'icy')),
  note text,
  temperature_c int,
  wind_kmh int,
  reported_at timestamptz not null default now(),
  reporter_email text,
  created_at timestamptz not null default now()
);

create index if not exists idx_trail_reports_trail_id on public.trail_reports (trail_id);
create index if not exists idx_trail_reports_reported_at on public.trail_reports (reported_at desc);

alter table public.trail_reports enable row level security;
