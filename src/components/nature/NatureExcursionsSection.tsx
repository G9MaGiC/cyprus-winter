"use client";

import { useMemo, useState } from "react";
import AppLink from "@/components/AppLink";
import {
  filterNatureExcursions,
  NATURE_EXCURSION_REGIONS,
  type NatureExcursion,
  type NatureExcursionRegion,
} from "@/lib/nature-excursions";
import { CARD, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function NatureExcursionsSection() {
  const t = useTranslations("nature.page.excursions");
  const [region, setRegion] = useState<NatureExcursionRegion | null>(null);

  const filtered = useMemo(() => filterNatureExcursions({ region }), [region]);

  return (
    <section aria-labelledby="nature-excursions" className="mt-12 sm:mt-16">
      <h2 id="nature-excursions" className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>
        {t("title")}
      </h2>
      <p className="text-sm text-olive/70 max-w-2xl mb-4">{t("intro")}</p>
      <p className="text-sm text-olive/60 mb-6">
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
        <FilterChip active={!region} onClick={() => setRegion(null)} label={t("allRegions")} />
        {NATURE_EXCURSION_REGIONS.map((r) => (
          <FilterChip
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
        {filtered.map((site) => (
          <ExcursionCard key={site.id} site={site} />
        ))}
      </ul>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 ${
        active
          ? "bg-terracotta text-white"
          : "bg-white border border-sand-200 text-olive hover:border-terracotta/40"
      }`}
    >
      {label}
    </button>
  );
}

function ExcursionCard({ site }: { site: NatureExcursion }) {
  const t = useTranslations("nature.page.excursions");

  return (
    <li className={`${CARD.base} ${CARD.content} flex flex-col gap-3`}>
      <div className="flex flex-wrap items-start gap-2">
        <h3 className={`${TYPE.cardTitle} text-charcoal flex-1 min-w-0`}>{site.name}</h3>
        {site.winterPick && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-golden/15 text-charcoal shrink-0">
            {t("winterPick")}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-sand-100 text-olive/80">
          {t(`regions.${site.region}`)}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-sand-100 text-olive/70">
          {t(`kind.${site.kind}`)}
        </span>
      </div>
      <p className="text-sm text-olive/80 line-clamp-4 flex-1">{site.description}</p>
      {site.winterNote && <p className="text-xs text-olive/60 italic">{site.winterNote}</p>}
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
