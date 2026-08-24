"use client";

import { ChevronDown } from "lucide-react";
import { HUB } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";
import { useMatchMedia } from "@/hooks/useMatchMedia";

type PlanAddMoreCollapsibleProps = {
  hasContent: boolean;
  children: React.ReactNode;
};

/**
 * When the plan already has places, mobile users get a collapsed "add more" area
 * so day list + map stay primary. Desktop layout unchanged.
 */
export default function PlanAddMoreCollapsible({
  hasContent,
  children,
}: PlanAddMoreCollapsibleProps) {
  const mdUp = useMatchMedia("(min-width: 768px)", false);
  const tPlan = useTranslations("plan");

  if (!hasContent || mdUp) {
    return <div className={`flex flex-col ${HUB.shellGap}`}>{children}</div>;
  }

  return (
    <details className="group rounded-2xl border border-sand-200/80 bg-white/70 shadow-sm open:shadow-md open:bg-white/90 transition-shadow">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl p-4 sm:p-5 text-left select-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sand min-h-[48px]">
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold text-charcoal">{tPlan("addMoreCollapsibleTitle")}</p>
          <p className="text-xs text-olive/60 mt-0.5">{tPlan("addMoreCollapsibleSubtitle")}</p>
        </div>
        <ChevronDown
          className="h-5 w-5 shrink-0 text-olive/45 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className={`border-t border-sand-200/60 px-3 pb-6 pt-4 sm:px-5 flex flex-col ${HUB.shellGap}`}>
        {children}
      </div>
    </details>
  );
}
