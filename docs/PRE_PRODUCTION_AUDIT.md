# Cyprus Winter — Pre-Production Audit

**Date:** 2025-03-09  
**Scope:** Runtime errors, hidden bugs, logical flaws, architectural weaknesses  
**Assumption:** Production with real users and unpredictable inputs

---

## Executive Summary

The codebase is generally well-structured with solid patterns (Zod validation, sanitization, rate limiting). However, several areas require attention before production:

- **Critical:** None
- **High:** 3 issues (AIAssistant setState-after-unmount, BookingsPage timer leak, unbounded user-agent storage)
- **Medium:** 12+ issues across API, hooks, and components
- **Low:** Multiple minor improvements

---

## Detailed Findings

### 1. Runtime Crash Risks

#### 1.1 AIAssistant — setState after unmount (High)

| Field | Value |
|-------|-------|
| **File** | `src/components/AIAssistant.tsx` |
| **Function** | `sendMessage` (lines 171–256) |
| **Issue** | After `await fetch()` and `await res.json()`, `setMessages`, `setLoading` run with no mounted check. If the user closes the AI panel or navigates away during the request, updates run on an unmounted component. |
| **Why problematic** | React warning: "Can't perform a React state update on an unmounted component." Can cause memory leaks and erratic UI. |
| **Risk** | High |
| **Fix** | Add `isMountedRef` and check before all setState calls after awaits. Use `AbortController` for fetch and abort on unmount. |
| **Example** | See useRightNowFeed pattern: `isMountedRef.current` check before `setState`. |

---

#### 1.2 BookingsPage — setState after unmount + uncleared timer (Medium)

| Field | Value |
|-------|-------|
| **File** | `src/app/(padded)/bookings/page.tsx` |
| **Function** | `fetchByEmail` (lines 48–90) |
| **Issue** | (1) All `setState` calls after `fetch` lack mounted check. (2) `setTimeout(() => setEmailSuccess(null), 5000)` is never stored or cleared. If the user leaves before 5s, the callback runs and updates state on an unmounted component. |
| **Why problematic** | Memory leak, React warning, possible crash in strict mode. |
| **Risk** | Medium |
| **Fix** | Store timeout ID in a ref; clear it in a useEffect cleanup. Add `isMountedRef` check before setState after await. |
| **Example** | `const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);` — store timer, clear in cleanup. |

---

#### 1.3 TrailReportClient, PushOptIn, WeatherPushOptIn — setState after unmount (Medium)

| File | Function | Issue |
|------|----------|-------|
| `TrailReportClient.tsx` | `handleSubmit` | `setDone`, `setError`, `setLoading` after fetch, no mounted check |
| `PushOptIn.tsx` | `handleSubscribe` | Multiple awaits (permission, fetch) followed by setStatus without check |
| `WeatherPushOptIn.tsx` | `handleSubscribe` | Same pattern |

**Fix:** Add `isMountedRef` and check before setState after each await.

---

#### 1.4 usePlanUrlActions — setState during effect on unmount (Low)

| Field | Value |
|-------|-------|
| **File** | `src/hooks/usePlanUrlActions.ts` |
| **Function** | `useEffect` (lines 38–62) |
| **Issue** | Effects call `addToDay` and `router.replace`. If the user navigates away before these finish, `addToDay` can schedule updates on an unmounted plan component. |
| **Risk** | Low |
| **Fix** | Use `isMountedRef` or check before calling `addToDay`; consider cleanup that sets a cancelled flag. |

---

#### 1.5 useItinerary — copyItinerary / copyShareLink (Medium, partially fixed)

| Field | Value |
|-------|-------|
| **File** | `src/hooks/useItinerary.ts` |
| **Function** | `copyItinerary`, `copyShareLink` |
| **Issue** | After `await navigator.clipboard.writeText()`, `setCopied` / `setLinkCopied` and `setTimeout` run without mounted check. Timeout cleanup exists, but setState after await does not. |
| **Risk** | Medium |
| **Fix** | Add `isMountedRef` check before setState after await. |

---

### 2. Logical Errors / Incorrect Assumptions

#### 2.1 right-now route — limit=0 becomes 12 (Low)

| Field | Value |
|-------|-------|
| **File** | `src/app/api/right-now/route.ts` |
| **Line** | 76 |
| **Issue** | `parseInt(limitParam ?? "", 10) || DEFAULT_ITEM_LIMIT` — if user sends `limit=0`, it becomes 12. |
| **Why problematic** | Unexpected behavior; caller may expect 0 to mean "no items." |
| **Risk** | Low |
| **Fix** | Explicit check: `const raw = parseInt(limitParam ?? "", 10); const limit = Number.isNaN(raw) || raw < 1 ? DEFAULT_ITEM_LIMIT : Math.min(raw, DEFAULT_ITEM_LIMIT);` |

---

#### 2.2 right-now route — maxDistanceKm can be NaN (Low)

| Field | Value |
|-------|-------|
| **File** | `src/app/api/right-now/route.ts` |
| **Line** | 77 |
| **Issue** | `maxDistanceKm = parseFloat(maxDistanceParam)` — if `maxDistanceParam` is non-numeric, result is NaN. No validation before use in scoring. |
| **Risk** | Low |
| **Fix** | `const maxDistanceKm = maxDistanceParam != null && !Number.isNaN(parseFloat(maxDistanceParam)) ? parseFloat(maxDistanceParam) : null;` |

---

#### 2.3 ConversionTracker — pathname locale handling (None)

| Field | Value |
|-------|-------|
| **File** | `src/components/ConversionTracker.tsx` |
| **Line** | 27, 34, 38 |
| **Finding** | `path.split("/").filter(Boolean).pop()` correctly extracts the last segment. For `/en/discover/omodos` this yields `omodos`. No issue. |
| **Risk** | None |

---

### 3. Edge Cases Not Handled

#### 3.1 usePlanUrlActions — unbounded ?add= param (Medium)

| Field | Value |
|-------|-------|
| **File** | `src/hooks/usePlanUrlActions.ts` |
| **Line** | 53–61 |
| **Issue** | `addParam.split(",")` can yield thousands of IDs. Each valid ID triggers `addToDay`. No cap. |
| **Why problematic** | Malicious or malformed URL like `?add=id1,id2,...,id10000` could cause thousands of state updates and UI lag. |
| **Risk** | Medium |
| **Fix** | Cap: `const ids = addParam.split(",").map(s => s.trim()).filter(Boolean).slice(0, 50);` |

---

#### 3.2 decodeItinerary — unbounded URL length (Low)

| Field | Value |
|-------|-------|
| **File** | `src/lib/itinerary-share.ts` |
| **Function** | `decodeItinerary` |
| **Issue** | No length check on `param`. A 10MB `?plan=` could cause high memory usage and slow parsing. |
| **Risk** | Low (URLs typically capped by browsers/servers) |
| **Fix** | `if (param.length > 2000) return null;` |

---

#### 3.3 pickDaily / pickDailyWithKey — throw on empty array (Low, mostly mitigated)

| Field | Value |
|-------|-------|
| **File** | `src/lib/daily-rotator.ts` |
| **Issue** | `pickDaily` and `pickDailyWithKey` throw when `items.length === 0`. Most callers guard or use `pickDailySafe`. |
| **Risk** | Low — remaining call sites are guarded (ThisWeekGrid, HomePlaceOfDay, right-now-scoring). |
| **Recommendation** | Prefer `pickDailySafe` for any new dynamic-array usage. |

---

### 4. State Management and Race Conditions

#### 4.1 AIAssistant — race on rapid sends (Medium)

| Field | Value |
|-------|-------|
| **File** | `src/components/AIAssistant.tsx` |
| **Function** | `sendMessage` |
| **Issue** | Rapid "Send" or retry starts multiple requests. `loading` blocks UI but older requests still complete and update state. Last response wins; no cancellation. |
| **Why problematic** | Responses can arrive out of order; user might see reply to an older message. |
| **Risk** | Medium |
| **Fix** | Use `AbortController`; abort previous request when a new one starts. Track request ID and ignore stale responses. |

---

#### 4.2 useRightNowFeed — no AbortController (Low)

| Field | Value |
|-------|-------|
| **File** | `src/hooks/useRightNowFeed.ts` |
| **Issue** | `fetch()` has no AbortController. Rapid region changes start multiple fetches; all run to completion. |
| **Risk** | Low |
| **Fix** | Use AbortController; abort on new request or unmount. |

---

### 5. Memory Leaks / Resource Mismanagement

#### 5.1 Toast — inner setTimeout not cleared (Low)

| Field | Value |
|-------|-------|
| **File** | `src/components/ui/Toast.tsx` |
| **Line** | 48–55 |
| **Issue** | Outer `setTimeout` is cleared on unmount; inner `setTimeout(() => onRemove(toast.id), 300)` is not stored or cleared. If component unmounts before it fires, `onRemove` can run after unmount. |
| **Risk** | Low |
| **Fix** | Store inner timeout ID and clear it in cleanup. |

---

### 6. Performance / Unnecessary Computation

#### 6.1 Plan page — activeDaysCount on every render (Low)

| Field | Value |
|-------|-------|
| **File** | `src/app/(padded)/plan/page.tsx` |
| **Line** | 58 |
| **Issue** | `Object.keys(days).filter(...).length` runs on every render. Minor cost. |
| **Risk** | Low |
| **Suggestion** | Memoize with `useMemo` if this value feeds heavy children. |

---

### 7. Security Vulnerabilities / Unsafe Patterns

#### 7.1 track route — unbounded user-agent storage (Medium)

| Field | Value |
|-------|-------|
| **File** | `src/app/api/track/route.ts` |
| **Line** | 138 |
| **Issue** | `user_agent: req.headers.get("user-agent") ?? undefined` stored without length limit. Some clients send 2KB+ user-agent strings. |
| **Why problematic** | Database bloat, potential for abuse (e.g. storing payloads in user-agent). |
| **Risk** | Medium |
| **Fix** | Truncate: `(req.headers.get("user-agent") ?? "").slice(0, 200)` |

---

#### 7.2 rate-limit-shared — spoofable x-forwarded-for (Medium)

| Field | Value |
|-------|-------|
| **File** | `src/lib/rate-limit-shared.ts` |
| **Line** | 9–15 |
| **Issue** | `getClientId` uses `x-forwarded-for` or `x-real-ip`. Without a trusted reverse proxy overwriting these, clients can spoof them. |
| **Why problematic** | Rate limit bypass by spoofing IP. |
| **Risk** | Medium |
| **Fix** | Document that deployment must use a trusted proxy (Vercel, Cloudflare, etc.) that sets these headers. Add deployment checklist. |

---

#### 7.3 stats route — ADMIN_SECRET="" bypass (Low)

| Field | Value |
|-------|-------|
| **File** | `src/app/api/stats/route.ts` |
| **Line** | 14–20 |
| **Issue** | If `ADMIN_SECRET` is set to `""`, `!secret` is true, so no one is authorized. But if token check is `token === secret` and secret is `""`, sending `Authorization: Bearer ` (empty) could match. |
| **Risk** | Low |
| **Fix** | `if (!secret || secret.length === 0) return false;` and ensure ADMIN_SECRET is never set to empty. |

---

### 8. Error Handling / Missing Validation

#### 8.1 push/vapid route — no try/catch (Low)

| Field | Value |
|-------|-------|
| **File** | `src/app/api/push/vapid/route.ts` |
| **Issue** | No top-level try/catch. If `getVapidPublicKey()` or `isPushConfigured()` throws, handler crashes with generic 500. |
| **Risk** | Low |
| **Fix** | Wrap handler body in try/catch; return structured `jsonError("SERVICE_UNAVAILABLE", ...)` on error. |

---

#### 8.2 right-now route — inconsistent error format (Low)

| Field | Value |
|-------|-------|
| **File** | `src/app/api/right-now/route.ts` |
| **Line** | 135–138 |
| **Issue** | Error path returns `{ error: { code: "INTERNAL_ERROR" } }` instead of using `jsonError` for consistency. |
| **Risk** | Low |
| **Fix** | Use `jsonError("SERVER_ERROR", "Internal error", 500)`. |

---

### 9. Code Duplication / Maintainability

| Area | Issue | Suggestion |
|------|-------|------------|
| **PushOptIn / WeatherPushOptIn** | Nearly identical subscribe logic | Extract `usePushSubscribe` hook with shared logic |
| **Multiple components** | Same `isMountedRef` + setState-after-await pattern | Extract `useSafeSetState` or document pattern in CONTRIBUTING |
| **API error responses** | Mix of `Response.json` and `jsonError` | Standardize on `jsonError` for all error paths |

---

### 10. Inconsistent Patterns

| Pattern | Inconsistent usage |
|---------|--------------------|
| **Error response format** | `push/vapid` returns `{ error: "string" }`; others use `{ error: { code, message } }` |
| **Mounted checks** | useRightNowFeed has them; AIAssistant, BookingsPage, TrailReportClient do not |
| **AbortController** | No fetch calls use it; recommended for all client-side fetches that may outlive component |

---

## Top 10 Production Failure Scenarios

1. **User closes AI panel during chat** — `sendMessage` completes, setState on unmounted component → React warning, possible memory leak.
2. **User leaves Bookings page before 5s** — Success timer fires, setState on unmounted component → React warning.
3. **Malicious ?add= with 10,000 IDs** — Plan page processes all, many state updates → UI freeze, possible OOM.
4. **Redis/Upstash down** — Rate limit throws; all routes now catch and return 503 (fixed). Before fix: 500.
5. **Spoofed x-forwarded-for** — Attacker bypasses rate limit; needs trusted proxy (documented).
6. **Very long user-agent** — Stored in conversion_events; DB bloat, potential abuse.
7. **Trail summary / weather timeout** — ThisWeekGrid, Right Now: timeouts already handled; fallback to defaults.
8. **Empty trailIdsWithData** — ThisWeekGrid: fallback to `["artemis"]` (fixed).
9. **Rapid AI "Send" clicks** — Out-of-order responses; user sees wrong reply.
10. **Supabase connection failure** — Bookings, trail reports, push: routes handle with 503 or in-memory fallback.

---

## Recommended Fixes (Priority Order)

### P0 (Before production)
- None identified.

### P1 (High priority) — **FIXED**
1. **AIAssistant:** Add `isMountedRef` and AbortController for `sendMessage`. ✓
2. **BookingsPage:** Clear success timer on unmount; add mounted check for fetchByEmail. ✓
3. **track route:** Truncate user-agent to 200 chars. ✓

### P2 (Medium priority) — **FIXED**
4. usePlanUrlActions: Cap `?add=` IDs (e.g. 50). ✓
5. TrailReportClient, PushOptIn, WeatherPushOptIn: Add mounted checks. ✓
6. useItinerary copyItinerary/copyShareLink: Add mounted check after clipboard await. ✓
7. AIAssistant: Add AbortController to cancel stale requests. ✓
8. Document rate-limit proxy requirement in deployment checklist.

### P3 (Low priority) — **FIXED** (except Toast)
9. right-now: Fix limit=0, validate maxDistanceKm. ✓
10. push/vapid: Add try/catch. ✓
11. decodeItinerary: Add max param length (2000). ✓
12. Toast: Clear inner setTimeout on unmount. (Manual fix: add innerTimerRef and clear in cleanup)
13. stats: Harden ADMIN_SECRET check. ✓

---

## Architectural Improvements

1. **Shared fetch wrapper** — `useFetch` or `fetchWithAbort` that supports AbortController and mounted checks.
2. **Input validation layer** — Centralize limits (max IDs in add, max plan param length, max user-agent length).
3. **Error response standard** — All API errors via `jsonError` with consistent shape.
4. **Data integrity lint** — Validate `trailIds`, `combineWith`, template place IDs against data.

---

## Refactoring Suggestions

1. Extract `usePushSubscribe` from PushOptIn and WeatherPushOptIn.
2. Extract `useSafeAsync` (isMountedRef + optional AbortController) for shared pattern.
3. Add integration tests for plan URL params (`?add=`, `?template=`).
4. Add E2E test for AI chat flow (send, close panel during request).
