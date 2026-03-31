# TRIO Business Advisor: Expert Review

Three business experts reviewed the Cyprus Winter app and their recommendations were implemented as code changes.

---

## Expert 1: Alex Hormozi — The Offer Architect

**Diagnosis**: Zero email capture. Booking forms lack perceived value. No urgency to book now.

### Implemented Changes

**H1. Lead Magnet Email Capture**
- Created `src/components/LeadCapture.tsx` — email capture offering "Free Cyprus Winter Checklist"
- Created `src/app/api/subscribe/route.ts` — rate-limited subscription endpoint
- Added to homepage after the "Why Cyprus" teaser section
- Added `subscribe` scope to rate limiter

**H2. Booking Value Stack**
- Created `src/components/bookings/BookingValueStack.tsx` — shows what's included (tasting, tour, recommendations, no cost) with checkmarks
- Added risk reversal copy: "Cancel anytime before confirmation. Zero risk."
- Integrated into both winery and guide booking forms

**H3. Seasonal Urgency**
- Added urgency strip to BookingValueStack: "Winter tasting season — book ahead for weekend availability"
- Non-deceptive, seasonal messaging (not fake scarcity)

---

## Expert 2: Russell Brunson — The Funnel Architect

**Diagnosis**: Homepage has 4 competing CTAs. Plan feature has no capture. No post-booking cross-sell.

### Implemented Changes

**B1. Plan Save Prompt**
- Created `src/components/plan/PlanSavePrompt.tsx` — appears when plan has 3+ items
- Offers "Email me my itinerary" with email capture
- Dismissible, non-blocking, reuses `/api/subscribe` endpoint with `plan-save` source tag

**B2. Post-Booking Upsell**
- Created `src/components/book/PostBookingUpsell.tsx` — "Complete your day" section after booking success
- Shows 2-3 nearby places based on winery region (static data, no heavy imports)
- Added to winery booking form success state

**B3. Hero CTA Simplification**
- Modified `src/app/_home/HomeHero.tsx` — swapped CTA hierarchy
- "Plan your trip" is now primary (terracotta, full-width on mobile)
- "Explore" is now secondary (border style)
- Tertiary links (airport, AI guide) remain below the fold

---

## Expert 3: Gary Vaynerchuk — The Content Strategist

**Diagnosis**: Trail reports (UGC) hidden on individual pages. Share section buried at bottom. No viral sharing for trip plans.

### Implemented Changes

**G1. Shareable Trip Cards**
- Created `src/components/plan/ShareTripCard.tsx` — dark card with "My Cyprus Winter Trip" branding
- Shows day count and place count, uses Web Share API (native share sheet) with clipboard fallback
- Pre-fills social post: "Just planned my X-day, X-place Cyprus winter trip"
- Added to plan page when user has content

**G2. Trail Report Social Proof**
- Created `src/components/home/RecentTrailReports.tsx` — "What hikers are saying" section
- Shows 3 featured trail reports with status indicators, surface conditions, and quotes
- Links to individual trail pages for deeper engagement
- Added to homepage before planning section

**G3. Contextual Share Prompts**
- Created `src/components/SharePrompt.tsx` — inline "Love this place? Share it with a friend"
- Uses Web Share API with clipboard fallback
- Added to discover detail pages after description section

---

## Files Created (8)

| File | Purpose |
|------|---------|
| `src/components/LeadCapture.tsx` | Email capture (Hormozi H1) |
| `src/app/api/subscribe/route.ts` | Subscription API (Hormozi H1) |
| `src/components/bookings/BookingValueStack.tsx` | Value stack + urgency (Hormozi H2/H3) |
| `src/components/plan/PlanSavePrompt.tsx` | Plan email save (Brunson B1) |
| `src/components/book/PostBookingUpsell.tsx` | Post-booking cross-sell (Brunson B2) |
| `src/components/plan/ShareTripCard.tsx` | Social trip card (GaryVee G1) |
| `src/components/home/RecentTrailReports.tsx` | Trail report social proof (GaryVee G2) |
| `src/components/SharePrompt.tsx` | Contextual share prompt (GaryVee G3) |

## Files Modified (8)

| File | Change |
|------|--------|
| `src/app/_home/HomePageContent.tsx` | Added LeadCapture + RecentTrailReports |
| `src/app/_home/HomeHero.tsx` | Swapped CTA hierarchy (Plan primary) |
| `src/app/(padded)/book/winery/[id]/WineryBookingForm.tsx` | Added BookingValueStack + PostBookingUpsell |
| `src/app/(padded)/book/guide/[id]/GuideBookingForm.tsx` | Added BookingValueStack |
| `src/app/(padded)/book/winery/[id]/page.tsx` | Pass region prop to form |
| `src/app/(padded)/discover/[id]/page.tsx` | Added SharePrompt |
| `src/app/(padded)/plan/page.tsx` | Added PlanSavePrompt + ShareTripCard |
| `src/lib/rate-limit.ts` | Added `subscribe` scope |

## i18n

Translation keys added to all 4 locales (en, de, el, pl) under: `leadCapture`, `share`, `home.trailReports`, `plan.savePrompt`, `plan.shareCard`, `book.valueStack`, `book.upsell`.
