**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Cyprus Winter — Reverse Engineering: All Integration & Contact Points (ICPs)

A reverse-engineered map of all APIs, external services, data flows, and integration touchpoints for the Cyprus Winter tourism app.

---

## 1. Internal API Routes (REST)

### `GET /api/health`
- **Purpose:** Health check, liveness
- **Auth:** None
- **Response:** `{ ok: boolean, ai: boolean }`
- **ai:** `true` if `MOONSHOT_API_KEY` is set
- **Location:** `src/app/api/health/route.ts`

---

### `POST /api/chat`
- **Purpose:** AI assistant chat (Moonshot/Kimi)
- **Auth:** None (rate-limited by Moonshot)
- **Request:**
  ```json
  { "messages": [{ "role": "user"|"assistant", "content": "string" }] }
  ```
- **Response (200):** `{ reply: string }`
- **Errors:** 400 (bad request), 503 (no API key), 500 (AI error), 429 (quota)
- **Location:** `src/app/api/chat/route.ts`
- **External:** Calls `https://api.moonshot.ai/v1` via OpenAI client
- **Context:** `buildAIContext()` injects trails, wineries, attractions into system prompt

---

### `GET /api/bookings?email=<email>`
- **Purpose:** List bookings for an email
- **Auth:** None (email in query)
- **Response:** `{ bookings: Booking[] }`
- **Data:** In-memory store (`src/lib/bookings.ts`); resets on server restart
- **Location:** `src/app/api/bookings/route.ts`

---

### `POST /api/bookings`
- **Purpose:** Create winery tasting booking
- **Auth:** None
- **Request:**
  ```json
  {
    "type": "winery_tasting",
    "providerId": "string",    // winery id, e.g. "tsiakkas"
    "date": "YYYY-MM-DD",
    "partySize": number,
    "guestEmail": "string",
    "guestName": "string",
    "notes": "string"          // optional
  }
  ```
- **Response (200):** `{ booking: Booking, message: "Booking request sent" }`
- **Errors:** 400 (missing/invalid fields, unsupported type), 404 (winery not found), 500
- **Location:** `src/app/api/bookings/route.ts`
- **Data:** Validates against `wineries`; stores in `createBooking()` (in-memory)

---

## 2. Client-Side Storage (localStorage)

| Key | Purpose | Consumer |
|-----|---------|----------|
| `cyprus-bookings` | Array of booking IDs created via app | `WineryBookingForm.tsx`, `bookings/page.tsx` |
| `cyprus-plan` | Plan builder state (STORAGE_KEY) | `plan/page.tsx` |

**Flow:**
- `POST /api/bookings` → success → append `booking.id` to `cyprus-bookings` in localStorage
- `/bookings` reads from both localStorage (IDs) and `GET /api/bookings?email=...` for full data

---

## 3. External Service Integrations

### Moonshot AI (Kimi)
- **Base URL:** `https://api.moonshot.ai/v1`
- **Model:** `moonshot-v1-8k`
- **Env:** `MOONSHOT_API_KEY`
- **Client:** OpenAI SDK with custom `baseURL`
- **Rate limits:** Enforced by Moonshot; 429 on quota exceeded

### Winery / Attraction External URLs (Data-Driven)
Stored in `src/data/wineries.ts` and `src/data/attractions.ts`:

| Field | Usage | Example |
|-------|-------|---------|
| `bookingUrl` | External booking/reservations | `https://www.tsiakkaswinery.com/en/visit` |
| `shopUrl` | Online shop | — |
| `contactPhone` | `tel:` links | `+357 25 944044` |

**Wineries with external booking URLs:**
- Tsiakkas, Vouni Panayia, Zambartas, Santo, Vlassides, Kalopanayiotis (village)

---

## 4. Page Routes & Navigation

| Route | Type | Notes |
|-------|------|-------|
| `/` | SSR | Homepage |
| `/discover` | SSR | Attractions list, filter by type |
| `/discover/[id]` | SSR | Attraction detail; Book CTA → `/book/winery/[id]` or `bookingUrl` |
| `/trails` | SSR | Trails list, filters |
| `/trails/[id]` | SSR | Trail detail |
| `/plan` | Client | Plan builder (localStorage) |
| `/book/winery/[id]` | SSR | Winery booking form |
| `/bookings` | Client | My bookings (localStorage + API) |
| `/account` | SSR | Placeholder |
| `/airport` | SSR | Arrival info |
| `/team` | SSR | Team page |

---

## 5. Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `MOONSHOT_API_KEY` | For chat | Moonshot AI API key |
| `NODE_ENV` | Auto | development / production (affects error stack in chat) |

---

## 6. Data Sources (Static)

| Source | Path | Used By |
|--------|------|---------|
| Trails | `src/data/trails.ts` | trails pages, AI context, plan |
| Wineries | `src/data/wineries.ts` | discover, bookings API, AI context |
| Attractions | `src/data/attractions.ts` | discover, plan, AI context |
| Airports | `src/data/airport.ts` | airport page |
| Team | `src/data/team.ts` | team page |

---

## 7. Deployment & Infrastructure ICPs

### Current Stack
- **Runtime:** Node.js (Next.js 16)
- **Hosting:** Vercel-compatible (SSR, API routes)
- **Build:** `next build` → static + server

### Internet Computer (ICP) Deployment
To deploy on the **Internet Computer** (Dfinity):

1. **Frontend:** Export as static HTML/JS (`next export` or `output: 'export'`) and deploy to asset canister.
2. **API routes:** Cannot run server-side directly. Options:
   - **Option A:** Replace API routes with **canister backend** (Motoko/Rust); call from frontend via `dfx` / agent.
   - **Option B:** Keep APIs on a separate backend (Vercel/Cloudflare) and call from ICP-hosted frontend.
3. **Chat:** Moonshot calls must go through a backend (CORS, API key). On ICP: use a canister as proxy, or keep chat API on Vercel.
4. **Bookings:** Move in-memory store to canister state or external DB.

### Other Deployment Targets
- **Vercel** — Native Next.js support
- **Cloudflare Pages** — With `@cloudflare/next-on-pages` for Edge
- **Docker** — `next start` in container
- **Static export** — `output: 'export'` for CDN-only (no API routes)

---

## 8. Request/Response Schemas Summary

```
GET  /api/health
     → { ok, ai }

POST /api/chat
     ← { messages: [{ role, content }] }
     → { reply } | { error, message }

GET  /api/bookings?email=...
     → { bookings: [{ id, type, providerId, providerName, date, partySize, guestEmail, guestName, status, createdAt, notes? }] }

POST /api/bookings
     ← { type, providerId, date, partySize, guestEmail, guestName, notes? }
     → { booking, message }
```

---

## 9. Security & Privacy Notes

- **No auth:** APIs are public; email is the only identifier for bookings.
- **API key:** `MOONSHOT_API_KEY` must be server-side only (never exposed).
- **In-memory store:** Bookings are lost on restart and not shared across instances.
- **localStorage:** Client-controlled; can be cleared; no integrity check.

---

## 10. UX Perspective — User Touchpoints & Flows

### 10.1 Primary User Journeys

| Journey | Entry points | ICPs | Exit / outcome |
|---------|--------------|------|----------------|
| **Ask AI** | Home hero CTA, Nav “Ask AI”, mobile menu | Floating chat bubble → `POST /api/chat` | Answer + inline links (e.g. `/trails/artemis`) |
| **Book winery** | Home “Book a tasting”, Discover, Attraction detail “Book a tasting” | `/book/winery/[id]` form → `POST /api/bookings` → localStorage | Success state → “View my bookings” or “Discover more” |
| **View bookings** | Nav “Bookings”, Home “My bookings”, post-booking CTA | `/bookings` (localStorage only) | List of bookings or empty state |
| **Plan trip** | Home “Plan trip”, Nav “Plan” | `/plan` (localStorage `cyprus-plan`) | Saved itinerary (client-only) |
| **Discover** | Home, Nav, mood filters | `/discover`, `/discover/[id]` | Detail page with Book / Contact / Shop CTAs |
| **Trails** | Home “Trail conditions”, Nav, mood “Active” | `/trails`, `/trails/[id]` | Trail detail, conditions, “Add to plan” |
| **Arrival** | Home “Just arrived?”, toolkit | `/airport` | LCA/PFO info, transport |

### 10.2 UX Touchpoints by ICP

| ICP | UX role | Strengths | Gaps / friction |
|-----|---------|-----------|------------------|
| **AI chat** | Primary helper, accessible from any page | Voice + text, suggestions, in-context links | No persistence; 429/503 errors feel opaque; no “start over” |
| **Booking form** | Conversion point | Clear fields, success state, dual CTAs | No confirmation email; localStorage vs API mismatch if server restarts |
| **Bookings page** | Trust / review | Status badges, date formatting | Only shows localStorage data; no API sync for “my email” view; no cancel/edit |
| **Plan builder** | Personalization | Adds items from discover/trails | Client-only; lost on device change; no share/export |
| **Attraction detail** | Revenue (Book, Contact, Shop) | Multiple CTAs; “Book on website” for wineries with external URL | Two booking paths (in-app vs external) can confuse |
| **Nav** | Orientation | Clear labels, “Ask AI” prominent | 8 links can feel dense on mobile |

### 10.3 Mobile UX

- **Nav:** Hamburger, 44px min touch targets, “Ask AI” first in mobile menu
- **Safe areas:** `env(safe-area-inset-*)` on nav, main content, bottom CTA
- **Viewport:** `viewportFit: "cover"` for notched devices
- **AI bubble:** Persistent floating button; chat panel overlays content

### 10.4 Friction & Dead Ends

1. **Bookings:** User books via form → server restarts → `GET /api/bookings` returns []; localStorage still has IDs but full data lost. Empty state or partial data.
2. **Plan:** No account → plan tied to device. Switch device = plan gone.
3. **AI 429:** Generic “AI usage limit reached”; no retry or fallback.
4. **Account:** Placeholder only; no sign-in, no “my bookings by email”.
5. **Winery booking paths:** Some wineries: “Book a tasting” (in-app) + “Book on website” (external). User may not understand the difference.

### 10.5 Error & Loading States

| Component | Loading | Error | Empty |
|-----------|---------|-------|-------|
| AI chat | “Thinking…” | Inline error message | N/A |
| Booking form | “Sending…” disabled button | Red banner | N/A |
| Bookings page | “Loading…” | None (falls back to []) | “No bookings yet” + CTA |
| Plan | N/A | N/A | “Add places from Discover or Trails” |

### 10.6 Navigation Hierarchy

```
Home (hero + quick links)
├── Discover (filter by type)
│   └── [id] (Book / Contact / Shop)
├── Trails (filters)
│   └── [id] (Add to plan)
├── Plan (itinerary builder)
├── Bookings (my list)
├── Airport (arrival)
├── Account (placeholder)
└── Team
```

**Ask AI** is a global overlay, not a route.

### 10.7 Recommendations (UX)

- **Bookings:** Unify localStorage + API; add “Enter email to see bookings” on `/bookings` when localStorage empty
- **Plan:** Add export/share (e.g. copy link, PDF) before requiring account
- **AI:** Add retry on 429; optional “New chat” to clear context
- **Account:** Replace placeholder with “Sign in to sync plan & bookings” when Phase 2 lands

---

## 11. Stress Test Endpoints

Script `scripts/stress-test-apis.mjs` exercises:
- `GET /api/health`
- `GET /api/bookings?email=stress@test.local`
- `POST /api/bookings` (with sample payload)
- `POST /api/chat` (if `STRESS_INCLUDE_CHAT=1`)
