## Golden Flows Audit (GF1–GF6)

**Baseline gates:** `npm run lint`, `npm test -- --run`, `npm run build` — ✅ pass.

### GF1 — Home → Discover → detail → Add to plan → Plan reflects item
- **Locale route check (de):** `/de/discover/<id>` → “Add to plan →” → `/de/plan` ✅ locale preserved.

### GF2 — Add 3–5 items across days → reorder/remove → share plan
- **Remove / share tracking wired** in plan state (see `src/hooks/useItinerary.ts`) ✅

### GF3 — Plan → booking start → confirmation → Bookings
- **Not browser-verified in this pass** (requires form submission). Code path exists via `/book/*` and `/bookings`.

### GF4 — Search → detail → back to results (preserve query + locale)
- **Locale-safe URL sync**: SearchBar uses `@/i18n/navigation` router ✅
- **Defensive guard** added to prevent accidental `q=undefined` cases ✅

### GF5 — Start on `/de/*` `/el/*` `/pl/*` → navigate → never drop locale
- **P0 fixes applied:** locale-aware router usage for plan URL actions, SearchBar routing, and SmartBackLink.

### GF6 — Empty/invalid states → clear next step
- **Plan page** provides “Adding to your plan…” and failed add alert ✅
- *Correction (Aug 2026 audit, AUD-03):* the failed-add alert later regressed silently — `plan-url-params` patched the URL via raw `history.replaceState`, which never re-renders `useSearchParams`, so `/plan?add=<bad-id>` showed nothing until a manual reload. Fixed by signalling the failure through React state in `usePlanUrlActions`; see `docs/UX_UI_PERSONA_AUDIT_2026-08-31.md` (AUD-03).

## Fixed P0 issues (this pass)
- **SmartBackLink locale drop**: switched to `AppLink` so internal “back” links preserve locale.
  - File: `src/components/SmartBackLink.tsx`
- **SearchBar robustness**: coerces `query` to string so URL sync cannot produce `q=undefined`.
  - File: `src/components/SearchBar.tsx`
