"use client";

import { useTranslations } from "next-intl";
import { CTA } from "@/lib/design-tokens";
import type { PlanDayMapFocus } from "@/lib/discover-map-focus";

type DiscoverMapToolbarProps = {
  placeCount: number;
  focus: PlanDayMapFocus;
  focusMode: boolean;
  onFocusModeChange: (enabled: boolean) => void;
  onResetView: () => void;
};

export default function DiscoverMapToolbar({
  placeCount,
  focus,
  focusMode,
  onFocusModeChange,
  onResetView,
}: DiscoverMapToolbarProps) {
  const tDiscover = useTranslations("discover");

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <button
        type="button"
        aria-pressed={focusMode}
        disabled={!focus.enabled}
        title={
          !focus.enabled ? tDiscover("map.toolbar.nearPlanDayDisabled") : undefined
        }
        onClick={() => onFocusModeChange(!focusMode)}
        className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          focusMode && focus.enabled ? CTA.chipPrimary : CTA.chipTertiary
        }`}
      >
        {focus.enabled
          ? tDiscover("map.focus.dayLabel", { day: focus.planDay })
          : tDiscover("map.toolbar.nearPlanDay")}
      </button>
      {(focusMode || focus.enabled) && (
        <button
          type="button"
          onClick={onResetView}
          className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium ${CTA.chipTertiary} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2`}
        >
          {tDiscover("map.toolbar.resetView")}
        </button>
      )}
      <span className="text-sm text-muted-ink ml-auto">
        {tDiscover("map.toolbar.placeCount", { count: placeCount })}
      </span>
    </div>
  );
}
