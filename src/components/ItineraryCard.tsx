"use client";

import AppLink from "@/components/AppLink";
import { CARD, CTA, TYPE } from "@/lib/design-tokens";
import type { PlanItem } from "@/data";
import NavigateButton from "@/components/NavigateButton";
import { useTranslations } from "next-intl";

function TypeBadge({ type }: { type: PlanItem["type"] }) {
  const style: Record<PlanItem["type"], string> = {
    trail: "bg-aegean/15 text-aegean",
    winery: "bg-terracotta/15 text-terracotta",
    attraction: "bg-sage/15 text-olive",
    event: "bg-golden/15 text-golden",
    restaurant: "bg-golden/15 text-charcoal",
  };
  const label: Record<PlanItem["type"], string> = {
    trail: "Trail",
    winery: "Winery",
    attraction: "Place",
    event: "Event",
    restaurant: "Eat",
  };
  return (
    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium tracking-[0.01em] ${style[type]}`}>{label[type]}</span>
  );
}

export default function ItineraryCard({
  place,
  onRemove,
  lastAdded,
  index,
  cardRef,
  inTimeline,
}: {
  place: PlanItem;
  onRemove: () => void;
  lastAdded: boolean;
  index: number;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  inTimeline?: boolean;
}) {
  const tCommon = useTranslations("common");
  const href =
    place.type === "trail"
      ? `/trails/${place.id}`
      : place.type === "event"
        ? `/events#${place.id}`
        : `/discover/${place.id}`;

  return (
    <div
      ref={lastAdded && !inTimeline ? cardRef : undefined}
      className={`group flex items-center gap-4 rounded-2xl ${CARD.content} ${CARD.base} transition-all duration-200 ${
        lastAdded
          ? "ring-2 ring-terracotta/40 border-terracotta/30 shadow-md"
          : CARD.hover
      }`}
    >
      {!inTimeline && (
        <span className="shrink-0 w-9 h-9 rounded-full bg-sand-200/80 text-olive/70 font-semibold text-sm flex items-center justify-center">
          {index}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <TypeBadge type={place.type} />
          <span className="text-xs text-olive/50">·</span>
          <span className="text-xs text-olive/60 truncate" title={place.region}>{place.region}</span>
        </div>
        <AppLink
          href={href}
          className={`${TYPE.cardTitle} block break-words min-h-[44px] py-2.5 -my-2 px-2 -mx-2 rounded-lg hover:bg-sand-100/50`}
          title={place.name}
        >
          {place.name}
        </AppLink>
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        <NavigateButton place={place} />
        {place.type === "winery" && (
          <AppLink
            href={`/book/winery/${place.id}`}
            className={CTA.primaryCompact}
            aria-label={`${tCommon("bookTasting")} — ${place.name}`}
          >
            {tCommon("bookTasting")}
          </AppLink>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-olive/60 hover:text-terracotta hover:bg-terracotta/5 transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={`Remove ${place.name} from itinerary`}
        >
          {tCommon("remove")}
        </button>
      </div>
    </div>
  );
}
