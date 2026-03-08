"use client";

import Image from "next/image";
import Link from "next/link";
import { CARD, TYPE, CALLOUT } from "@/lib/design-tokens";
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
  const teaser = trail.highlights?.[0] ?? trail.description;

  return (
    <div
      className={`group rounded-xl overflow-hidden transition-all duration-300 ${
        featured
          ? `${CARD.base} ${CARD.featured} ${CARD.hover}`
          : `${CARD.base} ${CARD.hover}`
      }`}
    >
      <Link
        href={`/trails/${trail.id}`}
        className={`block ${CARD.link}`}
        aria-label={`${trail.name}, ${trail.lengthKm} km ${trail.difficulty} trail in ${trail.region}`}
      >
        <div
          className={`relative overflow-hidden bg-olive/10 shrink-0 ${
            featured ? "aspect-[16/10]" : "aspect-[4/3]"
          }`}
        >
          <Image
            src={getTrailImage(trail.id)}
            alt={`${trail.name}, ${trail.region} — ${trail.lengthKm} km ${trail.difficulty} trail in Cyprus winter`}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
            sizes={featured ? "(max-width: 640px) 100vw, 33vw" : "(max-width: 640px) 100vw, 50vw"}
          />
          <div className={CARD.mediaOverlay} aria-hidden />
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
            {conditions && <StatusBadge status={conditions.status} />}
            <DifficultyBadge difficulty={trail.difficulty} />
          </div>
          {conditions?.temperatureC != null && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 text-charcoal text-xs font-medium backdrop-blur-sm">
              {conditions.temperatureC}°C
            </div>
          )}
          <span className="absolute bottom-3 left-3 right-3 text-white font-medium text-sm drop-shadow-md truncate block">
            {trail.region}
          </span>
        </div>
        <div className={CARD.content}>
          <h3
            className={`${TYPE.cardTitle} truncate ${featured ? "text-xl" : ""}`}
            title={trail.name}
          >
            {trail.name}
          </h3>
          <p className="text-sm text-olive/70 mt-1 line-clamp-1 break-words">
            {teaser}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-olive/60">
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
            {conditions?.lastReportedAt && (
              <>
                <span aria-hidden>·</span>
                <span>{formatReportedAgo(conditions.lastReportedAt)}</span>
              </>
            )}
          </div>
          {conditions?.tip && (
            <p className={`mt-3 text-sm text-olive/90 break-words px-4 py-3 ${CALLOUT.tip}`}>
              {conditions.tip}
            </p>
          )}
        </div>
      </Link>
      <div className={CARD.footer}>
        <AddToItineraryButton placeId={trail.id} label="Add to plan" className="text-sm" />
      </div>
    </div>
  );
}
