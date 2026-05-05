**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Home Page Redesign Spec

**Created:** March 2026  
**Source:** Parallel TEAM-AGENTS audit (branding-redesign, ux-polish, content-polish, senior-software-engineer)

---

## 1. Section Order (Final)

Resolved using UX_PERSONA: discovery-first, calm confidence. Prioritize Search and StartHere above the fold.

| # | Section | Notes |
|---|---------|-------|
| 1 | HomeHero | Unchanged |
| 2 | HomeWeatherStrip | Keep compact (STRIP.py or pyCompact) |
| 3 | TripReminderBanner | Only if user has trip data |
| 4 | Search | **Moved up** — "Where to today?" first action |
| 5 | HomeTrailConditionsStrip | After Search; search is main entry |
| 6 | StartHereStrip | **Moved up** — Discover / Plan / Book right after Search |
| 7 | RightNowNearYou | Location-based, secondary |
| 8 | RecentlyViewedStrip | Support for Plan CTA |
| 9 | HomeMoodStrip | Discovery by mood |
| 10 | Explore (CategoryChips) | Discovery hub |
| 11 | HomePlaceOfDay | **Moved up** — after Explore, before ThisWeek |
| 12 | ThisWeek | Unchanged |
| 13 | EditorsPicks | Unchanged |
| 14 | BookTastings | Unchanged |
| 15 | Plan + Events cards | Unchanged |
| 16 | HomeInsiderTip | Unchanged |
| 17 | WhyCyprusDetails | Keep collapsible (details/summary) |
| 18 | Share | Unchanged |

---

## 2. Above-the-Fold Priorities

Target first 1–1.5 viewports on mobile:

- Hero (primary message + Discover CTA)
- WeatherStrip
- TripReminderBanner (if applicable)
- TrailConditionsStrip
- Search
- StartHereStrip (peek above fold if possible)

---

## 3. Why Cyprus

- **Keep as collapsible.** Already uses `<details>`/`<summary>` in WhyCyprusDetails.tsx.
- No changes needed. Fits understated, discovery-first tone.

---

## 4. Component-Level Changes

| Change | File | Priority |
|--------|------|----------|
| Reorder sections per §1 | `src/app/page.tsx` | P0 |
| Add aria-labelledby to RecentlyViewedStrip | `src/components/RecentlyViewed.tsx` | P1 |
| Add SECTION.alt to StartHereStrip | `src/app/_home/StartHereStrip.tsx` | P2 |
| RightNowNearYou: terracotta CTA for "Use location" | `src/app/_home/RightNowNearYou.tsx` | P2 |
| Align section padding with SECTION tokens | `src/app/page.tsx` | P2 |
| Remove or document HomeRightNowStrip | `src/app/_home/HomeRightNowStrip.tsx` | P2 |

---

## 5. Accessibility

- RecentlyViewedStrip: add `id="recently-viewed-heading"` to h2, `aria-labelledby="recently-viewed-heading"` on section.
- All other sections: aria-labelledby already correct.

---

## 6. Cleanup

- `HomeRightNowStrip.tsx` — unused. Remove or deprecate. Page uses `RightNowNearYou`.
