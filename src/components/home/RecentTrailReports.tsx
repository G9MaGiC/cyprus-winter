"use client";

import { useTranslations } from "next-intl";
import AppLink from "@/components/AppLink";
import { LAYOUT, SECTION, TYPE, CARD, CTA } from "@/lib/design-tokens";

const STATUS_ICON: Record<string, string> = {
  open: "text-sage",
  caution: "text-golden",
  closed: "text-terracotta",
};

type HikerReport = {
  trail: string;
  trailSlug: string;
  status: "open" | "caution";
  surface: string;
  quote: string;
};

const FEATURED_REPORTS: HikerReport[] = [
  {
    trail: "Artemis Trail",
    trailSlug: "artemis",
    status: "open",
    surface: "dry",
    quote: "Clear skies, dry path. Perfect winter morning hike.",
  },
  {
    trail: "Atalante Trail",
    trailSlug: "atalante",
    status: "open",
    surface: "muddy",
    quote: "Some muddy patches near the stream. Boots recommended.",
  },
  {
    trail: "Caledonia Waterfalls",
    trailSlug: "caledonia-waterfalls",
    status: "caution",
    surface: "snow",
    quote: "Light snow at the top. Waterfall is stunning in winter.",
  },
];

export default function RecentTrailReports() {
  const t = useTranslations("home.trailReports");

  return (
    <section
      aria-labelledby="trail-reports-heading"
      className={`${SECTION.py} bg-background ${LAYOUT.safeAreaX}`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <header className="text-center mb-8 sm:mb-10">
          <p className={`${TYPE.kicker} text-sage mb-2`}>{t("kicker")}</p>
          <h2 id="trail-reports-heading" className={`${TYPE.sectionTitle} ${SECTION.titleGap}`}>
            {t("title")}
          </h2>
          <p className={`${TYPE.sectionSubtitle} max-w-xl mx-auto ${SECTION.headingGap}`}>
            {t("subtitle")}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURED_REPORTS.map((report) => (
            <AppLink
              key={report.trailSlug}
              href={`/trails/${report.trailSlug}`}
              className={`${CARD.base} ${CARD.hover} ${CARD.content} group block`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${STATUS_ICON[report.status]} bg-current shrink-0`} />
                <span className="text-xs font-medium text-olive/60 uppercase tracking-wide">
                  {report.status} &middot; {report.surface}
                </span>
              </div>
              <h3 className={TYPE.cardTitle}>{report.trail}</h3>
              <p className="text-sm text-olive/70 mt-2 leading-relaxed italic">
                &ldquo;{report.quote}&rdquo;
              </p>
            </AppLink>
          ))}
        </div>

        <div className="text-center mt-8">
          <AppLink href="/trails" className={CTA.secondaryCompact}>
            {t("cta")}
          </AppLink>
        </div>
      </div>
    </section>
  );
}
