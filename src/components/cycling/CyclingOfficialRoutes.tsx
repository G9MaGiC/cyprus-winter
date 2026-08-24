"use client";

import { useMemo, useState } from "react";
import AppLink from "@/components/AppLink";
import {
  CYCLING_ROUTE_REGIONS,
  filterCyclingRoutes,
  formatRouteDistance,
} from "@/lib/cycling-routes";
import type { CyclingRoute, CyclingRouteRegion } from "@/lib/cycling-route-types";
import ClientPillFilter from "@/components/ClientPillFilter";
import { CARD, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function CyclingOfficialRoutes() {
  const t = useTranslations("cycling.page.officialRoutes");
  const [region, setRegion] = useState<CyclingRouteRegion | null>(null);

  const filtered = useMemo(
    () => filterCyclingRoutes({ region, bikeType: null }),
    [region]
  );

  return (
    <section aria-labelledby="cycling-official-routes" className="mt-12 sm:mt-16">
      <h2 id="cycling-official-routes" className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>
        {t("title")}
      </h2>
      <p className="text-sm text-olive/70 max-w-2xl mb-4">{t("intro")}</p>
      <p className="text-sm text-olive/60 mb-6">
        <a
          href="https://www.visitcyprus.com/discover-cyprus/routes/cycling-routes-routes/"
          target="_blank"
          rel="noopener noreferrer"
          className={SECTION.aegeanLink}
        >
          {t("officialIndexLink")}
        </a>
      </p>

      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label={t("filterRegion")}>
        <ClientPillFilter active={!region} onClick={() => setRegion(null)} label={t("allRegions")} />
        {CYCLING_ROUTE_REGIONS.map((r) => (
          <ClientPillFilter
            key={r}
            active={region === r}
            onClick={() => setRegion(region === r ? null : r)}
            label={t(`regions.${r}`)}
          />
        ))}
      </div>

      <p className="text-sm text-olive/60 mb-4" aria-live="polite">
        {t("resultCount", { count: filtered.length })}
      </p>

      <ul className="grid gap-4 sm:grid-cols-2">
        {filtered.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </ul>
    </section>
  );
}

function RouteCard({ route }: { route: CyclingRoute }) {
  const t = useTranslations("cycling.page.officialRoutes");
  const distance = formatRouteDistance(route.distanceKm);

  return (
    <li className={`${CARD.base} ${CARD.content} flex flex-col gap-3`}>
      <div className="flex flex-wrap items-start gap-2">
        <h3 className={`${TYPE.cardTitle} text-charcoal flex-1 min-w-0`}>{route.name}</h3>
        {route.winterPick && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-golden/15 text-charcoal shrink-0">
            {t("winterPick")}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-sand-100 text-olive/80">
          {t(`regions.${route.region}`)}
        </span>
        {distance && (
          <span className="px-2 py-0.5 rounded-full bg-sand-100 text-olive/80">{distance}</span>
        )}
        <span className="px-2 py-0.5 rounded-full bg-sand-100 text-olive/80">
          {t(`difficulty.${route.difficulty}`)}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-sand-100 text-olive/70">
          {t(`surface.${route.surface}`)}
        </span>
      </div>
      <p className="text-sm text-olive/80 line-clamp-3 flex-1">{route.description}</p>
      {route.winterNote && (
        <p className="text-xs text-olive/60 italic">{route.winterNote}</p>
      )}
      <div className="flex flex-wrap gap-3 pt-1">
        <a
          href={route.visitCyprusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={CTA.secondaryCompact}
        >
          {t("viewOnVisitCyprus")}
        </a>
        {route.gpxUrl && (
          <a
            href={route.gpxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={SECTION.aegeanLink}
          >
            {t("downloadGpx")}
          </a>
        )}
        {route.relatedPlaceId && (
          <AppLink href={`/discover/${route.relatedPlaceId}`} className={SECTION.aegeanLink}>
            {t("relatedPlace")}
          </AppLink>
        )}
      </div>
    </li>
  );
}
