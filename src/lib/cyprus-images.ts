/**
 * Curated Cyprus image URLs. Local images only (no Unsplash) for reliability.
 *
 * Mapping principles:
 * - Use place-specific images where available (e.g. lefkara → cyprus-lefkara.jpg)
 * - Fallbacks: beach=south coast, ancient=Kourion, village=Troodos, monastery=Kykkos
 * - Region match: Polis/Latsi → polis; Kyrenia/Pentadaktylos → bellapais or st-hilarion
 * - Wineries: per-id map, then wine-route regional image (not one generic for all 70+)
 */
import { wineries } from "@/data/wineries";
import { getPartnerOverlay } from "./partner-overlay";

const local = "/images/cyprus";

const wineryById = new Map(wineries.map((w) => [w.id, w]));

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
    choirokoitia: `${local}/cyprus-choirokoitia.jpg`,
    kolossi: `${local}/cyprus-ancient-kourion.jpg`,
    palaipafos: `${local}/cyprus-ancient-kourion.jpg`,
    buffavento: `${local}/cyprus-st-hilarion.jpg`, // castle on Pentadaktylos, not monastery
    "cyprus-museum": `${local}/cyprus-ancient-kourion.jpg`,
    bellapais: `${local}/cyprus-bellapais.jpg`,
    "leventis-museum": `${local}/cyprus-ancient-kourion.jpg`,
    "paphos-castle": `${local}/cyprus-ancient-kourion.jpg`,
    idalion: `${local}/cyprus-ancient-kourion.jpg`,
    kition: `${local}/cyprus-ancient-kourion.jpg`,
    "larnaca-aliki": `${local}/cyprus-trail-coastal.jpg`,
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
    "troodos-cycling-hub": `${local}/cyprus-trail-troodos.jpg`,
    "prodromos-dam-cycling": `${local}/cyprus-trail-waterfall.jpg`,
    "pitsilia-cycling-loop": `${local}/cyprus-vineyard-mountain.jpg`,
    "kellaki-kyparissia-ridge": `${local}/cyprus-vineyard-mountain.jpg`,
    "krasochoria-gravel-loop": `${local}/cyprus-vineyard-lofou-january.jpg`,
    "trimiklini-dam-cycling": `${local}/cyprus-trail-troodos.jpg`,
    "xyliatos-dam-cycle": `${local}/cyprus-trail-troodos.jpg`,
    "potamia-dam-cycling": `${local}/cyprus-trail-troodos.jpg`,
    "akamas-latchi-cycling": `${local}/cyprus-trail-coastal.jpg`,
    "limassol-coastal-cycle": `${local}/cyprus-governors-beach.jpg`,
    "silikou-valley-trail": `${local}/cyprus-vineyard-silikou.jpg`,
    "larnaca-village-coastal-cycle": `${local}/cyprus-lara-bay.jpg`,
    alona: `${local}/cyprus-village-omodos.jpg`,
    kellaki: `${local}/cyprus-village-omodos.jpg`,
    trimiklini: `${local}/cyprus-village-omodos.jpg`,
    prodromos: `${local}/cyprus-village-omodos.jpg`,
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
  if (type === "winery") return resolveWineryImage(id);
  if (type === "restaurant") return map[id] ?? fallbacks.restaurant;
  return map[id] ?? fallbacks[type] ?? `${local}/cyprus-trail-troodos.jpg`;
}

const trailsDir = `${local}/trails`;
const trailFallback = `${local}/cyprus-trail-troodos.jpg`;

/** Visit Cyprus / Forestry official hero photos (npm run trails:fetch-images). */
const officialTrailImages: Record<string, string> = {
  adonis: `${trailsDir}/trail-adonis.jpg`,
  "agia-irini": `${trailsDir}/trail-agia-irini.jpg`,
  "agioi-anargyroi-circular": `${trailsDir}/trail-agioi-anargyroi-circular.jpg`,
  aphrodite: `${trailsDir}/trail-aphrodite.jpg`,
  "aphrodite-cape-greco": `${trailsDir}/trail-aphrodite-cape-greco.jpg`,
  artemis: `${trailsDir}/trail-artemis.jpg`,
  atalante: `${trailsDir}/trail-atalante.jpg`,
  "avakas-gorge": `${trailsDir}/trail-avakas-gorge.jpg`,
  "caledonia-falls": `${trailsDir}/trail-caledonia-falls.jpg`,
  chrysovrysi: `${trailsDir}/trail-chrysovrysi.jpg`,
  "germasogeia-kyparissia": `${trailsDir}/trail-germasogeia-kyparissia.jpg`,
  "kampos-tou-livadiou": `${trailsDir}/trail-kampos-tou-livadiou.jpg`,
  "kannoures-agios-nikolaos": `${trailsDir}/trail-kannoures-agios-nikolaos.jpg`,
  "kavos-trail": `${trailsDir}/trail-kavos-trail.jpg`,
  "kionia-profitis-elias": `${trailsDir}/trail-kionia-profitis-elias.jpg`,
  "konnoi-cyclops": `${trailsDir}/trail-konnoi-cyclops.jpg`,
  "livadi-trail": `${trailsDir}/trail-livadi-trail.jpg`,
  "loumata-ton-aeton": `${trailsDir}/trail-loumata-ton-aeton.jpg`,
  "madari-ridge": `${trailsDir}/trail-madari-ridge.jpg`,
  "mnimata-piskopon": `${trailsDir}/trail-mnimata-piskopon.jpg`,
  persephone: `${trailsDir}/trail-persephone.jpg`,
  pissouromoutti: `${trailsDir}/trail-pissouromoutti.jpg`,
  "prodromos-dam-stavroulia": `${trailsDir}/trail-prodromos-dam-stavroulia.jpg`,
  "prodromos-zoumi": `${trailsDir}/trail-prodromos-zoumi.jpg`,
  "psilo-dentro-pouziaris": `${trailsDir}/trail-psilo-dentro-pouziaris.jpg`,
  "sea-caves-anargyroi": `${trailsDir}/trail-sea-caves-anargyroi.jpg`,
  smigies: `${trailsDir}/trail-smigies.jpg`,
  "trooditissa-phini": `${trailsDir}/trail-trooditissa-phini.jpg`,
  "xyliatos-dam": `${trailsDir}/trail-xyliatos-dam.jpg`,
  "ezousa-valley": `${trailsDir}/trail-ezousa-valley.jpg`,
  "panagia-araka-stavros": `${trailsDir}/trail-panagia-araka-stavros.jpg`,
};

/** Regional stock for trails without an official Visit Cyprus hero. */
const regionalTrailImages: Record<string, string> = {
  "olympus-summit": `${local}/cyprus-trail-troodos.jpg`,
  horteri: `${local}/cyprus-trail-troodos.jpg`,
  "millomeris-falls": `${local}/cyprus-trail-waterfall.jpg`,
  "caledonia-alternative": `${local}/cyprus-trail-waterfall.jpg`,
  "cape-greco": `${local}/cyprus-trail-coastal.jpg`,
  "petra-tou-romiou": `${local}/cyprus-trail-coastal.jpg`,
  "stavros-tis-psokas": `${local}/cyprus-trail-troodos.jpg`,
  "e4-troodos-platres": `${local}/cyprus-trail-troodos.jpg`,
  "vavatsinia-honeybee": `${local}/cyprus-village-omodos.jpg`,
  "vouni-panagias": `${local}/cyprus-trail-troodos.jpg`,
  "kryos-potamos-loop": `${local}/cyprus-trail-waterfall.jpg`,
  "panagia-tis-amasgou": `${local}/cyprus-village-omodos.jpg`,
  "selladi-stavros": `${local}/cyprus-trail-troodos.jpg`,
  "machairas-forest": `${local}/cyprus-trail-troodos.jpg`,
  "horteri-extended": `${local}/cyprus-trail-troodos.jpg`,
  mylikouri: `${local}/cyprus-trail-troodos.jpg`,
  "persephone-extended": `${local}/cyprus-trail-troodos.jpg`,
  "dwarf-oaks": `${local}/cyprus-trail-troodos.jpg`,
  "lefkara-path": `${local}/cyprus-lefkara.jpg`,
  "potamia-dam": `${local}/cyprus-trail-troodos.jpg`,
  kionia: `${local}/cyprus-trail-troodos.jpg`,
  "trees-of-woe": `${local}/cyprus-trail-troodos.jpg`,
  "kalidonia-alt": `${local}/cyprus-trail-waterfall.jpg`,
  pentadaktylos: `${local}/cyprus-st-hilarion.jpg`,
  "larnaca-salt-lake": `${local}/cyprus-trail-coastal.jpg`,
  "moni-fylagra": `${local}/cyprus-trail-troodos.jpg`,
  agiasma: `${local}/cyprus-trail-gorge.jpg`,
  arnies: `${local}/cyprus-trail-gorge.jpg`,
  "treis-elies": `${local}/cyprus-trail-waterfall.jpg`,
  lemithou: `${local}/cyprus-trail-troodos.jpg`,
  kastrovounos: `${local}/cyprus-trail-troodos.jpg`,
  "dymes-pelendri": `${local}/cyprus-village-omodos.jpg`,
  arsos: `${local}/cyprus-vineyard-lofou-january.jpg`,
  kalevounari: `${local}/cyprus-governors-beach.jpg`,
  "germasogeia-weir": `${local}/cyprus-trail-waterfall.jpg`,
  "agros-kato-mylos": `${local}/cyprus-village-omodos.jpg`,
  "kalopanagiotis-oikos": `${local}/cyprus-village-omodos.jpg`,
  "archangelos-mylos-rodous": `${local}/cyprus-monastery-kykkos.jpg`,
  "lagoudera-agros": `${local}/cyprus-trail-troodos.jpg`,
  "lagoudera-madari": `${local}/cyprus-trail-troodos.jpg`,
  "polystypos-hazelnut": `${local}/cyprus-trail-troodos.jpg`,
  "pano-ambelia": `${local}/cyprus-trail-troodos.jpg`,
  "petros-vanezis": `${local}/cyprus-village-omodos.jpg`,
  gourri: `${local}/cyprus-trail-waterfall.jpg`,
  "machairas-lazanias": `${local}/cyprus-monastery-kykkos.jpg`,
  "lazanias-fikardou": `${local}/cyprus-village-omodos.jpg`,
  "fikardou-archontides": `${local}/cyprus-village-omodos.jpg`,
  "choirokoitia-trail": `${local}/cyprus-choirokoitia.jpg`,
  "panagia-agapis-vavla": `${local}/cyprus-lefkara.jpg`,
  "lefkara-metamorfoseos": `${local}/cyprus-lefkara.jpg`,
  "profitis-ilias-konnoi": `${local}/cyprus-trail-coastal.jpg`,
  "panagia-agios-ioannis": `${local}/cyprus-trail-coastal.jpg`,
  "panagia-agioi-saranda": `${local}/cyprus-trail-coastal.jpg`,
};

export type TrailImageSource = "official" | "regional" | "fallback";

/** Classify how a trail hero image was resolved (for intake metrics). */
export function classifyTrailImageSource(trailId: string): TrailImageSource {
  if (officialTrailImages[trailId]) return "official";
  if (regionalTrailImages[trailId]) return "regional";
  return "fallback";
}

/** Map trail id to image URL. Official Visit Cyprus photos take precedence. */
export function getTrailImage(trailId: string): string {
  return officialTrailImages[trailId] ?? regionalTrailImages[trailId] ?? trailFallback;
}

/** Per-winery overrides (venue-specific or partner assets). */
const wineryImages: Record<string, string> = {
  "domes-sergiou": `${local}/domes-sergiou-hero.png`,
  kolios: `${local}/cyprus-vineyard-mountain.jpg`,
  tsiakkas: `${local}/winery-tsiakkas.jpg`, // Pelendri vineyard (CC BY 2.0), not a tasting-room interior
  "vouni-panayia": `${local}/cyprus-vineyard-laona.jpg`,
  zambartas: `${local}/cyprus-vineyard-lofou-january.jpg`, // Krasochoria, not Laona/Paphos
  santo: `${local}/cyprus-vineyard-lofou-january.jpg`,
  kyperounta: `${local}/cyprus-vineyard-mountain.jpg`,
  fikardos: `${local}/cyprus-vineyard-laona.jpg`,
  vlassides: `${local}/cyprus-winery-barrels.jpg`,
  vasilikon: `${local}/cyprus-trail-gorge.jpg`,
  "ktima-vassiliades": `${local}/cyprus-winery-barrels.jpg`,
  "oenou-yi": `${local}/cyprus-winery-omodos-tasting.jpg`,
  savvas: `${local}/cyprus-vineyard-silikou.jpg`,
};

/** Wine-route regional fallbacks when no per-id image exists. */
const wineRouteImages: Record<string, string> = {
  Krasochoria: `${local}/cyprus-vineyard-lofou-january.jpg`,
  Laona: `${local}/cyprus-vineyard-laona.jpg`,
  "Laona–Akamas": `${local}/cyprus-trail-gorge.jpg`,
  Akamas: `${local}/cyprus-trail-gorge.jpg`,
  Pitsilia: `${local}/cyprus-vineyard-mountain.jpg`,
  Commandaria: `${local}/cyprus-vineyard-silikou.jpg`,
  Troodos: `${local}/cyprus-trail-troodos.jpg`,
  "Larnaca hills": `${local}/cyprus-lefkara.jpg`,
  Larnaca: `${local}/cyprus-lefkara.jpg`,
  "Larnaca–Limassol corridor": `${local}/cyprus-governors-beach.jpg`,
  "Limassol corridor": `${local}/cyprus-governors-beach.jpg`,
  "Limassol coast": `${local}/cyprus-governors-beach.jpg`,
  Limassol: `${local}/cyprus-governors-beach.jpg`,
  Nicosia: `${local}/cyprus-village-omodos.jpg`,
};

const wineryFallback = `${local}/cyprus-winery-troodos.jpg`;

export type WineryImageSource = "partner-overlay" | "per-id" | "wine-route" | "fallback";

/** Classify how a winery hero image was resolved (for intake metrics). */
export function classifyWineryImageSource(id: string): WineryImageSource {
  if (getPartnerOverlay(id)?.imageUrl) return "partner-overlay";
  if (wineryImages[id]) return "per-id";
  const route = wineryById.get(id)?.wineRoute;
  if (route && wineRouteImages[route]) return "wine-route";
  return "fallback";
}

/** Resolve winery hero/card image by id and optional wine route. */
export function resolveWineryImage(id: string): string {
  const overlayImage = getPartnerOverlay(id)?.imageUrl;
  if (overlayImage) return overlayImage;
  if (wineryImages[id]) return wineryImages[id];
  const route = wineryById.get(id)?.wineRoute;
  if (route && wineRouteImages[route]) return wineRouteImages[route];
  return wineryFallback;
}
