**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Partner Integration — Wineries & Guides

**Goal:** 5–7 verified wineries and 2–3 guides by launch.

---

## Wineries — How it works

When a guest books a tasting via the app:

1. **Guest** — Receives confirmation email (if Resend configured).
2. **Winery** — If the winery is a **verified partner** (`isVerified: true` and `partnerEmail` set), they receive a booking request email with guest details so they can confirm directly.

---

## Onboarding a winery partner

1. Reach agreement with the winery (verbal or written) to receive bookings via the app.
2. Get their preferred email for booking requests.
3. In `src/data/wineries.ts`, add to the winery object:

```ts
{
  id: "tsiakkas",
  name: "Tsiakkas Winery",
  // ... existing fields ...
  partnerEmail: "bookings@tsiakkaswinery.com",  // where to send requests
  isVerified: true,                              // enables winery notification
  partnerLeadFeeEur: 5,                          // optional: lead fee per booking
},
```

4. Ensure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set in the environment.

**Note:** Placeholder emails (`bookings+{id}@cyprus-winter.example`) are used for demo. Replace with real partner emails for production.

---

## Verified partner badge

Wineries with `isVerified: true` show a "Verified partner" badge on the booking page (`/book/winery/[id]`) and on cards in Discover and Wineries list.

---

## Guides — How it works

When a guest books a guided hike via the app:

1. **Guest** — Receives confirmation email (if Resend configured).
2. **Guide** — If the guide is a **verified partner** (`isVerified: true` and `partnerEmail` set), they receive a booking request email with guest details and optional trail name. They confirm directly.

---

## Onboarding a guide partner

1. Reach agreement with the guide (verbal or written) to receive bookings via the app.
2. Get their preferred email for booking requests.
3. In `src/data/guides.ts`, add a new guide:

```ts
{
  id: "my-guide",
  name: "My Guide Co",
  region: "Troodos",
  description: "Winter hiking tours...",
  trailIds: ["artemis", "caledonia-falls", "atalante"],  // trail IDs from src/data/trails.ts
  contactPhone: "+357 99 123456",
  bookingUrl: "https://...",
  isVerified: true,
  partnerEmail: "bookings@myguide.com",
  partnerLeadFeeEur: 10,
},
```

4. Trail IDs must match `id` or `slug` in `src/data/trails.ts`.
5. Ensure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set.

**Note:** Placeholder emails (`bookings+{id}@cyprus-winter.example`) are used for demo. Replace with real partner emails for production.

---

## Guide booking entry points

- `/book/guide` — List of all guides
- `/book/guide/[id]` — Booking form for a specific guide
- Trail detail page — "Book a guide" (when status is caution/closed and a guide covers the trail)
