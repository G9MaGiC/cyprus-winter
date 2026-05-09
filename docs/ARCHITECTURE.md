# Cyprus Winter — Architecture Overview

High-level architecture for the Cyprus tourism Next.js app. See also `docs/QA_PLAN.md` and `docs/QA_BUGS.md`.

---

## 1. Project Structure

```
cyprus-winter/
├── src/
│   ├── app/              # Next.js App Router (pages, layouts, API)
│   │   ├── (padded)/     # Route group: pages with top padding
│   │   ├── _home/        # Home page sections (mixed server/client)
│   │   ├── [locale]/     # Localized routes (en, el, de, pl)
│   │   ├── api/          # API routes
│   │   └── serwist/      # PWA worker config
│   ├── components/       # Shared UI components (~80+)
│   ├── contexts/         # AuthContext, StickyPlanBarContext
│   ├── data/             # Static content (attractions, trails, etc.)
│   ├── hooks/            # useItinerary, useRightNowFeed, etc.
│   ├── i18n/             # next-intl routing, navigation
│   └── lib/              # Services, utilities, shared logic (~50 files)
├── messages/             # i18n JSON (en, el, de, pl)
├── docs/                 # QA, audits, design docs
├── scripts/              # Build, data enrichment, i18n
├── public/               # Static assets
└── android/              # Capacitor Android app
```

---

## 2. Main Modules

### 2.1 Routing

- **next-intl** with locales: `en` (default), `el`, `de`, `pl` (`localePrefix: "as-needed"`).
- **Dual route trees**:
  - Root `/` → home (non-locale)
  - `[locale]/...` → localized pages with `NextIntlClientProvider`, `SerwistProvider`, `StickyPlanBarProvider`
- **Route groups**: `(padded)` for pages with top padding; `_home` for home sections.
- **Locale-aware navigation**: `@/i18n/navigation` — `Link`, `redirect`, `usePathname`, `useRouter`.

### 2.2 Data Layer

- **Static data** in `src/data/`:
  - `attractions.ts` (beaches, ancient, villages, monasteries, nature)
  - `trails.ts`, `wineries.ts`, `restaurants.ts`, `guides.ts`, `events.ts`
  - `regions.ts`, `region-centroids.ts`, `itinerary-templates.ts`, `plan-quick-add.ts`
  - `weather.ts` (monthly), `airport.ts`, `home.ts`, `promoted.ts`, `secret-gems.ts`
- **Data access** via `src/data/index.ts`:
  - `getPlaceById`, `getAttractionById`, `getRestaurantById`, `getDiscoverPlaceById`, `getGuideById`
  - `allAttractions`, `allPlaces`, `PlanItem`
- **~25+ files** import from `@/data` (components, pages, lib, API routes).

### 2.3 API Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/health` | GET | Health check, Resend, Supabase |
| `/api/chat` | POST | AI chat (multi-provider) |
| `/api/weather` | GET | Live weather (coast/Troodos or lat/lng) |
| `/api/right-now` | GET | Location-based suggestions |
| `/api/trail-reports` | POST | Submit trail report |
| `/api/bookings` | GET, POST | Create/lookup bookings |
| `/api/track` | POST | Analytics events |
| `/api/stats` | GET | Admin stats |
| `/api/push/vapid` | GET | VAPID public key |
| `/api/push/subscribe` | POST | Subscribe to push |
| `/api/cron/daily` | GET | Trail summary, trip countdown pushes |
| `/api/cron/weather-digest` | GET | Weather digest pushes |

### 2.4 UI Components

- **Design tokens** from `@/lib/design-tokens` (LAYOUT, CARD, SECTION, SKELETON, CTA, TYPE).
- **Plan-related**: `DayContentPanel`, `DaySelector`, `PlacePickerModal`, `QuickStartSection`, `BuildADaySection`, `PlanShareBar`.
- **Shared**: `SearchBar`, `PlacePicker`, `AttractionCard`, `TrailCard`, `BottomNav`, `StickyPlanBar`.
- **~75 client components** (`"use client"`).

### 2.5 Hooks

| Hook | Purpose |
|------|---------|
| `useItinerary` | Itinerary state (localStorage + URL `?plan=`), add/remove, templates |
| `useRightNowFeed` | Right Now feed by lat/lng or region |
| `usePlanUrlActions` | Plan URL sync (`?add=`, `?plan=`) |
| `useTripDates` | Trip dates for countdowns |
| `useUserPreferences` | User prefs (client, localStorage) |

---

## 3. Data Flow

### No Global Store

- No Zustand, Redux, or similar. State via React contexts and hooks.

### Server vs Client

- **Server components** (default): discover, trails, wineries, plan — import `@/data` directly.
- **Client components** (`"use client"`): ~75 files — interactive UI (itinerary, maps, forms, AI, push).
- **Pattern**: Server pages compose server + client children; client components call APIs with `fetch()`.

#### RSC safety rules (non-negotiable)

- **Do not pass functions/components from Server Components into Client Components as props.** React Server Components cannot serialize those values.\n+  - Example failure mode: passing a `LinkComponent` (a function/component) into a client-only section can trigger the global `error.tsx` boundary at runtime.\n+- Prefer **importing the dependency directly** inside the client component (e.g. `AppLink` / `@/i18n/navigation` wrappers), or make the caller client-only if it truly needs to pass a component reference.

#### Locale routing rule of thumb

- If a link should respect locale routing, prefer `@/i18n/navigation` (`Link`, `useRouter`, `usePathname`) via the project wrapper `src/components/AppLink.tsx`.

### Data Paths

```
Static content:
  data/*.ts → server pages/components (no API)

Dynamic APIs:
  /api/weather     → weather-live.ts (Open-Meteo)
  /api/right-now   → right-now-scoring.ts + weather-live.ts
  /api/trail-reports → trail-reports.ts → Supabase
  /api/bookings    → bookings.ts → Supabase
  /api/chat        → OpenAI / AI Gateway / xAI / Groq / Ollama

Client-side persistence:
  useItinerary     → localStorage + URL ?plan=
  BookingsEmailLookup → localStorage fallback when no Supabase
  useUserPreferences → localStorage
```

### Contexts

- `AuthProvider` — auth state (Clerk/next-auth or custom).
- `StickyPlanBarProvider` — sticky plan bar visibility.

---

## 4. Key Services

| Service | Location | Role |
|---------|----------|------|
| **Rate limiting** | `lib/rate-limit.ts`, `rate-limit-redis.ts`, `rate-limit-in-memory.ts` | Upstash Redis or in-memory; per-route scopes |
| **Sanitization** | `lib/sanitize.ts`, `lib/safe-url.ts` | `sanitizeText`, `sanitizeForStorage`, `sanitizeMarkdownLinks`; UGC in APIs |
| **Weather** | `lib/weather-live.ts` | Open-Meteo, 1h cache; coast/Troodos or lat/lng |
| **Trail reports** | `lib/trail-reports.ts` | Create/read; Supabase or in-memory |
| **Trail summary cache** | `lib/trail-summary-cache.ts` | Cron-populated; 10min TTL; `getTrailSummary()` |
| **Bookings** | `lib/bookings.ts` | Create/lookup via Supabase; Resend for email |
| **AI/Chat** | `api/chat/route.ts`, `lib/ai-context.ts`, `lib/chat-schema.ts` | Multi-provider; context from `buildAIContext()` |
| **Push** | `lib/push.ts`, `lib/push-subscriptions.ts` | web-push; Supabase; VAPID via `/api/push/vapid` |
| **Email** | `lib/email.ts` | Resend for booking confirmations |
| **Daily rotator** | `lib/daily-rotator.ts` | Deterministic daily picks; `pickDaily`, `pickDailyWithKey`, `pickDailySafe` |
| **Right Now scoring** | `lib/right-now-scoring.ts` | Score/rank places for location feed |

---

## 5. Dependencies

### Main Packages

| Package | Use |
|---------|-----|
| next 16.1.6 | App Router, RSC, Turbopack |
| react 19.2.3 | UI |
| next-intl 4.8.3 | i18n, routing |
| @supabase/supabase-js | Bookings, trail reports, push subscriptions |
| @upstash/ratelimit, @upstash/redis | Rate limiting |
| openai | Chat API (OpenAI-compatible) |
| zod 4.x | Validation in APIs |
| resend | Email |
| web-push | Push |
| react-leaflet, leaflet | Maps |
| react-markdown | Markdown rendering |

### Internal Import Map

```
@/data         → pages, API routes, lib (related-places, ai-context, etc.)
@/lib/design-tokens → most components
@/lib/rate-limit    → API routes
@/lib/sanitize      → chat, trail-reports, bookings
@/lib/api-response  → shared response helpers
@/i18n/navigation   → Link, redirect, usePathname, useRouter (locale-aware)
@/components/*      → pages and other components
```

---

## 6. Layout Hierarchy

```
app/layout.tsx (root: html, body, Providers, Nav, BottomNav, SiteFooter)
├── app/page.tsx (home, no locale)
└── app/[locale]/layout.tsx (NextIntlClientProvider, SerwistProvider, StickyPlanBarProvider)
    └── locale pages (padded wrapper)

app/(padded)/layout.tsx (top padding for non-home pages)
```

---

## 7. Dependency Graph (Simplified)

```
Pages
  ├─→ data/index.ts (getPlaceById, allPlaces, etc.)
  ├─→ lib/design-tokens
  ├─→ components/*
  └─→ hooks/* (useItinerary, useRightNowFeed, etc.)

API routes
  ├─→ lib/rate-limit
  ├─→ lib/api-response
  ├─→ lib/sanitize (UGC routes)
  ├─→ lib/supabase (storage routes)
  └─→ data/* (validation, lookups)

Components
  ├─→ lib/design-tokens
  ├─→ data (getPlaceById, etc.)
  ├─→ i18n/navigation (Link)
  └─→ other components

Hooks
  ├─→ data (getPlaceById)
  ├─→ lib/itinerary-share, lib/site-url
  └─→ next/navigation (useSearchParams, useParams)
```

---

## 8. Areas Most Likely to Contain Bugs or Runtime Failures

### 8.1 High Risk

| Area | Reason |
|------|--------|
| **Empty-array edge cases** | `pickDaily`, `pickDailyWithKey` throw on empty arrays. Static data is usually non-empty, but dynamic filters (e.g. `trailIdsWithData` in ThisWeekGrid) can yield `[]`. Use `pickDailySafe` or guard with fallbacks. |
| **External API failures** | Weather (Open-Meteo), Right Now, trail summary, cron jobs — timeouts and network errors. Most have try/catch and fallbacks; watch for missing guards. |
| **Supabase unavailable** | Bookings, trail reports, push — fallback to in-memory or 503. Redis unavailable → rate limit throws; now wrapped in try/catch. |
| **Client async + unmount** | Hooks that do `fetch()` or `setTimeout` and then `setState` can run after unmount. `useRightNowFeed` and `useItinerary` have been hardened with `isMountedRef` and timeout cleanup. |

### 8.2 Medium Risk

| Area | Reason |
|------|--------|
| **Data consistency** | `data/*.ts` uses cross-references (e.g. `combineWith`, `trailIds`). Orphan IDs (typos, removed places) can break lookups. `related-places.test.ts` validates some; restaurants were added after BUG-002. |
| **URL/query parsing** | `?plan=`, `?add=` in plan page; `decodeItinerary`, `usePlanUrlActions`. Malformed URLs can produce invalid state. |
| **Locale + path params** | `params.id` on `/trails/[id]/report`; ConversionTracker path parsing. Non-default locales can alter path structure; ensure ID extraction is locale-aware. |
| **Non-null assertions** | `t!`, `byType.get(t)!` — can fail if assumptions break. Prefer defensive checks or type guards. |

### 8.3 Lower Risk

| Area | Reason |
|------|--------|
| **localStorage** | Quota, disabled, private mode. Code uses try/catch; may silently fail. |
| **Markdown/sanitization** | User input in chat, trail reports. `sanitize.ts` and `safe-url.ts` handle XSS; ensure all UGC paths use them. |
| **In-memory caches** | `weather-live`, `trail-summary-cache`, rate-limit fallback — per-instance; resets on deploy. Acceptable for dev; use Redis for production. |

---

## 9. Testing Strategy

- **Unit tests**: `lib/*.test.ts` (format, search, sanitize, daily-rotator, api-response, rate-limit, itinerary-share, etc.)
- **API tests**: `app/api/*/route.test.ts` (trail-reports, bookings, chat, health)
- **Data tests**: `data/index.test.ts`, `lib/related-places.test.ts`
- **E2E**: Not automated; manual QA per `docs/QA_PLAN.md`
