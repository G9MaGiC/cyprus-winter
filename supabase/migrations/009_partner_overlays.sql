-- Cyprus Winter: durable partner display overlays (AUD-26)
-- Partner-edited winter hours / hero image previously lived in per-instance
-- memory and vanished on every cold start. Run in Supabase SQL Editor or via
-- `supabase db push`.

create table if not exists public.partner_overlays (
  provider_id text primary key,
  opening_hours text,
  image_url text,
  updated_at timestamptz not null default now()
);

-- Enable RLS; service role bypasses (same posture as bookings).
alter table public.partner_overlays enable row level security;
