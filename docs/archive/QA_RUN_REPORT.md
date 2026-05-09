**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Cyprus Winter — QA Run Report

**Date:** March 2026  
**Plan:** docs/QA_PLAN.md  
**Status:** Phase A–C completed; Phase D–E skipped (manual/browser required)

---

## Summary

| Phase | Status | Notes |
|-------|--------|-------|
| **A. Automated** | ✅ Pass (1 fix applied) | Lint ✓, Test ✓, tsc ✓; Build blocked by .next permissions |
| **B. Security** | ✅ Pass | Code verification only |
| **C. Functional** | ✅ Pass | Code verification only |
| **D. Accessibility** | ⏭ Skipped | Requires axe/Lighthouse in browser |
| **E. Mobile** | ⏭ Skipped | Requires device/browser testing |
| **Stress test** | ⏭ Skipped | Dev server not running (requires `npm run dev`) |

---

## Phase A — Automated Checks

| Check | Result |
|-------|--------|
| `npm run lint` | ✅ Pass |
| `npm run test` | ✅ Pass (22 tests) |
| `npx tsc --noEmit` | ✅ Pass *(after fix)* |
| `npm run build` | ❌ Blocked — `.next` root-owned; prebuild correctly surfaces fix instructions |
| `npm run stress:api` | ⏭ Skipped — dev server not running; 0 requests |

### Bug Fixed During Run

**TS2353:** `openingHours` (and `transport`, `parking`) did not exist on `Winery` type in `src/data/wineries.ts`. The "Dómes Sergiou" winery used these fields.  
**Fix:** Added optional `openingHours`, `transport`, `parking` to `Winery` type.

---

## Phase B — Security Verification (Code Review)

| Check | Result |
|-------|--------|
| **Booking lookup exact match** | ✅ `getBookingsByEmail` uses `.eq("guest_email", emailNormalized)`; no ILIKE/substring |
| **Rate limiting** | ✅ Chat 20/min, Bookings GET 10/min POST 15/min, Trail reports 10/min, Track 120/min |
| **AI output sanitization** | ✅ Uses `ReactMarkdown`; no `dangerouslySetInnerHTML` for model output |
| **Resend email escaping** | ✅ `escapeHtml()` used for guestName, providerName, date, notes, guestEmail in HTML body |
| **Admin stats 401** | ✅ Returns 401 when `ADMIN_SECRET` header/token missing or wrong |

---

## Phase C — Functional Verification (Code Review)

| Check | Result |
|-------|--------|
| **Invalid attraction id** | ✅ `discover/[id]` calls `notFound()` when `getAttractionById(id)` returns null |
| **Invalid trail id** | ✅ `trails/[id]` calls `notFound()` when trail not found |
| **Invalid winery id** | ✅ `book/winery/[id]` calls `notFound()` when winery not found |
| **Nav parent-route highlighting** | ✅ `pathname.startsWith(href + "/")` for sub-routes; home uses exact match |
| **404 pages** | ✅ `not-found.tsx` exists; emergency numbers present |
| **Error boundary** | ✅ `error.tsx` exists |

---

## Remaining Actions

1. **Run build:** Fix `.next` ownership: `sudo chown -R $(whoami) .next && rm -rf .next` then `npm run build`
2. **Run stress test:** Start `npm run dev`, then `npm run stress:api` to verify rate limits under load
3. **Lighthouse:** Run manually for LCP, a11y, performance baseline
4. **Device testing:** Test on iPhone/Android for safe area, touch targets, BottomNav overlap

---

## Traceability

- QA_PLAN.md — full plan
- AUDIT_REPORT.md — prior audit (most items resolved)
- PROJECT_REVIEW.md — prior team review
