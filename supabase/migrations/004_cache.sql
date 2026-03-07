-- Cyprus Winter: cache table for cron-populated data (trail summary, etc.)
-- Run in Supabase SQL Editor or via `supabase db push`

create table if not exists public.cache (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Service role has full access; RLS blocks anon
alter table public.cache enable row level security;
