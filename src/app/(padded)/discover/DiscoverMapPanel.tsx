"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import AppLink from "@/components/AppLink";
import AskAIButton from "@/components/AskAIButton";
import { buildDiscoverMapPlaces } from "@/lib/discover-map-places";
import type { DiscoverSection } from "@/lib/discover-sections";
import { CARD, CTA, SECTION, TYPE, LAYOUT } from "@/lib/design-tokens";
import DiscoverMapClient from "./DiscoverMapClient";

type DiscoverMapPanelProps = {
  sections: DiscoverSection[];
};

export default function DiscoverMapPanel({ sections }: DiscoverMapPanelProps) {
  const tDiscover = useTranslations("discover");
  const placeIds = useMemo(
    () => sections.flatMap((s) => s.items.map((item) => item.id)),
    [sections]
  );
  const places = useMemo(
    () => buildDiscoverMapPlaces(placeIds),
    [placeIds]
  );

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
            <DiscoverMapClient places={places} />
          )}
        </div>
      </div>
    </section>
  );
}
