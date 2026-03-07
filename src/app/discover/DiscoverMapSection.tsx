import { getPlaceById } from "@/data";
import { getPlaceCoords } from "@/lib/place-coords";
import {
  beaches,
  natureSites,
  ancientSites,
  villages,
  monasteries,
} from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { restaurants } from "@/data/restaurants";
import { SECTION, TYPE, LAYOUT } from "@/lib/design-tokens";
import type { DiscoverMapPlace } from "./DiscoverMap";
import DiscoverMapClient from "./DiscoverMapClient";

const allDiscoverItems = [
  ...beaches,
  ...natureSites,
  ...ancientSites,
  ...villages,
  ...wineries,
  ...restaurants,
  ...monasteries,
];

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

export default function DiscoverMapSection() {
  const places = getDiscoverMapPlaces();
  return (
    <section
      aria-labelledby="discover-map-heading"
      className={`${SECTION.pySub} ${LAYOUT.safeAreaX}`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <h2
          id="discover-map-heading"
          className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}
        >
          Explore on map
        </h2>
        <DiscoverMapClient places={places} />
      </div>
    </section>
  );
}
