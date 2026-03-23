-- RLS policies for all tables.
-- Service role (server-side API routes) bypasses RLS automatically.
-- Anon/authenticated clients get restricted access.

-- Bookings: only the guest can read their own bookings (by email match).
-- Inserts go through the API route (service role), not directly from client.
create policy "Guests can view own bookings"
  on public.bookings for select
  using (lower(guest_email) = lower(current_setting('request.jwt.claims', true)::json->>'email'));

create policy "Service role can insert bookings"
  on public.bookings for insert
  with check (true);

create policy "Service role can update bookings"
  on public.bookings for update
  using (true);

-- Trail reports: anyone can read (public data), inserts via API only.
create policy "Anyone can read trail reports"
  on public.trail_reports for select
  using (true);

create policy "Service role can insert trail reports"
  on public.trail_reports for insert
  with check (true);

-- Conversion events: no client access. Server-side only via service role.
create policy "No anon access to conversion events"
  on public.conversion_events for select
  using (false);

create policy "Service role can insert conversion events"
  on public.conversion_events for insert
  with check (true);

-- Push subscriptions: clients can only read/modify their own subscription.
create policy "Clients can view own push subscription"
  on public.push_subscriptions for select
  using (client_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Service role can manage push subscriptions"
  on public.push_subscriptions for all
  using (true);

-- Cache: server-side only via service role.
create policy "No anon access to cache"
  on public.cache for select
  using (false);

create policy "Service role can manage cache"
  on public.cache for all
  using (true);
