"use client";

import Image from "next/image";
import AppLink from "@/components/AppLink";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { CARD, TYPE, MEDIA } from "@/lib/design-tokens";
import { isDiscoveryBadgeCode } from "@/lib/right-now-badges";
import { useTranslations } from "next-intl";

function formatKm(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

const REASON_CODES = ["nearby", "local_secret", "worth_visit"] as const;
type ReasonCode = (typeof REASON_CODES)[number];

function isReasonCode(value: string): value is ReasonCode {
  return (REASON_CODES as readonly string[]).includes(value);
}

export type RightNowItem = {
  id: string;
  name: string;
  region: string;
  type: string;
  href: string;
  score: number;
  reasons: string[];
  distanceKm: number;
  timeOfDayMatch: string;
  discoveryBadge: string | null;
  image: string;
  tease: string | null;
};

export default function RightNowCard({ item }: { item: RightNowItem }) {
  const tHome = useTranslations("home");
  const tCommon = useTranslations("common");

  const localizeReason = (reason: string) =>
    isReasonCode(reason) ? tHome(`rightNow.reasons.${reason}`) : reason;

  const localizeBadge = (code: string) =>
    isDiscoveryBadgeCode(code) ? tHome(`rightNow.discoveryBadges.${code}`) : code;

  const badge = item.discoveryBadge
    ? localizeBadge(item.discoveryBadge)
    : item.reasons[0]
      ? localizeReason(item.reasons[0])
      : tHome("rightNow.card.defaultTease");
  const tease = item.tease ?? tHome("rightNow.card.defaultTease");
  const distanceLabel =
    item.distanceKm < 0.5
      ? tHome("rightNow.card.distanceLessThanKm")
      : tHome("rightNow.card.distanceKm", { distance: formatKm(item.distanceKm) });

  return (
    <div
      className={`group overflow-hidden ${CARD.base} ${CARD.hover} ${CARD.interactive} flex flex-row sm:flex-col`}
    >
      <AppLink
        href={item.href}
        className={`block ${CARD.link} flex-1 flex flex-row sm:flex-col min-w-0`}
        aria-label={`${item.name}, ${item.region}`}
      >
        <div className="w-20 h-20 sm:w-full sm:aspect-[4/3] shrink-0 relative overflow-hidden bg-sand-200/50">
          <Image
            src={item.image}
            alt=""
            fill
            className={MEDIA.hoverImage}
            sizes="80px 80px, (max-width: 640px) 80px, 50vw"
          />
          <div className={CARD.mediaOverlayCompact} aria-hidden />
          <span
            className="absolute bottom-1 left-1 right-1 text-white text-xs font-medium truncate drop-shadow-sm sm:bottom-2 sm:left-2 sm:right-2"
            title={badge}
          >
            {badge}
          </span>
        </div>
        <div className="flex-1 p-2.5 sm:p-3 min-w-0 flex flex-col justify-center">
          <h3 className={`${TYPE.cardTitleCompact} truncate`}>{item.name}</h3>
          <p
            className="text-xs text-olive/80 mt-0.5 truncate"
            title={`${item.region} · ${distanceLabel}`}
          >
            {item.region} · {distanceLabel}
          </p>
          <p className="hidden sm:block text-xs text-olive/90 mt-0.5 leading-relaxed line-clamp-2 break-words">
            {tease}
          </p>
        </div>
      </AppLink>
      <div className="flex sm:block shrink-0 p-2 sm:p-3 sm:-mt-1 self-center sm:self-stretch">
        <AddToItineraryButton placeId={item.id} label={tCommon("addToPlan")} />
      </div>
    </div>
  );
}
