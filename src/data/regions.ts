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

/** Match winery region string to a region slug (winery.region is like "Pelendri (Limassol)" or "Kathikas (Paphos)"). */
export function wineryMatchesRegion(wineryRegion: string, slug: RegionSlug): boolean {
  const r = wineryRegion.toLowerCase();
  switch (slug) {
    case "troodos":
      return /troodos|platres|kyperounta|omodos|koilani|pera pedi|pelendri|kyperounta|pitsilia|odou/i.test(r);
    case "paphos":
      return r.includes("paphos");
    case "larnaca":
      return r.includes("larnaca");
    case "limassol":
      return r.includes("limassol") || r.includes("lemesos");
    case "ayia-napa":
      return false; // no wineries in Ayia Napa
    default:
      return false;
  }
}
