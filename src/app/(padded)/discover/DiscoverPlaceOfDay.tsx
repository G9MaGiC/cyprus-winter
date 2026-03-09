import Image from "next/image";
import Link from "next/link";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import NavigateButton from "@/components/NavigateButton";
import { CARD, LAYOUT, SECTION } from "@/lib/design-tokens";
import { getPlaceById } from "@/data";
import { allDiscoverItems } from "@/data/discover";
import { getDiscoverPlaceOfDayPicks } from "@/lib/discover-place-of-day";

export default function DiscoverPlaceOfDay() {
  const picks = getDiscoverPlaceOfDayPicks(allDiscoverItems);
  const place = picks[0] ?? null;
  const alsoWorth = picks.slice(1, 3);
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
          className={`prose-label text-olive/70 ${SECTION.headingGap}`}
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
              className="object-cover group-hover:scale-[1.02] motion-reduce:group-hover:scale-100 transition-transform duration-300 ease-out"
              sizes="(max-width: 640px) 100vw, 40vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent pointer-events-none"
              aria-hidden
            />
            <span className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium drop-shadow-lg">
              {place.overlay}
            </span>
            <span className="absolute top-4 right-4 px-3 py-1.5 rounded-lg prose-label bg-white/95 backdrop-blur-sm text-charcoal">
              Place of the day
            </span>
          </Link>
          <div className={`flex-1 flex flex-col ${CARD.content} justify-between`}>
            <div>
              <Link
                href={place.href}
                className="font-display text-xl sm:text-2xl font-semibold text-charcoal group-hover:text-terracotta transition-colors block min-h-[44px] py-1"
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
                    className={`font-medium ${SECTION.aegeanLink}`}
                  >
                    {place.pairWith.name}
                  </Link>
                </p>
              )}
              {alsoWorth.length > 0 && (
                <p className="text-sm text-olive/80 mt-3">
                  Also worth a visit:{" "}
                  {alsoWorth.map((p, i) => (
                    <span key={p.id}>
                      {i > 0 && ", "}
                      <Link
                        href={p.href}
                        className={`font-medium ${SECTION.aegeanLink}`}
                      >
                        {p.name}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {planItem && <NavigateButton place={planItem} />}
              <AddToItineraryButton placeId={place.id} label="Add to plan" />
              <Link
                href={place.href}
                className="text-sm font-medium text-terracotta hover:text-terracotta-muted transition-colors min-h-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
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
