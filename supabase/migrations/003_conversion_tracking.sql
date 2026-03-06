-- Conversion events for funnel analytics
create table if not exists public.conversion_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  properties jsonb default '{}',
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_conversion_events_event on public.conversion_events (event);
create index if not exists idx_conversion_events_created_at on public.conversion_events (created_at desc);

alter table public.conversion_events enable row level security;

-- Lead fee for partner revenue share (billable amount per booking)
alter table public.bookings add column if not exists lead_fee_eur numeric(6,2);
