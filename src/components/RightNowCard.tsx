"use client";

import Image from "next/image";
import AppLink from "@/components/AppLink";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { CARD, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

function formatKm(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1);
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
  const badge = item.discoveryBadge ?? item.reasons[0] ?? tHome("rightNow.card.defaultTease");
  const tease = item.tease ?? tHome("rightNow.card.defaultTease");

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
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="80px 80px, (max-width: 640px) 80px, 50vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-charcoal/50 to-transparent sm:from-charcoal/60"
            aria-hidden
          />
          <span className="absolute bottom-1 left-1 right-1 text-white text-[10px] sm:text-xs font-medium truncate drop-shadow-sm sm:bottom-2 sm:left-2 sm:right-2" title={badge}>
            {badge}
          </span>
        </div>
        <div className="flex-1 p-2.5 sm:p-3 min-w-0 flex flex-col justify-center">
          <h3 className={`${TYPE.cardTitleCompact} truncate`}>
            {item.name}
          </h3>
          <p className="text-xs text-olive/80 mt-0.5 truncate" title={`${item.region} · ${item.distanceKm < 0.5 ? "< 1 km" : `${formatKm(item.distanceKm)} km`}`}>
            {item.region} · {item.distanceKm < 0.5 ? "< 1 km" : `${formatKm(item.distanceKm)} km`}
          </p>
          <p className="hidden sm:block text-xs text-olive/90 mt-0.5 leading-relaxed line-clamp-2 break-words">
            {tease}
          </p>
        </div>
      </AppLink>
      <div className="flex sm:block shrink-0 p-2 sm:p-3 sm:-mt-1 self-center sm:self-stretch">
        <AddToItineraryButton placeId={item.id} label="Add" />
      </div>
    </div>
  );
}
