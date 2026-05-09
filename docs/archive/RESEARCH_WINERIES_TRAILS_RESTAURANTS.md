**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Research: Wineries, Trails & Restaurants

*Compiled March 2026. Aligned with Cyprus Winter's Mediterranean, discovery-first positioning.*

---

## 1. WINERIES

### Coverage landscape
- **100+** listed on wineriesofcyprus.com
- **65+** established producers
- **Key sources:** wineriesofcyprus.com, CBN "9 wineries", Tripadvisor 47 results

### Regions
| Region | Notes |
|--------|------|
| Limassol (Krasochoria) | 40+ wineries; heartland |
| Paphos | Laona, Akamas wine villages |
| Troodos | High-altitude, ski + wine |
| Larnaca | Corridor (e.g. Domes Sergiou) |
| Nicosia | Fewer; outskirts |

### Notable additions NOT in `wineries.ts`
| Winery | Region | Why |
|--------|--------|-----|
| Mystes | Krasochoria | Established, tasting room |
| Oenou Yi | Krasochoria | Modern, indigenous |
| Sterna Boutique | Paphos | Boutique, Laona |
| Chrysoroyiatissa | Paphos | Monastery winery (distinct from Chrysorrogiatissa monastery) |
| Povis | Paphos | Small producer |
| Hadjicharalambous | Limassol | Traditional |
| Pittali | Krasochoria | Family-run |
| Papaioannou | Krasochoria | Long-standing |
| LOEL | Limassol | Historic brand |
| ETKO / Olympus | Limassol | Heritage producer |
| Mallia | Krasochoria | |
| Karseras | Paphos | Laona |
| Revecca | Limassol | |
| Antoniades | Krasochoria | |
| Evangelou | Paphos | |
| Monolithos | Limassol | |
| Silikou Commandaria Museum | Silikou | Commandaria heritage, museum |

**Domes Sergiou** is already in the app ✓

---

## 2. TRAILS

### Coverage landscape
- **99** official trails (Department of Forests, moa.gov.cy; VisitCyprus)
- **239** on AllTrails
- **~15** currently in `trails.ts`

### Sources
- Department of Forests (moa.gov.cy)
- VisitCyprus (visitcyprus.com)
- feelaliveoutdoors.com
- AllTrails
- Lonely Planet

### Key gaps
- More Troodos trails (Atalante, Artemis, Persephone, Horteri, Olympus, Madari, Caledonia, Millomeris, Caledonia Long covered; many more exist)
- Akamas trails (Adonis, Aphrodite covered; Smigies, Stavros tis Psokas, Pissouromoutti, etc.)
- Coastal paths (Cape Greco, Petra tou Romiou covered; more E4 sections)
- E4 long-distance sections (Madari touches it; full E4 segments)

---

## 3. RESTAURANTS

### Current app state
- **No** dedicated restaurant data
- Taverna mentions only in secret-gems (Zygi, Governor's Beach coves, Polis harbour, Psilo Dendro, Kouklia)

### Wiz 50 Best 2025 — Top entries
| Rank | Name | Region | Style |
|------|------|--------|-------|
| 1 | The Polo | Limassol | Fine dining |
| 2 | Seasons Oriental | Limassol | Asian fusion |
| 3 | Cor Gastronomy | Limassol | Fine dining |
| 4 | The Farmyard | Kathika (Paphos) | Farm-to-table |
| 5 | Sentio | Nicosia | Contemporary |
| — | (+ many more) | — | — |

### Cyprus Winter fit
Focus on:
- Tavernas and fish spots (Zygi, Polis, Governor's Beach)
- Village lunch options (Omodos, Platres trout, Kakopetria)
- Winery restaurants (Santo already has one)
- Fine dining for special occasions (The Polo, Cor, Sentio)
- Places that stay open in winter

---

## 4. PROPOSED RESTAURANT TYPE

Aligned with `Winery` and `Attraction` patterns in `src/data/*.ts`:

```ts
export type Restaurant = {
  id: string;
  name: string;
  region: string;
  description: string;
  type: "restaurant";
  /** taverna | fine-dining | fish | meze | contemporary */
  cuisine: string;
  highlights: string[];
  bestFor: string[];
  /** Winter opening (Dec–Mar) */
  winterOpen?: boolean;
  /** e.g. "12–15:30, 19–23" */
  openingHours?: string;
  /** International format */
  contactPhone?: string;
  /** Reserve online */
  bookingUrl?: string;
  /** Winter-specific tip */
  winterTip?: string;
  /** Best time to visit */
  bestTimeToVisit?: string;
  /** Insider tip */
  localSecret?: string;
  /** Related place IDs (trail, winery, attraction) for day combos */
  combineWith?: string[];
  /** € | €€ | €€€ */
  priceRange?: string;
  image?: string;
};
```

### Sample entries (top 10–15, winter-tourism focus)

| id | name | region | cuisine | winter tip |
|----|------|--------|---------|------------|
| the-polo | The Polo | Limassol | fine-dining | Wiz #1; reserve ahead; dress smart |
| cor-gastronomy | Cor Gastronomy | Limassol | fine-dining | Award-winning; winter terrace |
| seasons-oriental | Seasons Oriental | Limassol | Asian fusion | Wiz #2; winter menu |
| the-farmyard | The Farmyard | Kathika (Paphos) | farm-to-table | Akamas loop; book for lunch |
| sentio | Sentio | Nicosia | contemporary | Rainy-day Nicosia; combine with Leventis |
| zygi-tavernas | Zygi Fish Tavernas | Larnaca | fish | Harbour; what the boats brought in; locals' Sunday fish |
| governors-beach-tavernas | Governor's Beach Cliff Tavernas | Limassol | fish | White cliffs, dark sand; sit outside with a blanket Dec–Feb |
| polis-harbour | Polis Harbour Tavernas | Paphos | fish | Post-Adonis/Aphrodite; harbour views |
| psilo-dendro | Psilo Dendro | Platres | taverna | Post-Artemis; trout with almonds; fireplace |
| santo-restaurant | Santo Restaurant | Lemesos | meze / wine | Winery lunch; sea views; heaters in winter |
| kakopetria-trout | Kakopetria Trout Tavernas | Troodos | taverna | River setting; psaróvrasto |
| kouklia-cafe | Kouklia Village Café | Paphos | kafenion | Ruins over your shoulder; Palaipafos |
| kiti-angeloktisti-lunch | Kiti Village Tavernas | Larnaca | taverna | Post-Angeloktisti church; combine with Zygi |

---

## 5. PRIORITY ADDITIONS

### Top 5–10 Wineries to add

| # | id | name | region | why |
|---|----|------|--------|-----|
| 1 | mystes | Mystes Winery | Krasochoria (Limassol) | High visibility; tasting room; winter-ready |
| 2 | oenou-yi | Oenou Yi | Krasochoria | Modern indigenous focus; complements Zambartas/Aes Ambelis |
| 3 | sterna-boutique | Sterna Boutique Winery | Laona (Paphos) | Boutique Laona; fills Paphos gap |
| 4 | silikou-museum | Silikou Commandaria Museum | Silikou | Commandaria heritage; Savvas already in app; museum differentiator |
| 5 | hadjicharalambous | Hadjicharalambous Winery | Limassol | Traditional; established |
| 6 | pittali | Pittali Winery | Krasochoria | Family-run; wine route staple |
| 7 | papaioannou | Papaioannou Winery | Krasochoria | Long-standing; good for groups |
| 8 | karseras | Karseras Winery | Laona (Paphos) | Paphos wine route; Laona diversity |
| 9 | evangelou | Evangelou Winery | Paphos | Paphos region balance |
| 10 | chrysoroyiatissa | Chrysoroyiatissa Winery | Paphos | Distinct from monastery; Laona |

### Top 5–10 Trails to add

| # | id | name | region | difficulty | why |
|---|----|------|--------|------------|-----|
| 1 | smigies | Smigies Nature Trail | Akamas (Paphos) | easy–moderate | Akamas diversity; loop from Baths of Aphrodite area |
| 2 | pissouromoutti | Pissouromoutti Trail | Akamas | moderate | Akamas coverage; flora |
| 3 | e4-troodos-section | E4 Troodos Section | Troodos | moderate–hard | Long-distance; fills E4 gap |
| 4 | kampos-tou-livadiou | Kampos tou Livadiou | Troodos | easy | Family-friendly Troodos |
| 5 | agioi-vavatsinias | Agioi Vavatsinias | Larnaca | moderate | Larnaca hinterland; different region |
| 6 | atalante-east | Atalante East Extension | Troodos | easy | Troodos variety; links with Atalante |
| 7 | stavros-tis-psokas | Stavros tis Psokas | Akamas | moderate | Forest station; wildlife |
| 8 | vouni-panagias | Vouni Panagias | Paphos | moderate | Laona; combine with Vouni Panayia winery |
| 9 | agia-irini | Agia Irini Gorge | Paphos | moderate | Gorge; Paphos diversity |
| 10 | kryos-potamos-full | Kryos Potamos Full Valley | Troodos | moderate | Connects Caledonia; forest valley |

### Top 10 Restaurants / tavernas to add

| # | id | name | region | type | why |
|---|----|------|--------|------|-----|
| 1 | zygi-tavernas | Zygi Fish Tavernas | Larnaca | fish | Secret-gems star; locals' Sunday fish |
| 2 | governors-beach-tavernas | Governor's Beach Cliff Tavernas | Limassol | fish | Already in attractions; needs standalone entry |
| 3 | the-polo | The Polo | Limassol | fine-dining | Wiz #1; prestige |
| 4 | the-farmyard | The Farmyard | Kathika (Paphos) | farm-to-table | Akamas loop; Wiz top 5 |
| 5 | psilo-dendro | Psilo Dendro | Platres | taverna | Post-Artemis pairing; trout, fireplace |
| 6 | polis-harbour | Polis Harbour Tavernas | Paphos | fish | Post-Adonis/Aphrodite; village content |
| 7 | cor-gastronomy | Cor Gastronomy | Limassol | fine-dining | Award-winning; winter terrace |
| 8 | sentio | Sentio | Nicosia | contemporary | Rainy-day Nicosia; Wiz |
| 9 | kakopetria-trout | Kakopetria Trout Tavernas | Troodos | taverna | Village + trail combo |
| 10 | santo-restaurant | Santo Restaurant | Lemesos | meze | Already in wineries; restaurant angle |

---

## 6. NEXT STEPS

1. **Wineries:** Add top 5 (Mystes, Oenou Yi, Sterna Boutique, Silikou Museum, Hadjicharalambous) to `wineries.ts` with full copy.
2. **Trails:** Validate official trail names/lengths via moa.gov.cy or VisitCyprus before adding; start with Smigies, Stavros tis Psokas, Kampos tou Livadiou.
3. **Restaurants:** Create `src/data/restaurants.ts` with the Restaurant type; add top 5–10 entries; wire into `src/data/index.ts` and nav if needed.
4. **Cross-links:** Update `combineWith` on existing wineries, trails, attractions to reference new IDs.

---

*Document prepared for Cyprus Winter MVP. Tone: Mediterranean, understated, discovery-first.*
