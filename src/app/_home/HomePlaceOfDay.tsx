import Image from "next/image";
import Link from "next/link";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { CARD, LAYOUT, SECTION } from "@/lib/design-tokens";
import { allPlaces, getAttractionById } from "@/data";
import { getAttractionImage, getTrailImage } from "@/lib/cyprus-images";
import { pickDailyWithKey } from "@/lib/daily-rotator";
import { trails } from "@/data/trails";

const PLACE_TYPES = ["attraction", "trail", "winery"] as const;

function getPlaceOfDayData() {
  const candidates = allPlaces.filter((p) =>
    PLACE_TYPES.includes(p.type as (typeof PLACE_TYPES)[number])
  );
  if (candidates.length === 0) return null;

  const picked = pickDailyWithKey(candidates, "place-of-day");

  if (picked.type === "trail") {
    const trail = trails.find((t) => t.id === picked.id);
    if (!trail) return null;
    const tease =
      trail.winterNotes ||
      trail.description.split(".")[0] + "." ||
      "Check reports before you go.";
    return {
      id: picked.id,
      name: picked.name,
      region: picked.region,
      href: `/trails/${picked.id}`,
      image: getTrailImage(picked.id),
      imageAlt: `${picked.name}, ${picked.region} — Troodos trail`,
      tease: tease.length > 100 ? tease.slice(0, 97) + "…" : tease,
      overlay: "Good day for it",
    };
  }

  const att = getAttractionById(picked.id);
  if (!att) return null;

  const desc = att.description;
  const fallbackByType: Record<string, string> = {
    winery: "Heaters on the terrace.",
    village: "Cobbles to yourself midweek.",
    monastery: "Quiet this week.",
    nature: "Clear today.",
    ancient: "Best light in afternoon.",
    beach: "Quiet in winter.",
  };
  const tease =
    att.winterTip ||
    desc.split(".")[0] + "." ||
    fallbackByType[att.type] ||
    `${att.region}. Worth a visit.`;
  const shortTease = tease.length > 100 ? tease.slice(0, 97) + "…" : tease;

  const overlayByType: Record<string, string> = {
    winery: "Quiet this week",
    village: "Quiet this week",
    monastery: "Quiet this week",
    nature: "Clear today",
    ancient: "Best light in afternoon",
    beach: "Best light in afternoon",
  };

  return {
    id: picked.id,
    name: picked.name,
    region: picked.region,
    href: `/discover/${picked.id}`,
    image: getAttractionImage(picked.id, att.type),
    imageAlt: `${picked.name}, ${picked.region} — Cyprus winter`,
    tease: shortTease,
    overlay: overlayByType[att.type] ?? "Worth a visit",
  };
}

export default function HomePlaceOfDay() {
  const place = getPlaceOfDayData();
  if (!place) return null;

  return (
    <section
      aria-labelledby="place-of-day-heading"
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
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent"
              aria-hidden
            />
            <span className="absolute bottom-3 left-3 right-3 text-white text-sm font-medium drop-shadow-md">
              {place.overlay}
            </span>
          </Link>
          <div className="flex-1 flex flex-col p-5 sm:p-6">
            <p
              id="place-of-day-heading"
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
            <div className="mt-4 flex flex-wrap items-center gap-3">
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
