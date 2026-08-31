import type { DiscoverItem } from "@/data/discover";
import { isCallAheadHours } from "@/lib/place-card-hours";
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
import { LOCAL_WINTER_PICK_IDS } from "@/data/local-winter-picks";

export {
  PRACTICAL_DISCOVER_FILTERS,
  buildDiscoverFilterChipGroups,
  type PracticalDiscoverFilter,
} from "@/lib/discover-filter-chips";

export type DiscoverSection = {
  id: string;
  title: string;
  items: DiscoverItem[];
  trailLinks?: { id: string; name: string; href: string }[];
  seeMore?: { href: string; labelKey: string };
};

/**
 * Lean projection of a DiscoverItem for the /discover client boundary —
 * exactly the fields AttractionCard, the map (id-based lookup), and
 * interest sorting consume. Full items are ~319KB of JSON for the catalog;
 * this projection is ~136KB, and every field added here ships to the
 * browser twice (SSR HTML + RSC flight), so extend deliberately.
 */
export type DiscoverCardItem = {
  id: string;
  name: string;
  /** Native name for Greek-first card titles (ICPS §6.1 / AUD-100). */
  nameEl?: string;
  type: DiscoverItem["type"];
  region: string;
  description: string;
  highlights?: string[];
  bestFor?: string[];
  winterTip?: string;
  bestTimeToVisit?: string;
  openingHours?: string;
  /** EN-base call-ahead decision — survives future content overlays (AUD-10). */
  hoursCallAhead?: boolean;
  isVerified?: boolean;
  partnerEmail?: string;
};

/** A DiscoverSection with its items projected for the client boundary. */
export type DiscoverCardSection = Omit<DiscoverSection, "items"> & {
  items: DiscoverCardItem[];
};

export function toDiscoverCardItem(item: DiscoverItem): DiscoverCardItem {
  const lean: DiscoverCardItem = {
    id: item.id,
    name: item.name,
    type: item.type,
    region: item.region,
    description: item.description,
  };
  if ("nameEl" in item && item.nameEl) lean.nameEl = item.nameEl;
  if ("highlights" in item && item.highlights) lean.highlights = item.highlights;
  if ("bestFor" in item && item.bestFor) lean.bestFor = item.bestFor;
  if ("winterTip" in item && item.winterTip) lean.winterTip = item.winterTip;
  if ("bestTimeToVisit" in item && item.bestTimeToVisit) lean.bestTimeToVisit = item.bestTimeToVisit;
  if ("openingHours" in item && item.openingHours) lean.openingHours = item.openingHours;
  lean.hoursCallAhead = isCallAheadHours(
    ("openingHours" in item ? item.openingHours : undefined) ??
      ("tastingInfo" in item ? (item as { tastingInfo?: string }).tastingInfo : undefined)
  );
  if ("isVerified" in item && item.isVerified !== undefined) lean.isVerified = item.isVerified;
  if ("partnerEmail" in item && item.partnerEmail) lean.partnerEmail = item.partnerEmail;
  return lean;
}

export function toDiscoverCardSection(section: DiscoverSection): DiscoverCardSection {
  return { ...section, items: section.items.map(toDiscoverCardItem) };
}

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
  local: "local",
  hidden: "hidden",
  "off-beaten-path": "hidden",
};

export function isFamilyFriendly(item: { bestFor?: string[] }): boolean {
  return (
    item.bestFor?.some(
      (b) =>
        b.toLowerCase().includes("famil") || b.toLowerCase().includes("family")
    ) ?? false
  );
}

export function isAccessibleFriendly(item: {
  accessibility?: string;
  bestFor?: string[];
}): boolean {
  const acc = (item.accessibility ?? "").toLowerCase();
  if (
    acc.includes("not suitable") ||
    acc.includes("not for limited") ||
    acc.includes("strenuous") ||
    acc.includes("steep climb") ||
    (acc.includes("steep paths") && acc.includes("many steps"))
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

/** Editorial “Hidden gems” signal — bestFor tags only (not localSecret copy). */
export function isOffBeatenPath(item: { bestFor?: string[] }): boolean {
  return (
    item.bestFor?.some((b) => {
      const lower = b.toLowerCase();
      return lower.includes("off-the-beaten-path") || lower.includes("hidden gem");
    }) ?? false
  );
}

export function buildDiscoverSections(
  allDiscoverItems: DiscoverItem[]
): DiscoverSection[] {
  const coastNature = natureSites.filter((item) => !ACTIVITY_PLACE_IDS_SET.has(item.id));
  const coastsItems = [...beaches, ...coastNature];
  const wineAndFoodItems = [...wineries, ...restaurants];
  const familyItems = allDiscoverItems.filter(isFamilyFriendly);
  const accessibleItems = allDiscoverItems.filter(isAccessibleFriendly);
  const localWinterItems = allDiscoverItems.filter((item) =>
    (LOCAL_WINTER_PICK_IDS as readonly string[]).includes(item.id)
  );
  // Hidden gems: editorial bestFor tags only — not localSecret (almost every place has tip copy)
  // and not a family union (Family has its own section / filter).
  const hiddenGemsItems = allDiscoverItems.filter(isOffBeatenPath);

  return [
    // NOTE: `title` is non-user-facing fallback only; UI should use i18n keys like `discover.page.sections.${id}`.
    { id: "coasts", title: "coasts", items: coastsItems },
    { id: "ancient", title: "ancient", items: ancientSites },
    { id: "village", title: "village", items: villages },
    { id: "wine", title: "wine", items: wineAndFoodItems },
    { id: "monastery", title: "monastery", items: monasteries },
    { id: "family", title: "family", items: familyItems },
    { id: "accessible", title: "accessible", items: accessibleItems },
    { id: "local", title: "local", items: localWinterItems },
    { id: "hidden", title: "hidden", items: hiddenGemsItems },
  ];
}
