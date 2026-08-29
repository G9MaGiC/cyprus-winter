"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { PlanItem } from "@/data";
import { analyzePlanDay, type PlanDayWarningId } from "@/lib/plan-realism";

type PlanDayHintsProps = {
  places: PlanItem[];
};

export default function PlanDayHints({ places }: PlanDayHintsProps) {
  const t = useTranslations("plan.realism");
  const warnings = useMemo(() => analyzePlanDay(places), [places]);

  if (warnings.length === 0) return null;

  const messageFor = (id: PlanDayWarningId) => t(id);

  return (
    <ul
      className="mt-3 space-y-2"
      role="status"
      aria-live="polite"
      aria-label={t("aria")}
    >
      {warnings.map((w) => (
        <li
          key={w.id}
          className="text-sm text-muted-ink leading-relaxed ps-3 border-s-2 border-golden/50"
        >
          {messageFor(w.id)}
        </li>
      ))}
    </ul>
  );
}
