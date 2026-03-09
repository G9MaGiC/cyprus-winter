# User Flows A–Z

Audit of all user flows in Cyprus Winter. Verify each path end-to-end.

## Hero
- [x] Homepage hero uses `cyprus-ancient-kourion.jpg` (Kourion ruins, coast)
- [x] OG image (social share) uses same image

---

## Entry points

### Homepage (/)
| Flow | From | To | Notes |
|------|------|-----|------|
| Discover | Hero CTA | /discover | |
| Trails | Hero CTA | /trails | |
| Local secrets | Hero CTA | /secrets | |
| Plan trip | Hero CTA | /plan | |
| Just arrived? | Hero CTA | /airport | |
| Start here | Discover, Trails, Local secrets, Plan trip, Events | Respective pages | |
| Browse by category | Villages, Wineries, Culture, Coasts, Monasteries | /discover?filter=X | |
| Quick start | Artemis Trail | /trails/artemis | |
| Quick start | Wineries | /discover?filter=winery | |
| Quick start | What's on | /events | |
| Quick start | Dómes Sergiou | /discover/domes-sergiou | |
| Four places | Omodos, Pafos mosaics, Artemis, Kourion | /discover/X or /trails/artemis | |
| Local secrets | Cards + See all | /secrets or detail href | |
| Plan your trip | Card | /plan | |
| Winter events | Card | /events | |
| Essentials | Arriving, Trails, Discover, Bookings | Respective pages | |

### Nav (desktop)
| Flow | Link | Target |
|------|------|--------|
| Home | Cyprus Winter logo | / |
| Search | Search icon | /search |
| Discover | Nav | /discover |
| Trails | Nav | /trails |
| Events | Nav | /events |
| Plan | Nav | /plan |
| Bookings | Nav | /bookings |
| Arriving | Nav | /airport |
| More → Local secrets | Dropdown | /secrets |
| More → Account | Dropdown | /account |
| More → Team | Dropdown | /team |
| Ask AI | Button | Opens AI assistant |

### Bottom nav (mobile)
| Flow | Link | Target |
|------|------|--------|
| Primary | Home, Discover, Trails, Plan | /, /discover, /trails, /plan |
| More | Search, Weather, Events, Bookings, Arriving, Local secrets, Team, Account | Respective pages (overflow menu) |

---

## Discover (/discover)
| Flow | Action | Target |
|------|--------|--------|
| Filter | difficulty, region, type chips | Filtered list |
| Card | Tap place | /discover/[id] |
| Add to itinerary | Button | /plan?add=[id] |

### Discover detail (/discover/[id])
| Flow | Action | Target |
|------|--------|--------|
| Book tasting | (winery) | /book/winery/[id] |
| Pair well with | Related place | /discover/X or /trails/X |
| Add + (related) | Add related to plan | /plan?add=X |
| Add to itinerary | Button | /plan?add=[id] or "In itinerary" state |

---

## Trails (/trails)
| Flow | Action | Target |
|------|--------|--------|
| Filter | Difficulty, Region | Filtered list |
| Best right now | Featured cards | /trails/[id] |
| Map | Markers | /trails/[id] |
| Trail card | Tap | /trails/[id] |
| Report conditions | Footer CTA | /trails/artemis/report |

### Trail detail (/trails/[id])
| Flow | Action | Target |
|------|--------|--------|
| Report conditions | Submit report | /trails/[id]/report |
| Pair well with | Related place + Add + | /discover/X, /plan?add=X |
| Add to itinerary | Button | /plan?add=[id] |
| View all trails | Footer | /trails |

### Trail report (/trails/[id]/report)
| Flow | Action | Target |
|------|--------|--------|
| Submit | Form | API, then success state |

---

## Plan (/plan)
| Flow | Action | Target |
|------|--------|--------|
| ?add=[id] | URL param | Adds place to active day, replaces URL |
| Templates | Classic, Mountain, Coast & Culture | Populates days |
| Day selector | Tabs 1–5 | Switches active day |
| Add to Day X | PlacePicker | Adds place |
| Suggested for your day | Quick-add buttons | Adds related place |
| Remove | Per-card | Removes from day |
| Clear day | Button | Clears active day |
| Copy itinerary | Button | Clipboard |
| Browse wineries | (if has wineries) | /discover?filter=winery |
| My bookings | (if has wineries) | /bookings |

---

## Bookings (/bookings)
| Flow | Action | Target |
|------|--------|--------|
| Load by email | Form | API merge, updates list |
| View winery | Card | /discover/[id] |
| Modify | (upcoming) | /book/winery/[id] |
| Browse wineries | Footer | /discover?filter=winery |
| Discover all | Footer | /discover |

---

## Book winery (/book/winery/[id])
| Flow | Action | Target |
|------|--------|--------|
| Submit booking | Form | API, localStorage, success |
| View winery | Link | /discover/[id] |

---

## Events (/events)
| Flow | Action | Target |
|------|--------|--------|
| Filter | Type, Region | Filtered list |
| Explore [region] | Card CTA | /search?q=[region] |
| Learn more | (if event has url) | External |

---

## Search (/search)
| Flow | Action | Target |
|------|--------|--------|
| Query | Input | Results (places, trails) |
| Result | Tap | /discover/[id] or /trails/[id] |

---

## Local secrets (/secrets)
| Flow | Action | Target |
|------|--------|--------|
| Card | Tap or Go there | /discover/X or /trails/X (if href) |

---

## Airport (/airport)
| Flow | Action | Target |
|------|--------|--------|
| Content | Practical arrival info | Informational |

---

## Account (/account)
| Flow | Action | Target |
|------|--------|--------|
| Sign in | (if implemented) | Auth flow |

---

## Team (/team)
| Flow | Action | Target |
|------|--------|--------|
| Content | Team bios | Informational |

---

## Cross-cutting
| Flow | Implementation |
|------|----------------|
| Scroll to top on route change | ScrollToTop component in layout |
| Skip to main content | Fixed link, focus-only visible |
| AI Assistant | Trigger from hero, nav; opens overlay |

---

## Verification (one by one)

### 1. All Nav + BottomNav links resolve
- **Nav** primaryLinks: /, /discover, /trails, /plan (navPrimaryLinks) ✓
- **Nav** moreLinks: /weather, /events, /bookings, /airport, /secrets, /account, /team (navMoreLinks) ✓
- **Nav** Search: /search (separate) ✓
- **BottomNav** primary: Home, Discover, Trails, Plan (bottomPrimaryLinks) ✓
- **BottomNav** overflow (More): Search, Weather, Events, Bookings, Arriving, Local secrets, Team, Account (bottomOverflowLinks) ✓
- **Result**: ✓ All routes exist (`src/app/` has page.tsx for each)

### 2. All homepage CTAs resolve
- Hero: /discover, /trails, /secrets, /plan, /airport ✓
- Start here: /discover, /trails, /secrets, /plan, /events ✓
- Browse: /discover?filter=village|winery|ancient|beach|monastery ✓
- Quick start: /trails/artemis, /discover?filter=winery, /events, /discover/domes-sergiou ✓
- Four places: /discover/omodos, /discover/pafos-mosaics, /trails/artemis, /discover/kourion ✓
- Local secrets: g.href (e.g. /discover/kourion) or /secrets ✓
- Plan, Events cards: /plan, /events ✓
- Essentials: /airport, /trails, /discover, /bookings ✓
- **Result**: ✓ All valid

### 3. Add to itinerary → Plan with place added
- Trail/discover detail: `AddToItineraryButton` → `/plan?add={id}` ✓
- Plan page: `useEffect` reads `?add=`, calls `addToDay(id)`, `router.replace("/plan", { scroll: false })` ✓
- **Result**: ✓ Connected

### 4. Related places Add + → Plan with place added
- `RelatedPlacesBlock` with `showAddToItinerary`: each related place has `href={/plan?add={r.id}}` ✓
- **Result**: ✓ Connected

### 5. Trail report form submits
- Form posts to `/api/trail-reports` ✓
- Success: shows "Thanks for reporting", link to trail detail ✓
- **Result**: ✓ Works

### 6. Winery booking form submits
- `WineryBookingForm` submits to `/api/bookings`, saves to localStorage ✓
- **Result**: ✓ Works (API + local fallback)

### 7. Search returns and links work
- `SearchBar` uses `search()` from `@/lib/search` ✓
- Results: `href` = `/discover/{id}` (places) or `/trails/{id}` (trails) or `/events` (events) ✓
- `Link href={r.href}` in dropdown ✓
- **Result**: ✓ Works

### 8. Templates populate plan
- `useItinerary().applyTemplate(key)` uses `WINTER_TEMPLATES` ✓
- Templates: classic, mountain, coast-culture with day→placeIds ✓
- **Result**: ✓ Works

### 9. Suggested for day adds related places
- `SuggestedForDay` uses `getCombineWith(id)` for activeDayItems ✓
- Renders quick-add buttons that call `onAdd(r.id)` ✓
- **Result**: ✓ Works

---

## Summary
All 9 checklist items verified in code. Manual browser testing recommended for UX (scroll, focus, mobile).
