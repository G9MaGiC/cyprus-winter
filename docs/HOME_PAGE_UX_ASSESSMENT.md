# Home Page UX Assessment — Cyprus Winter

**Date:** March 9, 2026  
**Scope:** `src/app/_home/` (HomePageContent and all sections)  
**References:** SKILL.md, UX_PERSONA.md, CMO_REVIEW_2026-03-04.md

---

## Executive Summary

The home page aligns well with the “Cyprus secret” lens: premium, discovery-first, Mediterranean warmth. The CMO review marked it as ready. This assessment identifies what works, what’s problematic, and where to refine the experience for clarity and conversion.

---

## 1. What Works Well (Good)

### Alignment with UX_PERSONA.md
- **Calm confidence:** Hero uses terracotta/golden CTAs; no loud or pushy language.
- **Discovery-first:** “Explore,” “Pair with,” “Find a place or trail,” “Curious what we’d choose?” — suggestive, not sales-heavy.
- **Mediterranean warmth:** Sand/cream backgrounds, sage accents, Fraunces + Plus Jakarta Sans; `HomeWhyCyprusTeaser` quote (“Nobody hurries”) reflects the tone.
- **Generous space:** Typography and whitespace carry the layout; not cramped.

### Conversion Funnel
- **Primary path:** Hero → Explore / Plan your trip → Ask your guide; clear entry points.
- **Multiple CTAs:** Discover, Plan, Book tastings, Trail conditions, Just arrived — structured and consistent.
- **Plan integration:** Place of Day, Editor’s picks, Book tastings all offer “Add to plan”; StickyPlanBar appears via `plan-sentinel` for continuity.

### Clarity & Structure
- **Section roles:**
  - Hero: Value prop + main actions
  - Weather/Trails strips: Quick, actionable info
  - Search: Entry for uncertain users
  - Start Here: Primary path cards (Discover/Plan/Book) + category chips
  - Right Now: Location-based suggestions
  - Place of Day: Daily highlight with Add to plan
  - This Week: Weather, trails, events
  - Editor’s picks / Book tastings: Curation and conversion
  - Planning + Footer: Templates, Why Cyprus, Insider tip
- **Semantic HTML:** `aria-labelledby`, section headings, visible/sr-only `h2` where needed.

### Mediterranean Premium Feel
- **Design tokens:** Terracotta, aegean, sage, golden used consistently; `CARD.base`, `CARD.featured`, `CARD.hover` for structure.
- **Imagery:** Cyprus-specific (Kourion theatre, trail/place images); winter-appropriate content.
- **Voice:** “Sixteen degrees when home is six,” “Nobody hurries,” “The stove is lit” — distinctive, local tone.

### Technical & Accessibility
- **Touch targets:** 44px minimum (CTA.primaryCompact, SearchBar, chips, buttons).
- **Focus states:** `focus-visible:ring-terracotta` used across interactive elements.
- **SearchBar:** Combobox/listbox pattern, keyboard nav, `aria-autocomplete`, `role="option"`.
- **Reduced motion:** `prefers-reduced-motion: reduce` supported in globals.css.
- **Loading states:** Suspense + skeletons for EditorsPicks, BookTastings, ThisWeekGrid, WeatherStrip.

---

## 2. What’s Problematic (Bad)

### Friction & Clutter
- **StartHereWithExplore is long:** Four chip groups (Browse by category, Plan by region, Culture/coasts/monasteries, Explore by mood) + three primary cards. Risk of cognitive overload, especially on mobile.
- **Redundant category entry points:** Villages and Trails appear in both “Browse by category” and “Explore by mood.” “Trail conditions” and “Trails” both link to `/trails`. Villages appear twice.
- **“Curious what we’d choose?”:** Standalone paragraph between This Week and Editor’s picks adds little; feels like filler.

### Inconsistency
- **Plan CTA placement:** Plan appears in Hero, Start Here, HomePlanningSection, and StickyPlanBar; “Plan your trip” vs “Build a day” vs “Plan” — label variation is acceptable but could be tightened for consistency.
- **Weather strip vs This Week weather:** Both show coast/Troodos temps; WeatherStrip links to `/weather`, ThisWeekGrid weather card also links to `/weather`. Slight duplication; user may not need both.
- **HomePlanningSection:** Two equal cards (Plan + Winter events) both with `border-l-terracotta`. Events could use aegean or sage to reduce visual repetition.

### Accessibility Gaps
- **SearchBar results container:** `role="listbox"` with `aria-labelledby="search-input"` — standard pattern. Options use `tabIndex={-1}` on Link, so keyboard users rely on Enter from combobox; no explicit `aria-activedescendant` for active option.
- **RecentlyViewedStrip Clear button:** `aria-label` missing; only “Clear” text. Add `aria-label="Clear recently viewed"` for clarity.
- **WhyCyprusDetails `<details>`:** `summary` uses `cursor-pointer` but no `aria-expanded`; `<details>` handles it implicitly, but worth verifying screen reader behavior.
- **Right Now “Closer / Farther” toggle:** `role="group"` and `aria-label="Distance"` present; buttons need `aria-pressed` for state.

### Mobile Issues
- **StartHere chip scroll:** `overflow-x-auto` on mobile with gradient fade on right; `snap-x snap-mandatory` helps, but gradient may obscure that more content exists — consider a subtle scroll hint.
- **Right Now:** Consent/region states are fine; grid collapses to 1 column; touch targets OK.
- **Place of Day:** Horizontal card on mobile (`flex-col sm:flex-row`); image aspect and CTA grouping may feel tight on 375px.
- **Editor’s picks / Book tastings:** 2- and 3-column grids collapse to 1; cards may feel tall on small screens.

### Potential Dead Ends
- **Right Now “empty” state:** “No suggestions for this region right now” + “See more in Discover” — adequate, but could add “Try Ask AI” for alternate path.
- **Regions:** StartHere links to `/regions/[slug]`; route exists. No problem.

---

## 3. What’s Extra or Unnecessary

### Redundant / Low-Value Content
- **“Curious what we’d choose?”** (`HomePageContent.tsx` line 73–75): Bridge text before Editor’s picks. UX_PERSONA prefers brevity; this adds little. Consider removing or folding into the Editor’s picks subtitle.
- **WeatherStrip + This Week weather:** Both show coast/Troodos; WeatherStrip is a quick strip, This Week is a card grid. For users who scroll, duplication is minor but present. Could simplify by making WeatherStrip more minimal (e.g., temp + prompt only) and letting This Week carry the fuller weather card.

### Duplicated CTAs
- **Discover:** Hero “Explore”, Start Here “Discover” card, Search empty “Browse Discover”, Right Now “See more →”, mood chips. Multiple entry points are intentional, but the funnel could be simplified: Hero and Start Here are enough; Search/Right Now secondary links are fine.
- **Plan:** Hero “Plan your trip”, Start Here “Build a day”, StickyPlanBar, HomePlanningSection “Plan your trip”. Core funnel clarity is good; no strong need to remove any.

### Cognitive Overload Risks
- **Start Here chip density:** Four chip groups create many choices. Consider collapsing “Plan by region” and “Culture, coasts, monasteries” into one “Also explore” group, or making region chips secondary (smaller, below primary chips).
- **Mood vs category:** “Villages” and “Trails” in both Browse and Mood; “Wine” vs “Wineries.” Slight overlap; could merge or reduce redundancy.

---

## 4. Actionable Improvements

### P0 — Blockers (None)
No P0 issues; home is usable and on-brand.

### P1 — Should Fix

| # | Change | File | Detail |
|---|--------|------|--------|
| 1 | Add `aria-pressed` to Right Now distance toggle | `RightNowNearYou.tsx` | Add `aria-pressed={value === "less"}` and `aria-pressed={value === "more"}` to the two buttons for screen readers. |
| 2 | Add `aria-label` to Recently Viewed Clear button | `RecentlyViewed.tsx` | Add `aria-label="Clear recently viewed"` to the Clear button. |
| 3 | Remove or merge “Curious what we’d choose?” | `HomePageContent.tsx` | Remove the standalone `<p>` (lines 73–75) or fold into Editor’s picks subtitle: e.g. “Curious what we’d choose? Our favorites.” |

### P2 — Nice-to-Have

| # | Change | File | Detail |
|---|--------|------|--------|
| 4 | Consolidate Start Here chip groups | `StartHereWithExplore.tsx` | Merge “Plan by region” and “Culture, coasts, monasteries” into one “Explore more” section, or move region chips to tertiary style. |
| 5 | Deduplicate chip labels | `StartHereWithExplore.tsx` | Remove “Trail conditions” from category chips (keep “Trails”); remove duplicate “Villages” from mood if it’s in category. |
| 6 | Differentiate HomePlanningSection cards | `HomePlanningSection.tsx` | Use `border-l-aegean` for Winter events card to create hierarchy and reduce visual repetition. |
| 7 | Right Now empty state: add AI path | `RightNowNearYou.tsx` | In empty state, add “Or ask the AI for suggestions” link to AIAssistantTrigger. |
| 8 | Improve SearchBar keyboard UX | `SearchBar.tsx` | Add `aria-activedescendant` on the combobox pointing to the active option’s id for better screen reader support. |
| 9 | Place of Day mobile spacing | `HomePlaceOfDay.tsx` | On mobile, add `gap-2` between Add to plan and See details to ensure comfortable tap targets. |

### P3 — Future Polish

| # | Change | Detail |
|---|--------|--------|
| 10 | Consider collapsing WeatherStrip on scroll | Make WeatherStrip minimal (temp + prompt) and rely on This Week for fuller weather; or add “collapse on scroll” behavior. |
| 11 | A/B test Start Here chip count | Test 2 chip groups vs 4 to measure engagement and cognitive load. |
| 12 | Add skip link for long home | For keyboard users, add “Skip to Editor’s picks” or “Skip to Plan” for faster navigation. |

---

## 5. Section-by-Section Role Summary

| Section | Role | Status |
|---------|------|--------|
| HomeHero | Value prop, primary CTAs, AI trigger | Strong; on-brand |
| HomeWeatherStrip | Quick weather + prompt | Good; slight overlap with This Week |
| TripReminderBanner | Contextual for trip dates | Good; conditional |
| HomeSearchSection | Entry for uncertain users | Good |
| HomeWhyCyprusTeaser | Emotional payoff, tone | Strong |
| HomeTrailConditionsStrip | Trail status, action | Good |
| StartHereWithExplore | Primary path + browse | Dense; see P1/P2 |
| RightNowNearYou | Location/region suggestions | Good; accessibility tweaks |
| RecentlyViewedStrip | Browsing history | Good; aria fix |
| HomePlaceOfDay | Daily highlight + Add to plan | Strong |
| This Week | Weather, trails, events | Good |
| Editor’s picks | Curation + Add to plan | Strong |
| Book tastings | Conversion | Strong |
| HomePlanningSection | Plan + events | Good; visual tweak |
| HomeFooter | Why Cyprus, Insider tip, templates | Strong |
| HomeShareSection | Share + Back to top | Good |

---

## 6. Conclusion

The home page matches the Cyprus Winter UX persona: premium, discovery-led, Mediterranean warmth. Primary issues are:

1. **Accessibility:** Minor ARIA improvements (Right Now toggle, Recently Viewed Clear, SearchBar).
2. **Clarity:** Remove “Curious what we’d choose?” or merge into Editor’s picks.
3. **Redundancy:** Start Here chip groups and duplicated chips.
4. **Visual hierarchy:** Differentiate Plan vs Events in HomePlanningSection.

Prioritize P1 fixes; P2 and P3 can be rolled in over time.
