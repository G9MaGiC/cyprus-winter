import Link from "next/link";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { CARD } from "@/lib/design-tokens";
import { winterEvents } from "@/data/events";

export default function ThisWeekGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <Link
        href="/weather"
        className={`${CARD.content} rounded-2xl ${CARD.base} border-l-4 border-l-aegean ${CARD.hover} ${CARD.link} ${CARD.interactive} group`}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-sage prose-label">Weather</p>
        <p className="text-2xl font-display font-bold text-charcoal mt-0.5 group-hover:text-terracotta transition-colors text-balance">
          Coast 18°C · Troodos 10°C
        </p>
        <p className="text-sm text-sage mt-0.5">Pack layers for the mountain</p>
      </Link>

      <div className={`${CARD.content} rounded-2xl ${CARD.base} border-l-4 border-l-aegean ${CARD.hover} ${CARD.interactive} group flex flex-col`}>
        <Link href="/trails/artemis" className={`flex-1 ${CARD.link} -m-5 sm:-m-6 p-5 sm:p-6`}>
          <p className="font-display font-semibold text-charcoal group-hover:text-terracotta transition-colors">
            Artemis Trail
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm text-aegean mt-0.5">
            <span className="w-2 h-2 rounded-full bg-aegean/70" aria-hidden />
            Open · Dry
          </p>
        </Link>
        <div className="-mt-1 pt-1">
          <AddToItineraryButton placeId="artemis" label="Add to plan" className="text-sm py-2" />
        </div>
      </div>

      <Link
        href="/events"
        className={`${CARD.content} rounded-2xl ${CARD.base} border-l-4 border-l-golden ${CARD.hover} ${CARD.link} ${CARD.interactive} group`}
      >
        <p className="font-display font-semibold text-charcoal group-hover:text-terracotta transition-colors">
          What&apos;s on
        </p>
        <p className="text-sm text-sage mt-0.5 truncate">
          {winterEvents.length > 0 ? winterEvents.slice(0, 2).map((e) => e.name).join(" · ") + "…" : "Browse winter events"}
        </p>
      </Link>
    </div>
  );
}

