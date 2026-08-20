# G2 — Partner portal spec (post-submission / months 0–6)

**Status:** Spec only. Do not implement the large portal until PRE-SEED is filed (backlog constraint).  
**Invariant:** Guest `GET /api/bookings` keeps **Bearer session and HMAC lookup token**. Do not introduce a third guest auth scheme.

## Job

A **verified** winery (or guide) can:

1. Update **winter hours** / call-ahead text that Discover and wine-route pages already read from `src/data` or a partner overlay table
2. Set a **hero image URL** or upload that `resolveWineryImage` prefers over regional fallbacks (intake still in `docs/WINERY_IMAGE_INTAKE.md`)
3. **Accept or decline** a tasting/tour **request** already stored as a booking (`status`: `pending` → `confirmed` | `cancelled`)

Reuse `bookings` rows. Do not build a second CRM.

## AuthZ

- Partner session bound to `partnerEmail` on `wineries` / `guides` where `isVerified` is true
- Unauthenticated partner routes: **401**
- Authenticated partner may only read/update rows where `providerId` equals their id (tests must include a foreign `providerId` → 403/404)
- Admin stats stay on the existing HttpOnly admin cookie / `ADMIN_SECRET` Bearer — not this portal

## API sketch (additive)

| Method | Path | Rule |
|--------|------|------|
| POST | `/api/partner/session` | Magic link or password to `partnerEmail`; HttpOnly cookie |
| GET | `/api/partner/bookings` | Filter `providerId = me` |
| PATCH | `/api/partner/bookings/:id` | `{ status: "confirmed" \| "cancelled" }` only if `providerId = me` |
| PATCH | `/api/partner/profile` | `{ openingHours?, imageUrl? }` for own id |

Do **not** change guest POST create-booking or guest GET lookup behaviour besides what those tests already lock.

## Tests (when built)

- Unauthorised 401 on partner GET/PATCH
- Partner A cannot see partner B `providerId`
- Accept/decline updates the same booking id guests see on `/bookings`
- Hours/image updates do not 404 Discover/Book heroes (`data:validate` / image file tests)
- Bookings e2e gate still green

## Out of scope

Payments, inventory calendars, a public “partner marketplace”, replacing email confirmation, or storing partner passwords in git.
