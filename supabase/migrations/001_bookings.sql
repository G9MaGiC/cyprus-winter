-- Cyprus Winter: bookings table
-- Run in Supabase SQL Editor or via `supabase db push`

create table if not exists public.bookings (
  id text primary key,
  type text not null default 'winery_tasting',
  provider_id text not null,
  provider_name text not null,
  date date not null,
  party_size int not null,
  guest_email text not null,
  guest_name text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_guest_email on public.bookings (lower(guest_email));
create index if not exists idx_bookings_created_at on public.bookings (created_at desc);

-- Enable RLS; service role bypasses
alter table public.bookings enable row level security;
