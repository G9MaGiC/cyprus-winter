-- Composite index for admin funnel queries: filter by event + time range
create index if not exists idx_conversion_events_event_created_at
  on public.conversion_events (event, created_at desc);
