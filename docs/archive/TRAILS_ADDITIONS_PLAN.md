**Status**: Archived (historical). **Stats superseded:** Chrysovrysi is 8 km (Forestry grade 2), Kavos is 1.2 km — see `src/data/trails.ts` and BUG-215–216 in `docs/QA_BUGS.md`.

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Add Underground and Less-Touristic Trails — Plan (Revised)

## Positioning: Discovery-First, Not Tourist Traps

Cyprus Winter should feel like a **secret app**—trails locals hike, places most visitors never find. Research (Feel Alive Outdoors, Visit Famagusta, VisitCyprus) shows which trails are crowded vs hidden.

**Skip or de-prioritise:** Cyclops Cave (Konnos Beach), Cape Greco Aphrodite Trail, Prophet Elias–Konnoi—these are popular Protaras/Cape Greco draws.

**Prioritise:** Remote Paphos forest, Cedar Valley, secret seasonal features, abandoned villages, trails with limited parking and low footfall.

---

## 1. Hidden / Less-Touristic Trails (Research-Backed)

*Sources: feelaliveoutdoors.com, Visit Famagusta, Wikiloc, Cyprus tourism.*

| id | name | region | difficulty | lengthKm | why add (less touristy) |
|----|------|--------|------------|----------|-------------------------|
| almirolivado | Almirolivado Secret Lake | Troodos | moderate–hard | 11 | "King of winter trails". Seasonal lake only after snow/rain; abandoned asbestos mine, lunar landscape. Best in winter. Very few know it. |
| vretsia-roudias | Vretsia – Roudias Venetian Bridge | Paphos | moderate | 8.5 | Abandoned village (post-1974), Venetian bridge, ruined watermill. Remote forest. Poignant, historic. |
| kykkos-konizi | Kykkos to Konizi | Paphos | expert | 7 | "Hidden and unknown". Unspoiled Paphos forest, streams, V-shaped route. Very difficult; not popular. |
| selladi-trypilos | Selladi tou Staxtou – Trypilos | Paphos | hard | 10.5 | Cedar Valley, 360° fire tower. Parking for 6–7 cars. Remote. |
| chrysovrysi | Chrysovrysi Natural Trail | Troodos | moderate | 1.5 | "Hidden in plain sight". Near Troodos Square but seldom hiked. 1h out-and-back. |
| gnafkio | Gnafkio Natural Trail | Nicosia | hard | 6.5 | "Greenest trail in Cyprus". Moss-covered, secluded. Kampos/Tsakistras. Linear. |
| agia-tilliria | Agia Tilliria | Nicosia | moderate | 6.8 | Kato Pyrgos area. Abandoned village, wooden bridge, gorge, sea views. "Distinct from rest of Cyprus". Remote. |
| politiko-machairas | Politiko to Machairas | Nicosia | hard | 7 | Gorge, stream, Afxentiou hideout, Machairas Monastery. "Hidden sanctuary". Winter magical after rain. |
| panthea | Panthea | Nicosia | hard | 7–14 | Kykkos–Tsakistra road. Remote ridge, 360° views, refuge at start. Near Gnafkio. |
| ariadni | Ariadni | Nicosia | moderate | 4.5 | Gerakies, near Kykkos. Kavallos fire lookout, Marathasa Valley views. Best in winter (sun exposure). |
| kionia-profitis-elias | Kionia – Profitis Elias | Nicosia | moderate | 7 | Machairas Forest. E4 trail, charcoal kilns, abandoned monastery. Vavatsinia/Lythrodontas. |
| moutti-athasias | Moutti tis Athasias (Cave) | Larnaca | easy | 4.5 | Vavatsinia. "Quite path, chosen among locals". Mysterious cave (Venetian-era mine). Not touristy. |
| moutti-anemwn | Moutti twn Anemwn | Paphos | moderate | 3.8 | "Hidden gem". Peak of Winds, Pano Panagia. Remote Paphos forest. Limited visitors. |
| mesa-potamos | Mesa Potamos Waterfall | Limassol | easy | 9 | Unofficial loop. Waterfall, monastery, cold river. Family-friendly. Less documented. |
| kavos-trail | Kavos Trail | Famagusta | easy | 2.5 | Old quarry, fossils, hilltop. Less known than Cyclops/Sea Caves. Official Visit Famagusta trail. |

---

## 2. Underground / Cave Trails (Selective)

Cape Greco caves (Cyclops, Agioi Anargyroi) are touristy in summer. For a discovery-first app:

- **Include:** **Kavos Trail** (quarry, fossils, underground feel) — less documented than main cave trails
- **Include:** **Moutti tis Athasias** (Larnaca) — easy trail to a mysterious cave (Venetian-era mine); "quite path, chosen among locals"
- **Optional:** Sea Caves – Agioi Anargyroi (4 km, Kamara tou Koraka) — frame as "quieter in winter"
- **Skip:** Cyclops Cave (very popular), Aphrodite Cape Greco (mainstream)

---

## 3. Implementation Tasks

### 3.1 Add new trails to `src/data/trails.ts`

For each trail:
- Full `Trail` object per existing schema
- Copy: Mediterranean, discovery-first; emphasise solitude, "few know this", winter magic
- `localSecret`: genuine insider tip (e.g. Almirolivado: "Go with someone who knows it; lake appears only after snow/rain")
- `winterNotes` and `winterSafety` where relevant

### 3.2 Add `trailConditions` for each new trail

### 3.3 Expand region filter in `src/app/trails/TrailsClient.tsx`

Include: Famagusta, Larnaca, Limassol, Nicosia, Kyrenia (or derive from trails).

---

## 4. Research Summary (Key Details)

| Trail | Elevation | Duration | Trailhead / Notes |
|-------|-----------|----------|-------------------|
| Almirolivado | 324 m | ~4 h | Karvounas–Troodos road; secret lake + giant juniper detour |
| Vretsia | 311 m | ~3 h | Vretsia village or Roudias bridge; linear or circular |
| Kykkos-Konizi | 869 m | ~6 h | Linear; do not hike alone; winter preferred (snakes) |
| Selladi Trypilos | 572 m | ~4.5 h | Cedar Valley; parking limited (6–7 cars) |
| Chrysovrysi | 255 m | ~1 h | Karvounas–Troodos, 7 km before Troodos Square |
| Gnafkio | 750 m | 4–5 h | Kykkos toward Tsakistras; moss, Peter's Valley views |
| Agia Tilliria | 265 m | 2.5–4 h | Pigenia, near Kato Pyrgos; abandoned village, bridge |
| Politiko–Machairas | 551 m | ~4 h | Politiko village; gorge, Afxentiou hideout |
| Panthea | 413 m | 2–4 h | Kykkos–Tsakistra road; refuge at start |
| Ariadni | 253 m | ~2 h | Gerakies; Kavallos fire lookout |
| Kionia–Profitis Elias | 745 m | ~3 h | Kionia or Profitis Elias picnic site (Machairas) |
| Moutti tis Athasias | 174 m | ~2 h | Vavatsinia–Kionia road; cave at end |
| Moutti Anemwn | 460 m | ~3 h | Pano Panagia, shares trailhead with Gefyria |
| Mesa Potamos | ~290 m | 2–2.5 h | Moniatis; waterfall, St John Prodromos monastery |
| Kavos | — | ~45 min | Cape Greco; quarry, fossils, panoramic views |
| Stavrovouni | 338 m | 2–3 h | Stavrovouni Monastery; circular, rugged |
| Agia Varvara–Stavrovouni | 280 m | ~2 h | Agia Varvara Monastery; steep ascent |
| Karvounarka | 315 m | ~2 h | Vavatsinia–Kionia road |
| Cape Aspro | 421 m | 3–4 h | Pissouri, near Columbia Beach; white cliffs |
| Germasogeia–Kyparissia | 600 m | ~3.5 h | Foinikaria; dam, Kyparissia peak |
| Agioi Anargyroi circular | — | ~45 min | Church Agioi Anargyroi, Cape Greco |
| Sea Caves–Agioi Anargyroi | — | ~1.5 h | Linear along coast |

---

## 5. Priority Order

**Phase 1 (high impact, clear differentiation):**
1. Almirolivado
2. Vretsia – Roudias
3. Chrysovrysi
4. Kavos Trail
5. Moutti twn Anemwn
6. **Nicosia batch:** Politiko–Machairas, Agia Tilliria, Ariadni
7. Moutti tis Athasias (Larnaca, cave)

**Phase 2 (Nicosia focus + deeper coverage):**
8. Gnafkio
9. Panthea
10. Kionia–Profitis Elias
11. Kykkos-Konizi
12. Selladi Trypilos
13. Mesa Potamos

**Phase 3 (Other areas: Larnaca, Limassol, Famagusta):**
14. **Larnaca:** Stavrovouni, Karvounarka, Agia Varvara–Stavrovouni
15. **Limassol:** Cape Aspro, Germasogeia–Kyparissia
16. **Famagusta:** Agioi Anargyroi circular, Sea Caves–Agioi Anargyroi

**Current Nicosia in app:** Xyliatos Dam, Machairas Forest, Potamia Dam (3 trails).  
**After additions:** 9 Nicosia trails (Gnafkio, Agia Tilliria, Politiko–Machairas, Panthea, Ariadni, Kionia–Profitis Elias + existing 3).

---

## 6. Other Areas (Larnaca, Limassol, Famagusta, Kyrenia)

*Current app: Larnaca 3, Limassol 1, Famagusta 0, Kyrenia 1, Ayia Napa 1. Expand with less-touristic options.*

### Larnaca

| id | name | difficulty | lengthKm | why add |
|----|------|------------|----------|---------|
| stavrovouni | Stavrovouni Nature Trail | hard | 5.4 | Circular around monastery cliff; 360° views, Larnaca/Salt Lake. Best in winter (exposed). |
| agia-varvara-stavrovouni | Agia Varvara to Stavrovouni | moderate | 4.8 | Steep ascent to Stavrovouni; panoramic views. 30 min from Larnaca. Combines with Stavrovouni loop for ~10 km. |
| karvounarka | Karvounarka | moderate | 7 | Vavatsinia–Kionia, Machairas forest. Circular; can combine with Moutti tis Athasias. Winter fog adds atmosphere. |

### Limassol

| id | name | difficulty | lengthKm | why add |
|----|------|------------|----------|---------|
| cape-aspro | Cape Aspro | moderate | 8 | Pissouri. White cliffs (~250 m), coastal. Best in winter (no shade). Different from forest trails. |
| germasogeia-kyparissia | Germasogeia Dam – Kyparissia | moderate | 13 | Foinikaria. Pine forest, dam, 600 m ascent. Birdlife. Krasochoria wine route nearby. |

### Famagusta

| id | name | difficulty | lengthKm | why add |
|----|------|------------|----------|---------|
| kavos-trail | Kavos Trail | easy | 2.5 | Already in plan. Quarry, fossils, panoramic. Less known than Cyclops. |
| agioi-anargyroi-circular | Agioi Anargyroi (Circular) | easy | 2.3 | Church of Agioi Anargyroi. Dense flora, sea views, Kamara tou Koraka. Quieter than Cyclops. |
| sea-caves-anargyroi | Sea Caves – Agioi Anargyroi | easy | 4 | Linear along coast; sea caves, Kamara tou Koraka. Winter = fewer crowds. |

### Kyrenia

*Note: Most Kyrenia trails are in the northern part; access from south Cyprus may require checkpoint. Pentadaktylos Foothills already in app. Optional: add trails accessible from south (e.g. Bellapais area) if research confirms safe access.*
