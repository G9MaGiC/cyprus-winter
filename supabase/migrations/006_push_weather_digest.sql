-- Cyprus Winter: add weather digest push option
alter table public.push_subscriptions
  add column if not exists push_weather_digest boolean not null default false;

alter table public.push_subscriptions
  add column if not exists last_weather_push_at timestamptz;

create index if not exists idx_push_subscriptions_weather_digest
  on public.push_subscriptions (id) where push_weather_digest = true;
