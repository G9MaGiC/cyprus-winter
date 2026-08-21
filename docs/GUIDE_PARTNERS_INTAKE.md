# Verified guide partners

In-app booking partners (`src/data/guides.ts`) sit above the licensed directory. Real onboarding links a partner row to a licensed directory id via `licensedGuideId`.

## Tiers

| Tier | Source | Booking |
|------|--------|---------|
| Verified partner | `guides.ts` | In-app request → partner portal |
| Licensed directory | Visit Cyprus PDF | Direct phone/email |

## Guide record fields

| Field | Purpose |
|-------|---------|
| `district` | Match plan/trail region → directory filters |
| `languages[]` | Locale-aware match (see `LOCALE_TO_GUIDE_LANGUAGE`) |
| `licensedGuideId` | Optional link to `guides-directory.ts` row after opt-in |
| `partnerEmail` | Partner portal auth (`isVerified: true`) |

## Onboarding checklist

1. Confirm guide is on the official licensed list (or add via `npm run guides:parse-pdf`)
2. Add row to `guides.ts` with real `partnerEmail` (not `@cyprus-winter.example`)
3. Set `licensedGuideId` to the directory row id when the same person/company
4. Set `trailIds`, `district`, and `languages` from their winter offering
5. Partner accepts bookings at `/partner` with `PARTNER_PORTAL_SECRET`

## Demo partners

Current verified rows use example emails for development. Do **not** treat them as real CTO-licensed endorsements until replaced with opted-in partners.

## Match order

1. Verified partners covering the trail, sorted by visitor locale language
2. Licensed directory filtered by district + locale language
3. Full directory browse

See `src/lib/guide-match.ts` and `src/lib/guide-partners.ts`.
