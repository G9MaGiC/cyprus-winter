# Launch checklist — Cyprus Winter

One-page ops + engineering gate before public traffic. Complements `docs/RUNBOOK.md` §6 and `docs/SCORECARD.md`.

**Last updated:** 2026-08-29 · **Target:** PR #196 on top of `main` after PRs #191, #192, and #195

**Production access (live check):** `https://cyprus-winter-three.vercel.app` returns HTTP 200 without authentication or `noindex`, and Next.js image optimization is active. `/api/health` returns HTTP 503 with `productionReady: false` because required Upstash and Supabase services are still unavailable. No custom domain is attached to Vercel, while production metadata currently points to `https://cypruswinter.com`.

**Quick gate:** `npm run health:production` (exit 0 only when live `productionReady: true`).

---

## 0. Public domain and canonical URL (P0 - block launch until aligned)

Live Vercel audit on 2026-08-29:

- latest `main` deployment is `READY`
- `https://cyprus-winter-three.vercel.app/` returns HTTP 200 to an unauthenticated visitor
- the production response does not send `x-robots-tag: noindex`
- generated image URLs use `/_next/image`, confirming image optimization is active
- `/api/health` returns HTTP 503 with `productionReady: false`
- Vercel has no custom domain attached, but canonical, alternate, schema, Open Graph, and Twitter metadata point to `https://cypruswinter.com`
- Vercel reported no runtime error clusters in the previous 7 days

Before public traffic:

1. Attach `cypruswinter.com` to the Vercel project and verify DNS, or explicitly approve a `.vercel.app` alias and set `NEXT_PUBLIC_SITE_URL` to that final origin.
2. Redeploy after the domain or environment change.
3. Verify the public response and metadata:

   ```bash
   curl -sSI "https://<your-public-domain>/" | sed -n '1,12p'
   curl -s "https://<your-public-domain>/" | grep -Eo '<link rel="canonical"[^>]+>'
   ```

4. Confirm the canonical URL matches the public origin, there is no `noindex` header, and the health checks in section 1 pass.

**Pass criteria:** the final public domain reaches the production deployment, all canonical and social metadata use that domain, and unauthenticated visitors receive the app.

---

## 1. Production environment (P0 - block launch if missing)

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
| `HEALTH_SECRET` | Recommended (required for annex dump) | Bearer token for full `/api/health` diagnostics in production |

**Never in production:** `STRESS_TEST_TOKEN`

### Step-by-step (P0 — ~15 min)

1. **Upstash Redis** — [console.upstash.com](https://console.upstash.com) → Create database → copy REST URL + token.
2. **Supabase** — Project → Settings → API → copy `Project URL`, `anon` key, and `service_role` key.
3. **Vercel** → Project → Settings → Environment Variables → **Production** → add:

   | Variable | Value |
   |----------|--------|
   | `UPSTASH_REDIS_REST_URL` | Upstash REST URL |
   | `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-only) |

4. **Redeploy** production (Deployments → … → Redeploy) so env vars take effect.
5. **Verify:**

   ```bash
   npm run health:production
   # or:
   curl -s "https://<your-public-domain>/api/health" | jq '{ ok, productionReady }'
   ```

6. **Optional but recommended:** add `HEALTH_SECRET` (random 32+ chars) for authorized diagnostics; `RESEND_API_KEY` + `RESEND_FROM_EMAIL` for booking emails; one AI key (`GROQ_API_KEY` or `AI_GATEWAY_API_KEY`).

See also `.env.example` and `docs/RUNBOOK.md` §6 for the full env matrix.

### Verify after deploy

Public production health returns `{ ok, message, productionReady }` only. `productionChecks` (and storage/AI details) require `Authorization: Bearer $HEALTH_SECRET`. JSON never includes env values or setup hints.

```bash
# Uptime / boolean gate
curl -s "https://<your-domain>/api/health" | jq '{ ok, productionReady }'

# PRE-SEED annex dump (redacted checks — paste this, not Vercel env screenshots)
curl -s "https://<your-domain>/api/health" \
  -H "Authorization: Bearer ${HEALTH_SECRET}" \
  | jq '{ ok, productionReady, productionChecks, supabase, ai, email }'
```

**Pass criteria:** `productionReady: true` and required checks (`upstash`, `supabase`) show `ok: true`.

Example authorized payload while Upstash is still missing (do **not** paste a fabricated `true`):

```json
{
  "ok": false,
  "productionReady": false,
  "productionChecks": [
    { "id": "upstash", "label": "Upstash Redis (rate limits)", "ok": false, "required": true },
    { "id": "supabase", "label": "Supabase (bookings, analytics, trail reports)", "ok": false, "required": true }
  ]
}
```

---

## 2. Engineering gate (P0 - green in release PRs; rerun on final head)

Run locally or trust latest CI ([GitHub Actions](https://github.com/G9MaGiC/cyprus-winter/actions)):

```bash
npm run lint && npm run typecheck && npm run test
npm run i18n:validate && npm run i18n:scan --fail
npm run data:validate && npm run check:conflict-markers && npm run build
npm run images:validate   # winery + attraction local image paths
npm run test:e2e:gate:ci   # core funnel + UX + visual QA (375/768/RTL); needs: npm run test:e2e:install
```

| Check | Expected (August 2026) |
|-------|---------------------|
| Unit tests | Coverage suite passes; do not rely on a stale hardcoded count |
| i18n | Validation, coverage, hardcoded scan, and editorial drift pass for all 7 locales |
| Release CI | PR #192 run #565 and PR #195 run #568 passed all six jobs; PR #196 must also be green before launch |

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
| i18n beta | `/fr`, `/he`, `/ro` | Chrome + editorial + draft legal shipped; switcher still shows beta until lawyer sign-off — `docs/BETA_LOCALE_GRADUATION.md` |
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

- [x] Design sprint A–F (tokens, home calm, chrome, visual QA gate, photography trust) — PRs #150–#155
- [x] Main + secondary hub visual token pass — PRs #157–#159 (`HOME`/`HUB` grids, book card media, docs hygiene)
- [ ] Partner winery image intake (verified partners first) — `docs/WINERY_IMAGE_INTAKE.md`
- [ ] Confirm `productionReady` on public domain (not just preview) - **blocked on sections 0 and 1**
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
