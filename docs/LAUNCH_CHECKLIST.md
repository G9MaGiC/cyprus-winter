# Launch checklist — Cyprus Winter

One-page ops + engineering gate before public traffic. Complements `docs/RUNBOOK.md` §6 and `docs/SCORECARD.md`.

**Last updated:** 2026-08-19 · **Target commit:** `main` after PR #70

---

## 1. Production environment (P0 — block launch if missing)

Set in **Vercel → Project → Settings → Environment Variables → Production**:

| Variable | Required | Purpose |
|----------|----------|---------|
| `UPSTASH_REDIS_REST_URL` | **Yes** | Shared rate limits (chat, bookings lookup, health) |
| `UPSTASH_REDIS_REST_TOKEN` | **Yes** | Pair with URL above |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Bookings, trail reports, analytics |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Server-side Supabase |
| `RESEND_API_KEY` | Recommended | Booking confirmation emails |
| `BOOKING_LOOKUP_TOKEN_SECRET` | Recommended | Signed 15-minute My Bookings email links (min 16 chars). Signed-in users can still load bookings without it. |
| `ADMIN_SECRET` | Recommended | `/admin/stats` |
| One AI key | Recommended | Cyprus Guide (`GROQ_API_KEY`, `AI_GATEWAY_API_KEY`, etc.) |
| `CRON_SECRET` | If crons enabled | Daily cron routes |

**Never in production:** `STRESS_TEST_TOKEN`

### Verify after deploy

```bash
# Use production domain or Vercel bypass URL if deployment protection is on
curl -s "https://<your-domain>/api/health" | jq '{ ok, productionReady, productionChecks, supabase, ai, email }'
```

**Pass criteria:** `productionReady: true` and required checks (`upstash`, `supabase`) show `ok: true`.

---

## 2. Engineering gate (P0 — already green on `main`)

Run locally or trust latest CI ([GitHub Actions](https://github.com/G9MaGiC/cyprus-winter/actions)):

```bash
npm run lint && npm run typecheck && npm run test
npm run i18n:validate && npm run i18n:scan --fail
npm run data:validate && npm run build
npm run test:e2e:gate:ci   # needs: npm run test:e2e:install
```

| Check | Expected (August 2026) |
|-------|---------------------|
| Unit tests | 450+ pass |
| i18n keys | 1860 × 7 locales |
| CI on `main` | Quality, Build, Core Funnel Gate, E2E Full, Dependency Security — all green |

---

## 3. Manual smoke (P1 — ~30 min)

| Journey | Path | Pass if |
|---------|------|---------|
| Arrival | `/airport` → Plan 48h CTA | Hero + sticky Plan on scroll (mobile) |
| Discover | `/discover` → filter winery → detail | Image loads; book CTA; back works |
| Plan | Add place → `/plan` | Share bar; sticky add bar; offline banner when offline |
| Book | `/discover/tsiakkas` → Book tasting | Hero image ≠ generic only; back returns to discover |
| Search | `/search?q=omodos` → result → back | Query preserved (GF4) |
| i18n | `/el`, `/de` home + plan | No English leaks in nav/footer |
| Bookings | Submit test booking (staging) | Email or Supabase row (if configured) |

Test viewports: **390×844** (mobile), **1280** (desktop).

---

## 4. Content & assets (P1 — soft launch OK with gaps)

| Item | Status | Action |
|------|--------|--------|
| Winery hero images | Regional fallbacks live; ~55 venues need partner photos | See `docs/WINERY_IMAGE_INTAKE.md` |
| Image paths | 29 files in `public/images/cyprus/`; 0 broken refs | Re-run after new assets |
| CC attributions | BUG-125–136 logged in `docs/QA_BUGS.md` | Keep attributions when adding Wikimedia assets |

---

## 5. 48-hour soft launch monitoring

| Signal | Where | Alert if |
|--------|-------|----------|
| 5xx rate | Vercel Analytics / logs | Spike on `/api/bookings`, `/api/chat` |
| Rate limit 429s | API logs | Sustained without Upstash (misconfig) |
| E2E / CI regression | GitHub Actions | Any red on `main` after hotfix |
| Booking funnel | Analytics `book_*` events | Zero conversions with traffic (broken CTA) |
| Health | Cron or uptime ping `/api/health` | `productionReady: false` or `supabase: error` |

**Rollback:** Redeploy previous Vercel production deployment; no DB migration rollback needed for static/content-only releases.

---

## 6. Post-launch sprint (P2 — first 2 weeks)

- [ ] Partner winery image intake (verified partners first) — `docs/WINERY_IMAGE_INTAKE.md`
- [ ] Confirm `productionReady` on public domain (not just preview)
- [ ] Update `docs/SCORECARD.md` after each release train
- [x] Admin HttpOnly session (DR-003) — `/admin/stats` uses `POST /api/admin/session`; secret is not stored in `sessionStorage`
- [x] GitHub Actions Node 20 → 24 action runtime (PR #70: checkout/setup-node/upload-artifact @v7)

---

## Sign-off

| Role | Name | Date | Notes |
|------|------|------|-------|
| Engineering | | | CI green, health `productionReady` |
| Ops | | | Upstash + Supabase verified |
| Product | | | Smoke journeys OK |
| Content | | | Winery image plan accepted |

---

## Related

- `docs/RUNBOOK.md` — incidents, Capacitor, cron
- `docs/SCORECARD.md` — 5/5 engineering criteria
- `docs/QA_BUGS.md` — BUG-122–145 remediation log
- `docs/DEEP_REVIEW_2026-05-20.md` — pre-launch security backlog
