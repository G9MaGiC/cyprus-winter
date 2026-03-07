# Redis Setup for Production Rate Limiting

Cyprus Winter uses **Upstash Redis** for shared rate limiting across serverless instances. Without Redis, limits are enforced per-instance (e.g. each Vercel serverless function has its own counter). With Redis, limits are shared—abuse is consistently blocked.

---

## Why Redis?

- **Vercel / serverless:** Multiple instances run in parallel. In-memory limits are per-instance.
- **Shared state:** Redis gives a single source of truth for rate-limit counters.
- **Fallback:** If Redis env vars are unset, the app uses in-memory limits (fine for local dev; not ideal for production).

---

## Quick Setup (Upstash)

1. **Create an Upstash account**  
   [console.upstash.com](https://console.upstash.com)

2. **Create a Redis database**
   - Click "Create Database"
   - Choose a region close to your app (e.g. `eu-central-1` for Cyprus)
   - Enable TLS (default)

3. **Copy credentials**  
   From the database dashboard:
   - `UPSTASH_REDIS_REST_URL` (e.g. `https://xxx.upstash.io`)
   - `UPSTASH_REDIS_REST_TOKEN` (long string)

4. **Add to your environment**
   - **Vercel:** Project → Settings → Environment Variables → add both vars for Production
   - **Local:** Add to `.env.local` (do not commit)

5. **Deploy**  
   Limits will apply globally once the vars are set.

---

## Verification

1. Hit any rate-limited API (e.g. `/api/chat`, `/api/weather`).
2. Inspect response headers:
   - `X-RateLimit-Remaining` — requests left in the window
   - `X-RateLimit-Limit` — max requests per minute
   - `X-RateLimit-Bypassed: true` — only in dev with bypass header

3. If Redis is active, limits will be consistent across instances. Without Redis, hitting different instances can bypass limits.

---

## Rate-Limited Routes

| Route | Limit | Scope |
|-------|-------|-------|
| /api/chat | 20/min | chat |
| /api/bookings POST | 10/min | bookings |
| /api/bookings GET (lookup) | 15/min | bookings-lookup |
| /api/weather | 30/min | weather |
| /api/push/vapid | 10/min | vapid |
| /api/push/subscribe | 5/min | push-subscribe |
| /api/trail-reports | 10/min | trail-reports |
| /api/track | 120/min | track |
| /api/health | 60/min | health |
| /api/stats | 30/min | stats |

---

## Troubleshooting

- **429 too often:** Increase limits in `src/lib/rate-limit.ts` and the respective route files.
- **Redis not used:** Ensure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set for the deployment environment (e.g. Production in Vercel).
- **Upstash errors:** Check [Upstash status](https://status.upstash.com) and your database dashboard for errors.
