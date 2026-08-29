"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import PlanMapClient from "./PlanMapClient";
import { useMatchMedia } from "@/hooks/useMatchMedia";
import { SECTION, TYPE } from "@/lib/design-tokens";

/**
 * Desktop (md+): map stays open like a normal section.
 * Mobile: map sits in <details> default-collapsed so day list + actions stay primary.
 */
export default function PlanMapCollapsibleSection() {
  const mdUp = useMatchMedia("(min-width: 768px)", false);
  const tPlan = useTranslations("plan");

  if (mdUp) {
    return (
      <section
        id="plan-map"
        aria-labelledby="plan-map-heading"
        className="border-t border-sand-200/80 pt-10 sm:pt-12"
      >
        <h2
          id="plan-map-heading"
          className={`${TYPE.subSectionTitleLg} text-charcoal ${SECTION.titleGap}`}
        >
          {tPlan("mapTitle")}
        </h2>
        <p className={`text-xs text-olive/60 ${SECTION.headingGap}`}>{tPlan("mapCollapsibleHint")}</p>
        <PlanMapClient />
      </section>
    );
  }

  return (
    <details
      id="plan-map"
      className="group border-t border-sand-200/80 pt-8"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl py-3 ps-1 pe-2 text-start -mx-1 select-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sand min-h-[48px]">
        <div className="min-w-0">
          <h2 className={`${TYPE.subSectionTitleLg} text-charcoal`}>{tPlan("mapTitle")}</h2>
          <p className="text-xs text-olive/60 mt-0.5">
            {tPlan("mapCollapsibleHint")}
          </p>
        </div>
        <ChevronDown
          className="h-5 w-5 shrink-0 text-olive/45 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="pt-4 pb-2">
        <PlanMapClient />
      </div>
    </details>
  );
}
