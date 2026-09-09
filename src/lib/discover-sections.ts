import type { DiscoverItem } from "@/data/discover";
import { isCallAheadHours } from "@/lib/call-ahead";
import { isPartnerVerified } from "@/lib/partner-verification";
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
import { trails } from "@/data/trails";
import { LOCAL_WINTER_PICK_IDS } from "@/data/local-winter-picks";
import { slugifyBestFor } from "@/lib/best-for-shared";

export {
  PRACTICAL_DISCOVER_FILTERS,
  buildDiscoverFilterChipGroups,
  type PracticalDiscoverFilter,
} from "@/lib/discover-filter-chips";

export type DiscoverSection = {
  id: string;
  title: string;
  items: DiscoverItem[];
  trailLinks?: { id: string; name: string; nameEl?: string; href: string }[];
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
  /** Winery tasting line — placeCardHours' fallback when openingHours is
      absent (~19 wineries), so cards keep their hours preview. */
  tastingInfo?: string;
  /** EN-base call-ahead decision — survives future content overlays (AUD-10). */
  hoursCallAhead?: boolean;
  /** Server-computed isPartnerVerified() so raw partner emails never enter
      the client payload. */
  partnerVerified?: boolean;
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
  if ("tastingInfo" in item && (item as { tastingInfo?: string }).tastingInfo) {
    lean.tastingInfo = (item as { tastingInfo?: string }).tastingInfo;
  }
  // Overlaid records (localizeWineryContent) carry the flag decided on the EN
  // base; recomputing over their localized hours line would silently drop it.
  lean.hoursCallAhead =
    ("hoursCallAhead" in item ? item.hoursCallAhead : undefined) ??
    isCallAheadHours(
      ("openingHours" in item ? item.openingHours : undefined) ??
        ("tastingInfo" in item ? (item as { tastingInfo?: string }).tastingInfo : undefined)
    );
  if ("isVerified" in item || "partnerEmail" in item) {
    lean.partnerVerified = isPartnerVerified(
      item as { isVerified?: boolean; partnerEmail?: string }
    );
  }
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

/**
 * Audience tokens only (AUD-58, batch 80). The old "famil" substring pulled
 * *ownership* tokens ("Family-run", "Family heritage") into the children's
 * lane — tasting rooms are not family outings. Exact slug match keeps those
 * chips truthful on winery pages while the lane stays curated.
 */
const FAMILY_AUDIENCE_SLUGS = new Set(["families", "family-friendly"]);

export function isFamilyFriendly(item: { bestFor?: string[] }): boolean {
  return item.bestFor?.some((b) => FAMILY_AUDIENCE_SLUGS.has(slugifyBestFor(b))) ?? false;
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

/**
 * Curated family-lane lead (AUD-58, batch 80): winter flamingos and the UNESCO
 * round huts first, then the calm beaches; everything else keeps catalog order
 * via the stable sort. Reordering the source arrays would move the Coasts lane
 * and force a plan-items regeneration — this doesn't.
 */
const FAMILY_LEAD_IDS = [
  "larnaca-aliki",
  "choirokoitia",
  "fig-tree-bay",
  "nissi-beach",
  "coral-bay",
];

/** Short, easy trails a family can actually finish — rendered as chips via the
    section's `trailLinks` slot (trails carry no bestFor, so they can't join
    the lane itself). */
const FAMILY_TRAIL_IDS = ["kavos-trail", "livadi-trail", "dwarf-oaks"];

const familyLeadRank = (id: string) => {
  const i = FAMILY_LEAD_IDS.indexOf(id);
  return i === -1 ? FAMILY_LEAD_IDS.length : i;
};

/**
 * Re-applies the curated family lead as a stable sort — the single source of
 * truth for the lane's order. The client's interest personalization re-sorts
 * sections after hydration; the family section must call this afterwards so
 * personalization only reorders the unranked remainder.
 */
export function pinFamilyLead<T extends { id: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => familyLeadRank(a.id) - familyLeadRank(b.id));
}

export function buildDiscoverSections(
  allDiscoverItems: DiscoverItem[]
): DiscoverSection[] {
  const coastNature = natureSites.filter((item) => !ACTIVITY_PLACE_IDS_SET.has(item.id));
  const coastsItems = [...beaches, ...coastNature];
  const wineAndFoodItems = [...wineries, ...restaurants];
  const familyItems = pinFamilyLead(allDiscoverItems.filter(isFamilyFriendly));
  const familyTrailLinks = FAMILY_TRAIL_IDS.map((id) => {
    const t = trails.find((tr) => tr.id === id);
    if (!t) return null;
    const link: { id: string; name: string; nameEl?: string; href: string } = {
      id: t.id,
      name: t.name,
      nameEl: t.nameEl,
      href: `/trails/${t.id}`,
    };
    return link;
  }).filter((link): link is NonNullable<typeof link> => link != null);
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
    { id: "family", title: "family", items: familyItems, trailLinks: familyTrailLinks },
    { id: "accessible", title: "accessible", items: accessibleItems },
    { id: "local", title: "local", items: localWinterItems },
    { id: "hidden", title: "hidden", items: hiddenGemsItems },
  ];
}
