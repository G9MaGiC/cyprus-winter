import { getPlaceById } from "@/data";
import { getPlaceCoords } from "@/lib/place-coords";
import { allDiscoverItems } from "@/data/discover";
import { SECTION, TYPE, LAYOUT } from "@/lib/design-tokens";
import type { DiscoverMapPlace } from "./DiscoverMap";
import DiscoverMapClient from "./DiscoverMapClient";
import { getTranslations } from "next-intl/server";

function getDiscoverMapPlaces(): DiscoverMapPlace[] {
  const results: DiscoverMapPlace[] = [];
  const seen = new Set<string>();

  for (const item of allDiscoverItems) {
    const place = getPlaceById(item.id);
    if (!place) continue;
    const coords = getPlaceCoords(place);
    if (!coords) continue;

    const key = `${place.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({
      id: place.id,
      name: place.name,
      href: `/discover/${place.id}`,
      region: place.region,
      lat: coords.lat,
      lng: coords.lng,
    });
  }

  return results;
}

export default async function DiscoverMapSection() {
  const places = getDiscoverMapPlaces();
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
        <p className="text-xs text-olive/60 -mt-2 mb-3">
          {tDiscover("map.curatedBy")}
        </p>
        <div className="rounded-xl overflow-hidden border border-sand-200/80 bg-sand-100/50 shadow-[0_2px_12px_rgba(37,39,48,0.06)]">
          {places.length === 0 ? (
            <div className="min-h-[280px] flex flex-col items-center justify-center gap-2 py-12 px-6 text-center">
              <p className="text-sm text-olive/70">{tDiscover("map.emptyTitle")}</p>
              <p className="text-xs text-olive/60">{tDiscover("map.emptyBody")}</p>
            </div>
          ) : (
            <DiscoverMapClient places={places} />
          )}
        </div>
      </div>
    </section>
  );
}
