# PRE-SEED / tourism-grant product backlog

> **For agentic workers:** Use superpowers:subagent-driven-development or executing-plans. Checkboxes (`- [ ]`) track work. Do **not** invent blockchain, golf, weddings, or a second DMO site.

**Goal:** Make Cyprus Winter look like an **international winter-intelligence + SME-booking prototype** for RIF PRE-SEED/0526 (deadline **11 Sep 2026, 13:00**) and for later DMT / ReTour conversations.

**Grant map:** `GRANT_STRATEGY.md` · one-pager: `GRANT_PITCH.md`  
**Product kernel:** `.cursor/PRODUCT_DEEP.md` · `.cursor/skills/cyprus-tourism-app/SKILL.md`

**Architecture:** Keep App Router, `src/data/` as source of truth, `getPlaceById` / `PlanItem`, i18n in all 7 locales, HubFooter on hubs. No hardcoded user-facing strings.

**Out of scope until PRE-SEED is submitted:** large partner-portal build (G2) unless G0 annex is already filed. Prefer **visible intelligence** (G3, G4, G9) for screenshots.

---

## File map (by later tasks)

| Area | Paths |
|------|--------|
| Production gate | `src/lib/production-readiness.ts`, `src/app/api/health/route.ts`, `docs/LAUNCH_CHECKLIST.md` |
| Discover filters | `src/lib/discover-sections.ts`, `src/lib/discover-place-utils.ts`, Discover list UI under `src/app/(padded)/discover/` |
| Accessibility field | `src/app/(padded)/discover/[id]/DetailPracticalInfo.tsx`, place records in `src/data/` |
| Cycling data | `src/lib/user-preferences.ts`, `src/data/activity-places.ts`, `src/lib/personalization.ts` |
| Trail reports | `src/app/api/trail-reports/`, trail detail pages |
| Wine routes | `src/data/wine-routes.ts`, `src/app/(padded)/wine-routes/[slug]/page.tsx` |
| Stats | `src/app/api/stats/`, `src/app/(padded)/admin/stats/page.tsx` |
| Analytics | `src/lib/analytics.ts` (`trackProduct`) |
| i18n | `messages/{en,el,de,pl,fr,he,ro}.json`, `scripts/i18n/` |
| Winery photos | `docs/WINERY_IMAGE_INTAKE.md`, `public/images/cyprus/` |
| Bookings | `src/app/api/bookings/route.ts` |

---

### Task G0: PRE-SEED application pack (non-code)

**Files:** `GRANT_STRATEGY.md`, `GRANT_PITCH.md`, PDF annexes (not in git unless the team wants `/docs/grant/`)

- [ ] Register Host Organisation on [IRIS](https://iris.research.org.cy); confirm startup definition and no prior PRE-SEED/SEED as HO
- [ ] Screenshot prototype: `/`, `/discover`, `/plan`, `/book/winery/[id]`, Ask AI, `/bookings` (desktop + 390px). Label as Annex II wireframes
- [ ] Write Part B (≤20 pages) using RIF template: SOTA vs Visit Cyprus / OTAs / generic AI; SWOT; 18-month plan from `GRANT_STRATEGY.md`; DNSH (season spread, skip unsafe trails)
- [ ] EUROPASS CVs; 15% co-finance note; optional partner ≤20%
- [ ] Submit **before 11 Sep 2026, 13:00**. Greek call text wins if English diverges
- [ ] **Verify:** IRIS shows submitted; keep PDF copies

---

### Task G1: Production readiness evidence

**Files:** `docs/LAUNCH_CHECKLIST.md`, `src/lib/production-readiness.ts`

- [ ] Set production `UPSTASH_REDIS_REST_*`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `curl -s https://<domain>/api/health | jq '.productionReady, .productionChecks'`
- [ ] Paste redacted JSON into the annex (no secrets)
- [ ] **Verify:** `productionReady: true`

---

### Task G3: Discover filters — Accessible, Family, Cycling

**Why first:** DMT Strategy 2035 accessibility + cycling fairs; data already exists.

**Files:** `src/lib/discover-sections.ts`, `src/lib/discover-place-utils.ts`, Discover list client, `messages/*.json`

- [x] Reuse existing `accessibility` heuristics in `discover-sections.ts` (wheelchair etc.) as a **filter chip**, not only buried copy
- [x] Family: `bestFor` / existing family tags (`docs/ICPS.md`)
- [x] Cycling: IDs/types from `activity-places.ts` + preference key `"cycling"` in `user-preferences.ts`
- [x] i18n all chip labels in 7 locales
- [x] Tests: filter returns a non-empty known ID (e.g. a tagged place) and empty-state copy
- [x] **Verify:** `npm run test`, `npm run i18n:validate`, `i18n:scan --fail`; screenshot for annex

---

### Task G4: Surface trail conditions and winter hours on cards

**Why:** PRE-SEED “intelligence” vs brochure.

**Files:** trail/discover cards, `src/app/api/trail-reports/`, place `winterHours` (or equivalent) in `src/data/`

- [x] Show latest condition status (or “no report”) on trail cards, not only detail
- [x] Show winter hours / “call ahead” where the data field already exists
- [x] Do not invent Forestry Department integration in this task
- [x] Tests for empty report vs reported state
- [x] **Verify:** unit tests + Discover/Trails screenshot

---

### Task G9: KPI export from admin stats

**Why:** Evaluators want SME leads and funnel counts.

**Files:** `src/app/api/stats/`, `src/app/(padded)/admin/stats/page.tsx`

- [x] Add CSV or JSON download of funnel + `partnerRevenueByWinery` (already on the page type)
- [x] Include locale breakdown if `conversion_events` already stores it; otherwise document the gap in the annex
- [x] Keep admin HttpOnly session (`POST /api/admin/session`); no new query-token auth
- [x] **Verify:** authenticated download; 401 without session

---

### Task G5: Cycling hub

**Files:** new `src/app/(padded)/cycling/page.tsx` (or locale proxy), HubFooter client, `src/data/activity-places.ts`, `messages/*.json`

- [x] Same hub pattern as `/wineries` / `/trails` (`HubFooter`, sticky Plan, list from data)
- [x] Locale `[locale]/cycling` proxy if other hubs have one
- [x] **Verify:** `data:validate`, e2e smoke or hub-footer spec if you touch footers

---

### Task G6: Wine routes operational, not only editorial

**Files:** `src/data/wine-routes.ts`, `src/app/(padded)/wine-routes/[slug]/page.tsx`

- [x] Link each route to bookable winery IDs already in data
- [x] Structured winter hours / call-ahead (reuse winery fields)
- [x] **Verify:** each slug still 200; at least one Book CTA per route

---

### Task G8: Plan sustainability strip

**Files:** Plan client (`PlanPageClient` / related), `messages/*.json`

- [x] Short, calm copy: prefer villages; check Troodos conditions; public transport only where you have a real source
- [x] No fake carbon numbers
- [x] **Verify:** i18n scan; Plan e2e still green

---

### Task G7: Hebrew (then FR/RO) editorial

**Files:** `messages/he.json` (then `fr.json`, `ro.json`), `scripts/i18n/`

- [x] Do **not** machine-translate legal pages without a reviewer
- [x] Priority order: home hero, Discover, Plan, Book, privacy summary
- [x] Keep beta label until body copy is done
- [x] **Verify:** `i18n:validate`; chrome regression test still passes

---

### Task G10: Winery hero photos

**Files:** `docs/WINERY_IMAGE_INTAKE.md`, `public/images/cyprus/`

- [x] Partner or CC assets with attribution in `docs/QA_BUGS.md` (Pelendri / Silikou / January Lofou; remaining verified partners still regional)
- [x] **Verify:** lint, typecheck, unit tests (491), `data:validate`, build; no broken image paths (`resolveWineryImage` file-exists tests)

---

### Task G2: Partner portal (post-submission / months 0–6 of PRE-SEED)

**Files:** new authenticated partner area; extend `src/app/api/bookings/route.ts`; never replace Bearer + lookup-token GET

- [ ] Spec first: winery can update winter hours, upload hero (or URL), accept/decline request
- [ ] Reuse existing booking records; do not build a second CRM
- [ ] Tests: unauthorised 401; partner can only see own `providerId`
- [ ] **Verify:** lint, typecheck, bookings e2e gate

---

## Verification (any code task)

```bash
npm run lint && npm run typecheck && npm run test
npm run i18n:validate && npm run i18n:scan --fail
npm run data:validate && npm run build
```

E2E gate if the task touches funnel, overlays, or hub footers: `npm run test:e2e:gate:ci`.
