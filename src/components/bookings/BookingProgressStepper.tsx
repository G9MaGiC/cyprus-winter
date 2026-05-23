"use client";

import { useTranslations } from "next-intl";

type BookingProgressStepperProps = {
  currentStep?: 1 | 2 | 3;
};

export default function BookingProgressStepper({
  currentStep = 1,
}: BookingProgressStepperProps) {
  const t = useTranslations("book.form.progress");
  const steps = [t("stepDetails"), t("stepSent"), t("stepConfirmation")] as const;

  return (
    <section aria-label={t("aria")} className="rounded-xl border border-sand-200/80 bg-white/90 p-4">
      <ol className="grid grid-cols-3 gap-2">
        {steps.map((label, index) => {
          const step = (index + 1) as 1 | 2 | 3;
          const isActive = step <= currentStep;
          return (
            <li key={label} className="min-w-0">
              <div
                className={`h-1.5 rounded-full ${isActive ? "bg-terracotta" : "bg-sand-200"}`}
                aria-hidden
              />
              <p className={`mt-2 text-xs font-medium ${isActive ? "text-olive" : "text-olive/50"}`}>
                {label}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
