/**
 * Discover Place of Day — deterministic daily picks with type diversity.
 * Signals: date, promoted IDs, type diversity. (Future: weather-aware re-ranking.)
 */

import { getPlaceById } from "@/data";
import { getAttractionImage } from "@/lib/cyprus-images";
import { pickDailyMultipleWithTypeDiversity } from "@/lib/daily-rotator";
import { PROMOTED_PLACE_IDS } from "@/data/promoted";
import type { DiscoverItem } from "@/data/discover";

export type DiscoverPlaceOfDayPick = {
  id: string;
  name: string;
  /** Greek-first titles via getLocalizedName, same contract as the cards. */
  nameEl?: string;
  region: string;
  type: string;
  href: string;
  image: string;
  imageAlt: string;
  tease: string;
  overlay: string;
  pairWith?: { name: string; nameEl?: string; href: string };
};

const fallbackByType: Record<string, string> = {
  winery: "Heaters on the terrace.",
  village: "Cobbles to yourself midweek.",
  monastery: "Quiet this week.",
  nature: "Clear today.",
  ancient: "Best light in afternoon.",
  beach: "Quiet in winter.",
  restaurant: "Cosy in winter.",
};

const overlayByType: Record<string, string> = {
  winery: "Quiet this week",
  village: "Quiet this week",
  monastery: "Quiet this week",
  nature: "Clear today",
  ancient: "Best light in afternoon",
  beach: "Best light in afternoon",
  restaurant: "Cosy in winter",
};

export function getDiscoverPlaceOfDayPicks(
  allDiscoverItems: DiscoverItem[]
): DiscoverPlaceOfDayPick[] {
  if (allDiscoverItems.length === 0) return [];

  const picks = pickDailyMultipleWithTypeDiversity(
    allDiscoverItems,
    PROMOTED_PLACE_IDS,
    "discover-place-of-day",
    3,
    5
  );

  return picks.map((picked) => {
    const desc = picked.description ?? "";
    const tease =
      "winterTip" in picked && picked.winterTip
        ? picked.winterTip
        : desc.split(".")[0] + "." ||
          fallbackByType[picked.type] ||
          `${picked.region}. Worth a visit.`;
    const shortTease =
      tease.length > 100 ? tease.slice(0, 97) + "…" : tease;

    const combineWith =
      "combineWith" in picked &&
      picked.combineWith &&
      picked.combineWith.length > 0
        ? picked.combineWith[0]
        : undefined;
    const pairPlace = combineWith ? getPlaceById(combineWith) : undefined;
    const pairHref =
      pairPlace?.type === "trail"
        ? `/trails/${pairPlace.id}`
        : pairPlace
          ? `/discover/${pairPlace.id}`
          : undefined;

    return {
      id: picked.id,
      name: picked.name,
      nameEl: "nameEl" in picked ? picked.nameEl : undefined,
      region: picked.region,
      type: picked.type,
      href: `/discover/${picked.id}`,
      image: getAttractionImage(picked.id, picked.type),
      imageAlt: `${picked.name}, ${picked.region} — Cyprus winter`,
      tease: shortTease,
      overlay: overlayByType[picked.type] ?? "Worth a visit",
      pairWith:
        pairPlace && pairHref
          ? { name: pairPlace.name, nameEl: pairPlace.nameEl, href: pairHref }
          : undefined,
    };
  });
}
