"use client";

import { useMemo, useState } from "react";
import AppLink from "@/components/AppLink";
import ClientPillFilter from "@/components/ClientPillFilter";
import {
  NATURE_EXCURSION_REGIONS,
  type NatureExcursion,
  type NatureExcursionRegion,
} from "@/lib/nature-excursion-types";
import { CARD, CTA, HOME, SECTION, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

/** The server page localizes the list (data-layer overlay) and passes it
    down — filtering happens over the prop, so the EN base data module stays
    out of the client bundle. */
export default function NatureExcursionsSection({
  excursions,
}: {
  excursions: NatureExcursion[];
}) {
  const t = useTranslations("nature.page.excursions");
  const [region, setRegion] = useState<NatureExcursionRegion | null>(null);

  const filtered = useMemo(
    () => (region ? excursions.filter((e) => e.region === region) : excursions),
    [excursions, region]
  );

  return (
    <section aria-labelledby="nature-excursions" className="mt-12 sm:mt-16">
      <h2 id="nature-excursions" className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>
        {t("title")}
      </h2>
      <p className="text-sm text-muted-ink max-w-2xl mb-4">{t("intro")}</p>
      <p className="text-sm text-muted-ink mb-6">
        <a
          href="https://www.visitcyprus.com/discover-cyprus/nature/excursions/"
          target="_blank"
          rel="noopener noreferrer"
          className={SECTION.aegeanLink}
        >
          {t("officialIndexLink")}
        </a>
      </p>

      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label={t("filterRegion")}>
        <ClientPillFilter active={!region} onClick={() => setRegion(null)} label={t("allRegions")} />
        {NATURE_EXCURSION_REGIONS.map((r) => (
          <ClientPillFilter
            key={r}
            active={region === r}
            onClick={() => setRegion(region === r ? null : r)}
            label={t(`regions.${r}`)}
          />
        ))}
      </div>

      <p className="text-sm text-muted-ink mb-4" aria-live="polite">
        {t("resultCount", { count: filtered.length })}
      </p>

      <ul className={`grid sm:grid-cols-2 ${HOME.gridGap}`}>
        {filtered.map((site) => (
          <ExcursionCard key={site.id} site={site} />
        ))}
      </ul>
    </section>
  );
}

function ExcursionCard({ site }: { site: NatureExcursion }) {
  const t = useTranslations("nature.page.excursions");

  return (
    <li className={`${CARD.base} ${CARD.hover} ${CARD.content} flex flex-col gap-3`}>
      <div className="flex flex-wrap items-start gap-2">
        <h3 className={`${TYPE.cardTitle} text-charcoal flex-1 min-w-0`}>{site.name}</h3>
        {site.winterPick && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-golden/15 text-charcoal shrink-0">
            {t("winterPick")}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-sand-100 text-muted-ink">
          {t(`regions.${site.region}`)}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-sand-100 text-muted-ink">
          {t(`kind.${site.kind}`)}
        </span>
      </div>
      <p className="text-sm text-muted-ink line-clamp-4 flex-1">{site.description}</p>
      {site.winterNote && <p className="text-xs text-muted-ink italic">{site.winterNote}</p>}
      <div className="flex flex-wrap gap-3 pt-1">
        <a
          href={site.visitCyprusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={CTA.secondaryCompact}
        >
          {t("viewOnVisitCyprus")}
        </a>
        {site.relatedTrailId && (
          <AppLink href={`/trails/${site.relatedTrailId}`} className={SECTION.aegeanLink}>
            {t("relatedTrail")}
          </AppLink>
        )}
        {site.relatedPlaceId && (
          <AppLink href={`/discover/${site.relatedPlaceId}`} className={SECTION.aegeanLink}>
            {t("relatedPlace")}
          </AppLink>
        )}
      </div>
    </li>
  );
}
