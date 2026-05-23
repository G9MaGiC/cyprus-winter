import type { DiscoverItem } from "@/data/discover";
import { trails } from "@/data/trails";
import type { Interest } from "@/lib/user-preferences";
import type { DiscoverSection } from "@/lib/discover-sections";

/** URL filter params for home mood chips → discover sections. */
export const ACTIVITY_FILTER_KEYS = [
  "bouldering",
  "climbing",
  "cycling",
  "watersports",
  "quiet",
  "mountains",
  "wellness",
] as const;

export type ActivityFilterKey = (typeof ACTIVITY_FILTER_KEYS)[number];

export function isActivityFilterKey(value: string): value is ActivityFilterKey {
  return (ACTIVITY_FILTER_KEYS as readonly string[]).includes(value);
}

/** Curated place IDs per activity (includes villages, monasteries, nature sites). */
export const ACTIVITY_PLACE_IDS: Record<ActivityFilterKey, string[]> = {
  bouldering: [
    "gerakopetra-boulders",
    "droushia-konefti-boulders",
    "episkopi-boulders",
    "ineia",
    "droushia",
    "arakapas-boulders",
    "klirou-boulders",
    "eptagoneia-limestone-boulders",
    "climb-cyprus-limassol",
  ],
  climbing: [
    "gerakopetra-boulders",
    "episkopi-crags",
    "droushia-konefti-boulders",
    "cape-greco-climbing",
    "kourion-coastal-scramble",
    "white-rocks-paphos",
    "petra-tou-romiou-cliffs",
    "buffavento",
  ],
  cycling: [
    "troodos-cycling-hub",
    "prodromos-dam-cycling",
    "pitsilia-cycling-loop",
    "kellaki-kyparissia-ridge",
    "krasochoria-gravel-loop",
    "trimiklini-dam-cycling",
    "xyliatos-dam-cycle",
    "potamia-dam-cycling",
    "akamas-latchi-cycling",
    "limassol-coastal-cycle",
    "silikou-valley-trail",
    "alona",
    "kellaki",
    "trimiklini",
    "prodromos",
    "platres",
    "larnaca-village-coastal-cycle",
  ],
  watersports: [
    "latchi-kayak-base",
    "pomos-harbour-coast",
    "amphorae-caves-paphos",
    "green-bay-protaras",
    "pissouri-bay-coast",
    "lara-bay",
    "paramali-coast",
    "zenobia-diving",
    "mackenzie-larnaca-coast",
    "germasogeia-dam-paddle",
    "cape-greco-kayak",
    "cape-greco-cyclops-dive",
    "white-rocks-paphos",
    "lady-mile-windsurf",
  ],
  quiet: [
    "tochni",
    "vretsia",
    "nikitari",
    "doros",
    "monagri-village",
    "silikou",
    "apsiou",
    "kalavasos",
    "foini",
    "kato-drys",
    "koili",
    "kampi-farmaka",
    "kritou-terra",
    "pelathousa",
    "milia",
    "moutoullas",
    "lagoudera",
    "vavla",
    "galata",
    "zodiakos",
    "lofou",
    "fikardou",
  ],
  mountains: [
    "prodromos",
    "kato-platres",
    "kannavia",
    "statos-agios-fotios",
    "polystipos",
    "alona",
    "amiantos",
    "mitsero",
    "kykkos",
    "trooditissa",
    "machairas",
    "fikardou",
    "platres",
    "pedoulas",
    "kalopanagiotis",
    "moutoullas",
    "lagoudera",
    "spilia",
    "agros",
  ],
  wellness: [
    "kalopanagiotis",
    "tzelefos-bridge",
    "milia",
    "mesa-potamos-grove",
    "minthis-forest-paphos",
    "kannavia-forest-bathing",
    "kannavia",
    "panagia-asinou",
    "panagia-tou-araka",
    "st-nicholas-roof",
    "ayii-anargyri-spa",
    "st-neophytos",
    "prodromos",
    "kato-platres",
    "silikou-valley-trail",
    "kykkos",
    "trooditissa",
    "athalassa-forest-park",
  ],
};

/** Related trail IDs shown below place cards on activity filters. */
export const ACTIVITY_TRAIL_IDS: Record<ActivityFilterKey, string[]> = {
  bouldering: ["vretsia-roudias", "smigies", "avakas-gorge"],
  climbing: [
    "avakas-gorge",
    "cape-greco",
    "pentadaktylos",
    "petra-tou-romiou",
    "cape-aspro",
    "sea-caves-anargyroi",
  ],
  cycling: [
    "germasogeia-kyparissia",
    "larnaca-salt-lake",
    "vavatsinia-honeybee",
    "e4-troodos-platres",
    "xyliatos-dam",
    "potamia-dam",
    "madari-ridge",
    "politiko-machairas",
  ],
  watersports: [
    "cape-greco",
    "aphrodite",
    "petra-tou-romiou",
    "adonis",
    "sea-caves-anargyroi",
    "cape-aspro",
    "kavos-trail",
  ],
  quiet: [
    "vavatsinia-honeybee",
    "persephone",
    "almirolivado",
    "kryos-potamos-loop",
    "vretsia-roudias",
    "horteri",
  ],
  mountains: [
    "artemis",
    "olympus-summit",
    "caledonia-falls",
    "atalante",
    "madari-ridge",
    "kryos-potamos-loop",
    "millomeris-falls",
    "mesa-potamos",
  ],
  wellness: [
    "persephone",
    "atalante",
    "artemis",
    "kryos-potamos-loop",
    "mesa-potamos",
    "machairas-forest",
  ],
};

export const ACTIVITY_SEE_MORE: Partial<
  Record<ActivityFilterKey, { href: string; labelKey: string }>
> = {
  mountains: { href: "/trails?region=Troodos", labelKey: "seeAllMountainTrails" },
  climbing: { href: "/trails", labelKey: "browseAllTrails" },
  cycling: { href: "/trails", labelKey: "browseAllTrails" },
  watersports: { href: "/beaches", labelKey: "seeCoasts" },
  quiet: { href: "/discover?filter=hidden", labelKey: "seeHiddenGems" },
  bouldering: { href: "/search?q=bouldering", labelKey: "searchMore" },
  wellness: { href: "/discover?filter=monastery", labelKey: "seeMonasteries" },
};

const SECTION_TITLE_KEYS: Record<ActivityFilterKey, string> = {
  bouldering: "bouldering",
  climbing: "climbing",
  cycling: "cycling",
  watersports: "watersports",
  quiet: "quiet",
  mountains: "mountains",
  wellness: "wellness",
};

export type ActivityDiscoverSection = DiscoverSection & {
  trailLinks?: { id: string; name: string; href: string }[];
  seeMore?: { href: string; labelKey: string };
};

export function buildActivitySection(
  key: ActivityFilterKey,
  allDiscoverItems: DiscoverItem[]
): ActivityDiscoverSection | null {
  const byId = new Map(allDiscoverItems.map((item) => [item.id, item]));
  const placeIds = ACTIVITY_PLACE_IDS[key];
  const items = placeIds
    .map((id) => byId.get(id))
    .filter((item): item is DiscoverItem => item != null);

  if (items.length === 0) return null;

  const trailLinks = ACTIVITY_TRAIL_IDS[key]
    .map((id) => {
      const t = trails.find((tr) => tr.id === id);
      if (!t) return null;
      return { id: t.id, name: t.name, href: `/trails/${t.id}` };
    })
    .filter((link): link is { id: string; name: string; href: string } => link != null);

  return {
    id: key,
    title: SECTION_TITLE_KEYS[key],
    items,
    trailLinks: trailLinks.length > 0 ? trailLinks : undefined,
    seeMore: ACTIVITY_SEE_MORE[key],
  };
}

/** Minimum curated picks per activity (places + trails) for QA. */
export function countActivityOptions(key: ActivityFilterKey): number {
  const places = ACTIVITY_PLACE_IDS[key].length;
  const trailCount = ACTIVITY_TRAIL_IDS[key].length;
  return places + trailCount;
}

/** Map activity filter to user-preferences Interest where applicable. */
export const ACTIVITY_TO_INTEREST: Partial<Record<ActivityFilterKey, Interest>> = {
  bouldering: "bouldering",
  climbing: "climbing",
  cycling: "cycling",
  watersports: "active",
  quiet: "wellness",
  mountains: "active",
  wellness: "wellness",
};
