"use client";

import Image from "next/image";
import AppLink from "@/components/AppLink";
import { CARD, TYPE, CALLOUT, MEDIA, BADGE } from "@/lib/design-tokens";
import { StatusBadge, DifficultyBadge } from "@/components/TrailBadges";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { TrackOnClick } from "@/components/TrackOnClick";
import { getTrailImage } from "@/lib/cyprus-images";
import { formatReportedAgo } from "@/lib/format";
import type { Trail, TrailConditions } from "@/data/trails";
import { trailConditions as editorialConditions } from "@/data/trails";
import { useTrailListReports } from "@/components/TrailListReportsProvider";
import {
  resolveTrailCardConditions,
  trailConditionsFromView,
} from "@/lib/trail-card-conditions";
import { useLocale, useTranslations } from "next-intl";

type Props = {
  trail: Trail;
  conditions?: TrailConditions;
  featured?: boolean;
  /** Hide static winter snapshots (e.g. “No report” group). Live reports still show. */
  hideEditorial?: boolean;
};

export default function TrailCard({ trail, conditions, featured, hideEditorial }: Props) {
  const locale = useLocale();
  const tTrails = useTranslations("trails");
  const reports = useTrailListReports();
  const editorial = hideEditorial ? undefined : (conditions ?? editorialConditions[trail.id]);
  const view = resolveTrailCardConditions(editorial, reports[trail.id]);
  const resolved = trailConditionsFromView(trail.id, view);
  const durationH = Math.round(trail.durationMin / 60);
  const teaser = trail.highlights?.[0] ?? trail.description;

  return (
    <div
      className={`group rounded-xl overflow-hidden ${CARD.interactive} ${
        featured
          ? `${CARD.base} ${CARD.featured} ${CARD.hover} border-sage/20`
          : `${CARD.base} ${CARD.hover}`
      }`}
    >
      <AppLink
        href={`/trails/${trail.id}`}
        className={`block ${CARD.link}`}
        aria-label={tTrails("card.trailAria", { name: trail.name, length: trail.lengthKm, difficulty: trail.difficulty, region: trail.region })}
      >
        <div
          className={`relative overflow-hidden bg-olive/10 shrink-0 ${
            featured ? "aspect-[16/10]" : "aspect-[4/3]"
          }`}
        >
          <Image
            src={getTrailImage(trail.id)}
            alt={tTrails("card.imageAlt", { name: trail.name, region: trail.region, length: trail.lengthKm, difficulty: trail.difficulty })}
            fill
            className={MEDIA.hoverImage}
            sizes={featured ? "(max-width: 640px) 100vw, 33vw" : "(max-width: 640px) 100vw, 50vw"}
          />
          <div className={CARD.mediaOverlay} aria-hidden />
          <div className="absolute top-3 start-3 flex flex-wrap items-center gap-2">
            {resolved ? (
              <StatusBadge status={resolved.status} />
            ) : (
              <span className={`${BADGE.base} ${BADGE.chip} text-olive/80`}>
                {tTrails("card.noReport")}
              </span>
            )}
            <DifficultyBadge difficulty={trail.difficulty} />
          </div>
          {resolved?.temperatureC != null && (
            <div className="absolute top-3 end-3 px-2.5 py-1 rounded-lg bg-white/90 text-charcoal text-xs font-medium backdrop-blur-sm">
              {tTrails("card.temperature", { value: resolved.temperatureC })}
            </div>
          )}
          <span className="absolute bottom-3 start-3 end-3 text-white font-medium text-sm drop-shadow-md truncate block">
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
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-sage/80">
            <span>{trail.lengthKm} km</span>
            <span aria-hidden>·</span>
            <span>{tTrails("card.elevationGain", { meters: trail.elevationGainM })}</span>
            <span aria-hidden>·</span>
            <span>~{durationH}h</span>
            {trail.routeType && (
              <>
                <span aria-hidden>·</span>
                <span className="capitalize">{trail.routeType.replace("-", " ")}</span>
              </>
            )}
            {view.source === "report" && resolved?.lastReportedAt ? (
              <>
                <span aria-hidden>·</span>
                <span>{tTrails("card.hikerReport")}</span>
                <span aria-hidden>·</span>
                <span>{formatReportedAgo(resolved.lastReportedAt, locale)}</span>
              </>
            ) : view.source === "editorial" ? (
              <>
                <span aria-hidden>·</span>
                <span>{tTrails("conditionsEditorial")}</span>
              </>
            ) : (
              <>
                <span aria-hidden>·</span>
                <span>{tTrails("card.noReport")}</span>
              </>
            )}
          </div>
          {resolved?.tip && (
            <p className={`mt-3 text-sm text-olive/90 break-words px-4 py-3 ${CALLOUT.tip}`}>
              {resolved.tip}
            </p>
          )}
        </div>
      </AppLink>
      <div className={CARD.footer}>
        <TrackOnClick event="plan_add" properties={{ placeId: trail.id, source: "trail_card" }}>
          <AddToItineraryButton placeId={trail.id} label={tTrails("addToPlan")} className="text-sm" />
        </TrackOnClick>
      </div>
    </div>
  );
}
