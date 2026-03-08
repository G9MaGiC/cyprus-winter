import Image from "next/image";
import Link from "next/link";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import NavigateButton from "@/components/NavigateButton";
import { CARD, LAYOUT, SECTION } from "@/lib/design-tokens";
import { getPlaceById } from "@/data";
import { getAttractionImage } from "@/lib/cyprus-images";
import { pickDailySafeWithBoost } from "@/lib/daily-rotator";
import { PROMOTED_PLACE_IDS } from "@/data/promoted";
import {
  beaches,
  natureSites,
  ancientSites,
  villages,
  monasteries,
} from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { restaurants } from "@/data/restaurants";
import type { Attraction } from "@/data/attractions";
import type { Winery } from "@/data/wineries";
import type { Restaurant } from "@/data/restaurants";

const allDiscoverItems = [
  ...beaches,
  ...natureSites,
  ...ancientSites,
  ...villages,
  ...wineries,
  ...restaurants,
  ...monasteries,
] as (Attraction | Winery | Restaurant)[];

function getDiscoverPlaceOfDay() {
  if (allDiscoverItems.length === 0) return null;
  const picked = pickDailySafeWithBoost(
    allDiscoverItems,
    PROMOTED_PLACE_IDS,
    "discover-place-of-day",
    5
  );
  if (!picked) return null;

  const desc = picked.description;
  const fallbackByType: Record<string, string> = {
    winery: "Heaters on the terrace.",
    village: "Cobbles to yourself midweek.",
    monastery: "Quiet this week.",
    nature: "Clear today.",
    ancient: "Best light in afternoon.",
    beach: "Quiet in winter.",
    restaurant: "Cosy in winter.",
  };
  const tease =
    "winterTip" in picked && picked.winterTip
      ? picked.winterTip
      : desc.split(".")[0] + "." || fallbackByType[picked.type] || `${picked.region}. Worth a visit.`;
  const shortTease = tease.length > 100 ? tease.slice(0, 97) + "…" : tease;

  const overlayByType: Record<string, string> = {
    winery: "Quiet this week",
    village: "Quiet this week",
    monastery: "Quiet this week",
    nature: "Clear today",
    ancient: "Best light in afternoon",
    beach: "Best light in afternoon",
    restaurant: "Cosy in winter",
  };

  const combineWith = "combineWith" in picked && picked.combineWith && picked.combineWith.length > 0
    ? picked.combineWith[0]
    : undefined;
  const pairPlace = combineWith ? getPlaceById(combineWith) : undefined;
  const pairHref =
    pairPlace?.type === "trail"
      ? `/trails/${pairPlace.id}`
      : pairPlace
        ? `/discover/${pairPlace.id}`
        : undefined;

  return {
    id: picked.id,
    name: picked.name,
    region: picked.region,
    href: `/discover/${picked.id}`,
    image: getAttractionImage(picked.id, picked.type),
    imageAlt: `${picked.name}, ${picked.region} — Cyprus winter`,
    tease: shortTease,
    overlay: overlayByType[picked.type] ?? "Worth a visit",
    pairWith: pairPlace && pairHref ? { name: pairPlace.name, href: pairHref } : undefined,
  };
}

export default function DiscoverPlaceOfDay() {
  const place = getDiscoverPlaceOfDay();
  const planItem = place ? getPlaceById(place.id) : undefined;
  if (!place) return null;

  return (
    <section
      aria-labelledby="discover-place-of-day-heading"
      className={`${SECTION.pySub} ${LAYOUT.safeAreaX}`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <h2
          id="discover-place-of-day-heading"
          className="text-olive/70 text-sm font-semibold uppercase tracking-wider mb-3"
        >
          Today&apos;s pick
        </h2>
        <div
          className={`rounded-2xl overflow-hidden ${CARD.planCombo} ${CARD.interactive} group flex flex-col sm:flex-row`}
        >
          <Link
            href={place.href}
            className="block sm:w-2/5 shrink-0 relative aspect-[4/3] sm:aspect-square"
            aria-label={`Open ${place.name}`}
          >
            <Image
              src={place.image}
              alt={place.imageAlt}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300 ease-out"
              sizes="(max-width: 640px) 100vw, 40vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent pointer-events-none"
              aria-hidden
            />
            <span className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium drop-shadow-lg">
              {place.overlay}
            </span>
            <span className="absolute top-4 right-4 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-white/95 text-charcoal">
              Place of the day
            </span>
          </Link>
          <div className={`flex-1 flex flex-col ${CARD.content} justify-between`}>
            <div>
              <Link
                href={place.href}
                className="font-display text-2xl sm:text-xl font-semibold text-charcoal group-hover:text-terracotta transition-colors block"
              >
                {place.name}
              </Link>
              <p className="text-sm text-olive/90 mt-2 leading-relaxed">
                {place.tease}
              </p>
              {place.pairWith && (
                <p className="text-sm text-olive/80 mt-3">
                  Pair with{" "}
                  <Link
                    href={place.pairWith.href}
                    className="font-medium text-aegean hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 rounded"
                  >
                    {place.pairWith.name}
                  </Link>
                </p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {planItem && <NavigateButton place={planItem} />}
              <AddToItineraryButton placeId={place.id} label="Add to plan" />
              <Link
                href={place.href}
                className="text-sm font-medium text-terracotta hover:text-terracotta-muted transition-colors min-h-[44px] inline-flex items-center"
              >
                See details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
