# G2 — Partner portal spec (post-submission / months 0–6)

**Status:** Thin MVP shipped (`/partner` + `/api/partner/*`). Not a second CRM. Overlay hours/hero are **in-memory per process** (reset on deploy/cold start) until a durable table is funded. Magic-link email is still out of scope.  
**Invariant:** Guest `GET /api/bookings` keeps **Bearer session and HMAC lookup token**. Do not introduce a third guest auth scheme.

## Job

A **verified** winery (or guide) can:

1. Update **winter hours** / call-ahead text that Discover, Book, and wine-route cards read via `placeCardHours` / `applyPartnerOpeningHours`
2. Set a **local hero path** under `/images/cyprus/` that `resolveWineryImage` prefers over regional fallbacks (intake still in `docs/WINERY_IMAGE_INTAKE.md`)
3. **Accept or decline** a tasting/tour **request** already stored as a booking (`status`: `pending` → `confirmed` | `cancelled`)

Reuse `bookings` rows. Do not build a second CRM.

## AuthZ

- Partner session bound to `partnerEmail` on `wineries` / `guides` where `isVerified` is true
- Bootstrap: shared `PARTNER_PORTAL_SECRET` (min 16 chars) **plus** that verified email — not per-winery passwords in git, not magic-link v1
- Example verified email: `bookings+tsiakkas@cyprus-winter.example` (`tsiakkas`)
- Unauthenticated partner routes: **401**
- Authenticated partner may only read/update rows where `providerId` equals their id (tests include a foreign `providerId` → **403**)
- Admin stats stay on the existing HttpOnly admin cookie / `ADMIN_SECRET` Bearer — not this portal
- Chat must not deep-link `/partner` (`isSafeInternalPath` stays false)

## API (additive)

| Method | Path | Rule |
|--------|------|------|
| POST | `/api/partner/session` | `{ email, secret }` → HttpOnly `cw_partner_sess` |
| GET | `/api/partner/session` | Ping current partner cookie |
| DELETE | `/api/partner/session` | Logout |
| GET | `/api/partner/bookings` | Filter `providerId = me` |
| PATCH | `/api/partner/bookings/:id` | `{ status: "confirmed" \| "cancelled" }` only if `providerId = me` |
| GET | `/api/partner/profile` | Overlay for `me` |
| PATCH | `/api/partner/profile` | `{ openingHours?, imageUrl? }` for own id; unsafe image URLs **400** |

Do **not** change guest POST create-booking or guest GET lookup behaviour besides what those tests already lock.

## Tests

- Unauthorised 401 on partner GET/PATCH
- Partner A cannot see partner B `providerId`
- Accept/decline updates the same booking id guests see via lookup-token
- Hours/image updates do not 404 Discover/Book heroes (`data:validate` / image file tests)
- Partner cookie is not guest booking auth

## Out of scope

Payments, inventory calendars, a public “partner marketplace”, replacing email confirmation, storing partner passwords in git, durable overlay storage, or magic-link email.
