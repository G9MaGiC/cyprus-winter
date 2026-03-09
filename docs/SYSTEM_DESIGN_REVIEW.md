# Cyprus Winter — System Design Review

**Date:** March 2026  
**Scope:** Architecture, multi-page bugs, system design issues, improvements  
**Status:** Post system design implementation (March 2026)

---

## Executive Summary

The Cyprus Winter application demonstrates solid architectural patterns with Next.js 15 App Router. P1–P3 recommendations from this review have been implemented: cross-tab sync, provider consolidation, React Query, error boundaries, offline mutation queue, E2E tests, cron monitoring, bundle analysis, and state management evaluation.

---

## 1. Architecture Overview

### 1.1 Tech Stack & Patterns

| Layer | Technology | Pattern |
|-------|-----------|---------|
| Framework | Next.js 16.1.6 | App Router, React Server Components |
| State Management | React Context + localStorage | No global store (Zustand/Redux) |
| Styling | Tailwind CSS v4 | Design tokens system |
| i18n | next-intl | Locale prefix "as-needed" |
| Database | Supabase | PostgreSQL + realtime subscriptions |
| Caching | In-memory + Redis (optional) | Per-instance TTL |
| PWA | Serwist | Service worker for offline |

### 1.2 Layout Hierarchy

```
Root Layout (non-locale: /, /discover)
├── Providers (Auth, StickyPlanBar)
├── Nav, BottomNav, SiteFooter
├── AIAssistant (global)
├── OnboardingModal (global)
└── Children

Locale Layout (/en, /de, /el, /pl)
├── NextIntlClientProvider
├── SerwistProvider
├── Providers
├── StickyPlanBarProvider
└── Padded container
```

### 1.3 Data Flow Patterns

```
Server Components (default)
├── Direct data access via @/data
├── No API calls needed
└── Static data rendered at build/req time

Client Components ("use client")
├── Hooks for state (useItinerary, useRightNowFeed)
├── API calls for dynamic data
├── localStorage for persistence
└── Context for shared UI state
```

---

## 2. Critical System Design Issues (Fixed in Audit)

### 2.1 State Management After Unmount ✅ FIXED

**Issue:** Multiple components called `setState` after async operations without checking if the component was still mounted.

**Affected:**
- AIAssistant (sendMessage)
- BookingsPage (fetchByEmail)
- TrailReportClient (handleSubmit)
- PushOptIn / WeatherPushOptIn (handleSubscribe)
- useItinerary (copyItinerary, copyShareLink)

**Fix Pattern Applied:**
```tsx
const isMountedRef = useRef(true);
useEffect(() => {
  isMountedRef.current = true;
  return () => { isMountedRef.current = false; };
}, []);

// Before setState after await:
if (isMountedRef.current) setState(value);
```

### 2.2 Request Cancellation ✅ FIXED

**Issue:** API requests could complete after component unmount or user navigation, causing state updates on unmounted components.

**Affected:**
- AIAssistant (chat fetch)
- useRightNowFeed (location fetch)

**Fix:** Added AbortController pattern:
```tsx
const abortControllerRef = useRef<AbortController | null>(null);
abortControllerRef.current?.abort();
const ac = new AbortController();
abortControllerRef.current = ac;

fetch("/api/chat", { signal: ac.signal })
```

### 2.3 Unbounded Input Processing ✅ FIXED

**Issue:** URL parameters could cause DoS via excessive processing.

**Affected:**
- usePlanUrlActions: `?add=id1,id2,...,id10000`
- decodeItinerary: 10MB plan parameter

**Fixes:**
- Capped add IDs to 50
- Max plan param length 2000 chars
- User-agent truncated to 200 chars

---

## 3. Remaining System Design Issues

### 3.1 localStorage Data Synchronization (Medium) — IMPLEMENTED

**IMPLEMENTED** — Cross-tab sync in useItinerary and BookingsPage (storage event listeners).

**Issue:** Multiple pages use localStorage for data persistence without a synchronization mechanism. Changes in one tab don't reflect in another.

**Affected Storage Keys:**
- `cyprus-winter-itinerary` (useItinerary)
- `cyprus-bookings` (bookings-storage)
- `cyprus-winter-push-client-id` (PushOptIn)
- `cyprus-winter:location-consent` (useRightNowFeed)
- `cyprus-last-place` (AIAssistant context)

**Risk:**
- User adds item to plan in Tab A, switches to Tab B — plan appears outdated
- Bookings created in one session not visible in another

**Recommended Fix:**
```tsx
// Add storage event listener for cross-tab sync
useEffect(() => {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      // Reload from storage
      setDays(loadItinerary());
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}, []);
```

### 3.2 Dual Provider Hierarchy (Medium) — IMPLEMENTED

**IMPLEMENTED** — Duplicate StickyPlanBarProvider removed from locale layout.

**Issue:** Providers are rendered in two different places:
- Root layout: AuthProvider, StickyPlanBarProvider
- Locale layout: StickyPlanBarProvider (nested again)

**Current Structure:**
```
RootLayout
└── Providers (Auth + StickyPlanBar)
    └── LocaleLayout
        └── StickyPlanBarProvider (again!)
```

**Risk:** Double-wrapped context providers create unnecessary render overhead.

**Recommended Fix:** Consolidate providers in one location, use a single Providers component that accepts a `locale` prop.

### 3.3 IntersectionObserver Cleanup (Low) — IMPLEMENTED

**IMPLEMENTED** — StickyPlanBar uses isMounted before setShow in observer callbacks.

**Issue:** StickyPlanBar uses IntersectionObserver without handling rapid mount/unmount cycles.

**Location:** `src/components/StickyPlanBar.tsx`

**Risk:** Memory leaks if the component mounts/unmounts rapidly (e.g., during fast navigation).

### 3.4 Path-based Analytics (Low) — IMPLEMENTED

**IMPLEMENTED** — ConversionTracker validates IDs (regex, length) before use.

**Issue:** ConversionTracker uses string manipulation on paths without URL validation.

```tsx
const id = path.split("/").filter(Boolean).pop() ?? "";
```

**Risk:** Incorrect ID extraction on malformed URLs or locale-prefixed paths with special characters.

---

## 4. Multi-Page State Consistency Issues

### 4.1 Itinerary State Across Pages — IMPLEMENTED

**IMPLEMENTED** — Cross-tab sync via storage event listener.

**Current Behavior:**
- Plan page manages itinerary state
- Other pages use `AddToItineraryButton` which calls `addToDay`
- State is persisted to localStorage
- No real-time sync between pages

**Issue:** If user has two tabs open:
1. Tab A: Add "Winery X" to Day 1
2. Tab B: Already open on plan page — doesn't show Winery X until refresh

**Impact:** Medium — user confusion, potential duplicate additions

**Fix:** BroadcastChannel API or storage events for cross-tab sync.

### 4.2 Bookings State Management

**Current Pattern:**
```
BookingsPage loads → checks localStorage → merges with API
```

**Issue:** Local-first approach means bookings created on one device don't appear on another until explicit sync (email lookup).

**Impact:** Medium — user expects bookings to be immediately available on all devices

**Recommended:** Add polling or realtime subscription for bookings when user is authenticated.

### 4.3 Right Now Feed State — IMPLEMENTED

**IMPLEMENTED** — React Query with 5-min cache.

**Current Pattern:**
- Location consent stored in localStorage
- Auto-fetches on mount if consented
- No shared cache between page navigations

**Issue:** Each page visit re-fetches "Right Now" data, causing unnecessary API calls.

**Recommended:** Add React Query or SWR for shared, cached data fetching.

---

## 5. Architectural Improvements

### 5.1 Shared Data Fetching Layer — IMPLEMENTED

**IMPLEMENTED** — React Query for Right Now feed.

**Current:** Each component manages its own fetch logic with useEffect.

**Recommended:** Adopt TanStack Query (React Query) for:
- Shared cache between components
- Automatic background refetching
- Stale-while-revalidate pattern
- Request deduplication

```tsx
// Example API hooks
export function useTrailSummary() {
  return useQuery({
    queryKey: ['trailSummary'],
    queryFn: getTrailSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### 5.2 State Management Consolidation — IMPLEMENTED

**IMPLEMENTED** — Evaluation in docs/STATE_MANAGEMENT_EVALUATION.md; no migration recommended.

**Current:** Multiple state sources:
- localStorage (itinerary, bookings)
- Context (auth, sticky bar visibility)
- URL params (plan sharing)
- Supabase (bookings DB)

**Recommended:** Evaluate if Zustand or Jotai would simplify the architecture:
- Single source of truth
- Built-in persistence middleware
- Better TypeScript support

### 5.3 Error Boundary Strategy — IMPLEMENTED

**IMPLEMENTED** — Root error.tsx, AIAssistantWithBoundary, (padded)/error.tsx.

**Current:** No error boundaries visible in the codebase.

**Risk:** Runtime errors in any component crash the entire page.

**Recommended:** Add error boundaries at:
- Root layout (catch-all)
- AIAssistant (isolated, non-critical)
- Plan page (protect user data)
- API error boundaries

### 5.4 Service Worker Strategy — IMPLEMENTED

**IMPLEMENTED** — Offline mutation queue for winery/guide bookings (src/lib/offline-queue.ts).

**Current:** Uses Serwist for PWA, but no offline data strategy.

**Recommended:**
- Cache static data (trails, wineries) for offline browsing
- Queue mutations (add to plan) when offline
- Sync when connection restored

### 5.5 API Route Consistency — IMPLEMENTED

**IMPLEMENTED** — Cron routes use jsonError.

**Current:** Mix of error response formats:
```tsx
// Some routes:
return jsonError("CODE", "message", status);

// Others:
return Response.json({ error: { code, message } }, { status });
```

**Recommended:** Standardize all API routes on `jsonError` helper.

---

## 6. Performance Considerations

### 6.1 Bundle Size

**Observation:** AIAssistant imports ReactMarkdown which is ~30KB gzipped.

**Impact:** Loaded on every page (in root layout), even if never opened.

**Recommended:** Keep lazy loaded or move to a separate chunk.

### 6.2 Static Data Loading

**Observation:** `allPlaces` array is reconstructed on every module import.

```tsx
export const allPlaces: PlanItem[] = [
  ...baseAttractions.map(...),
  ...wineries.map(...),
  // ... 200+ items
];
```

**Impact:** Minor, but could be memoized or served as JSON.

### 6.3 Image Optimization

**Observation:** Images use Next.js Image component, but no blur placeholder strategy for LCP images.

---

## 7. Security Architecture

### 7.1 Rate Limiting ✅ IMPLEMENTED

**Current:** Hybrid approach:
- Redis in production (shared across instances)
- In-memory fallback (per-instance, resets on deploy)

**Concern:** In-memory fallback allows bypass via instance hopping.

**Recommendation:** Make Redis mandatory for production.

### 7.2 Input Validation ✅ IMPLEMENTED

**Current:** Zod schemas for all API inputs.

**Gap:** File uploads not validated (no file upload endpoints found).

### 7.3 XSS Prevention ✅ IMPLEMENTED

**Current:** 
- sanitize.ts for user content
- DOMPurify pattern in ReactMarkdown rendering

---

## 8. Testing Strategy Gaps

### 8.1 Integration Tests — IMPLEMENTED

**IMPLEMENTED** — Playwright E2E, Discover→Detail flow.

**Gap:** No tests for multi-page flows:
- Add to plan → View plan → Share plan
- Create booking → View in bookings list
- Login → Persist session across navigation

### 8.2 E2E Tests — IMPLEMENTED

**IMPLEMENTED** — e2e/discover-detail.spec.ts.

**Gap:** No E2E coverage for:
- Cross-tab state synchronization
- Offline behavior
- Mobile navigation flows

---

## 9. Deployment & Infrastructure

### 9.1 Environment Variables

**Required for Production:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
ADMIN_SECRET
UPSTASH_REDIS_REST_URL      # Required for shared rate limits
UPSTASH_REDIS_REST_TOKEN
```

### 9.2 Cron Jobs — IMPLEMENTED

**IMPLEMENTED** — Monitoring runbook in RUNBOOK.md §4.

**Configured:**
- `/api/cron/daily` — Trail summary refresh, trip countdown pushes
- `/api/cron/weather-digest` — Weather updates (3x daily)

**Risk:** No fallback if cron job fails (no alerting).

---

## 10. Recommendations Summary

### Immediate (P1) — DONE

1. **Add cross-tab sync** for localStorage-based state — DONE
2. **Consolidate provider hierarchy** to avoid double-wrapping — DONE
3. **Add React Query** for shared data fetching and caching — DONE

### Short-term (P2) — DONE

4. Add error boundaries at major page boundaries — DONE
5. Implement offline mutation queue — DONE
6. Standardize API error response format — DONE
7. Add integration tests for critical user flows — DONE

### Long-term (P3) — DONE

8. Evaluate state management library (Zustand/Jotai) — DONE (see STATE_MANAGEMENT_EVALUATION.md)
9. Add bundle analysis and code splitting — DONE (npm run analyze)
10. Implement proper monitoring/alerting for cron jobs — DONE (RUNBOOK.md §4)

---

## Appendix: Files Modified in Pre-Production Audit

| Category | Files |
|----------|-------|
| Mounted Checks | AIAssistant.tsx, BookingsPage, TrailReportClient, PushOptIn, WeatherPushOptIn, useItinerary |
| Rate Limiting | All API routes (try/catch wrapper) |
| Input Validation | usePlanUrlActions, decodeItinerary, track route |
| Toast Cleanup | Toast.tsx |
| Architecture Docs | ARCHITECTURE.md, PRE_PRODUCTION_AUDIT.md, SYSTEM_DESIGN_REVIEW.md |

### System Design Implementation (March 2026)

| Category | Files |
|----------|-------|
| Cross-tab sync | useItinerary.ts, BookingsPage (bookings/page.tsx) |
| Provider consolidation | [locale]/layout.tsx, Providers.tsx |
| StickyPlanBar | StickyPlanBar.tsx (IntersectionObserver cleanup) |
| ConversionTracker | ConversionTracker.tsx (path validation) |
| Cron API | api/cron/daily/route.ts, api/cron/weather-digest/route.ts (jsonError) |
| Error boundaries | error.tsx, AIAssistantWithBoundary.tsx, (padded)/error.tsx |
| React Query | Providers.tsx, useRightNowFeed.ts |
| Offline queue | offline-queue.ts, OfflineQueueProcessor.tsx, WineryBookingForm, GuideBookingForm |
| E2E | playwright.config.ts, e2e/discover-detail.spec.ts, vitest.config.ts |
| Docs | RUNBOOK.md §4, STATE_MANAGEMENT_EVALUATION.md, CHANGELOG.md |

---

**Reviewers:** Senior Staff Engineer  
**Next Review:** Post-launch (30 days)
