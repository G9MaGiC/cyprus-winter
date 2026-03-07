import { getAttractionImage, getTrailImage } from "@/lib/cyprus-images";
import { pickDailyWithKey } from "@/lib/daily-rotator";
import { PROMOTED_PLACE_IDS } from "@/data/promoted";

export type HomeEditorialPick = {
  id: string;
  href: string;
  title: string;
  desc: string;
  image: string;
  imageAlt: string;
};

export const homeEditorsPicks: HomeEditorialPick[] = [
  {
    id: "omodos",
    href: "/discover/omodos",
    image: getAttractionImage("omodos", "village"),
    imageAlt: "Omodos village, wine heartland, cobbled streets—Cyprus winter",
    title: "Omodos",
    desc: "Cobbled streets, zivania, coffee in the wine heartland",
  },
  {
    id: "pafos-mosaics",
    href: "/discover/pafos-mosaics",
    image: getAttractionImage("pafos-mosaics", "ancient"),
    imageAlt: "Pafos Roman mosaics in soft winter light—Cyprus",
    title: "Pafos mosaics",
    desc: "Roman mosaics in soft winter light",
  },
  {
    id: "artemis",
    href: "/trails/artemis",
    image: getTrailImage("artemis"),
    imageAlt: "Artemis Trail, Troodos pine forest, Cyprus winter hiking",
    title: "Artemis Trail",
    desc: "7 km of pine forest and ridge views",
  },
  {
    id: "kourion",
    href: "/discover/kourion",
    image: getAttractionImage("kourion", "ancient"),
    imageAlt: "Kourion Greco-Roman ruins above Mediterranean, Cyprus winter",
    title: "Kourion",
    desc: "Roman ruins, sunset over the sea",
  },
];

export type HomeFeaturedWinery = {
  wineryId: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
};

/** Discover-only editor picks pool — 8 candidates, 4 shown daily (rotated). */
export const discoverEditorsPicksPool: HomeEditorialPick[] = [
  {
    id: "omodos",
    href: "/discover/omodos",
    image: getAttractionImage("omodos", "village"),
    imageAlt: "Omodos village, wine heartland, cobbled streets—Cyprus winter",
    title: "Omodos",
    desc: "Cobbled streets, zivania, coffee in the wine heartland. Winter weekday mornings are quietest.",
  },
  {
    id: "pafos-mosaics",
    href: "/discover/pafos-mosaics",
    image: getAttractionImage("pafos-mosaics", "ancient"),
    imageAlt: "Pafos Roman mosaics in soft winter light—Cyprus",
    title: "Pafos mosaics",
    desc: "Roman mosaics in soft winter light. Winter light is softer—ideal for photos.",
  },
  {
    id: "kourion",
    href: "/discover/kourion",
    image: getAttractionImage("kourion", "ancient"),
    imageAlt: "Kourion Greco-Roman ruins above Mediterranean, Cyprus winter",
    title: "Kourion",
    desc: "Roman ruins, sunset over the sea. Sunset around 4:30 in winter.",
  },
  {
    id: "tsiakkas",
    href: "/discover/tsiakkas",
    image: getAttractionImage("tsiakkas", "winery"),
    imageAlt: "Tsiakkas winery, Troodos foothills, Cyprus winter",
    title: "Tsiakkas",
    desc: "Troodos foothills · heaters on the terrace · book ahead.",
  },
  {
    id: "lefkara",
    href: "/discover/lefkara",
    image: getAttractionImage("lefkara", "village"),
    imageAlt: "Lefkara village, lacemakers, cobbled streets—Cyprus winter",
    title: "Lefkara",
    desc: "Lefkaritiko lace, silver, winter light on the threads. Weekday mornings quietest.",
  },
  {
    id: "governors-beach",
    href: "/discover/governors-beach",
    image: getAttractionImage("governors-beach", "beach"),
    imageAlt: "Governor's Beach, white cliffs, dark sand—Cyprus winter",
    title: "Governor's Beach",
    desc: "White cliffs above dark sand. One of the best winter lunch spots on the coast.",
  },
  {
    id: "chrysorrogiatissa",
    href: "/discover/chrysorrogiatissa",
    image: getAttractionImage("chrysorrogiatissa", "monastery"),
    imageAlt: "Chrysorrogiatissa Monastery, Paphos hills—Cyprus winter",
    title: "Chrysorrogiatissa",
    desc: "The monks make wine. Buy a bottle. Paphos region stays mild in winter.",
  },
  {
    id: "vouni-panayia",
    href: "/discover/vouni-panayia",
    image: getAttractionImage("vouni-panayia", "winery"),
    imageAlt: "Vouni Panayia winery, Laona route—Cyprus winter",
    title: "Vouni Panayia",
    desc: "Laona route · Commandaria comparisons · cosy winter room. Book ahead.",
  },
  {
    id: "domes-sergiou",
    href: "/discover/domes-sergiou",
    image: getAttractionImage("domes-sergiou", "winery"),
    imageAlt: "Dómes Sergiou winery, Skarinou—indigenous varieties, Larnaca–Limassol corridor",
    title: "Dómes Sergiou",
    desc: "Skarinou · indigenous varieties · Atypon blends · book ahead. Easy drive from Larnaca or Limassol.",
  },
];

/** Four editor picks rotated daily from the pool. Promoted items appear ~2/7 days in a reserved slot. */
export function getDiscoverEditorsPicks(): HomeEditorialPick[] {
  const pool = discoverEditorsPicksPool;
  if (pool.length < 4) return pool;
  const startIdx = pickDailyWithKey(
    [0, 1, 2, 3, 4, 5, 6, 7, 8],
    "discover-editors"
  ) as number;
  let picks = [0, 1, 2, 3].map((i) => pool[(startIdx + i) % pool.length]);
  const promotedInPool = pool.filter((p) => PROMOTED_PLACE_IDS.includes(p.id));
  const forceBoost = pickDailyWithKey([0, 1, 2, 3, 4, 5, 6], "discover-editors-boost") as number;
  const shouldBoost = forceBoost < 2 && promotedInPool.length > 0;
  if (shouldBoost && !picks.some((p) => PROMOTED_PLACE_IDS.includes(p.id))) {
    const promoted = pickDailyWithKey(promotedInPool, "discover-editors-promoted");
    picks = [picks[0], picks[1], picks[2], promoted];
  }
  return picks;
}

/** @deprecated Use getDiscoverEditorsPicks for rotated picks. */
export const discoverEditorsPicks: HomeEditorialPick[] = discoverEditorsPicksPool.slice(0, 4);

export const homeFeaturedWineries: HomeFeaturedWinery[] = [
  {
    wineryId: "tsiakkas",
    title: "Tsiakkas",
    subtitle: "Troodos foothills · heaters on the terrace · book ahead",
    image: getAttractionImage("tsiakkas", "winery"),
    imageAlt: "Winter winery tasting in the Troodos foothills, Cyprus",
  },
  {
    wineryId: "vouni-panayia",
    title: "Vouni Panayia",
    subtitle: "Laona route · Commandaria comparisons · cosy winter room",
    image: getAttractionImage("vouni-panayia", "winery"),
    imageAlt: "Wine villages in the Paphos hills in winter light, Cyprus",
  },
  {
    wineryId: "domes-sergiou",
    title: "Dómes Sergiou",
    subtitle: "Between Larnaca & Limassol · indigenous varieties · modern",
    image: getAttractionImage("domes-sergiou", "winery"),
    imageAlt: "Modern Cypriot winery tasting, Cyprus winter",
  },
];

