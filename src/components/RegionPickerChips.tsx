"use client";

import { useTranslations } from "next-intl";
import { REGION_CONFIGS, getRegionShortLabel, type RegionSlug } from "@/data/regions";
import { SECTION } from "@/lib/design-tokens";

type RegionPickerChipsProps = {
  onSelect: (slug: RegionSlug) => void;
  onUseLocation?: () => void;
  /** First favorite region from user preferences — shown as "For you" chip */
  suggestedRegion?: RegionSlug | null;
};

export default function RegionPickerChips({
  onSelect,
  onUseLocation,
  suggestedRegion,
}: RegionPickerChipsProps) {
  const tCommon = useTranslations("common");
  const configs = REGION_CONFIGS;
  const suggested = suggestedRegion && configs.some((c) => c.slug === suggestedRegion) ? suggestedRegion : null;

  return (
    <>
      <div className={`flex flex-wrap gap-2 ${SECTION.headingGap}`}>
        {suggested && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(suggested);
            }}
            className="min-h-[44px] px-3 py-2 rounded-md border-2 border-terracotta/40 bg-terracotta/5 text-terracotta text-sm font-medium hover:bg-terracotta/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-2"
          >
            For you: {getRegionShortLabel(suggested)}
          </button>
        )}
        {configs
          .filter((config) => config.slug !== suggested)
          .map((config) => (
          <button
            key={config.slug}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(config.slug);
            }}
            className="min-h-[44px] px-3 py-2 rounded-md border border-sand-200/80 bg-white text-olive text-sm font-medium hover:bg-sand-100/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-2"
          >
            {getRegionShortLabel(config.slug)}
          </button>
        ))}

      </div>
      {onUseLocation && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUseLocation();
          }}
          className="text-sm text-olive/70 hover:text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-2 rounded"
        >
          {tCommon("useMyLocationInstead")}
        </button>
      )}
    </>
  );
}
