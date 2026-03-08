"use client";

import { REGION_CONFIGS, getRegionShortLabel, type RegionSlug } from "@/data/regions";
import { SECTION } from "@/lib/design-tokens";

type RegionPickerChipsProps = {
  onSelect: (slug: RegionSlug) => void;
  onUseLocation?: () => void;
};

export default function RegionPickerChips({
  onSelect,
  onUseLocation,
}: RegionPickerChipsProps) {
  return (
    <>
      <div className={`flex flex-wrap gap-2 ${SECTION.headingGap}`}>
        {REGION_CONFIGS.map((config) => (
          <button
            key={config.slug}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(config.slug);
            }}
            className="min-h-[44px] px-3 py-2 rounded-md border border-sand-200/80 bg-white text-olive text-sm font-medium hover:bg-sand-50/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-2"
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
          Use my location instead
        </button>
      )}
    </>
  );
}
