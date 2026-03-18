"use client";

import AppLink from "@/components/AppLink";
import Image from "next/image";
import type { Attraction } from "@/data/attractions";
import type { Winery } from "@/data/wineries";
import type { Restaurant } from "@/data/restaurants";
import { getAttractionImage } from "@/lib/cyprus-images";
import { CARD, CTA, TYPE } from "@/lib/design-tokens";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { useTranslations } from "next-intl";

export default function AttractionCard({ a }: { a: Attraction | Winery | Restaurant }) {
  const tCommon = useTranslations("common");
  const typeColors: Record<string, string> = {
    beach: "bg-aegean/20 text-aegean",
    ancient: "bg-terracotta/20 text-terracotta",
    village: "bg-olive/20 text-olive",
    monastery: "bg-golden/30 text-charcoal",
    nature: "bg-sage/30 text-olive",
    winery: "bg-terracotta/20 text-terracotta",
    restaurant: "bg-golden/20 text-charcoal",
  };
  const badge = typeColors[a.type] ?? "bg-sand-100 text-olive/80";
  const isSustainable = ["village", "monastery", "nature", "winery"].includes(a.type);
  const badgeLabel = a.type === "restaurant" ? tCommon("eat") : a.type;

  const isWinery = a.type === "winery";
  const winterTip = "winterTip" in a ? a.winterTip : undefined;
  const bestTime = "bestTimeToVisit" in a ? a.bestTimeToVisit : undefined;
  const tease =
    winterTip && winterTip.length > 0
      ? winterTip.length > 100
        ? winterTip.slice(0, 97) + "…"
        : winterTip
      : a.description;

  return (
    <div className={`group rounded-xl overflow-hidden ${CARD.base} ${CARD.hover} ${CARD.interactive}`}>
      <AppLink
        href={`/discover/${a.id}`}
        className={`block ${CARD.link}`}
        aria-label={`${a.name}, ${a.type} in ${a.region}`}
      >
        <div className="aspect-[4/3] relative overflow-hidden bg-sand-200/50 shrink-0">
          <Image
            src={getAttractionImage(a.id, a.type)}
            alt={`${a.name}, ${a.region}—${a.type} in Cyprus winter light`}
            fill
            className="object-cover group-hover:scale-[1.03] motion-reduce:group-hover:scale-100 transition-transform duration-300 ease-out"
            sizes="(max-width: 640px) calc(100vw - 3rem), (max-width: 1024px) 50vw, 33vw"
          />
          <div className={CARD.mediaOverlay} aria-hidden />
          <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${badge}`}
            >
              {badgeLabel}
            </span>
            {isSustainable && (
              <span className="max-[360px]:hidden px-2.5 py-1 rounded-full text-xs font-medium bg-sage/20 text-olive/80">
                {tCommon("local")}
              </span>
            )}
            {isWinery && (a as Winery).isVerified && (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-aegean/20 text-aegean"
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
          <h3 className={`${TYPE.cardTitle} truncate duration-200`} title={a.name}>
            {a.name}
          </h3>
          <p className="text-sm text-olive/70 mt-1 line-clamp-2 break-words">
            {tease}
          </p>
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
      <div className={`${CARD.footer} flex flex-wrap items-center gap-3`}>
        {isWinery && (
          <AppLink
            href={`/book/winery/${a.id}`}
            className={CTA.primaryCompact}
            aria-label={`${tCommon("bookTasting")} — ${a.name}`}
          >
            {tCommon("bookTasting")}
          </AppLink>
        )}
        <AddToItineraryButton placeId={a.id} className="text-sm" />
      </div>
    </div>
  );
}
