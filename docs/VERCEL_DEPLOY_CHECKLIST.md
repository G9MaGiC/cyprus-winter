# Vercel Deploy Checklist

Use this when configuring the Cyprus Winter project in Vercel.

---

## CTO Summary — Deploy Readiness

| Check | Status |
|-------|--------|
| Lint | ✓ `npm run lint` |
| Tests | ✓ `npm run test` (148 tests) |
| Build | ✓ `npm run build` (Next.js 16.1.6) |
| Node | `>=18.18.0` (package.json engines) |
| Framework | Next.js (Vercel auto-detects) |
| Crons | `/api/cron/daily` (06:00 UTC), `/api/cron/weather-digest` (06:00, 12:00, 17:00 UTC) |

**Before first deploy:** Set all required env vars in Vercel dashboard. Build will fail or features will break without Supabase, Resend, and at least one AI key.

**P0 before launch:** Set Redis (`UPSTASH_REDIS_REST_*`) for shared rate limiting. Never set `STRESS_TEST_TOKEN` in production.

---

## 1. Build ✓

Local `npm run lint` and `npm run build` pass. Vercel will run the same build.

If you see `ENOENT: pages-manifest.json` or `No such file or directory` for moved files (e.g. `book/guide/[id]/GuideBookingForm.tsx`) after a route refactor, run `npm run build:clean` (clears `.next` and rebuilds). Stale cache references old paths. Vercel uses clean environments, so this won't affect deploys.

---

## 2. Environment Variables

Add these in **Vercel → Project → Settings → Environment Variables** (Production + Preview).

### Required for core features

| Variable | Description | Source |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-only) | Supabase dashboard |
| `RESEND_API_KEY` | Email send (bookings, confirmations) | Resend.com |
| `RESEND_FROM_EMAIL` | e.g. `Cyprus Winter <bookings@cypruswinter.com>` | Your domain |
| `ADMIN_SECRET` | Protects /admin/stats | Generate a random string |

### AI chat (add one)

| Variable | Provider |
|----------|----------|
| `OPENAI_API_KEY` | OpenAI (gpt-4o-mini) |
| `GROQ_API_KEY` | Groq |
| `XAI_API_KEY` | xAI Grok |
| `MOONSHOT_API_KEY` | Moonshot |

### Optional

| Variable | Purpose |
|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Production rate limiting (shared) |
| `UPSTASH_REDIS_REST_TOKEN` | From Upstash Redis |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push notifications |
| `VAPID_PRIVATE_KEY` | Push notifications |
| `VAPID_MAILTO` | mailto for push metadata |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |
| `CRON_SECRET` | Protects /api/cron/daily and /api/cron/weather-digest |

---

## 3. Redis (production rate limiting)

For shared rate limits across Vercel instances:

1. Create a database at [console.upstash.com](https://console.upstash.com)
2. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel

See [docs/REDIS_SETUP.md](REDIS_SETUP.md) for details.

---

## 4. Custom Domain

Settings → Domains → Add domain (e.g. cypruswinter.com)

---

## 5. Launch Blockers (P0)

Before launch, ensure:

- [ ] **Redis** — `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` set (required for shared rate limiting across serverless instances)
- [ ] **STRESS_TEST_TOKEN** — Never set in production (bypass disabled when `NODE_ENV=production`)

---

## 6. Smoke Test (after deploy)

- [ ] Home loads
- [ ] Discover → place detail → Add to plan
- [ ] Plan shows added items
- [ ] Search "Omodos" returns results
- [ ] Bookings page loads
- [ ] AI chat responds (if API key set)
