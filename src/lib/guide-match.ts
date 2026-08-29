import { guides, type Guide } from "@/data/guides";
import { getPlaceById } from "@/data";
import { districtForTrailRegion, filterLicensedGuides } from "@/lib/guides-directory";
import {
  LOCALE_TO_GUIDE_LANGUAGE,
  type TouristGuideDistrict,
} from "@/lib/guides-directory-types";
import { sortGuidesByLocaleMatch } from "@/lib/guide-partners";
import { findTrailByIdOrSlug } from "@/lib/trail-resolve";

export type GuideMatchResult = {
  verifiedGuides: Guide[];
  /** Single district when all plan trails share one; otherwise null. */
  district: TouristGuideDistrict | null;
  language: string | null;
  licensedCount: number;
  trailIds: string[];
};

export function getVerifiedGuidesForTrail(trailId: string): Guide[] {
  const trail = findTrailByIdOrSlug(trailId);
  const canonicalId = trail?.id ?? trailId;
  return guides.filter((g) => g.isVerified && g.trailIds.includes(canonicalId));
}

export function buildGuideDirectoryHref(options: {
  district?: TouristGuideDistrict | null;
  language?: string | null;
  from?: string;
}): string {
  const params = new URLSearchParams();
  if (options.district) params.set("district", options.district);
  if (options.language) params.set("lang", options.language);
  if (options.from) params.set("from", options.from);
  const qs = params.toString();
  return qs ? `/guides/directory?${qs}` : "/guides/directory";
}

function uniqueGuides(items: Guide[]): Guide[] {
  const seen = new Set<string>();
  return items.filter((g) => {
    if (seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });
}

/** Match verified partners and licensed directory for trails on a plan. */
export function matchGuidesForPlanItemIds(
  itemIds: string[],
  locale?: string | null
): GuideMatchResult {
  const trailIds: string[] = [];
  const districts = new Set<TouristGuideDistrict>();

  for (const id of itemIds) {
    const place = getPlaceById(id);
    if (place?.type !== "trail") continue;
    trailIds.push(place.id);
    const district = districtForTrailRegion(place.region);
    if (district) districts.add(district);
  }

  const verifiedGuides = sortGuidesByLocaleMatch(
    uniqueGuides(trailIds.flatMap((tid) => getVerifiedGuidesForTrail(tid))),
    locale
  );

  const language = locale ? (LOCALE_TO_GUIDE_LANGUAGE[locale] ?? null) : null;
  const district = districts.size === 1 ? [...districts][0]! : null;
  const licensedCount = filterLicensedGuides({ district, language }).length;

  return { verifiedGuides, district, language, licensedCount, trailIds };
}

/** Best verified guide for a single trail, or directory href params. */
export function matchGuideForTrail(
  trailId: string,
  locale?: string | null
): {
  verifiedGuide: Guide | null;
  directoryHref: string;
  licensedCount: number;
} {
  const verified = sortGuidesByLocaleMatch(getVerifiedGuidesForTrail(trailId), locale);
  const trail = findTrailByIdOrSlug(trailId);
  const district = trail ? districtForTrailRegion(trail.region) ?? null : null;
  const language = locale ? (LOCALE_TO_GUIDE_LANGUAGE[locale] ?? null) : null;
  const licensedCount = filterLicensedGuides({ district, language }).length;

  return {
    verifiedGuide: verified[0] ?? null,
    directoryHref: buildGuideDirectoryHref({ district, language, from: "trail" }),
    licensedCount,
  };
}
