**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# CPO-Style Product Review — Cyprus Winter Main Pages

**Date:** March 2026  
**Reviewers:** UX Polish + Content Polish (Lena Müller, content lens)  
**Context:** PRD personas (Cultural Explorer Claire, Active Adventurer Anders); design system in `.cursor/skills/cyprus-tourism-app/SKILL.md`; MESSAGING.md for tone.

---

## Summary by Priority

| Priority | Count | Themes |
|----------|-------|--------|
| **P0** | 8 | Search dead-end, Discover→Plan gap, Itinerary→Book gap, Winery booking discoverability, Weather month events not clickable |
| **P1** | 14 | Messaging consistency, CTAs, persona-specific value props |
| **P2** | 12 | Polish, empty-state copy, secondary flows |

---

## Findings by Page

---

### 1. Home — `src/app/page.tsx`

**Product value**
- Value prop is clear: "Cyprus Winter" + "Trails, villages, wine, events." Serves both Claire (culture, villages, wine) and Anders (trails).
- Weather-first "Right now" is PRD-aligned. Artemis status (Open · Dry) helps Anders.
- **P1:** Missing "escape the cold" / temperature contrast (PRD: "16°C when home is 6°C"). Hero subhead could lean into this.

**Conversion path**
- Primary CTA: Discover. Secondary: Trails, Plan trip, Just landed.
- Explore chips drive Discover (filtered) and Events; no direct "Book" entry point.
- **P1:** No direct route to winery booking. Claire’s high-value path (book tastings) starts only from Discover→winery detail.
- **P2:** "Your itinerary" / "Continue planning" placeholder from PRD home mockup not present—could surface if itinerary has content.

**Friction**
- Minimal. Clear hierarchy, accessible CTAs.
- **P2:** "Why Cyprus in winter" is collapsible; some users may miss it. Consider promoting it more for first-time visitors.

**Messaging**
- Tone matches MESSAGING.md: understated, Mediterranean. "Trails, villages, wine, events" is on-brand.
- **P1:** Hero could add MESSAGING line: "Sixteen degrees when home is six" for stronger contrast.

| Priority | Finding | Action |
|----------|---------|--------|
| P1 | No "escape the cold" temp contrast | Add PRD line to hero or "Right now" copy |
| P1 | No direct path to winery booking | Consider "Wineries" chip or featured winery card |
| P2 | "Why Cyprus" buried | A/B test making it expanded by default |

---

### 2. Discover — `src/app/discover/page.tsx`, `DiscoverClient.tsx`

**Product value**
- "Beaches, ruins, villages, wineries, monasteries" clearly scoped. Claire and Anders both served.
- "Your guide, not a brochure" supports premium discovery tone.
- **P2:** No mood-based taxonomy (PRD: Active, Culture, Wine). Current taxonomy is type-based.

**Conversion path**
- Cards → detail. No inline Add to plan on cards; only on detail. Plan conversion happens only after click.
- **P0:** No CTA to Plan at list level. Users can leave Discover without ever seeing Plan.
- **P1:** Wineries highlighted in filter; no "Book a tasting" or "Browse wineries" CTA above the fold.

**Friction**
- Filter chips work; empty-section state is handled. "No places in this category yet" copy is helpful.
- **P2:** Footer: "Or ask the AI. It knows the island." — AI CTA is subtle; consider more prominent placement.

**Messaging**
- Consistent with MESSAGING. Empty state and footer copy are clear.
- **P1:** Add a top-level CTA: "Plan your trip" or "Add to itinerary" to bridge Discover→Plan.

| Priority | Finding | Action |
|----------|---------|--------|
| P0 | No Discover→Plan CTA | Add "Plan your trip" or "Add places to your itinerary" link/button above or below sections |
| P1 | No winery booking CTA at list level | Add "Book a tasting" link when filter=winery |
| P2 | Mood-based taxonomy missing | Future enhancement; type-based is acceptable for MVP |

---

### 3. Discover detail — `src/app/discover/[id]/page.tsx`

**Product value**
- Strong: description, highlights, practical info, local secrets. Claire and Anders well served.
- Buffer-zone note, winter tips, backstory add credibility.

**Conversion path**
- Add to plan (footer + StickyAddToPlanBar). Winery: "Book a tasting" CTA; villages: "Find stays" when `bookingUrl`.
- Related places and "combine with" support cross-discovery.
- **P1:** Non-winery attractions lack revenue CTAs (e.g. guided tours). Ancient sites could link to guides.

**Friction**
- Book & Contact section appears after Visit & taste; winery flow is clear.
- **P2:** Sticky bar can overlap footer on small screens; verify z-index and spacing.

**Messaging**
- Clear, Cyprus-winter tone. "Book ahead in winter" and "Winter tastings are cosy" align with MESSAGING.
- **P1:** CTA copy varies: "Book a tasting →", "Contact / book", "Book on website". Standardize primary vs secondary.

| Priority | Finding | Action |
|----------|---------|--------|
| P1 | Ancient sites lack booking CTAs | Add guided-tour links where partners exist |
| P1 | CTA label inconsistency | Align primary="Book tasting" vs secondary="Book on website" |
| P2 | Sticky bar overlap | Test on 375px viewport |

---

### 4. Trails — `src/app/trails/page.tsx`, `TrailsClient.tsx`

**Product value**
- "Check conditions before you go" directly addresses Anders’ #1 pain. Open/caution/closed stats are visible.
- "Best right now" and winter hiking tips add utility.
- Map supports spatial discovery.

**Conversion path**
- Cards → detail. "Plan your day → add trails to your itinerary" link in winter tips. Report conditions CTA.
- **P1:** No "Add to plan" on TrailCard. User must open detail first.
- **P0:** "Report conditions" is strong; links to first unknown trail or first filtered trail. Good.

**Friction**
- Empty filter state: "No trails match your filters" + "Clear filters" CTA. Good.
- Mobile collapsible filters work; ensure "Filters: All" is understandable.

**Messaging**
- "Open, dry, good conditions. Start here." — clear for Anders.
- "Just back from a trail?" + "Report conditions" — friendly, community tone.

| Priority | Finding | Action |
|----------|---------|--------|
| P1 | No Add to plan on TrailCard | Add quick "Add to plan" on card or in hover state (if not too cluttered) |
| P2 | Region filter: "Ayia Napa" — few trails | Ensure copy reflects regional reality; consider "Paphos" as default filter option |

---

### 5. Trail detail — `src/app/trails/[id]/page.tsx`

**Product value**
- Strong: conditions, safety, winter notes, waypoints, local secrets. Serves Anders and Claire.
- Trail report + latest conditions build trust.

**Conversion path**
- Add to plan (footer + TrailDetailStickyActions). "View all trails", Related places.
- **P0:** No "Book a guide" CTA. PRD: "Conditions tricky—book a guide?" — not implemented.

**Friction**
- No report + no conditions: "Be the first to report" CTA. Good.
- Map, waypoints, safety info well structured.

**Messaging**
- Safety block: "Emergency 112 · Tourist info 1460" — clear.
- Footer: "Add to your plan and pair with a village or winery in the afternoon" — actionable.

| Priority | Finding | Action |
|----------|---------|--------|
| P0 | No "Book a guide" CTA | Add when conditions are caution/closed or when partner guides exist |
| P2 | Related places: "Hike in the morning, village or winery in the afternoon" | Already strong; ensure links to Plan |

---

### 6. Trail report — `src/app/trails/[id]/report/page.tsx`, `TrailReportClient.tsx`

**Product value**
- UGC trail conditions support Anders and community. Form is simple: status, surface, note, optional email.
- Success state: "Thanks for reporting" + Back to trail.

**Conversion path**
- Success → Back to trail. No next-step CTA (e.g. "Add to plan", "Report another trail").
- **P1:** Post-submit: suggest "Add this trail to your plan" or "Report another trail".

**Friction**
- Breadcrumb and Back link; form is clear. Error state and recovery copy are good.
- **P2:** No "Report another" link on success.

**Messaging**
- "Help others by sharing what you saw. Quick and anonymous if you prefer." — aligns with community tone.

| Priority | Finding | Action |
|----------|---------|--------|
| P1 | Success state has no next action | Add "Add to plan" or "Report another trail" link |
| P2 | Optional email could mention benefit | "Email (optional — we may verify your report)" |

---

### 7. Events — `src/app/events/page.tsx`

**Product value**
- "Epiphany, carnival, markets, tastings" + month structure serve Claire and Winter Sun Family.
- Don’t miss section for Epiphany/Carnival is strong.
- Planning tips: book early, pair with trails.

**Conversion path**
- "Explore {region}" → Search; "Learn more" → external URL.
- **P0:** No Plan CTA. User reads events but has no in-app path to add event to itinerary.
- **P1:** Event cards are not addable to Plan. PRD itinerary can include events.

**Friction**
- Empty filter: "Nothing matches" + Clear filters. Good.
- Jump-to-month nav is useful. Region/type filters work.

**Messaging**
- "The island fills the short days with light and noise" — on-brand.
- "Dates may shift year to year. Check official sources." — appropriate caveat.

| Priority | Finding | Action |
|----------|---------|--------|
| P0 | Events not addable to Plan | Add "Add to plan" on event cards or Event→Plan flow |
| P0 | No Plan CTA on Events page | Add "Plan your trip" or "Add to itinerary" section |
| P1 | "Learn more" only — no booking | Where events have ticketing, add "Get tickets" link |

---

### 8. Plan — `src/app/plan/page.tsx`

**Product value**
- "Build day by day. Auto-saves. Templates or add places." Clear for Claire (10-day itinerary).
- Templates: Classic, Mountain, Coast & Culture. Popular picks, PlacePicker, SuggestedForDay.
- **P1:** 5 days max. PRD Claire plans 10-day stays; consider 7–10 day support.

**Conversion path**
- Copy itinerary, Share, Browse wineries, My bookings (when hasWineries).
- **P0:** No "Book tastings" CTA when plan has wineries but user hasn’t booked. "Book tastings ahead" appears only when hasWineries; add it earlier.
- **P1:** CTA "Browse wineries" is good; "Book a tasting" more direct than "Modify" for new users.

**Friction**
- Template modal when plan has content: Replace vs Add. Good.
- Empty day: "Add a place above, or ask AI for ideas." Clear.
- **P2:** "Add next stop below" — some users may not see PlacePicker; consider a more prominent prompt.

**Messaging**
- "Daylight ends around 5pm. Start early, save when you're ready." — practical.
- **P1:** "Book tastings ahead" could be more prominent when wineries are in plan.

| Priority | Finding | Action |
|----------|---------|--------|
| P0 | No clear "Book tastings" when plan has wineries | Surface "Book tastings" CTA when wineries in plan, even before first booking |
| P1 | 5 days may be tight for Claire | Consider 7–10 day selector or expandable |
| P2 | "Add next stop" discoverability | Ensure PlacePicker is visually prominent |

---

### 9. Bookings — `src/app/bookings/page.tsx`

**Product value**
- "Your tastings and experiences. All in one place." Clear.
- Sync by email for multi-device. Stats: total, upcoming, confirmed.
- Empty: "Book a winery tasting from Discover" + Browse wineries + Load by email.

**Conversion path**
- Empty → Browse wineries, Load by email. With bookings → View winery, Modify (→ book/winery/[id]).
- "Book more" / "Plan your next visit" section. Good.
- **P1:** Past bookings: "Visit winery page" only; no "Book again" for return visitors.

**Friction**
- Email lookup: rate limit messaging is clear. Loading and error states handled.
- **P2:** "Modify" goes to booking form; users with confirmed bookings may expect "View details" vs "Change booking".

**Messaging**
- "No bookings yet" + wine glass icon. Friendly.
- "Load bookings you made on another device" — clear use case.

| Priority | Finding | Action |
|----------|---------|--------|
| P1 | Past bookings: no "Book again" | Add "Book again" for past winery tastings |
| P2 | "Modify" vs "View details" | Consider separate actions for confirmed vs pending |

---

### 10. Arriving (Airport) — `src/app/airport/page.tsx`

**Product value**
- "Just landed?" + transport, tips. Emergency numbers prominent. PRD-aligned for jetlagged users.
- "Coast mild, Troodos cooler—pack layers" — practical.

**Conversion path**
- CTAs: Start exploring (Discover), Plan your first day (Plan), Check weather. Strong.
- **P2:** No Bookings or winery link; acceptable—arrival focus is explore/plan.

**Friction**
- Quick pick: LCA, PFO. Sections well structured. "Before you go" with winter tips.
- Closing line: "The island isn't going anywhere" — reassuring.

**Messaging**
- Matches MESSAGING. "Drop your bags, find a harbour café" — evocative.

| Priority | Finding | Action |
|----------|---------|--------|
| P2 | Consider "Book a tasting" for early planners | Optional; arrival page can stay exploration-focused |

---

### 11. Search — `src/app/search/page.tsx`, `SearchBar.tsx`

**Product value**
- "Search villages, wineries, beaches, trails, and winter events." Scope is clear.
- SearchBar: 2-char minimum, type labels (Trail, Winery, Place, Event).

**Conversion path**
- Results are links only. User clicks → detail. No "Add to plan" in search results.
- **P0:** No results: "No results for X. Try trails, villages, wineries, or events." No next CTA—user hits dead end.
- **P1:** Results dropdown doesn’t offer "Add to plan"; user must navigate to detail first.

**Friction**
- Empty query: SearchBar shows "Enter at least 2 characters". Good.
- **P0:** Zero-results state has no link to Discover, Trails, or Plan. Dead end.

**Messaging**
- Placeholder: "e.g. Omodos, Artemis, carnival" — helpful.
- No-results copy is informative but lacks recovery path.

| Priority | Finding | Action |
|----------|---------|--------|
| P0 | No-results state is dead end | Add "Browse Discover", "View all trails", "Plan your trip" links |
| P1 | Search results: no Add to plan | Consider quick-add in dropdown (optional) |

---

### 12. Secrets — `src/app/secrets/page.tsx`

**Product value**
- "Insider tips from people who live here." Supports Claire ("discoverer status") and Anders.
- Cards link to trail/place. Empty: "Discover places".

**Conversion path**
- Cards → place/trail. No Plan CTA on page.
- **P1:** Add "Add to plan" on each secret card or "Plan your trip" footer.

**Friction**
- Empty state handled. Type labels (Viewpoint, Kafenion, etc.) are clear.
- **P2:** Some secrets have `g.href` ("Go there"); others rely on `placeId`. Ensure all link somewhere useful.

**Messaging**
- "Advice a friend who lives here would give" — strong positioning.

| Priority | Finding | Action |
|----------|---------|--------|
| P1 | No Plan CTA | Add "Plan your trip" or link secret→place→Add to plan |
| P2 | Verify all secrets have useful links | Audit `g.href` and `placeId` |

---

### 13. Account — `src/app/account/page.tsx`

**Product value**
- "Sign in (coming soon) will sync your plan and bookings."
- Workaround: email lookup on bookings page. Honest about current state.

**Conversion path**
- View my bookings, My plan. Good fallback.
- **P2:** When sign-in ships, ensure clear migration path for local data.

**Messaging**
- "Your plan and bookings live on this device" — clear.

| Priority | Finding | Action |
|----------|---------|--------|
| P2 | Sign-in roadmap | Document migration path for local→account data |

---

### 14. Team — `src/app/team/page.tsx`

**Product value**
- "Cyprus in winter deserves more than a one-line mention." Builds trust for Claire.
- Profiles: role, expertise, bio. No LinkedIn links in review (data may have them).

**Conversion path**
- Start planning, Discover places. Good.
- **P2:** Consider linking expertise to relevant sections (e.g. trails expert → Trails).

**Messaging**
- Closing line: "Trail in the morning… The island rewards the curious." — on-brand.

| Priority | Finding | Action |
|----------|---------|--------|
| P2 | Link expertise to content | Optional: e.g. trails expert → /trails |

---

### 15. Wineries — `src/app/wineries/page.tsx`

**Product value**
- "Krasochoria, Laona, Akamas. Fireside tastings, Commandaria." Clear for Claire.
- "Call ahead—many run lean in winter" — practical.

**Conversion path**
- Cards → detail → Book tasting. Footer: "Plan your day".
- **P1:** No primary "Book a tasting" CTA above the fold. Cards link to detail; booking is one more click.
- **P2:** Consider featured "Book now" winery or banner.

**Messaging**
- "Pair a winery visit with a trail or village" — good cross-sell.

| Priority | Finding | Action |
|----------|---------|--------|
| P1 | No booking CTA above fold | Add "Book a tasting" or featured bookable winery |
| P2 | "Plan your day" link | Already present; ensure visibility |

---

### 16. Beaches — `src/app/beaches/page.tsx`

**Product value**
- "Empty sand, mild light. The sea is cold for swimming" — sets expectations.
- Winter Sun Family and Claire served.

**Conversion path**
- Cards → detail. Footer: "See all places". No Plan CTA.
- **P1:** Add "Plan your day" or "Add to itinerary" in footer (like Wineries).

**Messaging**
- "Combine a beach walk with ancient ruins or a village lunch" — actionable.

| Priority | Finding | Action |
|----------|---------|--------|
| P1 | No Plan CTA in footer | Add "Plan your day" link (match Wineries) |

---

### 17. Villages — `src/app/villages/page.tsx`

**Product value**
- "Cobbled streets, wine heartland, lace and silver." Strong for Claire.
- Winter context: quieter, tavernas warm.

**Conversion path**
- Cards → detail. Footer: "See all places". No Plan CTA.
- **P1:** Add "Plan your day" link (match Wineries, Beaches).

**Messaging**
- Consistent with category pages. "Combine a village visit with a trail or winery" — good.

| Priority | Finding | Action |
|----------|---------|--------|
| P1 | No Plan CTA | Add "Plan your day" link |

---

### 18. Weather — `src/app/weather/page.tsx`

**Product value**
- Month-by-month table: coast vs Troodos. "Pack layers" — practical.
- Links to trail conditions and winter wineries.

**Conversion path**
- Table rows are not clickable. No links to month detail.
- **P1:** PRD weather data exists; month rows could link to `/weather/december` etc. Currently no navigation from table to month pages.

**Messaging**
- "Coast means Larnaca, Limassol, Paphos" — clear.

| Priority | Finding | Action |
|----------|---------|--------|
| P1 | Month rows not clickable | Link each row to `/weather/[month]` |
| P2 | Add Plan CTA | "Plan your trip" link in footer |

---

### 19. Weather month — `src/app/weather/[month]/page.tsx`

**Product value**
- What to expect (coast, Troodos). Events in month. Strong.
- **P0:** Events listed but not clickable—no link to event detail or Events page.
- CTAs: Trail conditions, Winter wineries, Plan your trip. Good.

**Conversion path**
- Events block: `events.map` renders name, description, dates—but no `Link` or `href`. Dead end for events.
- **P0:** Add links from event to `/events` or event anchor (e.g. `#epiphany-cyprus`).

**Messaging**
- Month-specific descriptions. "All months" and "Troodos winter" links. Good.

| Priority | Finding | Action |
|----------|---------|--------|
| P0 | Events in month not clickable | Add Link to /events or event id anchor |
| P2 | Consider "Add to plan" for events | If events become plan-addable, link from here |

---

### 20. Install — `src/app/install/page.tsx`

**Product value**
- Developer/deployment page. Not user-facing. Appropriate scope.
- Steps, code, troubleshooting. Clear.

**Conversion path**
- "Back to app" → Home. Sufficient.

**Messaging**
- Technical. No tourism copy needed.

| Priority | Finding | Action |
|----------|---------|--------|
| — | N/A for end users | No changes needed for product review |

---

### 21. Book winery — `src/app/book/winery/[id]/page.tsx`

**Product value**
- "Book a tasting" + winery name. Tasting info, cosy winter messaging.
- Verified partner badge. Alternative: book on website, call.

**Conversion path**
- Form → submit. "Or book on the winery website" and phone. Good.
- **P1:** After booking, does user get directed to Bookings? Confirm post-submit flow.
- **P2:** No "Add to plan" on this page. User may want to add winery to itinerary after booking.

**Messaging**
- "Winter tastings are cosy: fire, heaters, often the owner pouring." — on-brand.
- "Fill out the form and they'll confirm" — sets expectations.

| Priority | Finding | Action |
|----------|---------|--------|
| P1 | Verify post-booking flow | Ensure redirect or message to Bookings |
| P2 | Add "Add to plan" | Optional: link to add winery to Plan after booking |

---

### 22. Regions — `src/app/regions/[slug]/page.tsx`

**Product value**
- Trails, villages, beaches, ancient, wineries, events by region. Rich.
- Troodos: "Best Troodos trails in December" link. Good.
- Footer: Weather by month, Plan your trip.

**Conversion path**
- Cards → detail. Plan link in footer. Strong.
- **P2:** Event cards: no link to event detail. Same as Weather month—events are plain text.

**Messaging**
- Config-driven titles and descriptions. Consistent.

| Priority | Finding | Action |
|----------|---------|--------|
| P2 | Region events not clickable | Add links to /events or event anchors |
| P2 | Wineries "All Cyprus wineries" when >9 | Already implemented; good |

---

### 23. Wine routes — `src/app/wine-routes/[slug]/page.tsx`

**Product value**
- Route description + wineries. "Book ahead" implied.
- Krasochoria, Laona, Akamas, Commandaria. Claire-focused.

**Conversion path**
- Cards → detail → Book. Footer: All wineries, Plan your trip. Good.
- **P2:** Consider "Book a tasting on this route" banner for high-intent users.

**Messaging**
- Route descriptions are evocative. "Book ahead" could be more prominent.

| Priority | Finding | Action |
|----------|---------|--------|
| P2 | "Book ahead" prominence | Consider banner or CTA for route-level booking |
| — | Otherwise strong | No P0/P1 |

---

## Cross-Cutting Recommendations

1. **Plan as hub:** Add "Plan your trip" or "Add to itinerary" on Discover list, Beaches, Villages, Secrets, Weather, and ensure Events can be added.
2. **Book path:** Surface "Book a tasting" from Home, Discover (winery filter), Plan (when wineries in plan), and Wineries list.
3. **Search recovery:** Never leave user with no next step. Always offer Discover, Trails, or Plan links on no-results.
4. **Events as first-class:** Make events addable to Plan and ensure event mentions (Weather month, Regions) link to Events page.
5. **Guide booking:** Add "Book a guide" on trail detail when conditions are caution/closed or when partners exist.
6. **Persona messaging:** Use "Escape the cold" / "16°C when home is 6°C" on Home for Anders/Claire; keep understated tone elsewhere.

---

## File Reference Summary

| Page | Primary File(s) |
|------|-----------------|
| Home | `src/app/page.tsx` |
| Discover | `src/app/discover/page.tsx`, `DiscoverClient.tsx` |
| Discover detail | `src/app/discover/[id]/page.tsx` |
| Trails | `src/app/trails/page.tsx`, `TrailsClient.tsx` |
| Trail detail | `src/app/trails/[id]/page.tsx` |
| Trail report | `src/app/trails/[id]/report/page.tsx`, `TrailReportClient.tsx` |
| Events | `src/app/events/page.tsx` |
| Plan | `src/app/plan/page.tsx` |
| Bookings | `src/app/bookings/page.tsx` |
| Arriving | `src/app/airport/page.tsx` |
| Search | `src/app/search/page.tsx`, `SearchBar.tsx` |
| Secrets | `src/app/secrets/page.tsx` |
| Account | `src/app/account/page.tsx` |
| Team | `src/app/team/page.tsx` |
| Wineries | `src/app/wineries/page.tsx` |
| Beaches | `src/app/beaches/page.tsx` |
| Villages | `src/app/villages/page.tsx` |
| Weather | `src/app/weather/page.tsx` |
| Weather month | `src/app/weather/[month]/page.tsx` |
| Install | `src/app/install/page.tsx` |
| Book winery | `src/app/book/winery/[id]/page.tsx` |
| Regions | `src/app/regions/[slug]/page.tsx` |
| Wine routes | `src/app/wine-routes/[slug]/page.tsx` |
