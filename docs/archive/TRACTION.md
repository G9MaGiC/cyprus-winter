**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Traction Metrics — YC-Ready

Track these numbers and keep them front and center.

---

## Primary metric: Bookings per month

**API:** `GET /api/stats`

```json
{
  "bookingsThisMonth": 12,
  "storage": "supabase"
}
```

- **Supabase configured:** `storage: "supabase"` — persistent, survives restarts
- **Fallback:** `storage: "memory"` — in-memory, resets on deploy

**How to view:**
- `/admin/stats` page (enter `ADMIN_SECRET` when prompted) or `curl -H "Authorization: Bearer $ADMIN_SECRET" http://localhost:3000/api/stats`
- Add to a simple dashboard, cron job, or Slack bot
- YC interview: *"We did X bookings last month"*

**Health check:** `GET /api/health` — returns `ok`, `storage`, `supabase` status, `ai`, `email`. Use for monitoring; returns 503 if Supabase unreachable.

---

## Secondary metrics (future)

| Metric | Where | Target |
|--------|-------|--------|
| MAU | Analytics | 1,000+ |
| Itinerary completion rate | Product | 30%+ |
| AI chat usage % | Product | 50%+ |
| Time to first booking | Product | < 5 min |

---

## Setup for persistent bookings

1. Create [Supabase](https://supabase.com) project
2. Run `supabase/migrations/001_bookings.sql` and `003_conversion_tracking.sql` in SQL Editor
3. Add to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. For admin stats: set `ADMIN_SECRET` (any string; enter it in the `/admin/stats` form)

## Setup for email confirmations

1. Create [Resend](https://resend.com) account
2. Add to `.env.local`:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (must be a verified domain or Resend onboarding address)
