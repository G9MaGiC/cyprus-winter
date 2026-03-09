# Changelog

All notable changes to Cyprus Winter are documented here.

## [2.0.1] - March 2026

### Project improvement list (batches 1–5)

- **.env.example** — Added with all required/optional vars; STRESS_TEST_TOKEN note. `.gitignore` allows `!.env.example`
- **CI** — Added explicit Build step before E2E
- **API** — right-now rate-limit catch uses `jsonError` for consistency
- **USER_FLOWS_AZ** — Bottom nav and Nav link tables aligned with `nav-links.ts`
- **Trail page** — Duration format `~1h 10m`; jump links (Overview, Conditions, Map, Waypoints, Pair with); Navigate to trailhead link in hero; `topSights` and `locationText` on Trail type; SectionCard supports `id`
- **Trail data** — `locationText` and `topSights` for Artemis, Caledonia Falls; winter SEO phrasing in first 80 chars for Artemis, Caledonia, Atalante, Adonis
- **Security headers** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy in `next.config.ts`

---

## [2.0.0] - March 2026

### Phase 1 completion

Release marking pre-launch polish and Phase 1 MVP completion per [ROADMAP.md](ROADMAP.md).

### Discover page refactor

- **Centralized data:** `src/data/discover.ts` exports `allDiscoverItems` and `allDiscoverIds` (replaces 3 duplicates)
- **Section config:** `src/lib/discover-sections.ts` — `buildDiscoverSections`, `filterToSectionId`, predicates
- **Schema:** `src/lib/discover-schema.ts` — `buildDiscoverItemListSchema` for JSON-LD
- **Place of day:** `src/lib/discover-place-of-day.ts` — `getDiscoverPlaceOfDayPicks` with fallback/overlay logic
- **DiscoverClient split:** `DiscoverFilterBar`, `DiscoverSectionList`, `DiscoverFooter` subcomponents

### Home page refactor

- **Skeletons:** `src/app/_home/skeletons.tsx` — EditorsPicksSkeleton, BookTastingsSkeleton, WeatherStripSkeleton, ThisWeekSkeleton
- **Section components:** HomeSearchSection, HomePlanningSection, HomeFooter, HomeShareSection
- **Shared layout:** `HomePageContent` — single source for root `/` and locale `/[locale]` pages; props for sharePath, LinkComponent, planSubtitle
- **Thin wrappers:** `page.tsx` and `[locale]/page.tsx` reduced to ~5–20 lines each; removes ~400 lines of duplication

### Trails page refactor

- **Filter logic:** `src/hooks/useTrailsFilter.ts` — URL parsing, validation, filtering, counts, `bestNow`, status groups
- **URL util:** `src/lib/trail-url.ts` — `buildTrailHref` for filter query strings
- **Schema:** `src/lib/trails-schema.ts` — `getTrailsItemListSchema` for JSON-LD
- **Section components:** `TrailStatusGroup`, `BestConditionsNow`, `TrailsFilterBar`, `TrailsEmptyState`, `TrailsTipsSection`
- **TrailsClient:** Reduced from ~335 to ~155 lines; composes sections and `useTrailsFilter`
- **TrailFilters:** Uses `buildTrailHref` from shared lib

### Summary

- **Version bump:** 0.1.0 → 2.0.0
- **System design (post-audit):** Cross-tab sync for itinerary (`useItinerary`) and bookings; provider consolidation (removed duplicate `StickyPlanBarProvider`); error boundaries at root, AIAssistant wrapper, and `(padded)` segment; StickyPlanBar `IntersectionObserver` cleanup; ConversionTracker path ID validation; cron API error format (`jsonError`); React Query for Right Now feed (shared 5-min cache, fewer refetches across navigation); bundle analysis script (`npm run analyze`); Playwright E2E tests for Discover→Detail flow (`npm run test:e2e`, `npm run test:e2e:ci`); offline mutation queue for winery/guide bookings (queues failed network requests, retries on reconnect); state management evaluation doc (Zustand/Jotai — no migration recommended near-term); cron monitoring runbook (RUNBOOK.md §4). See [SYSTEM_DESIGN_REVIEW.md](SYSTEM_DESIGN_REVIEW.md).
- **Homepage conversion polish:** Eyebrow ("The Mediterranean's best-kept secret"), ghost CTA ("Just arrived?"), sticky Plan CTA, Add to plan on Editor's picks and This week cards, section rhythm (Explore → This week → Editor's picks → Book tastings → Plan/Events → Why Cyprus)
- **Design tokens:** CTA objects in `design-tokens.ts`, hero overlay simplified (`from-charcoal via-charcoal/50 to-charcoal/5`), LAYOUT, SECTION, CARD, HERO
- **Rate limiting:** Weather API (30/min), VAPID API (10/min) — both routes protected
- **Data fix:** Orphan combineWith ID `pissouri` corrected to `pissouri-tavernas` in trails data

### References

- [docs/HOMEPAGE_REVIEW_RECOMMENDATIONS.md](HOMEPAGE_REVIEW_RECOMMENDATIONS.md)
- [docs/QA_BUGS.md](QA_BUGS.md)
- [docs/QA_PLAN.md](QA_PLAN.md)
