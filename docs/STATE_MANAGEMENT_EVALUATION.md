# State Management Evaluation — Zustand vs Jotai

**Date:** March 2026  
**Context:** SYSTEM_DESIGN_REVIEW.md §5.2 — evaluate Zustand/Jotai for state consolidation  
**Status:** Evaluation complete; no immediate migration recommended.

---

## 1. Current State (Post System Design Improvements)

| Source | Purpose | Persistence |
|--------|---------|-------------|
| **AuthContext** | User, session, sign-in/out | Supabase |
| **StickyPlanBarContext** | Sticky bar visibility | None |
| **useItinerary** | Plan days, add/remove, templates | localStorage |
| **useRightNowFeed** | Right Now suggestions | React Query cache (5 min) |
| **useUserPreferences** | Favorite regions, etc. | localStorage |
| **Bookings** | Local booking list | localStorage + Supabase |
| **Offline queue** | Pending API mutations | localStorage |
| **URL params** | Plan sharing (`?plan=`, `?add=`) | — |

---

## 2. Zustand

**Pros:**
- Minimal boilerplate; no provider nesting
- Built-in `persist` middleware for localStorage
- Good TypeScript, small bundle (~1KB)
- Fits itinerary, bookings, user prefs

**Cons:**
- Would need to wrap Supabase auth (AuthContext already handles this)
- Migration of `useItinerary` is non-trivial (cross-tab sync, URL sync)

**Migration effort:** Medium–High (itinerary, bookings, prefs)

---

## 3. Jotai

**Pros:**
- Atomic model; fine-grained subscriptions
- Integrates well with React Suspense and async
- Small bundle; flexible composition

**Cons:**
- More conceptual overhead than Zustand for our use cases
- Persistence requires `jotai/query` or custom solution
- Itinerary/bookings are not naturally atomic

**Migration effort:** Medium–High

---

## 4. Recommendation

**No migration in the near term.** Rationale:

1. **Recent improvements:** Cross-tab sync, React Query for Right Now, offline queue, and provider consolidation already address the main pain points.
2. **Limited benefit:** We have two lightweight contexts (Auth, StickyPlanBar) and a few localStorage-backed hooks. Zustand/Jotai would not meaningfully simplify this.
3. **Migration cost:** `useItinerary` has URL sync, cross-tab sync, and templates. Rewriting it in Zustand would be risky for limited payoff.
4. **Stability:** The current setup is stable and well-understood. A migration before launch adds risk.

**Revisit when:**
- Adding server-side plan sync (cloud itinerary)
- Auth or plan logic becomes more complex
- New features need shared state across many components

---

## 5. If Migrating Later: Zustand Preference

If we migrate, **Zustand** is the better fit:

- Direct match for localStorage-backed state (itinerary, bookings)
- `persist` middleware reduces custom sync code
- Simpler API for our non-atomic state

**Example (conceptual):**
```ts
// stores/itinerary.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useItineraryStore = create(
  persist(
    (set) => ({
      days: [],
      addToDay: (dayIndex, place) => set(...),
      removeFromDay: (dayIndex, placeId) => set(...),
    }),
    { name: 'cyprus-winter-itinerary' }
  )
);
```

---

**Reviewers:** Engineering  
**Next review:** Post-launch (30–90 days) or when adding plan cloud sync.
