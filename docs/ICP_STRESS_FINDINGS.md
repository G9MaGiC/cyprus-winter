# Cyprus Winter — ICP Stress Test Findings

**Date:** March 7, 2026  
**Source:** Phase 1 baseline, Phase 2 flow inspection, Phase 3 API/security, [PRODUCT_STRESS_AUDIT.md](./PRODUCT_STRESS_AUDIT.md)  
**Status:** Consolidated findings; fix status updated as issues are resolved.

---

## Severity Legend

| Severity | Criteria |
|----------|----------|
| **P0** | Security, data loss, app crash, P0 a11y |
| **P1** | Core flow broken, wrong data, P1 a11y, key ICP friction |
| **P2** | Minor flow, cosmetic, P2 a11y, ICP alignment polish |
| **P3** | Backlog, docs, low impact |

---

## Findings

### P0 — Critical
*None identified.*

---

### P1 — High

#### [P1-001] Hero/charcoal text contrast (PRODUCT_STRESS_AUDIT)
**Area:** Accessibility  
**Page/Component:** page.tsx, Nav.tsx  
**Description:** `text-white/60` and `text-white/70` on hero/charcoal may fail WCAG AA for small text.  
**Reproduction:** View hero and nav on charcoal background; check contrast.  
**Expected:** Minimum `text-white/80` for body copy on dark backgrounds.  
**Actual:** Some nav/hero text uses `text-white/70`.  
**Fix status:** Fixed (text-white/70 → text-white/80 in page.tsx, BottomNav, AIAssistant)  
**Owner:** Design

#### [P1-002] PlacePicker scroll behavior (PRODUCT_STRESS_AUDIT)
**Area:** Mobile / UX  
**Page/Component:** PlacePicker.tsx  
**Description:** `max-h-[280px] sm:max-h-[320px] overflow-y-auto` may cause scroll-within-scroll on short viewports.  
**Reproduction:** Plan → Add place → PlacePicker on small viewport.  
**Expected:** `overscroll-contain` and `scroll-touch`; no double-scroll.  
**Actual:** Code already has `overscroll-contain scroll-touch` on list (line 78). **Verified — no change needed.**  
**Fix status:** Verified OK  
**Owner:** —

#### [P1-003] Winery booking Supabase down (PRODUCT_STRESS_AUDIT)
**Area:** Logic / Data  
**Page/Component:** api/bookings/route.ts, WineryBookingForm.tsx  
**Description:** When Supabase is down, API returns 200 and form shows success; user may assume winery received request when DB write failed.  
**Reproduction:** Disable Supabase; submit booking; observe success message.  
**Expected:** Log DB errors; consider "confirmation pending" vs "saved locally only" when Supabase unavailable.  
**Actual:** createBooking uses in-memory fallback; user sees full success.  
**Fix status:** Fixed (DB error logging; storage field; memory-mode note in WineryBookingForm)  
**Owner:** Architecture

#### [P1-004] Discover filter `nature` → beach mapping (PRODUCT_STRESS_AUDIT)
**Area:** Logic  
**Page/Component:** discover/page.tsx, DiscoverClient.tsx  
**Description:** `filter=nature` maps to section `beach`; may confuse users expecting a distinct "nature" section.  
**Reproduction:** Visit `/discover?filter=nature` — shows beaches.  
**Expected:** Document mapping or add label "Nature & coasts (beaches)" when filter active.  
**Actual:** No label; mapping undocumented.  
**Fix status:** Fixed (DiscoverClient shows " (Nature & coasts)" when filter=nature)  
**Owner:** Content/UX

#### [P1-005] Trails "All" region chip (PRODUCT_STRESS_AUDIT)
**Area:** User flows  
**Page/Component:** trails/TrailsClient.tsx  
**Description:** Need "All" chip to clear region filter.  
**Reproduction:** Set region filter; try to clear.  
**Expected:** "All" chip returns `/trails` and clears both difficulty and region.  
**Actual:** TrailsClient has `{ id: "", label: "All" }` for region and difficulty. **Verified — done.**  
**Fix status:** Verified OK  
**Owner:** —

---

### P2 — Medium

#### [P2-001] AttractionCard badge styling (PRODUCT_STRESS_AUDIT)
**Area:** Design system  
**Page/Component:** AttractionCard.tsx  
**Description:** Uses `rounded-md`; design-tokens specify `rounded-full` for badges.  
**Fix status:** Fixed (rounded-md → rounded-full for badges and highlights)  
**Owner:** Design

#### [P2-002] Secondary CTA alignment (PRODUCT_STRESS_AUDIT)
**Area:** Design system  
**Page/Component:** discover/[id]/page.tsx, error.tsx, not-found.tsx  
**Description:** Some secondary CTAs use `border border-terracotta/80`; skill specifies `border-2 border-aegean text-aegean` for secondary.  
**Fix status:** Documented (design-tokens: terracotta secondary for contextual hierarchy when primary is terracotta; aegean variant available)  
**Owner:** Design

#### [P2-003] Plan `?add=` loading state (PRODUCT_STRESS_AUDIT)
**Area:** User flows  
**Page/Component:** plan/page.tsx  
**Description:** `?add=id` processed after hydration; user may briefly see plan without added place.  
**Reproduction:** Navigate to `/plan?add=omodos`; observe flash.  
**Fix status:** Fixed (shows "Adding to your plan…" while hydrating)  
**Owner:** UX

#### [P2-004] Template merge option (PRODUCT_STRESS_AUDIT)
**Area:** User flows  
**Page/Component:** useItinerary.ts, plan/page.tsx  
**Description:** `applyTemplate` uses `confirm()` and always replaces; no "Merge" vs "Replace" in UI.  
**Fix status:** Verified OK (TemplateChoiceModal offers Replace and Merge options)  
**Owner:** UX

#### [P2-005] combineWith ID validation (PRODUCT_STRESS_AUDIT)
**Area:** Logic  
**Page/Component:** related-places.ts  
**Description:** `getRelatedPlaces` silently skips unknown IDs; "Combine your day" may show fewer items.  
**Fix status:** Documented (JSDoc added; lint recommended for data validation)  
**Owner:** Architecture

#### [P2-006] Discover empty state (PRODUCT_STRESS_AUDIT)
**Area:** UI/UX  
**Page/Component:** discover/DiscoverClient.tsx  
**Description:** Sections have empty state; no explicit empty for a section with zero items when filter is active.  
**Actual:** DiscoverClient has empty state for `items.length === 0`. **Verified OK.**  
**Fix status:** Verified OK  
**Owner:** —

#### [P2-007] Nature filter tooltip (PRODUCT_STRESS_AUDIT)
**Area:** ICP alignment  
**Page/Component:** discover/DiscoverClient.tsx  
**Description:** When `filter=nature`, add tooltip or label: "Nature & coasts (beaches)".  
**Fix status:** Fixed (shows " (Nature & coasts)" when filter=nature)  
**Owner:** Content

---

### ICP Alignment (P2 — Backlog)

| Gap | Description | Fix status |
|-----|-------------|------------|
| Family filter | Implemented — `?filter=family` exists | OK |
| Nomad chip | No `?filter=nomad` in Discover | Backlog |
| Family template | No "Family" plan template | Backlog |
| 48h / short-stay template | No bleisure itinerary template | Backlog |

---

## Phase 1 Baseline Results

| Check | Result |
|-------|--------|
| npm run lint | Pass |
| npm run test | Pass (130 tests) |
| npm run build | Pass |
| npx tsc --noEmit | Pass |
| API stress | Requires running server |

---

## Phase 3: API & Security Verification

### Stress Script Update
- Added POST `/api/trail-reports` to stress-test-apis.mjs (trailId: artemis, status: open, surface: dry)

### Security (QA_PLAN §2.2) — Verified
| Check | Result |
|-------|--------|
| Bookings lookup exact match | `getBookingsByEmail` uses .eq() / strict === |
| Chat rate limit | 20/min via rate-limit.ts |
| Bookings rate limit | 10/min POST, 15/min GET |
| AI output sanitization | Client uses isSafeUrl for links; sanitizeText on input |
| Resend email escaping | guestName/notes use sanitizeForStorage |
| Admin stats 401 | isAdminAuthorized checks ADMIN_SECRET |

---

## Phase 6: Regression Verification (Complete)

| Check | Result |
|-------|--------|
| npm run lint | Pass |
| npm run test | Pass (130 tests) |
| npm run build | Pass |
| npx tsc --noEmit | Pass |
