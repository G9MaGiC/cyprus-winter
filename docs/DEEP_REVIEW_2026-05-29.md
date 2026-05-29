# Cyprus Winter — Deep Review (2026-05-29)

Structured audit following the Deep Project Review plan on branch `feat/persona-qa-2026-implementation`.

## Executive summary

| Dimension | Score | Notes |
|-----------|-------|-------|
| Architecture | 4/5 | Coherent static-data funnel; Plan/Events still client-heavy |
| Security | 4/5 | Strong validation; `debug-log` prod-gated; Upstash required in prod |
| Funnel / UX | 4/5 | Persona backlog largely shipped; travel-trust E2E added |
| i18n / SEO | 3/5 | 7 locales structurally complete; `fr`/`he`/`ro` ~43% English copy |
| Performance | 3/5 | Hero preload on discover/trails/plan/events/airport; Plan client LCP |
| a11y | 3/5 | Booking forms + discover filter inert; no axe in CI |
| Tests / CI | 4/5 | 563 unit tests; E2E gate expanded; component tests still 0 |

**Recommendation:** Merge feature branch after green CI. Schedule native translation sprint for `he`/`ro`/`fr` or label beta locales in UI.

---

## Phase 0 — Baseline

- Committed Sprint G (LCP preload, book locales, discover filter a11y).
- Verification: `lint`, `typecheck`, `test` (563), `i18n:validate` (1829 keys × 7), `build` — run before merge.

---

## Phase 1 — Architecture

**Strengths**

- Dual route tree `(padded)` + `[locale]` re-exports.
- Unified data access via `src/data/index.ts` with audit tests.
- Home RSC split pattern (`*-data.ts` + `*View.tsx`) established.

**Debt**

- `PlanPageClient.tsx` (~360 lines) — full client funnel.
- Events split: server `page.tsx` + `EventsPageClient.tsx` (preload added).
- TanStack Query in `Providers` for single hook (`useRightNowFeed`).
- `/api/debug-log` — dev-only (404 in production after this review).

---

## Phase 2 — Security

| Control | Status |
|---------|--------|
| Rate limiting | Upstash in prod; in-memory fallback per instance |
| Zod + sanitize | bookings, chat, trail-reports, push |
| Admin session | HttpOnly cookie + Bearer fallback |
| AI path allowlist | `safe-internal-path.ts`, `resolve-internal-path.ts` |
| debug-log | **404 in production** (implemented) |

**Ops:** Confirm `UPSTASH_REDIS_REST_*`, Supabase, Resend, `CRON_SECRET` on Vercel.

---

## Phase 3 — Funnel / UX

**Shipped (persona branch):** travel trust, plan realism, day combos, local filter, offline read-only plan, booking a11y, search aliases, ICS export.

**E2E coverage added:** `travel-trust.spec.ts`, `plan-offline.spec.ts` (in UX gate).

**Manual:** tablet 640–767px matrix, CRISIS-01 copy tone during alerts.

---

## Phase 4 — i18n / SEO

- **1829 keys × 7 locales** — structural parity passing.
- Book detail `generateMetadata` localized (`book.pages.*Detail.meta.*`).
- Guide loading skeleton uses `common.loading.bookingForm`.
- **Gap:** ~793 long strings in `fr`/`he`/`ro` still English; critical-path overrides in `scripts/i18n/critical-locale-overrides.json`.

---

## Phase 5 — Performance / PWA

| Page | Hero preload |
|------|--------------|
| Discover | Yes |
| Trails | Yes |
| Plan | Yes |
| Events | Yes |
| Airport | Yes |
| DetailHero | `fetchPriority="high"` |

**PWA:** `SerwistProvider` is a stub; `public/sw.js` is push-only. Plan offline = read-only via `localStorage`, not SW cache.

---

## Phase 6 — Accessibility

- `ListPageHero`: alt falls back to page title when image alt omitted.
- Discover mobile filters: `inert` when collapsed; focus first chip on expand.
- Booking forms: `aria-describedby` via `fieldDescribedBy()`.

**Remaining:** Full WCAG 2.2 AA audit; axe/Lighthouse not in CI.

---

## Phase 7 — Tests

| Added | File |
|-------|------|
| debug-log prod gate | `src/app/api/debug-log/route.test.ts` |
| cron daily auth | `src/app/api/cron/daily/route.test.ts` |
| push vapid | `src/app/api/push/vapid/route.test.ts` |
| usePlanUrlActions | `src/hooks/usePlanUrlActions.test.tsx` |
| travel trust E2E | `e2e/travel-trust.spec.ts` |
| offline plan E2E | `e2e/plan-offline.spec.ts` |

**Still open:** component tests; cron/weather-digest; push/subscribe route tests.

---

## Phase 8 — Docs sync

Updated: `AGENTS.md`, `docs/SCORECARD.md`, `docs/ARCHITECTURE.md`, `docs/QA_PLAN.md`.

---

## Prioritized backlog (post-review)

### P0 — Launch

1. Production env matrix green (`/api/health` → `productionReady`)
2. Green GitHub CI on feature branch

### P1 — Next sprint

3. Native `he`/`ro`/`fr` translation OR explicit beta-locale banner
4. Lighthouse mobile LCP on discover/plan/book
5. Localize `public/manifest.json`

### P2 — Quality depth

6. Plan RSC decomposition
7. Component tests (SearchBar, HubFooter, WineryBookingForm)
8. axe on E2E gate pages

### P3 — Platform

9. Real Serwist offline cache vs documented push-only stub
10. Prune/wire ~410 unused i18n keys (`i18n:coverage --strict`)
