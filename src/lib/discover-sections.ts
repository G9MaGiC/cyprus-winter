import type { DiscoverItem } from "@/data/discover";
import {
  beaches,
  natureSites,
  ancientSites,
  villages,
  monasteries,
} from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { restaurants } from "@/data/restaurants";

export type DiscoverSection = {
  id: string;
  title: string;
  items: DiscoverItem[];
};

/** Maps URL filter param to section id. */
export const filterToSectionId: Record<string, string> = {
  beach: "coasts",
  nature: "coasts",
  coasts: "coasts",
  ancient: "ancient",
  village: "village",
  winery: "wine",
  wine: "wine",
  eat: "wine",
  restaurant: "wine",
  monastery: "monastery",
  family: "hidden",
  quiet: "hidden",
  hidden: "hidden",
  "off-beaten-path": "hidden",
};

function isFamilyFriendly(item: { bestFor?: string[] }): boolean {
  return (
    item.bestFor?.some(
      (b) =>
        b.toLowerCase().includes("famil") || b.toLowerCase().includes("family")
    ) ?? false
  );
}

function isOffBeatenPath(item: {
  bestFor?: string[];
  localSecret?: string;
}): boolean {
  return (
    item.bestFor?.some(
      (b) =>
        b.toLowerCase().includes("off-the-beaten-path") ||
        b.toLowerCase().includes("hidden gem")
    ) ?? false
  ) || !!item.localSecret;
}

export function buildDiscoverSections(
  allDiscoverItems: DiscoverItem[]
): DiscoverSection[] {
  const coastsItems = [...beaches, ...natureSites];
  const wineAndFoodItems = [...wineries, ...restaurants];
  const familyItems = allDiscoverItems.filter(isFamilyFriendly);
  const quietItems = allDiscoverItems.filter(isOffBeatenPath);
  const hiddenGemsItems = [...familyItems, ...quietItems].filter(
    (item, i, arr) => arr.findIndex((x) => x.id === item.id) === i
  );

  return [
    { id: "coasts", title: "Coasts", items: coastsItems },
    { id: "ancient", title: "Ancient sites", items: ancientSites },
    { id: "village", title: "Villages", items: villages },
    { id: "wine", title: "Wine & food", items: wineAndFoodItems },
    { id: "monastery", title: "Monasteries & culture", items: monasteries },
    { id: "hidden", title: "Hidden gems", items: hiddenGemsItems },
  ];
}
