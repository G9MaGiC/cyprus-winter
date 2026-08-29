# Cyprus Winter Mode — Technical Specification

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Ref:** PRD.md — Cyprus Winter Mode Super PRD  
**Status:** Implementation Blueprint

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Tech Stack](#2-tech-stack)
3. [Data Models & Schema](#3-data-models--schema)
4. [API Design](#4-api-design)
5. [External Integrations](#5-external-integrations)
6. [PWA & Offline Capabilities](#6-pwa--offline-capabilities)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Security](#8-security)
9. [Deployment & DevOps](#9-deployment--devops)
10. [Monitoring & Observability](#10-monitoring--observability)
11. [Migration & Rollout Strategy](#11-migration--rollout-strategy)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Next.js   │  │   PWA /     │  │  IndexedDB  │  │   Service   │        │
│  │   App       │  │   Install   │  │   Offline   │  │   Worker    │        │
│  └──────┬──────┘  └─────────────┘  └─────────────┘  └──────┬──────┘        │
└─────────┼─────────────────────────────────────────────────┼────────────────┘
          │                                                  │
          │  HTTPS / REST / Server Actions                    │  Background Sync
          │                                                  │  Push / Cache
          ▼                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EDGE / CDN                                      │
│  Vercel Edge / Cloudflare — Static assets, geo-routing, DDoS protection      │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Next.js 16 (App Router)                                             │   │
│  │  • Server Components (static/dynamic)                                │   │
│  │  • Server Actions (mutations)                                        │   │
│  │  • Route Handlers (API)                                              │   │
│  │  • Middleware (auth, geo, A/B)                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DATA LAYER                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  PostgreSQL  │  │    Redis     │  │   Supabase   │  │   Blob/      │    │
│  │  (primary)   │  │  (cache)     │  │  (auth/real- │  │   S3 (media) │    │
│  │              │  │              │  │   time)      │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                                     │
│  Weather API | Trail APIs | Booking Partners | Payment Provider | Analytics  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Breakdown

| Component | Responsibility | Technology |
|-----------|----------------|------------|
| **Frontend** | SSR/SSG pages, client interactivity, PWA shell | Next.js 16, React 19 |
| **API Layer** | REST + Server Actions, rate limiting | Next.js Route Handlers |
| **Database** | Primary store for users, itineraries, bookings | PostgreSQL (Supabase / Neon) |
| **Cache** | Session, geo, weather, trail conditions | Redis (Upstash) |
| **Auth** | OAuth, anonymous, magic link | Supabase Auth / Clerk |
| **Storage** | Images, UGC photos, map tiles | Supabase Storage / S3 |
| **Queue** | Trail report processing, email, notifications | Vercel QStash / Inngest |
| **Search** | Full-text search (attractions, trails, villages) | PostgreSQL FTS / Meilisearch |

### 1.3 Phase-Based Architecture

**Phase 1 (MVP — Current → Nov 2026):**
- Static content: `src/data/*.ts` + Supabase for user-generated data
- Itinerary: `localStorage` primary; optional Supabase trips sync for signed-in users
- Backend: Supabase for bookings, trail reports, trips, conversion tracking
- Email: Resend for booking confirmation and winery notifications (optional; skipped if `RESEND_API_KEY` not set)
- PWA shell with offline content

Data flow: `localStorage` = device cache; Supabase = canonical for bookings; merge on "Load by email" for cross-device sync.

**Phase 2 (Winter Growth — Dec 2026):**
- Itineraries and trail reports in PostgreSQL (partially in place)
- Auth (anonymous + optional account)
- Weather API + cached trail conditions
- In-app booking already live; Phase 2 adds payment, richer flows

**Phase 3 (Full Winter Mode — Q1 2027):**
- In-app booking, payment
- Real-time trail conditions (crowd-sourced)
- Group hike matching
- Push notifications, background sync

---

## 2. Tech Stack

### 2.1 Current Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.x |
| React | React | 19.x |
| Styling | Tailwind CSS | 4.x |
| Language | TypeScript | 5.x |
| Fonts | Fraunces (headings), Plus Jakarta Sans (body) | Google Fonts |

**Currently in use (Phase 1):** Supabase (bookings, trail reports, trips, auth), Resend (transactional email), Leaflet/OpenStreetMap (maps).

### 2.2 Proposed Additions (Phase 2+)

| Category | Technology | Purpose |
|----------|------------|---------|
| **Database** | Supabase (PostgreSQL) | Auth, DB, storage, realtime |
| **ORM** | Drizzle / Prisma | Type-safe schema, migrations |
| **Cache** | Upstash Redis | Sessions, weather cache, rate limit |
| **PWA** | next-pwa / Workbox | Service worker, offline |
| **Maps** | Mapbox / OpenStreetMap | Trail maps, offline tiles |
| **Weather** | Open-Meteo / WeatherAPI | Forecast, alerts |
| **Email** | Resend | transactional, marketing |
| **Analytics** | PostHog / Vercel Analytics | Product analytics, privacy-first |
| **Error Tracking** | Sentry | Frontend + API errors |
| **Payment** | Stripe | Bookings, commissions |

### 2.3 Directory Structure (Target)

```
cyprus-winter/
├── src/
│   ├── app/                    # App Router
│   │   ├── (marketing)/        # Public routes
│   │   │   ├── page.tsx
│   │   │   ├── discover/
│   │   │   ├── airport/
│   │   │   └── team/
│   │   ├── (app)/              # Authenticated / interactive
│   │   │   ├── plan/
│   │   │   ├── trails/
│   │   │   ├── profile/
│   │   │   └── layout.tsx
│   │   ├── api/                # Route handlers
│   │   │   ├── trails/
│   │   │   ├── weather/
│   │   │   ├── itinerary/
│   │   │   └── webhooks/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # Base components
│   │   ├── features/           # Feature-specific
│   │   └── layout/
│   ├── lib/
│   │   ├── db/                 # DB client, queries
│   │   ├── auth/
│   │   ├── cache/
│   │   └── integrations/       # Weather, maps, booking
│   ├── data/                   # Static content (Phase 1)
│   ├── types/
│   └── hooks/
├── public/
│   ├── sw.js                   # Service worker (PWA)
│   ├── offline.html
│   └── manifest.json
├── drizzle/                    # Migrations (Phase 2+)
├── scripts/
└── tests/
```

---

## 3. Data Models & Schema

### 3.1 Core Entities

#### User (Phase 2+)

```typescript
interface User {
  id: string;
  email?: string | null;
  anonymousId: string;           // Device fingerprint for anonymous users
  displayName?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  preferences?: UserPreferences;
  badges?: Badge[];
}

interface UserPreferences {
  homeCity?: string;             // For weather comparison
  interests: ('active' | 'culture' | 'wine' | 'wellness' | 'villages')[];
  travelerType?: 'solo' | 'couple' | 'family' | 'group' | 'nomad';
  notifyTrailConditions: boolean;
  notifyEvents: boolean;
}
```

#### Itinerary (Phase 2+)

```typescript
interface Itinerary {
  id: string;
  userId: string;
  name?: string;                 // e.g. "Maria's Cyprus Trip"
  startDate: Date;
  endDate: Date;
  days: number;
  createdAt: Date;
  updatedAt: Date;
  isShared: boolean;
  shareSlug?: string | null;
}

interface ItineraryDay {
  id: string;
  itineraryId: string;
  dayNumber: number;
  date: Date;
  items: ItineraryItem[];
}

interface ItineraryItem {
  id: string;
  dayId: string;
  entityType: 'attraction' | 'trail' | 'event' | 'booking';
  entityId: string;
  order: number;
  notes?: string;
  startTime?: string;            // "09:00"
}
```

#### Trail & Trail Conditions (Phase 2+)

```typescript
interface Trail {
  id: string;
  slug: string;
  name: string;
  nameEl?: string;               // Greek
  region: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  lengthKm: number;
  elevationGainM: number;
  durationMin: number;
  description: string;
  highlights: string[];
  startPoint: { lat: number; lng: number };
  endPoint: { lat: number; lng: number };
  mapGeoJson?: object;
  bestSeason: ('winter' | 'spring' | 'summer' | 'autumn')[];
  winterNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TrailConditions {
  id: string;
  trailId: string;
  status: 'open' | 'caution' | 'closed';
  surface: 'dry' | 'muddy' | 'snow' | 'icy';
  temperatureC?: number;
  windKmh?: number;
  lastReportedAt: Date;
  source: 'official' | 'crowd' | 'automated';
  officialSource?: string;
  createdAt: Date;
}

interface TrailReport {
  id: string;
  trailId: string;
  userId: string;
  status: 'open' | 'caution' | 'closed';
  surface: 'dry' | 'muddy' | 'snow' | 'icy';
  description: string;
  photos: string[];
  conditionsAt: Date;
  createdAt: Date;
  helpfulCount: number;
  verified: boolean;             // Moderated / trusted user
}
```

#### Attraction (Extended from current)

```typescript
interface Attraction {
  id: string;
  slug: string;
  name: string;
  nameEl?: string;
  region: string;
  description: string;
  type: 'beach' | 'ancient' | 'village' | 'monastery' | 'nature' | 'trail' | 'winery' | 'wellness';
  mood: ('active' | 'culture' | 'wine' | 'wellness' | 'villages' | 'mountains')[];  // Winter taxonomy
  highlights: string[];
  image: string;
  images?: string[];
  bestFor: string[];
  coordinates?: { lat: number; lng: number };
  winterOpen: boolean;
  winterNotes?: string;
  bestTimeToVisit?: string;      // "8am for best light"
  seasonalContent?: {
    activeSeasons: ('winter' | 'spring' | 'summer' | 'autumn')[];
    eventDates?: { start: Date; end: Date; label: string }[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### Event (Phase 2+)

```typescript
interface Event {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: 'festival' | 'market' | 'workshop' | 'guided_hike' | 'wine_tasting';
  locationId: string;
  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  priceFrom?: number;
  bookingUrl?: string;
  winterOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Booking (Phase 3+)

```typescript
interface Booking {
  id: string;
  userId: string;
  partnerId: string;
  type: 'tour' | 'winery' | 'restaurant' | 'spa' | 'rental' | 'ski';
  entityId: string;
  entityName: string;
  scheduledAt: Date;
  participants: number;
  totalAmountCents: number;
  commissionCents: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 PostgreSQL Schema (Drizzle example)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itineraries
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INT NOT NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  share_slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE itinerary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES itinerary_days(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  "order" INT NOT NULL,
  notes TEXT,
  start_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trails
CREATE TABLE trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  length_km DECIMAL(5,2) NOT NULL,
  elevation_gain_m INT NOT NULL,
  duration_min INT NOT NULL,
  description TEXT NOT NULL,
  highlights JSONB DEFAULT '[]',
  start_point JSONB NOT NULL,
  end_point JSONB NOT NULL,
  best_season JSONB DEFAULT '[]',
  winter_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trail_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id UUID REFERENCES trails(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  surface TEXT NOT NULL,
  temperature_c DECIMAL(4,2),
  wind_speed_kmh DECIMAL(5,2),
  last_reported_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL,
  official_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trail_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id UUID REFERENCES trails(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  surface TEXT NOT NULL,
  description TEXT NOT NULL,
  photos JSONB DEFAULT '[]',
  conditions_at TIMESTAMPTZ NOT NULL,
  helpful_count INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX idx_itinerary_days_itinerary_id ON itinerary_days(itinerary_id);
CREATE INDEX idx_itinerary_items_day_id ON itinerary_items(day_id);
CREATE INDEX idx_trail_conditions_trail_id ON trail_conditions(trail_id);
CREATE INDEX idx_trail_reports_trail_id ON trail_reports(trail_id);
CREATE INDEX idx_trail_reports_created_at ON trail_reports(created_at DESC);

-- Full-text search
CREATE INDEX idx_trails_search ON trails USING GIN(to_tsvector('english', name || ' ' || description));
```

---

## 4. API Design

### 4.1 REST Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/attractions` | List attractions (filter by type, mood, season) | Optional |
| GET | `/api/attractions/[id]` | Attraction detail | Optional |
| GET | `/api/trails` | List trails with conditions | Optional |
| GET | `/api/trails/[id]` | Trail detail + latest conditions | Optional |
| GET | `/api/trails/[id]/conditions` | Trail conditions history | Optional |
| POST | `/api/trails/[id]/reports` | Submit trail report | Required |
| GET | `/api/weather` | Weather for region (query: `?lat=&lng=&days=7`) | Optional |
| GET | `/api/events` | Events (filter by date, type) | Optional |
| GET | `/api/itinerary` | Current user itinerary | Required |
| POST | `/api/itinerary` | Create itinerary | Required |
| PATCH | `/api/itinerary/[id]` | Update itinerary | Required |
| POST | `/api/itinerary/[id]/items` | Add item to day | Required |
| DELETE | `/api/itinerary/[id]/items/[itemId]` | Remove item | Required |
| GET | `/api/itinerary/share/[slug]` | Public shared itinerary | Public |
| POST | `/api/bookings` | Create booking (Phase 3) | Required |
| GET | `/api/user/preferences` | User preferences | Required |
| PATCH | `/api/user/preferences` | Update preferences | Required |

### 4.2 Server Actions

```typescript
// src/app/actions/itinerary.ts
'use server';

export async function addToItinerary(dayId: string, entityType: string, entityId: string) { ... }
export async function removeFromItinerary(itemId: string) { ... }
export async function reorderItineraryItems(dayId: string, itemIds: string[]) { ... }
export async function shareItinerary(itineraryId: string) { ... }

// src/app/actions/trail-report.ts
'use server';

export async function submitTrailReport(trailId: string, data: TrailReportInput) { ... }
export async function markReportHelpful(reportId: string) { ... }
```

### 4.3 Response Formats

**Success (200):**
```json
{
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 45 }
}
```

**Error (4xx/5xx):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid trail status",
    "details": [ { "field": "status", "message": "Must be open, caution, or closed" } ]
  }
}
```

### 4.4 Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Public read (attractions, trails, weather) | 100 req/min per IP |
| Trail report submit | 5 req/hour per user |
| Itinerary mutations | 60 req/min per user |
| Booking | 10 req/min per user |

### 4.5 Stress Testing

**Command:**
```bash
# Basic test (respects rate limits)
npm run stress:api

# With rate limit bypass (development only)
STRESS_BYPASS=1 node scripts/stress-test-apis.mjs http://localhost:3000 30 60

# With chat API included
STRESS_INCLUDE_CHAT=1 STRESS_BYPASS=1 node scripts/stress-test-apis.mjs
```

**Configuration:**
- `STRESS_BYPASS=1` - Adds `x-stress-test: bypass` header to bypass rate limits
- `STRESS_TEST_TOKEN=<token>` - Production bypass token (set in environment)
- Concurrency and duration: `node scripts/stress-test-apis.mjs <url> <concurrency> <durationSec>`

**Current Performance (30 concurrent users):**
| Endpoint | RPS | Success Rate | Avg Latency |
|----------|-----|--------------|-------------|
| Health | 219 | 100% | 136ms |
| Get Bookings | 163 | 100% | 183ms |
| Create Booking | 188 | 100% | 159ms |

See `docs/STRESS_TEST_RESULTS.md` for detailed analysis.

---

## 5. External Integrations

### 5.1 Weather

| Provider | Use Case | Fallback |
|----------|----------|----------|
| Open-Meteo | Primary (free, no key) | — |
| WeatherAPI.com | Backup | Open-Meteo |

**Integration:**
```typescript
// GET https://api.open-meteo.com/v1/forecast?latitude=34.68&longitude=33.04&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&timezone=Europe/Nicosia
```

**Cache:** 1 hour for forecast, 15 min for current conditions.

### 5.2 Maps

| Provider | Use Case |
|----------|----------|
| Mapbox | Interactive maps, offline tiles (Phase 2) |
| OpenStreetMap | Fallback, static map images |

**Offline:** Pre-download GeoJSON for Troodos trails; tile cache via Service Worker.

### 5.3 Booking Partners (Phase 3)

| Partner Type | Integration Method |
|--------------|-------------------|
| Tour guides | Manual entry → redirect / iframe |
| Wineries | API (if available) or redirect |
| Restaurants | Resy / TheFork API or redirect |
| Accommodation | Affiliate links (Booking.com, Airbnb) |

**Commission tracking:** UTM params + server-side attribution.

### 5.4 Push Notifications

| Provider | Use Case |
|----------|----------|
| VAPID (Web Push) | Trail conditions, events, itinerary reminders |
| OneSignal / Firebase | Optional mobile wrapper |

---

## 6. PWA & Offline Capabilities

### 6.1 PWA Manifest

```json
{
  "name": "Cyprus Winter — Plan Ahead or Start Exploring",
  "short_name": "Cyprus Winter",
  "description": "Discover Cyprus in winter: trails, ancient sites, villages, heritage",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f4f1de",
  "theme_color": "#E07A5F",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 6.2 Caching Strategy

| Resource | Strategy | TTL |
|----------|----------|-----|
| Static (JS, CSS, fonts) | Cache-first | 1 year |
| HTML pages | Network-first, fallback cache | — |
| API: attractions, trails | Stale-while-revalidate | 24h |
| API: weather | Network-first, cache 1h | 1h |
| API: trail conditions | Network-first, cache 15m | 15m |
| Images | Cache-first | 30 days |
| Offline page | Cache-first | — |

### 6.3 Offline Features

- **Offline page:** `/offline` when network fails
- **Itinerary:** Synced to IndexedDB when online; readable offline
- **Attractions/Trails:** Pre-cached on first visit
- **Maps:** Downloadable Troodos region (GeoJSON + tiles)

### 6.4 Background Sync

- Queue itinerary changes when offline
- Sync when connection restored
- Push: "Trail conditions updated for Artemis Trail"

---

## 7. Authentication & Authorization

### 7.1 Auth Modes

| Mode | Use Case |
|------|----------|
| **Anonymous** | Browse, build itinerary (localStorage only in Phase 1) |
| **Anonymous + Device ID** | Persist itinerary across sessions without account |
| **Email / Magic Link** | Save itinerary, reviews, trail reports |
| **OAuth (Google, Apple)** | One-tap sign-up |

### 7.2 Permissions

| Action | Anonymous | Authenticated |
|--------|-----------|---------------|
| View content | ✅ | ✅ |
| Build itinerary (local) | ✅ | ✅ |
| Save itinerary (cloud) | ❌ | ✅ |
| Submit trail report | ❌ | ✅ |
| Submit review | ❌ | ✅ |
| Book experience | ❌ | ✅ |
| Share itinerary | ❌ | ✅ |

### 7.3 Session

- **Anonymous:** `anon_` + UUID in cookie/localStorage
- **Authenticated:** JWT in httpOnly cookie, 7-day expiry
- **Refresh:** Sliding window on activity

---

## 8. Security

### 8.1 Data Protection

- HTTPS only (TLS 1.3)
- No PII in client logs or analytics (hash/anonymize)
- Encrypt sensitive fields at rest (payment, email)

### 8.2 Input Validation

- Zod schemas for all API/Server Action inputs
- Sanitize HTML in UGC (reviews, trail reports)
- File upload: type/size limits (images only, max 5MB)

### 8.3 Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### 8.4 GDPR / Privacy

- Cookie consent banner (EU)
- Data export + delete (account settings)
- Analytics: PostHog with IP anonymization, no cross-site tracking

---

## 9. Deployment & DevOps

### 9.1 Hosting

| Environment | Platform |
|-------------|----------|
| Production | Vercel |
| Preview | Vercel (per PR) |
| Staging | Vercel (staging branch) |

### 9.2 CI/CD

```yaml
# .github/workflows/ci.yml
- lint
- typecheck
- test
- build
- deploy (Vercel)
```

### 9.3 Environments

| Env | DB | Cache | API Keys |
|-----|-----|-------|----------|
| Development | Local / Supabase dev | Upstash dev | .env.local |
| Staging | Supabase staging | Upstash staging | Vercel env |
| Production | Supabase prod | Upstash prod | Vercel env (secret) |

### 9.4 Build Output

- Static: ISR for `/discover`, `/airport`, `/team`
- Dynamic: `/plan`, `/trails`, `/api/*`
- Edge: Middleware (geo, A/B)

---

## 10. Monitoring & Observability

### 10.1 Metrics

| Metric | Tool | Alert |
|--------|------|-------|
| Uptime | Vercel / Better Uptime | Downtime > 1 min |
| Errors | Sentry | Error rate > 1% |
| Latency | Vercel Analytics | p95 > 3s |
| API usage | Custom | Rate limit breaches |

### 10.2 Logging

- Structured JSON logs
- Log levels: `error`, `warn`, `info`, `debug`
- Correlation ID for request tracing

### 10.3 Dashboards

- **Product:** MAU, itinerary starts, trail report submissions, booking conversion
- **Technical:** Error rate, latency, cache hit ratio, DB connections

---

## 11. Migration & Rollout Strategy

### 11.1 Phase 1 → Phase 2 Migration

| Current | Target | Migration |
|---------|--------|-----------|
| `src/data/attractions.ts` | `attractions` table | Seed script; keep TS as fallback |
| `localStorage` itinerary | `itineraries` table | On sign-up: prompt "Import your plan?" |
| No auth | Supabase Auth | Introduce optional account; anonymous first |

### 11.2 Rollout Plan

1. **Week 1–2:** Winter UI (terracotta/olive theme), design tokens
2. **Week 3–4:** Trail data (25 trails), `/trails` page, static conditions
3. **Week 5–6:** DB setup, auth, itinerary persistence
4. **Week 7–8:** Weather API, trail conditions (manual → automated)
5. **Week 9–10:** PWA, offline support, manifest
6. **Week 11–12:** Trail reports (UGC), reviews
7. **Week 13:** Beta with 50 users
8. **Week 14:** Launch Nov 1, 2026

### 11.3 Feature Flags

- `winter_mode` — Toggle winter UI
- `trail_conditions` — Trail status feature
- `trail_reports` — UGC trail reports
- `group_hikes` — Matching feature
- `booking` — In-app booking

---

## Appendix A: Environment Variables

```env
# Database
DATABASE_URL=
DIRECT_URL=

# Auth (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cache (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Weather
OPEN_METEO_BASE=https://api.open-meteo.com

# Maps (Phase 2)
NEXT_PUBLIC_MAPBOX_TOKEN=

# Payment (Phase 3)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Errors
SENTRY_DSN=
```

---

## Appendix B: Key Dependencies to Add

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "@upstash/redis": "^1.x",
    "drizzle-orm": "^0.30.x",
    "zod": "^3.x",
    "next-pwa": "^5.x"
  },
  "devDependencies": {
    "drizzle-kit": "^0.21.x"
  }
}
```

---

*This document should be updated as implementation progresses. All technical decisions must align with PRD.md and the Cyprus Winter Mode product vision.*
