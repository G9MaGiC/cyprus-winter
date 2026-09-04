-- Cyprus Winter: persist the guest's UI locale and the chosen trail on bookings
-- (the "migration 008" noted by AUD-08/AUD-86: per-locale status emails and a
-- durable trail_id instead of the notes fold + local-storage carry).
-- Run in Supabase SQL Editor or via `supabase db push`.

alter table public.bookings add column if not exists locale text;
alter table public.bookings add column if not exists trail_id text;

comment on column public.bookings.locale is
  'Guest UI locale at booking time (BCP-47 tag from the app''s locale set); used for guest-facing status emails. Null = default locale.';
comment on column public.bookings.trail_id is
  'Chosen trail for guide tours (AUD-86). Null for winery tastings and legacy rows.';
