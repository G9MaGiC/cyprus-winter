# Partner Integration — Wineries & Guides

**Goal:** 5–7 verified wineries (or guides, Phase 2) by launch.

---

## How it works

When a guest books a tasting via the app:

1. **Guest** — Receives confirmation email (if Resend configured).
2. **Winery** — If the winery is a **verified partner** (`isVerified: true` and `partnerEmail` set), they receive a booking request email with guest details so they can confirm directly.

---

## Onboarding a partner

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
},
```

4. Ensure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set in the environment.

---

## Verified partner badge

Wineries with `isVerified: true` show a "Verified partner" badge on the booking page (`/book/winery/[id]`).

---

## Guides (Phase 2)

Guides currently have no booking flow. Future work: guide type, booking schema, and partner integration for hiking/cultural tours.
