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
        <div
          className={`rounded-xl overflow-hidden ${CARD.base} ${CARD.hover} ${CARD.interactive} group flex flex-col sm:flex-row`}
        >
          <Link
            href={place.href}
            className="block sm:w-1/3 shrink-0 relative aspect-[4/3] sm:aspect-square"
            aria-label={`Open ${place.name}`}
          >
            <Image
              src={place.image}
              alt={place.imageAlt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent"
              aria-hidden
            />
            <span className="absolute bottom-3 left-3 right-3 text-white text-sm font-medium drop-shadow-md">
              {place.overlay}
            </span>
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-charcoal">
              Winter pick
            </span>
          </Link>
          <div className="flex-1 flex flex-col p-5 sm:p-6">
            <p
              id="discover-place-of-day-heading"
              className="text-xs font-medium uppercase tracking-wider text-sage prose-label"
            >
              Place of the day
            </p>
            <Link
              href={place.href}
              className="font-display text-xl font-semibold text-charcoal group-hover:text-terracotta transition-colors mt-0.5"
            >
              {place.name}
            </Link>
            <p className="text-sm text-olive/90 mt-1 leading-relaxed flex-1">
              {place.tease}
            </p>
            {place.pairWith && (
              <p className="text-sm text-olive/80 mt-2">
                Pair with{" "}
                <Link
                  href={place.pairWith.href}
                  className="font-medium text-terracotta hover:text-terracotta-muted transition-colors underline"
                >
                  {place.pairWith.name}
                </Link>
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {planItem && <NavigateButton place={planItem} />}
              <AddToItineraryButton placeId={place.id} label="Add to plan" />
              <Link
                href={place.href}
                className="text-sm font-medium text-terracotta hover:text-terracotta-muted transition-colors"
              >
                See details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
