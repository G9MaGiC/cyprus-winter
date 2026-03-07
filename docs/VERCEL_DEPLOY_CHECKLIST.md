# Vercel Deploy Checklist

Use this when configuring the Cyprus Winter project in Vercel.

---

## 1. Build ✓

Local `npm run lint` and `npm run build` pass. Vercel will run the same build.

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
| `CRON_SECRET` | Protects /api/cron/daily |

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

## 5. Smoke Test (after deploy)

- [ ] Home loads
- [ ] Discover → place detail → Add to plan
- [ ] Plan shows added items
- [ ] Search "Omodos" returns results
- [ ] Bookings page loads
- [ ] AI chat responds (if API key set)
