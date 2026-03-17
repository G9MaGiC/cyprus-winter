"use client";

import { useTranslations } from "next-intl";

type PlanDaysUntilBannerProps = {
  daysUntil: number;
};

export default function PlanDaysUntilBanner({ daysUntil }: PlanDaysUntilBannerProps) {
  const tPlan = useTranslations("plan");
  const message = tPlan("daysUntilBanner", { days: daysUntil });

  return (
    <div
      role="status"
      className="rounded-2xl border-2 border-dashed border-golden/25 bg-golden/5 px-5 py-4 sm:px-6 sm:py-5 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <p className="text-sm font-medium text-olive">{message}</p>
    </div>
  );
}
