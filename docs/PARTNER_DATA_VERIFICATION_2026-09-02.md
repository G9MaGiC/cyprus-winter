# Partner and tourism data verification

**Review date:** 2026-09-02
**Scope:** Records previously marked `isVerified: true` in `src/data/wineries.ts` and `src/data/guides.ts`, plus the records derived from them.
**Re-applied:** 2026-09-12 onto current `main` (the original branch predated the 7-locale content register; this revision also quarantines the derived `santo-restaurant` and `santo-sunset` records the original pass missed, and unverifies the seven draft guide brands instead of relying on `isPublic` alone).

## Verification rule

A public email address, phone number, or booking page proves only that a business can be contacted. It does not prove a commercial partnership, consent to receive bookings from Cyprus Winter, or agreement to a lead fee. `isVerified` must remain false until written partner authorization is stored outside the public repository.

## Wineries reviewed

| Record | Result | Public contact or action | Source |
|---|---|---|---|
| Tsiakkas Winery | Real business and current visitor information verified | visit@tsiakkaswinery.com, +357 96 844111, direct booking page | https://tsiakkaswinery.com/contact-us/ |
| Vouni Panayia Winery | Real business and contact details corroborated | info@vounipanayiawinery.com, +357 99 755159 | https://www.vounipanayiawinery.com/ |
| Zambartas Wineries | Real business, hours, prices, phone and direct booking verified | +357 25 942424, direct booking page | https://zambartaswineries.com/visit-us/ |
| Kolios Winery | Real business, email, phone and seasonal hours verified | kolioswinery@cytanet.com.cy, +357 26 724090 | https://www.kolioswinery.com.cy/contact/ |
| Santo Winery, Limassol | Failed verification | Search resolves to Santo Wines in Santorini, Greece. The Cyprus record is quarantined from public output, together with the derived `santo-restaurant` record and the `santo-sunset` secret gem. | https://santowines.gr/visit-us/ |
| Dómes Sergiou | Real producer, but regular public visits and tastings are not confirmed | +357 99 317070, erin.b@domes-sergiouwinery.com. Removed from booking inventory pending confirmation; listing copy no longer claims tastings. | https://wineriesofcyprus.com/item/domes-sergiou-winery/ |

## Guide records reviewed

The following seven brands could not be matched to an official business presence or to the Cyprus Deputy Ministry of Tourism licensed-guide material during this review:

- Cyprus Active Tours
- Troodos Mountain Guides
- Akamas Explorer
- Paphos Forest Guides
- Platres Trail Co
- Cape & Coast Guides
- Nicosia Outdoor

Their telephone numbers follow obvious placeholder patterns, their partner emails use the reserved `.example` domain, and no evidence of booking authorization exists. The records remain in source history with `isVerified: false` and `isPublic: false`, and are excluded from lists, detail routes, structured data, and booking API acceptance.

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

## Second-pass winery quarantine

With project-owner approval, the following records were retained in source history but set to `isPublic: false` and `isBookable: false` after they could not be corroborated reliably, appeared to duplicate another winery identity, or used placeholder-style operational details:

- `ktima-vassiliades` (duplicate identity risk with Oenou Yi, Ktima Vassiliades)
- `olympus-winery` (duplicate identity risk with ETKO / Olympus)
- `tria-elit`
- `nichteri`
- `meletiou`
- `iona`
- `komos`
- `adege`
- `syndesmos`
- `savvas`
- `cholettis`
- `yiannis`
- `petrides`
- `monagri`
- `loukas`
- `stavrinos`
- `krasas`
- `agios-theodoros`
- `ambeli`
- `povis`
- `lambouri`
- `zambeli`
- `linos`
- `makrikontas`
- `fikardou-winery`
- `sygkrasi`

Quarantine is reversible. A record may be restored after a primary business website, official tourism listing, current operational contact details, and publication status are verified. Overlay translations for quarantined records stay in the locale catalogs so restoration restores their translations.

## Source-confirmed records tagged in the second pass

Primary business URLs and `lastVerifiedAt` metadata were added for:

- Kyperounta Winery
- Domaine Vlassides
- Christoudia Winery
- Fikardos Winery
- Vasilikon Winery
- Makarounas Winery
- Argyrides Winery
- Kalamos Winery
- Mystes Winery
- Oenou Yi Winery
- Hadjicharalambous Boutique Winery
- Pittali Winery
- Papaioannou Winery
- M. Antoniades Winery
