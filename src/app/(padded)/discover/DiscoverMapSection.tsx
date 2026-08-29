import { buildDiscoverMapPlaces } from "@/lib/discover-map-places";
import { SECTION, TYPE, LAYOUT } from "@/lib/design-tokens";
import DiscoverMapClient from "./DiscoverMapClient";
import { getTranslations } from "next-intl/server";

export default async function DiscoverMapSection() {
  const places = buildDiscoverMapPlaces();
  const tDiscover = await getTranslations("discover");
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
          {places.length > 0 ? tDiscover("map.sectionTitleWithCount", { count: places.length }) : tDiscover("map.sectionTitle")}
        </h2>
        <p className="text-xs text-muted-ink -mt-2 mb-3">
          {tDiscover("map.curatedBy")}
        </p>
        <div className="rounded-xl overflow-hidden border border-sand-200/80 bg-sand-100/50 shadow-[0_2px_12px_rgba(37,39,48,0.06)]">
          {places.length === 0 ? (
            <div className="min-h-[280px] flex flex-col items-center justify-center gap-2 py-12 px-6 text-center">
              <p className="text-sm text-muted-ink">{tDiscover("map.emptyTitle")}</p>
              <p className="text-xs text-muted-ink">{tDiscover("map.emptyBody")}</p>
            </div>
          ) : (
            <DiscoverMapClient places={places} />
          )}
        </div>
      </div>
    </section>
  );
}
