"use client";

import Image from "next/image";
import Link from "next/link";
import { CARD } from "@/lib/design-tokens";
import { StatusBadge, DifficultyBadge } from "@/components/TrailBadges";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { getTrailImage } from "@/lib/cyprus-images";
import { formatReportedAgo } from "@/lib/format";
import type { Trail, TrailConditions } from "@/data/trails";

type Props = {
  trail: Trail;
  conditions?: TrailConditions;
  featured?: boolean;
};

export default function TrailCard({ trail, conditions, featured }: Props) {
  const durationH = Math.round(trail.durationMin / 60);
  return (
    <div
      className={`rounded-xl overflow-hidden group transition-all duration-300 ${
        featured
          ? `${CARD.base} border-2 border-aegean/30 hover:border-aegean/50 hover:shadow-lg`
          : `${CARD.base} ${CARD.hover}`
      }`}
    >
    <Link
      href={`/trails/${trail.id}`}
      className={`block ${CARD.link}`}
    >
      <div className="flex flex-col sm:flex-row">
        <div
          className={`sm:shrink-0 relative overflow-hidden bg-olive/10 ${
            featured ? "aspect-video sm:w-64 sm:aspect-square" : "aspect-video sm:w-48 sm:aspect-square"
          }`}
        >
          <Image
            src={getTrailImage(trail.id)}
            alt={`${trail.name}, ${trail.region}—${trail.lengthKm}km ${trail.difficulty} trail in Cyprus winter`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes={featured ? "(max-width: 640px) 100vw, 256px" : "(max-width: 640px) 100vw, 192px"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
            {conditions && <StatusBadge status={conditions.status} />}
            <DifficultyBadge difficulty={trail.difficulty} />
          </div>
          {conditions?.temperatureC != null && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-charcoal/60 text-white text-xs font-medium backdrop-blur-sm">
              {conditions.temperatureC}°C
            </div>
          )}
        </div>
        <div className="flex-1 p-5 sm:p-6 min-w-0 flex flex-col justify-between">
          <div>
            <h3
              className={`font-display font-semibold text-olive group-hover:text-terracotta transition-colors truncate ${
                featured ? "text-xl" : "text-lg"
              }`}
              title={trail.name}
            >
              {trail.name}
            </h3>
            <p className="text-sm text-olive/70 mt-0.5">{trail.region}</p>
            {(trail.highlights?.length ? (
              <p className="text-sm text-olive/80 mt-2 leading-relaxed line-clamp-2 break-words">
                {trail.highlights[0]}
                {trail.highlights.length > 1 && (
                  <span className="text-olive/60"> · {trail.highlights.slice(1).join(", ")}</span>
                )}
              </p>
            ) : (
              <p className="text-sm text-olive/80 mt-2 leading-relaxed line-clamp-2 break-words">
                {trail.description}
              </p>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-sand-200/80 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-olive/60">
            <span>{trail.lengthKm} km</span>
            <span aria-hidden>·</span>
            <span>{trail.elevationGainM}m gain</span>
            <span aria-hidden>·</span>
            <span>~{durationH}h</span>
            {trail.routeType && (
              <>
                <span aria-hidden>·</span>
                <span className="capitalize">{trail.routeType.replace("-", " ")}</span>
              </>
            )}
            {conditions?.windKmh != null && conditions.windKmh > 15 && (
              <>
                <span aria-hidden>·</span>
                <span>{conditions.windKmh} km/h wind</span>
              </>
            )}
            {conditions?.lastReportedAt && (
              <>
                <span aria-hidden>·</span>
                <span className="text-olive/50">{formatReportedAgo(conditions.lastReportedAt)}</span>
              </>
            )}
          </div>
          {conditions?.tip && (
            <p className="mt-3 text-xs text-aegean/90 bg-aegean/10 rounded-lg px-3 py-2 line-clamp-2 break-words">
              {conditions.tip}
            </p>
          )}
        </div>
      </div>
    </Link>
    <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-2">
      <AddToItineraryButton placeId={trail.id} label="Add to plan" className="text-sm" />
    </div>
    </div>
  );
}
