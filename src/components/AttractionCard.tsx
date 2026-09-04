"use client";

import AppLink from "@/components/AppLink";
import Image from "next/image";
import type { Attraction } from "@/data/attractions";
import type { Winery } from "@/data/wineries";
import type { Restaurant } from "@/data/restaurants";
import type { DiscoverCardItem } from "@/lib/discover-sections";
import { getAttractionImage } from "@/lib/cyprus-images";
import { CARD, CTA, TYPE, MEDIA, BADGE } from "@/lib/design-tokens";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { TrackOnClick } from "@/components/TrackOnClick";
import { useSearchParams } from "next/navigation";
import { discoverDetailHref, getDiscoverTypeLabel } from "@/lib/discover-links";
import { isCallAheadHours, placeCardHours } from "@/lib/place-card-hours";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedName } from "@/lib/localize";
import { isPartnerVerified } from "@/lib/partner-verification";

export default function AttractionCard({
  a,
  bookFrom,
}: {
  a: Attraction | Winery | Restaurant | DiscoverCardItem;
  /** Query `from` for book tasting back navigation (e.g. discover, wineries). */
  bookFrom?: string;
}) {
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const displayName = getLocalizedName(a, locale);
  const tDiscover = useTranslations("discover.detail");
  const searchParams = useSearchParams();
  const discoverFilter = searchParams.get("filter");
  const detailHref = discoverDetailHref(a.id, discoverFilter);
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
  const badge = typeColors[a.type] ?? "bg-sand-100 text-muted-ink";
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
        aria-label={tCommon("aria.placeCard", { name: displayName, type: badgeLabel, region: a.region })}
      >
        <div className={CARD.media}>
          <Image
            src={getAttractionImage(a.id, a.type)}
            alt={tCommon("aria.placeCardImageAlt", { name: displayName, region: a.region })}
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
              <span className={`${BADGE.base} ${BADGE.pill} bg-sage/20 text-muted-ink`}>
                {tCommon("local")}
              </span>
            )}
            {isWinery &&
              ("partnerVerified" in a
                ? (a as { partnerVerified?: boolean }).partnerVerified
                : "isVerified" in a && isPartnerVerified(a)) && (
              <span
                className={`${BADGE.base} ${BADGE.pill} bg-aegean/20 text-aegean`}
                title={tCommon("verifiedPartnerTitle")}
              >
                {tCommon("verifiedPartner")}
                {/* title is desktop-hover-only; give SR users the meaning too
                    (AUD-46 — the booking page carries the visible line). */}
                <span className="sr-only"> — {tCommon("verifiedPartnerTitle")}</span>
              </span>
            )}
          </div>
          <span className="absolute bottom-3 left-3 right-3 text-white font-medium text-sm drop-shadow-md truncate block" title={a.region}>
            {a.region}
          </span>
        </div>
        <div className={CARD.content}>
          <h3 className={`${TYPE.cardTitle} line-clamp-2 duration-200`} title={displayName}>
            {displayName}
          </h3>
          <p className="text-sm text-muted-ink mt-1 line-clamp-2 break-words">
            {tease}
          </p>
          {hoursPreview && (
            <p className="text-xs text-aegean/90 mt-1.5 break-words line-clamp-2" title={hours}>
              {/* Precomputed EN-base flag survives content overlays (AUD-10);
                  regex fallback covers raw records. */}
              {(("hoursCallAhead" in a ? a.hoursCallAhead : undefined) ?? isCallAheadHours(hours)) ? `${tCommon("callAhead")} · ` : null}
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
                className="text-xs px-2.5 py-1 rounded-full bg-sand-200/70 text-muted-ink line-clamp-2 min-w-0 max-w-[180px] sm:max-w-[200px] break-words"
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
            aria-label={`${tCommon("bookTasting")} — ${displayName}`}
          >
            {tCommon("bookTasting")}
          </AppLink>
        )}
        <TrackOnClick event="plan_add" properties={{ placeId: a.id, source: "attraction_card" }}>
          <AddToItineraryButton placeId={a.id} className="text-sm" />
        </TrackOnClick>
      </div>
    </div>
  );
}
