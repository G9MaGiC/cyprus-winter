"use client";

import AppLink from "@/components/AppLink";
import { TrackOnClick } from "@/components/TrackOnClick";
import { CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { buildGuideDirectoryHref } from "@/lib/guide-match";
import type { Guide } from "@/data/guides";
import type { TouristGuideDistrict } from "@/lib/guides-directory-types";
import { useTranslations } from "next-intl";

type PlanGuideBarProps = {
  verifiedGuides: Guide[];
  district: TouristGuideDistrict | null;
  language: string | null;
  licensedCount: number;
};

export default function PlanGuideBar({
  verifiedGuides,
  district,
  language,
  licensedCount,
}: PlanGuideBarProps) {
  const tCommon = useTranslations("common");
  const tPlan = useTranslations("plan.guideBar");

  const primaryGuide = verifiedGuides[0];
  const directoryHref = buildGuideDirectoryHref({
    district,
    language,
    from: "plan",
  });

  return (
    <div
      role="region"
      aria-label={tPlan("ariaLabel")}
      className="rounded-2xl border border-sand-200/90 bg-white/90 p-5 sm:p-6 flex flex-col gap-3 sm:gap-4 shadow-sm"
    >
      <p className={`${TYPE.cardTitle} text-charcoal`}>{tPlan("title")}</p>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 min-h-[44px]">
        {primaryGuide ? (
          <TrackOnClick
            event="guide_match_click"
            properties={{
              source: "plan",
              match_type: "verified",
              guide_id: primaryGuide.id,
            }}
          >
            <AppLink
              href={`/book/guide/${primaryGuide.id}?from=plan`}
              className={CTA.primaryCompact}
            >
              {tCommon("bookHike")}
            </AppLink>
          </TrackOnClick>
        ) : (
          <TrackOnClick
            event="guide_match_click"
            properties={{
              source: "plan",
              match_type: "directory",
              district: district ?? "all",
            }}
          >
            <AppLink href={directoryHref} className={CTA.primaryCompact}>
              {tPlan("directoryCta")}
            </AppLink>
          </TrackOnClick>
        )}
        <TrackOnClick
          event="guide_match_click"
          properties={{
            source: "plan",
            match_type: "directory_browse",
            district: district ?? "all",
          }}
        >
          <AppLink href={directoryHref} className={CTA.secondaryCompact}>
            {tPlan("browseLicensed")}
          </AppLink>
        </TrackOnClick>
        {licensedCount > 0 && district && (
          <p className="text-sm text-muted-ink w-full sm:w-auto">
            {tPlan("directoryCount", { count: licensedCount })}
          </p>
        )}
        <AppLink href="/book/guide" className={SECTION.aegeanLink}>
          {tPlan("verifiedPartners")}
        </AppLink>
      </div>
    </div>
  );
}
