import type { DiscoverItem } from "@/data/discover";
import {
  beaches,
  natureSites,
  ancientSites,
  villages,
  monasteries,
} from "@/data/attractions";
import { ACTIVITY_PLACE_IDS_SET } from "@/data/activity-places";
import { wineries } from "@/data/wineries";
import { restaurants } from "@/data/restaurants";

export type DiscoverSection = {
  id: string;
  title: string;
  items: DiscoverItem[];
  trailLinks?: { id: string; name: string; href: string }[];
  seeMore?: { href: string; labelKey: string };
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
  family: "family",
  accessible: "accessible",
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

function isAccessibleFriendly(item: {
  accessibility?: string;
  bestFor?: string[];
}): boolean {
  const acc = (item.accessibility ?? "").toLowerCase();
  if (
    acc.includes("not suitable") ||
    acc.includes("not for limited") ||
    acc.includes("strenuous") ||
    acc.includes("steep climb") ||
    acc.includes("steep paths") && acc.includes("many steps")
  ) {
    return false;
  }
  if (
    acc.includes("accessible") ||
    acc.includes("manageable") ||
    acc.includes("ground floor") ||
    acc.includes("paved paths")
  ) {
    return true;
  }
  return (
    item.bestFor?.some((b) => {
      const lower = b.toLowerCase();
      return (
        lower.includes("accessible") ||
        lower.includes("wheelchair") ||
        lower.includes("limited mobility") ||
        lower.includes("gentle")
      );
    }) ?? false
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
  const coastNature = natureSites.filter((item) => !ACTIVITY_PLACE_IDS_SET.has(item.id));
  const coastsItems = [...beaches, ...coastNature];
  const wineAndFoodItems = [...wineries, ...restaurants];
  const familyItems = allDiscoverItems.filter(isFamilyFriendly);
  const accessibleItems = allDiscoverItems.filter(isAccessibleFriendly);
  const quietItems = allDiscoverItems.filter(isOffBeatenPath);
  const hiddenGemsItems = [...familyItems, ...quietItems].filter(
    (item, i, arr) => arr.findIndex((x) => x.id === item.id) === i
  );

  return [
    // NOTE: `title` is non-user-facing fallback only; UI should use i18n keys like `discover.page.sections.${id}`.
    { id: "coasts", title: "coasts", items: coastsItems },
    { id: "ancient", title: "ancient", items: ancientSites },
    { id: "village", title: "village", items: villages },
    { id: "wine", title: "wine", items: wineAndFoodItems },
    { id: "monastery", title: "monastery", items: monasteries },
    { id: "family", title: "family", items: familyItems },
    { id: "accessible", title: "accessible", items: accessibleItems },
    { id: "hidden", title: "hidden", items: hiddenGemsItems },
  ];
}
