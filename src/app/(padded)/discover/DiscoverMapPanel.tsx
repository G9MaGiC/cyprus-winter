"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import AppLink from "@/components/AppLink";
import AskAIButton from "@/components/AskAIButton";
import {
  activeMapPinKinds,
  buildDiscoverMapPlacesFromSections,
} from "@/lib/discover-map-places";
import type { PlanDayMapFocus } from "@/lib/discover-map-focus";
import type { DiscoverSection } from "@/lib/discover-sections";
import { CARD, CTA, SECTION, TYPE, LAYOUT, TOKENS } from "@/lib/design-tokens";
import type { DiscoverMapPinKind } from "./DiscoverMap";
import DiscoverMapClient from "./DiscoverMapClient";
import DiscoverMapToolbar from "./DiscoverMapToolbar";

const LEGEND_DOT: Record<DiscoverMapPinKind, string> = {
  winery: TOKENS.golden,
  village: TOKENS.terracotta,
  trail: TOKENS.sage,
  eat: TOKENS.charcoal,
  ancient: TOKENS.olive,
  coast: TOKENS.aegean,
  monastery: TOKENS.terracotta,
  activity: TOKENS.sage,
  other: TOKENS.terracotta,
};

type DiscoverMapPanelProps = {
  sections: DiscoverSection[];
  isActivityFilter: boolean;
  planFocus: PlanDayMapFocus;
  focusMode: boolean;
  onFocusModeChange: (enabled: boolean) => void;
  onResetView: () => void;
};

export default function DiscoverMapPanel({
  sections,
  isActivityFilter,
  planFocus,
  focusMode,
  onFocusModeChange,
  onResetView,
}: DiscoverMapPanelProps) {
  const tDiscover = useTranslations("discover");

  const places = useMemo(
    () =>
      buildDiscoverMapPlacesFromSections(sections, {
        includeTrailLinks: isActivityFilter,
      }),
    [sections, isActivityFilter]
  );

  const legendKinds = useMemo(() => activeMapPinKinds(places), [places]);

  const highlightIds = useMemo(
    () => (focusMode && planFocus.enabled ? new Set(planFocus.placeIds) : undefined),
    [focusMode, planFocus.enabled, planFocus.placeIds]
  );

  const focusBounds =
    focusMode && planFocus.enabled ? planFocus.bounds : null;

  return (
    <section
      id="discover-map"
      aria-labelledby="discover-map-heading"
      className={`${SECTION.pySub} ${LAYOUT.safeAreaX}`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <h2
          id="discover-map-heading"
          className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}
        >
          {places.length > 0
            ? tDiscover("map.sectionTitleWithCount", { count: places.length })
            : tDiscover("map.sectionTitle")}
        </h2>
        <p className="text-xs text-olive/60 -mt-2 mb-3">
          {tDiscover("map.curatedBy")}
        </p>

        {places.length > 0 && (
          <>
            <DiscoverMapToolbar
              placeCount={places.length}
              focus={planFocus}
              focusMode={focusMode}
              onFocusModeChange={onFocusModeChange}
              onResetView={onResetView}
            />
            {legendKinds.length > 0 && (
              <ul
                className="flex flex-wrap gap-x-4 gap-y-2 mb-3 text-xs text-olive/80"
                aria-label={tDiscover("map.legend.aria")}
              >
                {legendKinds.map((kind) => (
                  <li key={kind} className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: LEGEND_DOT[kind] }}
                      aria-hidden
                    />
                    {tDiscover(`map.legend.${kind}`)}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <div className={`${CARD.base} overflow-hidden bg-sand-100/50`}>
          {places.length === 0 ? (
            <div className="min-h-[280px] flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
              <p className="text-sm text-olive/70">{tDiscover("map.emptyTitle")}</p>
              <p className="text-xs text-olive/60">{tDiscover("map.emptyBody")}</p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <AppLink href="/discover" className={CTA.primaryCompact}>
                  {tDiscover("map.emptyBrowseCta")}
                </AppLink>
                <AskAIButton className={CTA.secondaryCompact} />
              </div>
            </div>
          ) : (
            <DiscoverMapClient
              places={places}
              focusBounds={focusBounds}
              highlightIds={highlightIds}
              dimUnhighlighted={focusMode && planFocus.enabled}
              showFooter={false}
              className="h-[min(65vh,560px)]"
            />
          )}
        </div>
        {places.length > 0 && (
          <p className="text-sm text-olive/70 mt-3">
            {tDiscover("map.footerCount", { count: places.length })}
          </p>
        )}
      </div>
    </section>
  );
}
