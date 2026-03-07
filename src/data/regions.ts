/**
 * Region config for landing pages. Used by /regions/[slug].
 * Filter logic: attractions/trails use region field; wineries use region string (e.g. "Pelendri (Limassol)").
 */
export type RegionSlug = "troodos" | "paphos" | "ayia-napa" | "larnaca" | "limassol";

export type RegionConfig = {
  slug: RegionSlug;
  title: string;
  description: string;
};

export const REGION_CONFIGS: RegionConfig[] = [
  {
    slug: "troodos",
    title: "Troodos Mountains in Winter",
    description:
      "Troodos Mountains in winter: trails, villages, wineries, Commandaria. Ski resort on Olympus, painted churches, black pine forest. Cyprus winter hiking hub. Plan your visit.",
  },
  {
    slug: "paphos",
    title: "Paphos Winter",
    description:
      "Beaches, ancient sites, villages, trails, wineries. Coral Bay, Pafos mosaics, Adonis Trail, Akamas wine route. Sixteen degrees when home is six. Plan your trip.",
  },
  {
    slug: "ayia-napa",
    title: "Ayia Napa & Cape Greco Winter",
    description:
      "East coast beaches, Cape Greco Coastal Path, sea caves. Nissi, Fig Tree Bay, Konnos. Mild winter sun. Sixteen degrees when home is six. Plan your visit.",
  },
  {
    slug: "larnaca",
    title: "Larnaca Winter",
    description:
      "Lefkara village, Kition, Hala Sultan. Lace, archaeology, winter events. Day trips to Limassol and Troodos. Sixteen degrees when home is six. Plan your trip.",
  },
  {
    slug: "limassol",
    title: "Limassol Winter",
    description:
      "Kourion, Kolossi, Governor's Beach. Krasochoria wine villages, Commandaria. Carnival, marathon, coast and hills. Sixteen degrees when home is six.",
  },
];

/** Chip-friendly display label for region picker and subtitles. */
export function getRegionShortLabel(slug: RegionSlug): string {
  switch (slug) {
    case "troodos":
      return "Troodos";
    case "paphos":
      return "Paphos";
    case "limassol":
      return "Limassol";
    case "larnaca":
      return "Larnaca";
    case "ayia-napa":
      return "Ayia Napa & Cape Greco";
    default:
      return slug;
  }
}

/** Filter attractions/trails/restaurants by region (simple region string match). */
export function filterByRegion<T extends { region: string }>(
  items: T[],
  slug: RegionSlug
): T[] {
  switch (slug) {
    case "troodos":
      return items.filter((i) => i.region === "Troodos");
    case "paphos":
      return items.filter((i) => i.region === "Paphos");
    case "ayia-napa":
      return items.filter((i) =>
        ["Ayia Napa", "Cape Greco", "Protaras"].includes(i.region)
      );
    case "larnaca":
      return items.filter((i) => i.region === "Larnaca");
    case "limassol":
      return items.filter((i) => i.region === "Limassol");
    default:
      return [];
  }
}

/** Match region string to a region slug. Handles attractions ("Paphos"), wineries ("Kathikas (Paphos)"), restaurants ("Platres"). */
export function itemMatchesRegion(regionStr: string, slug: RegionSlug): boolean {
  const r = regionStr.toLowerCase();
  switch (slug) {
    case "troodos":
      return r === "troodos" || /platres|kyperounta|omodos|koilani|pera pedi|pelendri|pitsilia|odou/i.test(r);
    case "paphos":
      return r === "paphos" || r.includes("paphos");
    case "larnaca":
      return r === "larnaca" || r.includes("larnaca");
    case "limassol":
      return r === "limassol" || r.includes("limassol") || r.includes("lemesos");
    case "ayia-napa":
      return ["ayia napa", "cape greco", "protaras"].includes(r);
    default:
      return false;
  }
}

/** Match winery region string to a region slug (winery.region is like "Pelendri (Limassol)" or "Kathikas (Paphos)"). */
export function wineryMatchesRegion(wineryRegion: string, slug: RegionSlug): boolean {
  return itemMatchesRegion(wineryRegion, slug);
}
