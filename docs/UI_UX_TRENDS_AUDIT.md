# Cyprus Winter — UI/UX Trends Audit

**Date:** March 5, 2026  
**Reference:** Travel app UI/UX trends — immersive visuals, navigation, personalization, seasonal discovery, events, weather/safety, itinerary planning

---

## Executive Summary

Cyprus Winter aligns well with core travel-app trends: strong Mediterranean visuals, clear nav, AI personalization, and seasonal focus. The main gaps are search, bottom-nav on mobile, events as a calendar, and richer weather/safety integration per location. Below, each trend is scored and prioritized recommendations are given.

---

## 1. Immersive Visual Storytelling

| Aspect | Current State | Score | Notes |
|--------|---------------|-------|-------|
| Destination photos | Hero images, attraction cards, detail pages | Strong | Cyprus images in `public/images/cyprus/`, hero on home, AttractionCard |
| Videos | None | Gap | No video content |
| Weather highlights | Static coast/Troodos boxes on home | Partial | Not live; hardcoded 18°C / 10°C |
| Seasonal content | Winter-focused copy, events | Strong | “Escape the cold”, winter events, trail conditions |

**Recommendations**
- [ ] Add short destination videos or looping clips for hero or key places (high effort)
- [ ] Replace static weather with live data (e.g. Open-Meteo) for coast + Troodos (medium effort)
- [ ] Add subtle ambient motion (e.g. parallax or very light animation) on hero or key detail pages (low effort)

---

## 2. Clear Navigation & Search

| Aspect | Current State | Score | Notes |
|--------|---------------|-------|-------|
| Top nav | Fixed top bar, hamburger on mobile | Partial | Desktop links, mobile expandable |
| Bottom nav | None | Gap | Travel apps often use bottom bar for thumb reach on mobile |
| Icons | Text labels only; no nav icons | Partial | Could add icons for Discover, Trails, Events, etc. |
| Contextual search | None | Gap | No text search for places, trails, events |
| Filter chips | Yes | Strong | Discover (beach, ancient, village, etc.), Trails (difficulty, region) |

**Recommendations**
- [ ] Add bottom navigation on mobile for primary flows: Discover, Trails, Plan, Events (high impact)
- [ ] Add a global search bar: “Search places, trails, events” with client-side or API search (high impact)
- [ ] Add nav icons next to labels for quicker scanning (low effort)

---

## 3. Personalization & Smart Suggestions

| Aspect | Current State | Score | Notes |
|--------|---------------|-------|-------|
| AI recommendations | Ask AI assistant, voice + text | Strong | AIAssistant, AIAssistantTrigger on home |
| Data-driven suggestions | “Related places”, “Pair with” | Strong | RelatedPlacesBlock, combineWith |
| PlacePicker in plan | Tabbed wineries / trails / attractions | Strong | useItinerary, PlacePicker |
| Preference-based | PlacePicker only; no saved prefs | Partial | No explicit preferences or “favourites” |
| “Best winter hikes” style suggestions | Home “Four places we love”, Explore by mood | Strong | Curated picks, mood chips |

**Recommendations**
- [ ] Add “Favourites” or “Save for later” so the AI can suggest from saved items (medium effort)
- [ ] Surface “weather-friendly” or “good today” suggestions when weather is live (future)

---

## 4. Seasonal Destination Discovery

| Aspect | Current State | Score | Notes |
|--------|---------------|-------|-------|
| Winter framing | Copy, imagery, trail conditions | Strong | “Cyprus Winter”, winter events, trail status |
| Mountain/snow context | Troodos trails, summit weather | Strong | Artemis, Troodos cards |
| “Snow parks” / ski | N/A for Cyprus | N/A | Not relevant |
| Filters by type | Beaches, ancient, village, winery, monastery | Strong | FilterChips on Discover |
| Explore by mood | Active, Nature, Culture, etc. | Strong | Mood chips on home |

**Recommendations**
- [ ] Add a “Winter conditions” or “Best now” badge on trails/places (low effort)
- [ ] Optional “Weekend picks” or “This week” carousel when more data exists (low priority)

---

## 5. Local Events & Festivals Calendar

| Aspect | Current State | Score | Notes |
|--------|---------------|-------|-------|
| Events page | `/events` with Epiphany, carnival, etc. | Strong | winterEvents, TYPE_LABELS |
| Layout | Grouped by month (Nov–Mar) | Partial | List, not calendar view |
| Visual calendar | None | Gap | No date picker or calendar grid |
| Event → place links | None | Partial | Could link events to venues/regions |
| Event → plan | None | Gap | Can’t add events to itinerary |

**Recommendations**
- [ ] Add calendar view or “by date” toggle for events (medium effort)
- [ ] Link events to Discover/region pages (low effort)
- [ ] Add “Add to plan” for events and show them in itinerary (medium effort)

---

## 6. Weather & Safety per Location

| Aspect | Current State | Score | Notes |
|--------|---------------|-------|-------|
| Home weather | Static coast + Troodos boxes | Partial | Not location-specific |
| Trail conditions | Temperature, wind, surface on trails | Strong | trailConditions in trails list and detail |
| Per-location weather | None for attractions | Gap | No weather on Discover detail |
| Safety | Emergency 112, 1460, 199 in footer | Strong | Footer + hero |
| Driving / road safety | None | Gap | Not covered |
| Pack layers / “check conditions” | Copy in tips and trails | Partial | Text only |

**Recommendations**
- [ ] Add “Conditions” or “Today’s weather” block on trail and key attraction detail pages (medium effort)
- [ ] Add a short “Safety & tips” section on trail detail (e.g. phone, what to bring) (low effort)
- [ ] Optional: road/snow status for Troodos (future, if data available)

---

## 7. Itinerary Planning with Options

| Aspect | Current State | Score | Notes |
|--------|---------------|-------|-------|
| Multi-day plan | Day 1, 2, 3 tabs | Strong | Plan page, useItinerary |
| Add trails | PlacePicker trails tab | Strong | Trails + attractions + wineries |
| Add attractions | PlacePicker attractions tab | Strong | Same |
| Templates | “Weekend”, “Cultural”, etc. | Strong | applyTemplate |
| Copy / share | copyItinerary | Strong | Copy to clipboard |
| Ski/hike mix | Trails + villages + wineries | Strong | Cross-category planning |

**Recommendations**
- [ ] Add “Suggested day” or “Morning / afternoon” hints (e.g. trail AM, village PM) (low effort)
- [ ] Show “Best order” or “Recommended route” when multiple places in same region (future)

---

## Priority Matrix

| Priority | Change | Effort | Impact |
|----------|--------|--------|--------|
| P1 | Add bottom navigation on mobile | Medium | High |
| P1 | Add global search (places, trails, events) | Medium | High |
| P2 | Add live weather (coast + Troodos) on home and detail | Medium | Medium |
| P2 | Add calendar view or date filter for events | Medium | Medium |
| P2 | Add “Add to plan” for events | Medium | Medium |
| P3 | Add nav icons to top nav | Low | Low |
| P3 | Add “Best now” / “Good today” badges | Low | Low |
| P3 | Add safety/tips block on trail detail | Low | Low |
| P4 | Add video to hero or key pages | High | Medium |
| P4 | Add “Favourites” and preference-based suggestions | Medium | Medium |

---

## Quick Wins (Same Sprint)

1. Add nav icons to the top nav for Discover, Trails, Events, Plan.
2. Add a short “Safety & tips” block on trail detail (emergency numbers, what to bring).
3. Add links from events to their regions or nearest places on Discover.
4. Add “Today’s conditions” label on home weather boxes (e.g. “Typical winter” until live data).

---

## Next Steps

- **P1:** Decide whether to ship bottom nav and search in the next release.
- **P2:** Design events calendar and event → plan flow.
- **P3:** Choose weather provider and define UX for “live” weather on home and detail pages.
