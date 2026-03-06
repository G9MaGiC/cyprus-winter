# Cyprus Winter — SaaS & Booking Extension

**Purpose:** Extend the app from a static guide to a **SaaS platform** with winery bookings, experiences, and user accounts.

---

## Vision

**From:** Static content + AI chat  
**To:** Bookable experiences, user accounts, subscriptions, and winery/tour operator dashboard.

---

## Phases

### Phase 1: Bookings MVP (Current)

- **Winery tastings** — In-app booking form; submits to API; stored in memory/localStorage
- **My Bookings** — `/bookings` page shows user's bookings (localStorage)
- **Request flow** — User fills form → API stores/sends → Confirmation shown
- **No auth** — Bookings keyed by email; no account required

### Phase 2: User Accounts

- **Auth** — NextAuth / Clerk / Supabase Auth
- **Account page** — Profile, saved places, booking history
- **Login/signup** — Email + password or social (Google, Apple)
- **Persist bookings** — Link to user ID instead of localStorage

### Phase 3: Payments & Confirmations

- **Stripe** — Pay for tastings, tours, experiences
- **Booking confirmations** — Email (Resend, SendGrid)
- **Cancellations** — User can cancel; refund policy

### Phase 4: B2B — Winery & Tour Operator Dashboard

- **Vendor portal** — Winery owners log in
- **Manage availability** — Slots, capacity
- **View bookings** — Incoming requests
- **Earnings** — Payouts, reporting

### Phase 5: Subscriptions (SaaS)

- **Premium tier** — Unlock features (e.g. AI itinerary builder, offline maps)
- **Stripe Subscriptions** — Monthly/annual
- **Freemium** — Free: browse, plan; Paid: book, save, premium AI

### Phase 6: Expanded Bookables

- **Tours** — Guided hikes, cultural tours
- **Airport transfers** — Taxi, shuttle
- **Accommodation** — Partner hotels, agrotourism
- **Experiences** — Cooking, pottery, olive oil

---

## Data Models

### Booking (Phase 1)

```ts
type Booking = {
  id: string;
  type: "winery_tasting" | "tour" | "transfer";
  providerId: string;      // winery id, etc.
  providerName: string;
  date: string;            // ISO
  partySize: number;
  guestEmail: string;
  guestName: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  notes?: string;
};
```

### User (Phase 2)

```ts
type User = {
  id: string;
  email: string;
  name?: string;
  bookings: string[];      // booking ids
  savedPlaces: string[];
  createdAt: string;
};
```

---

## Tech Stack (Proposed)

| Layer | Option | Notes |
|-------|--------|-------|
| Auth | NextAuth / Clerk / Supabase | Email, social |
| DB | Supabase / PlanetScale / Vercel Postgres | Bookings, users |
| Payments | Stripe | One-time + subscriptions |
| Email | Resend / SendGrid | Confirmations |
| File storage | Vercel Blob / S3 | Receipts, vouchers |

---

## Routes

| Route | Purpose |
|-------|---------|
| `/book/winery/[id]` | Book winery tasting |
| `/book/tour/[id]` | Book tour (Phase 6) |
| `/bookings` | My bookings |
| `/account` | Profile, history (Phase 2) |
| `/login` | Sign in (Phase 2) |
| `/vendor` | Winery dashboard (Phase 4) |
| `/api/bookings` | Create, list bookings |
| `/api/auth/*` | Auth (Phase 2) |

---

## Current Implementation (Phase 1)

- `POST /api/bookings` — Create booking request (stores in memory; can add Resend to email winery)
- `GET /api/bookings?email=...` — List bookings by email
- `/book/winery/[id]` — Booking form
- `/bookings` — List user's bookings (from localStorage + API)
- `/account` — Placeholder with "Coming soon"
