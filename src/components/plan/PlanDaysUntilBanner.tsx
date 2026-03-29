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
      className="rounded-2xl border-2 border-dashed border-golden/30 bg-golden/5 px-6 py-5 sm:px-7 sm:py-6 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <p className="text-base font-medium text-olive/90">{message}</p>
    </div>
  );
}
