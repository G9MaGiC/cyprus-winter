import { natureExcursions } from "@/data/nature-excursions";
import type { NatureExcursion, NatureExcursionRegion } from "@/lib/nature-excursion-types";

export type { NatureExcursion, NatureExcursionRegion, NatureExcursionKind } from "@/lib/nature-excursion-types";
export {
  NATURE_EXCURSION_REGIONS,
  NATURE_PARTNER_LINKS,
  VC_EXCURSIONS_INDEX_URL,
} from "@/lib/nature-excursion-types";

export function natureExcursionCount(): number {
  return natureExcursions.length;
}

export function winterPickExcursions(): NatureExcursion[] {
  return natureExcursions.filter((e) => e.winterPick);
}

export function filterNatureExcursions(options: {
  region?: NatureExcursionRegion | null;
  kind?: string | null;
}): NatureExcursion[] {
  return natureExcursions.filter((e) => {
    if (options.region && e.region !== options.region) return false;
    if (options.kind && e.kind !== options.kind) return false;
    return true;
  });
}
