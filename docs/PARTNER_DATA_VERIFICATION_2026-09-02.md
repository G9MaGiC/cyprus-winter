# Partner and tourism data verification

**Review date:** 2026-09-02  
**Scope:** Records previously marked `isVerified: true` in `src/data/wineries.ts` and `src/data/guides.ts`.

## Verification rule

A public email address, phone number, or booking page proves only that a business can be contacted. It does not prove a commercial partnership, consent to receive bookings from Cyprus Winter, or agreement to a lead fee. `isVerified` must remain false until written partner authorization is stored outside the public repository.

## Wineries reviewed

| Record | Result | Public contact or action | Source |
|---|---|---|---|
| Tsiakkas Winery | Real business and current visitor information verified | visit@tsiakkaswinery.com, +357 96 844111, direct booking page | https://tsiakkaswinery.com/contact-us/ |
| Vouni Panayia Winery | Real business and contact details corroborated | info@vounipanayiawinery.com, +357 99 755159 | https://www.vounipanayiawinery.com/ |
| Zambartas Wineries | Real business, hours, prices, phone and direct booking verified | +357 25 942424, direct booking page | https://zambartaswineries.com/visit-us/ |
| Kolios Winery | Real business, email, phone and seasonal hours verified | kolioswinery@cytanet.com.cy, +357 26 724090 | https://www.kolioswinery.com.cy/contact/ |
| Santo Winery, Limassol | Failed verification | Search resolves to Santo Wines in Santorini, Greece. The Cyprus record is quarantined from public output. | https://santowines.gr/visit-us/ |
| Dómes Sergiou | Real producer, but regular public visits and tastings are not confirmed | +357 99 317070, erin.b@domes-sergiouwinery.com. Removed from booking inventory pending confirmation. | https://wineriesofcyprus.com/item/domes-sergiou-winery/ |

## Guide records reviewed

The following seven brands could not be matched to an official business presence or to the Cyprus Deputy Ministry of Tourism licensed-guide material during this review:

- Cyprus Active Tours
- Troodos Mountain Guides
- Akamas Explorer
- Paphos Forest Guides
- Platres Trail Co
- Cape & Coast Guides
- Nicosia Outdoor

Their telephone numbers follow obvious placeholder patterns, their partner emails use the reserved `.example` domain, and no evidence of booking authorization exists. The records remain in source history with `isPublic: false`, but are excluded from lists, detail routes, structured data, and booking API acceptance.

Official reference used for future onboarding:

- Cyprus Deputy Ministry of Tourism, Tourist Guides List, August 2026: https://www.visitcyprus.com/wp-content/uploads/2026/08/TOURIST_GUIDES_AUG.2026_EN.pdf

## Required evidence before enabling a partner

1. Confirm legal or trading identity.
2. Match a primary official website or official tourism directory entry.
3. Confirm public contact details directly with the operator.
4. Obtain consent to publish the profile.
5. Obtain explicit consent to receive booking requests.
6. Agree response times, cancellation handling, data processing, and any lead fee.
7. Set `isPublic: true` where applicable.
8. Set `isVerified: true` only after the commercial authorization is complete.
9. Store `sourceUrl` and `lastVerifiedAt`.
