"use client";

import { TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

type BookingSuccessNextStepsProps = {
  namespace: "book.wineryForm" | "book.guideForm";
};

export default function BookingSuccessNextSteps({ namespace }: BookingSuccessNextStepsProps) {
  const t = useTranslations(namespace);

  const steps = [t("success.nextStep1"), t("success.nextStep2"), t("success.nextStep3")];

  return (
    <div className="mt-4 pt-4 border-t border-sand-200/80">
      <h3 className={`${TYPE.kicker} text-olive/70`}>{t("success.nextStepsHeading")}</h3>
      <ol className="mt-2 space-y-2 text-sm text-olive/80 list-decimal list-inside">
        {steps.map((step, i) => (
          <li key={i} className="leading-relaxed">
            {step}
          </li>
        ))}
      </ol>
      <p className="text-sm text-olive/70 mt-3">{t("success.sla")}</p>
    </div>
  );
}
