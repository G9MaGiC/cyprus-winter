/**
 * Curated Cyprus image URLs. Local images only (no Unsplash) for reliability.
 *
 * Mapping principles:
 * - Use place-specific images where available (e.g. lefkara → cyprus-lefkara.jpg)
 * - Fallbacks: beach=south coast, ancient=Kourion, village=Troodos, monastery=Kykkos
 * - Region match: Polis/Latsi → polis; Kyrenia/Pentadaktylos → bellapais or st-hilarion
 */
const local = "/images/cyprus";

/** Auth pages hero — warm, winter-appropriate (village/ruins). */
export const AUTH_HERO_IMAGE = `${local}/cyprus-village-omodos.jpg`;

/** Map attraction id to image URL. */
export function getAttractionImage(id: string, type: string): string {
  const map: Record<string, string> = {
    "nissi-beach": `${local}/cyprus-beach-nissi.jpg`,
    "fig-tree-bay": `${local}/cyprus-fig-tree-bay.jpg`,
    "konnos-bay": `${local}/cyprus-konnos-bay.jpg`,
    "coral-bay": `${local}/cyprus-coral-bay.jpg`,
    "lara-bay": `${local}/cyprus-lara-bay.jpg`,
    "ayia-napa-sea-caves": `${local}/cyprus-sea-caves.jpg`,
    "governors-beach": `${local}/cyprus-governors-beach.jpg`,
    "pafos-mosaics": `${local}/cyprus-pafos-mosaics.jpg`,
    kourion: `${local}/cyprus-ancient-kourion.jpg`,
    "tomb-of-kings": `${local}/cyprus-tomb-of-kings.jpg`,
    salamis: `${local}/cyprus-salamis.jpg`,
    "st-hilarion": `${local}/cyprus-st-hilarion.jpg`,
    amahti: `${local}/cyprus-ancient-kourion.jpg`,
    choirokoitia: `${local}/cyprus-ancient-kourion.jpg`,
    kolossi: `${local}/cyprus-ancient-kourion.jpg`,
    palaipafos: `${local}/cyprus-ancient-kourion.jpg`,
    buffavento: `${local}/cyprus-st-hilarion.jpg`, // castle on Pentadaktylos, not monastery
    "cyprus-museum": `${local}/cyprus-ancient-kourion.jpg`,
    bellapais: `${local}/cyprus-bellapais.jpg`,
    "leventis-museum": `${local}/cyprus-ancient-kourion.jpg`,
    "paphos-castle": `${local}/cyprus-ancient-kourion.jpg`,
    idalion: `${local}/cyprus-ancient-kourion.jpg`,
    kalopanagiotis: `${local}/cyprus-village-omodos.jpg`,
    lefkara: `${local}/cyprus-lefkara.jpg`,
    polis: `${local}/cyprus-polis.jpg`,
    omodos: `${local}/cyprus-village-omodos.jpg`,
    kakopetria: `${local}/cyprus-village-omodos.jpg`,
    lania: `${local}/cyprus-village-omodos.jpg`,
    lefke: `${local}/cyprus-village-omodos.jpg`,
    foini: `${local}/cyprus-village-omodos.jpg`,
    pedoulas: `${local}/cyprus-village-omodos.jpg`,
    platres: `${local}/cyprus-village-omodos.jpg`,
    "pera-pedi": `${local}/cyprus-village-omodos.jpg`,
    agros: `${local}/cyprus-village-omodos.jpg`,
    fikardou: `${local}/cyprus-village-omodos.jpg`,
    koilani: `${local}/cyprus-village-omodos.jpg`,
    "lefkara-kato": `${local}/cyprus-lefkara.jpg`,
    vavla: `${local}/cyprus-village-omodos.jpg`,
    galata: `${local}/cyprus-village-omodos.jpg`,
    zodiakos: `${local}/cyprus-village-omodos.jpg`,
    "kato-drys": `${local}/cyprus-village-omodos.jpg`,
    louvaras: `${local}/cyprus-village-omodos.jpg`,
    lofou: `${local}/cyprus-village-omodos.jpg`,
    "kampi-farmaka": `${local}/cyprus-village-omodos.jpg`,
    koili: `${local}/cyprus-village-omodos.jpg`,
    "kritou-terra": `${local}/cyprus-village-omodos.jpg`,
    kormakitis: `${local}/cyprus-village-omodos.jpg`,
    angeloktisti: `${local}/cyprus-ancient-kourion.jpg`,
    kykkos: `${local}/cyprus-monastery-kykkos.jpg`,
    "st-neophytos": `${local}/cyprus-monastery-kykkos.jpg`,
    trooditissa: `${local}/cyprus-monastery-kykkos.jpg`,
    machairas: `${local}/cyprus-monastery-kykkos.jpg`,
    chrysorrogiatissa: `${local}/cyprus-monastery-kykkos.jpg`,
    "st-john-lampadistis": `${local}/cyprus-monastery-kykkos.jpg`,
    "panagia-tou-araka": `${local}/cyprus-monastery-kykkos.jpg`,
    "st-george-alamanou": `${local}/cyprus-monastery-kykkos.jpg`,
    stavrovouni: `${local}/cyprus-monastery-kykkos.jpg`,
    "archangelos-michail": `${local}/cyprus-monastery-kykkos.jpg`,
    "st-nicholas-roof": `${local}/cyprus-monastery-kykkos.jpg`,
    "panagia-tou-moutoulla": `${local}/cyprus-monastery-kykkos.jpg`,
    "st-sozomenos": `${local}/cyprus-village-omodos.jpg`, // abandoned village, Nicosia district
    "zygi-tavernas": `${local}/cyprus-governors-beach.jpg`,
    "governors-beach-tavernas": `${local}/cyprus-governors-beach.jpg`,
    "the-polo": `${local}/cyprus-governors-beach.jpg`, // Limassol
    "the-farmyard": `${local}/cyprus-polis.jpg`, // Kathikas, Paphos wine region
    "polis-harbour": `${local}/cyprus-polis.jpg`,
    "psilo-dendro": `${local}/cyprus-village-omodos.jpg`,
    "kakopetria-trout": `${local}/cyprus-village-omodos.jpg`,
    "kouklia-cafe": `${local}/cyprus-ancient-kourion.jpg`,
    "kiti-tavernas": `${local}/cyprus-governors-beach.jpg`, // Larnaca south coast
    "platres-trout": `${local}/cyprus-village-omodos.jpg`,
    "latsi-harbour": `${local}/cyprus-polis.jpg`, // Latsi is Polis harbour
    "nicosia-tavernas": `${local}/cyprus-ancient-kourion.jpg`, // capital, historic fallback
    "pissouri-tavernas": `${local}/cyprus-governors-beach.jpg`,
    "omodos-tavernas": `${local}/cyprus-village-omodos.jpg`,
    "limassol-marina": `${local}/cyprus-governors-beach.jpg`,
    "limassol-marina-restaurants": `${local}/cyprus-governors-beach.jpg`,
    "protaras-tavernas": `${local}/cyprus-fig-tree-bay.jpg`, // Protaras / east coast
    "larnaca-old-town": `${local}/cyprus-governors-beach.jpg`, // south coast
    "pafos-harbour": `${local}/cyprus-pafos-mosaics.jpg`, // Paphos region
    "agros-tavernas": `${local}/cyprus-village-omodos.jpg`,
    "lefkara-tavernas": `${local}/cyprus-lefkara.jpg`,
    "kathikas-tavernas": `${local}/cyprus-polis.jpg`, // Paphos wine region, near Polis
    "limassol-old-town": `${local}/cyprus-governors-beach.jpg`, // Limassol coastal
    "kyrenia-tavernas": `${local}/cyprus-bellapais.jpg`, // north coast region
    "ayia-napa-tavernas": `${local}/cyprus-sea-caves.jpg`, // Ayia Napa area
    "troodos-square": `${local}/cyprus-village-omodos.jpg`,
    "solea-valley": `${local}/cyprus-village-omodos.jpg`,
    "zygi-mikri": `${local}/cyprus-governors-beach.jpg`,
    "kourion-tavernas": `${local}/cyprus-ancient-kourion.jpg`,
    "cor-gastronomy": `${local}/cyprus-village-omodos.jpg`,
    "sentio": `${local}/cyprus-village-omodos.jpg`,
    "santo-restaurant": `${local}/cyprus-governors-beach.jpg`,
    "seasons-oriental": `${local}/cyprus-governors-beach.jpg`, // Four Seasons Limassol
  };
  const fallbacks: Record<string, string> = {
    beach: `${local}/cyprus-governors-beach.jpg`,     // south coast
    ancient: `${local}/cyprus-ancient-kourion.jpg`,   // Kourion ruins
    village: `${local}/cyprus-village-omodos.jpg`,    // Troodos village
    monastery: `${local}/cyprus-monastery-kykkos.jpg`,
    winery: `${local}/cyprus-winery-troodos.jpg`,
    nature: `${local}/cyprus-trail-troodos.jpg`,
    activity: `${local}/cyprus-trail-troodos.jpg`,
    restaurant: `${local}/cyprus-village-omodos.jpg`, // taverna/coastal fallback
  };
  const wineryImages: Record<string, string> = {
    "domes-sergiou": `${local}/domes-sergiou-hero.png`,
    kolios: `${local}/cyprus-winery-troodos.jpg`, // Mountain winery: Statos Agios Fotios, 3000ft
  };
  if (type === "winery") return wineryImages[id] ?? fallbacks.winery;
  if (type === "restaurant") return map[id] ?? fallbacks.restaurant;
  return map[id] ?? fallbacks[type] ?? `${local}/cyprus-trail-troodos.jpg`;
}

const trailImages: Record<string, string> = {
  artemis: `${local}/cyprus-trail-troodos.jpg`,
  atalante: `${local}/cyprus-trail-troodos.jpg`,
  persephone: `${local}/cyprus-trail-troodos.jpg`,
  "olympus-summit": `${local}/cyprus-trail-troodos.jpg`,
  "madari-ridge": `${local}/cyprus-trail-troodos.jpg`,
  horteri: `${local}/cyprus-trail-troodos.jpg`,
  "caledonia-falls": `${local}/cyprus-trail-waterfall.jpg`,
  "millomeris-falls": `${local}/cyprus-trail-waterfall.jpg`,
  "caledonia-alternative": `${local}/cyprus-trail-waterfall.jpg`,
  "cape-greco": `${local}/cyprus-trail-coastal.jpg`,
  "avakas-gorge": `${local}/cyprus-trail-gorge.jpg`,
  adonis: `${local}/cyprus-trail-gorge.jpg`,
  aphrodite: `${local}/cyprus-trail-coastal.jpg`,
  "petra-tou-romiou": `${local}/cyprus-trail-coastal.jpg`,
  smigies: `${local}/cyprus-trail-gorge.jpg`,
  "stavros-tis-psokas": `${local}/cyprus-trail-troodos.jpg`,
  "kampos-tou-livadiou": `${local}/cyprus-trail-troodos.jpg`,
  pissouromoutti: `${local}/cyprus-trail-gorge.jpg`,
  "e4-troodos-platres": `${local}/cyprus-trail-troodos.jpg`,
  "vavatsinia-honeybee": `${local}/cyprus-village-omodos.jpg`,
  "vouni-panagias": `${local}/cyprus-trail-troodos.jpg`,
  "mnimata-piskopon": `${local}/cyprus-trail-troodos.jpg`,
  "kryos-potamos-loop": `${local}/cyprus-trail-waterfall.jpg`,
  "loumata-ton-aeton": `${local}/cyprus-trail-troodos.jpg`,
  "panagia-tis-amasgou": `${local}/cyprus-village-omodos.jpg`,
  "xyliatos-dam": `${local}/cyprus-trail-troodos.jpg`,
  "selladi-stavros": `${local}/cyprus-trail-troodos.jpg`,
  "machairas-forest": `${local}/cyprus-trail-troodos.jpg`,
  "horteri-extended": `${local}/cyprus-trail-troodos.jpg`,
  "agia-irini": `${local}/cyprus-trail-gorge.jpg`,
  "livadi-trail": `${local}/cyprus-trail-troodos.jpg`,
  mylikouri: `${local}/cyprus-trail-troodos.jpg`,
  "persephone-extended": `${local}/cyprus-trail-troodos.jpg`,
  "dwarf-oaks": `${local}/cyprus-trail-troodos.jpg`,
  "lefkara-path": `${local}/cyprus-lefkara.jpg`,
  "potamia-dam": `${local}/cyprus-trail-troodos.jpg`,
  kionia: `${local}/cyprus-trail-troodos.jpg`,
  "trees-of-woe": `${local}/cyprus-trail-troodos.jpg`,
  "kalidonia-alt": `${local}/cyprus-trail-waterfall.jpg`,
  pentadaktylos: `${local}/cyprus-st-hilarion.jpg`, // Pentadaktylos range, north Cyprus
  "larnaca-salt-lake": `${local}/cyprus-trail-coastal.jpg`,
};

/** Map trail id to image URL. */
export function getTrailImage(trailId: string): string {
  return trailImages[trailId] ?? `${local}/cyprus-trail-troodos.jpg`; // Troodos fallback
}
