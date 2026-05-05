**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Partner Outreach — Winery & Experience Integrations

**Purpose:** Secure 5–7 live in-app booking partners by Nov 1, 2026.  
**Ref:** [ROADMAP](ROADMAP.md) Tier 3, Product Decision Plan

---

## 1. Wineries with Booking Potential

Prioritized by: (a) has `bookingUrl` or strong contact info, (b) `winterOpen`, (c) tasting/booking info. Source: [src/data/wineries.ts](../src/data/wineries.ts).

### Tier A — High priority (already have online presence)

| Winery | Region | Contact | Notes |
|--------|--------|---------|-------|
| Tsiakkas | Pelendri (Limassol) | [tsiakkaswinery.com](https://www.tsiakkaswinery.com/en/visit), +357 25 944044 | Krasochoria route, winter terrace |
| Vouni Panayia | Panayia (Paphos) | [vounipanayiawinery.com](https://www.vounipanayiawinery.com/visit), +357 26 722222 | Laona, Commandaria specialist |
| Zambartas | Agios Amvrosios (Limassol) | [zambartaswineries.com](https://www.zambartaswineries.com/visit), +357 25 942424 | Easy Limassol drive |
| Santo | Lemesos | [santowinery.com](https://www.santowinery.com/reservations), +357 25 936666 | Restaurant + tasting, sea views |
| Vlassides | Kilani (Limassol) | [vlassideswinery.com](https://www.vlassideswinery.com), +357 25 472220 | Boutique |
| Domes Sergiou | Pelendri | [domeswinery.com](https://domeswinery.com/pages/contact) | Krasochoria |
| Hadjicharalambous | Omodos | [hchwinery.com](https://hchwinery.com/), +357 26 632145 | Krasochoria |
| Pittali | Lemesos | [pittaliwinery.com](https://pittaliwinery.com), +357 25 452000 | Krasochoria |
| Papaioannou | Limassol | [papaioannouwinery.com](https://papaioannouwinery.com/), +357 25 944500 | Boutique |
| Antoniades | Limassol | [antoniadeswinery.com](https://www.antoniadeswinery.com/), +357 25 422638 | Boutique |

### Tier B — Strong candidates (contact phone, winter open)

| Winery | Region | Contact | Notes |
|--------|--------|---------|-------|
| Kolios | Statos-Ayios Fotios (Paphos) | [kolioswinery.com.cy](https://www.kolioswinery.com.cy/book-a-table/), +357 26 724090 | Laona route, lunch + tasting, book ahead |
| Kyperounta | Kyperounta (Troodos) | +357 25 452123 | High altitude, call ahead (snow) |
| Tsangarides | Lemona (Paphos) | +357 26 732222 | Organic, Laona |
| Fikardos | Stroumbi (Paphos) | +357 26 632145 | Boutique, terrace |
| Vasilikon | Kathikas | +357 26 632138 | Akamas route |
| Olympus Winery | Pelendri | +357 25 442156 | Krasochoria |
| Sterna Boutique | Limassol | +357 25 421234 | Boutique, hilltop |
| Chrysoroyiatissa Winery | Pano Panayia | +357 26 722200 | Monastery winery |

### Tier C — Expansion (60+ total in data)

Use same criteria: `winterOpen`, `contactPhone` or `bookingUrl`, `tastingInfo`. Full list in `src/data/wineries.ts`.

---

## 2. Outreach Template

**Subject:** Cyprus Winter — free listing + in-app bookings for [Winery Name]

**Body (short):**

> Hi [Name],
>
> Cyprus Winter is a travel app for winter visitors to Cyprus. We feature trails, villages, wineries, and experiences — and help travellers book tastings and tours in-app.
>
> We’d like to add [Winery Name] and offer in-app booking. Benefits:
> - Free listing in Discover and Plan
> - Bookings sent directly to your email
> - Winter-focused audience (UK, Poland, Germany, Scandinavia)
>
> No integration cost. We only ask to list your tasting options and send requests to [email].
>
> Would you be open to a 10-minute call to discuss?

**Follow-up:** 1 week if no reply. Offer demo link.

---

## 3. Pipeline Tracking

| Stage | Count target | Notes |
|-------|--------------|-------|
| Contacted | 15+ | Email/call Tier A + B |
| Responded | 5+ | Positive or interested |
| Pilot | 2–3 by Q2 2026 | Add `partnerEmail`, `isVerified` to data |
| Live | 5–7 by Oct 2026 | In-app booking active |

**Data fields for live partners:**  
In [src/data/wineries.ts](../src/data/wineries.ts): `partnerEmail`, `isVerified: true`, optional `partnerLeadFeeEur`.

---

## 4. Next Steps

1. Finalise outreach list (pick 10 from Tier A+B).
2. Send first batch (5) this week.
3. Log responses in this doc or a spreadsheet.
4. Add pilot wineries to data with `isVerified` when agreed.
