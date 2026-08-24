"use client";

import AppLink from "@/components/AppLink";
import Image from "next/image";
import type { Attraction } from "@/data/attractions";
import type { Winery } from "@/data/wineries";
import type { Restaurant } from "@/data/restaurants";
import { getAttractionImage } from "@/lib/cyprus-images";
import { CARD, CTA, TYPE, MEDIA, BADGE } from "@/lib/design-tokens";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { TrackOnClick } from "@/components/TrackOnClick";
import { Plus } from "lucide-react";
import { useItinerary } from "@/hooks/useItinerary";
import { useSearchParams } from "next/navigation";
import { discoverDetailHref, getDiscoverTypeLabel } from "@/lib/discover-links";
import { isCallAheadHours, placeCardHours } from "@/lib/place-card-hours";
import { useTranslations } from "next-intl";

export default function AttractionCard({
  a,
  bookFrom,
}: {
  a: Attraction | Winery | Restaurant;
  /** Query `from` for book tasting back navigation (e.g. discover, wineries). */
  bookFrom?: string;
}) {
  const tCommon = useTranslations("common");
  const tDiscover = useTranslations("discover.detail");
  const searchParams = useSearchParams();
  const discoverFilter = searchParams.get("filter");
  const detailHref = discoverDetailHref(a.id, discoverFilter);
  const { days, hydrated, addToDayIfMissing } = useItinerary();
  const allIds = Object.values(days ?? {}).flat();
  const isInItinerary = hydrated && allIds.includes(a.id);
  const badgeLabel = getDiscoverTypeLabel(a.type, tDiscover, tCommon);
  const typeColors: Record<string, string> = {
    beach: "bg-aegean/20 text-aegean",
    ancient: "bg-terracotta/20 text-terracotta",
    village: "bg-olive/20 text-olive",
    monastery: "bg-golden/30 text-charcoal",
    nature: "bg-sage/30 text-olive",
    activity: "bg-sage/30 text-olive",
    winery: "bg-terracotta/20 text-terracotta",
    restaurant: "bg-golden/20 text-charcoal",
  };
  const badge = typeColors[a.type] ?? "bg-sand-100 text-olive/80";
  const isSustainable = ["village", "monastery", "nature", "activity", "winery"].includes(
    a.type
  );

  const isWinery = a.type === "winery";
  const winterTip = "winterTip" in a ? a.winterTip : undefined;
  const bestTime = "bestTimeToVisit" in a ? a.bestTimeToVisit : undefined;
  const hours = placeCardHours(a);
  const hoursPreview =
    hours && hours.length > 72 ? `${hours.slice(0, 69)}…` : hours;
  const tease =
    winterTip && winterTip.length > 0
      ? winterTip.length > 100
        ? winterTip.slice(0, 97) + "…"
        : winterTip
      : a.description;

  return (
    <div className={`group rounded-xl overflow-hidden ${CARD.base} ${CARD.hover} ${CARD.interactive}`}>
      <AppLink
        href={detailHref}
        className={`block ${CARD.link}`}
        aria-label={`${a.name}, ${badgeLabel} in ${a.region}`}
      >
        <div className={CARD.media}>
          <Image
            src={getAttractionImage(a.id, a.type)}
            alt={`${a.name}, ${a.region}—${a.type} in Cyprus winter light`}
            fill
            className={MEDIA.hoverImage}
            sizes="(max-width: 640px) calc(100vw - 3rem), (max-width: 1024px) 50vw, 33vw"
          />
          <div className={CARD.mediaOverlay} aria-hidden />
          <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
            <span
              className={`${BADGE.base} ${BADGE.pill} capitalize ${badge}`}
            >
              {badgeLabel}
            </span>
            {isSustainable && (
              <span className={`${BADGE.base} ${BADGE.pill} bg-sage/20 text-olive/80`}>
                {tCommon("local")}
              </span>
            )}
            {isWinery && (a as Winery).isVerified && (
              <span
                className={`${BADGE.base} ${BADGE.pill} bg-aegean/20 text-aegean`}
                title={tCommon("verifiedPartnerTitle")}
              >
                {tCommon("verifiedPartner")}
              </span>
            )}
          </div>
          <span className="absolute bottom-3 left-3 right-3 text-white font-medium text-sm drop-shadow-md truncate block" title={a.region}>
            {a.region}
          </span>
        </div>
        <div className={CARD.content}>
          <h3 className={`${TYPE.cardTitle} line-clamp-2 duration-200`} title={a.name}>
            {a.name}
          </h3>
          <p className="text-sm text-olive/70 mt-1 line-clamp-2 break-words">
            {tease}
          </p>
          {hoursPreview && (
            <p className="text-xs text-aegean/90 mt-1.5 break-words line-clamp-2" title={hours}>
              {isCallAheadHours(hours) ? `${tCommon("callAhead")} · ` : null}
              {hoursPreview}
            </p>
          )}
          {bestTime && (
            <p className="text-xs text-sage mt-1.5 break-words" title={tCommon("bestTimeToVisitTitle")}>
              {bestTime}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {(a.highlights ?? []).slice(0, 3).map((h, i) => (
              <span
                key={`${h}-${i}`}
                className="text-xs px-2.5 py-1 rounded-full bg-sand-200/70 text-olive/80 line-clamp-2 min-w-0 max-w-[180px] sm:max-w-[200px] break-words"
                title={h}
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      </AppLink>
      <div
        className={`${CARD.footer} flex flex-col max-sm:items-stretch sm:flex-row sm:flex-wrap sm:items-center gap-3 [&_a]:w-full [&_a]:sm:w-auto [&_button]:w-full [&_button]:sm:w-auto`}
      >
        {isWinery && (
          <AppLink
            href={`/book/winery/${a.id}${bookFrom ? `?from=${bookFrom}` : ""}`}
            className={CTA.secondaryCompact}
            aria-label={`${tCommon("bookTasting")} — ${a.name}`}
          >
            {tCommon("bookTasting")}
          </AppLink>
        )}
        <TrackOnClick event="plan_add" properties={{ placeId: a.id, source: "attraction_card" }}>
          <AddToItineraryButton placeId={a.id} className="text-sm" />
        </TrackOnClick>
        {hydrated && !isInItinerary && (
          <button
            type="button"
            onClick={() => addToDayIfMissing(a.id)}
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg border border-sand-200/80 text-aegean hover:bg-aegean/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 shrink-0"
            aria-label={`${tCommon("addToPlan")}: ${a.name}`}
          >
            <Plus className="h-5 w-5" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
