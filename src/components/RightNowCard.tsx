"use client";

import Image from "next/image";
import Link from "next/link";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { CARD } from "@/lib/design-tokens";

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
  tease: string;
};

export default function RightNowCard({ item }: { item: RightNowItem }) {
  const badge = item.discoveryBadge ?? item.reasons[0] ?? "Worth a visit";

  return (
    <div
      className={`group overflow-hidden ${CARD.base} ${CARD.hover} ${CARD.interactive} flex flex-row sm:flex-col`}
    >
      <Link
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
          <span className="absolute bottom-1 left-1 right-1 text-white text-[10px] sm:text-xs font-medium truncate drop-shadow-sm sm:bottom-2 sm:left-2 sm:right-2">
            {badge}
          </span>
        </div>
        <div className="flex-1 p-2.5 sm:p-3 min-w-0 flex flex-col justify-center">
          <h3 className="font-display text-sm sm:text-base font-semibold text-charcoal group-hover:text-terracotta transition-colors truncate">
            {item.name}
          </h3>
          <p className="text-xs text-olive/80 mt-0.5 truncate">
            {item.region} · {item.distanceKm} km
          </p>
          <p className="hidden sm:block text-xs text-olive/90 mt-0.5 leading-snug line-clamp-2">
            {item.tease}
          </p>
        </div>
      </Link>
      <div className="flex sm:block shrink-0 p-2 sm:p-3 sm:-mt-1 self-center sm:self-stretch">
        <AddToItineraryButton placeId={item.id} label="Add" />
      </div>
    </div>
  );
}
