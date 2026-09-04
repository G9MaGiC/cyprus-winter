"use client";

import { useTranslations } from "next-intl";
import { CARD, CTA, TYPE, BADGE } from "@/lib/design-tokens";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { Link } from "@/i18n/navigation";
import type { WinterEvent } from "@/data/events";

const TYPE_COLORS: Record<string, string> = {
  festival: "bg-golden/20 text-charcoal",
  market: "bg-terracotta/20 text-terracotta-muted",
  concert: "bg-aegean/20 text-aegean",
  food: "bg-sage/20 text-olive",
  culture: "bg-terracotta/15 text-terracotta-muted",
  sport: "bg-aegean/15 text-aegean",
};

export default function EventCard({
  event,
  variant = "default",
}: {
  event: WinterEvent;
  variant?: "default" | "highlight";
}) {
  const typeColor = TYPE_COLORS[event.type] ?? "bg-sand-200/80 text-muted-ink";
  const tPage = useTranslations("events.page");
  const tCommon = useTranslations("common");
  const typeLabel = (type: string) => {
    const key = type as "festival" | "market" | "concert" | "food" | "culture" | "sport";
    if (key in TYPE_COLORS) return tPage(`types.${key}`);
    return type;
  };

  return (
    <article
      id={event.id}
      className={`scroll-mt-24 ${CARD.base} ${CARD.hover} ${CARD.content} ${
        variant === "highlight"
          ? "border-2 border-golden/40 bg-white"
          : "border-s-4 border-s-terracotta/40"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`${BADGE.base} ${BADGE.pill} capitalize ${typeColor}`}
          aria-hidden
        >
          {typeLabel(event.type)}
        </span>
        <span className="text-xs text-muted-ink" aria-hidden>
          ·
        </span>
        <span className="text-sm text-muted-ink break-words">{event.region}</span>
      </div>
      <h3 className={`${TYPE.cardTitle} break-words`}>
        {event.name}
        {event.nameEl && (
          <span
            className="ms-2 text-muted-ink font-normal text-base break-words"
            lang="el"
          >
            {event.nameEl}
          </span>
        )}
      </h3>
      {(event.dates || event.venue) && (
        <p
          className="text-sm text-terracotta font-medium mt-2 break-words"
          aria-label={tPage("card.whenWhereAria", { dates: event.dates ?? "", venue: event.venue ?? "" })}
        >
          {event.dates && <span>{event.dates}</span>}
          {event.dates && event.venue && " · "}
          {event.venue && <span>{event.venue}</span>}
        </p>
      )}
      <p className="text-muted-ink text-sm mt-3 leading-relaxed break-words line-clamp-4">
        {event.description}
      </p>
      <div className="flex flex-wrap gap-3 mt-4">
        <AddToItineraryButton placeId={event.id} label={tCommon("addToPlan")} />
        {event.region !== "All" && (
          <Link
            href={`/search?q=${encodeURIComponent(event.region)}`}
            className={`px-4 py-2.5 rounded-lg ${CTA.secondaryCompact}`}
            aria-label={tPage("card.exploreRegionAria", { region: event.region })}
          >
            {tPage("card.exploreRegionCta", { region: event.region })}
          </Link>
        )}
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className={CTA.chipTertiary}
            aria-label={tPage("card.learnMoreAria", { name: event.name })}
          >
            {tPage("card.learnMoreCta")}
          </a>
        )}
      </div>
    </article>
  );
}
