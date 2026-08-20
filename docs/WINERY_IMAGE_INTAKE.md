# Partner winery image intake

Workflow for replacing generic/regional winery hero images with **venue-accurate** photos. Code path: `resolveWineryImage()` in `src/lib/cyprus-images.ts` (used by Discover, Book, home featured).

**Backlog:** Most listings still use wine-route regional fallbacks (see `docs/QA_BUGS.md` BUG-125–136, BUG-154). G10 added village-accurate CC assets; tasting-room interiors still need partners.

---

## Priority tiers

| Tier | Who | Count (approx.) | Target |
|------|-----|-----------------|--------|
| **P0** | `isVerified: true` partners | 6 | Week 1 |
| **P1** | Home featured + wine-route heroes | 3 featured + route pages | Week 1–2 |
| **P2** | All Krasochoria / Laona / Commandaria listings | ~40 | Month 1 |
| **P3** | Remaining wineries | ~15 | As partners respond |

### P0 verified partner IDs (data layer)

| ID | Name | Current image source |
|----|------|----------------------|
| `tsiakkas` | Tsiakkas Winery | Per-id → `winery-tsiakkas.jpg` (Pelendri vineyard, CC BY 2.0) |
| `vouni-panayia` | Vouni Panayia | Per-id → `cyprus-vineyard-laona.jpg` (Laona regional) |
| `zambartas` | Zambartas | Per-id → `cyprus-vineyard-lofou-january.jpg` (Krasochoria winter) |
| `kolios` | Kolios | Per-id → `cyprus-vineyard-mountain.jpg` (Pitsilia regional) |
| `santo` | Santo | Per-id → `cyprus-vineyard-lofou-january.jpg` (Krasochoria winter) |
| `domes-sergiou` | Dómes Sergiou | Partner asset `domes-sergiou-hero.png` ✓ |

`kyperounta` is listed in some older notes but is **not** `isVerified` in `src/data/wineries.ts`. It stays on the Pitsilia mountain regional photo.

---

## What we need from partners

### Image spec

| Field | Requirement |
|-------|-------------|
| **Subject** | Tasting room, terrace, cellar, or vineyard **at their property** — not stock |
| **Dimensions** | Min **1200×800** (3:2 or 16:9 crop OK) |
| **Format** | JPEG or WebP; PNG only if transparency required |
| **Max file size** | ≤ 800 KB after export (we resize to max 1920px width) |
| **Rights** | Written permission to use on cypruswinter.com + app; name photographer if required |
| **Season** | Winter/autumn preferred; avoid heavy summer beach stock look |

### Partner email template (copy-paste)

> Subject: Cyprus Winter — hero photo for [Winery name]
>
> We're listing [Winery name] on Cyprus Winter (winter tourism for Cyprus). To show your venue accurately, we need one hero photo:
> - Your tasting room, terrace, or vineyard (1200×800 min, JPEG)
> - Permission to display on our website and app
>
> Reply with attachment or a download link. We'll credit the photographer if you specify.

---

## Engineering workflow (when asset arrives)

### 1. File naming

Save under `public/images/cyprus/`:

```
winery-{id}.jpg
```

Examples: `winery-tsiakkas.jpg`, `winery-vouni-panayia.jpg`

Use lowercase id from `src/data/wineries.ts` (hyphens as in data).

### 2. Resize (local)

```bash
cd public/images/cyprus
sips -Z 1920 winery-{id}.jpg
```

### 3. Wire in code

Add to `wineryImages` in `src/lib/cyprus-images.ts`:

```typescript
const wineryImages: Record<string, string> = {
  // ...
  tsiakkas: `${local}/winery-tsiakkas.jpg`,
};
```

**Do not** duplicate in `wineries.ts` `image` field — book/discover use `getAttractionImage(id, "winery")`.

### 4. Attribution (if CC or licensed)

Add row to `docs/QA_BUGS.md` under image attributions:

| File | Source | License |

For partner-provided images: note "Partner provided, [date], [contact]".

### 5. Verify

```bash
npm run test -- src/lib/cyprus-images.test.ts
npm run data:validate
npm run build
```

Manual: `/discover/{id}`, `/book/winery/{id}`, home featured if applicable.

---

## Wikimedia / CC fallback (when partner silent)

Use only when image **clearly depicts the venue or its village**:

1. Search [Wikimedia Commons](https://commons.wikimedia.org) with winery name + Cyprus
2. Confirm license (CC BY / BY-SA / CC0)
3. Download, resize, name `winery-{id}.jpg` or reuse regional asset
4. Log attribution in `docs/QA_BUGS.md`

**Do not** use generic vineyard photos that could be any country/winery without documenting as regional fallback.

Regional fallbacks (no per-id map) live in `wineRouteImages` — already wired for Laona, Krasochoria, Commandaria, etc.

---

## QA checklist per winery

- [ ] Hero on Discover detail matches venue (or documented regional fallback)
- [ ] Book tasting page uses same image as Discover (`getAttractionImage`)
- [ ] OG/social preview acceptable (optional: check metadata on book page)
- [ ] No broken image (404)
- [ ] File committed to repo (no hotlinked external URLs in production heroes)

---

## Metrics

Track in partner sprint:

| Metric | Baseline (May 2026) | Aug 2026 (G10) | Target |
|--------|----------------------|----------------|--------|
| Wineries with per-id image | ~12 / 71 | 15 / 72 | 25 |
| Verified partners with venue or village-accurate photo | 1 / 6 (domes-sergiou) | 2 / 6 (domes + Tsiakkas Pelendri CC); 2 Krasochoria on Lofou winter CC; 2 still Laona/mountain regional | 6 / 6 tasting-room or partner shots |
| Broken image paths | 0 | 0 (asserted in `cyprus-images.test.ts`) | 0 |

---

## Related

- `src/lib/cyprus-images.ts` — `wineryImages`, `wineRouteImages`, `resolveWineryImage()`
- `docs/LAUNCH_CHECKLIST.md` — content gate for soft launch
- `docs/QA_BUGS.md` — BUG-125–136 image audit
