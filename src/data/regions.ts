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
      "Trails, villages, wineries, monasteries. Ski resort on Olympus, Commandaria in the Krasochoria, painted churches, black pine forest.",
  },
  {
    slug: "paphos",
    title: "Paphos Winter",
    description:
      "Beaches, ancient sites, villages, trails, wineries. Coral Bay, Pafos mosaics, Adonis Trail, Akamas wine route.",
  },
  {
    slug: "ayia-napa",
    title: "Ayia Napa & Cape Greco Winter",
    description:
      "East coast beaches, Cape Greco Coastal Path, sea caves. Nissi, Fig Tree Bay, Konnos. Mild winter sun.",
  },
  {
    slug: "larnaca",
    title: "Larnaca Winter",
    description:
      "Lefkara village, Kition, Hala Sultan. Lace, archaeology, winter events. Day trips to Limassol and Troodos.",
  },
  {
    slug: "limassol",
    title: "Limassol Winter",
    description:
      "Kourion, Kolossi, Governor's Beach. Krasochoria wine villages, Commandaria. Carnival, marathon, coast and hills.",
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
