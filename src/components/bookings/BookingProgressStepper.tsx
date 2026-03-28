"use client";

import { useTranslations } from "next-intl";

type BookingProgressStepperProps = {
  currentStep?: 1 | 2 | 3;
};

const STEP_KEYS = ["details", "requestSent", "confirmation"] as const;

export default function BookingProgressStepper({
  currentStep = 1,
}: BookingProgressStepperProps) {
  const t = useTranslations("bookings.stepper");
  return (
    <section aria-label={t("aria")} className="rounded-xl border border-sand-200/80 bg-white/90 p-4">
      <ol className="grid grid-cols-3 gap-2">
        {STEP_KEYS.map((key, index) => {
          const step = (index + 1) as 1 | 2 | 3;
          const isActive = step <= currentStep;
          return (
            <li key={key} className="min-w-0">
              <div className={`h-1.5 rounded-full ${isActive ? "bg-terracotta" : "bg-sand-200"}`} aria-hidden />
              <p className={`mt-2 text-xs font-medium ${isActive ? "text-olive" : "text-olive/50"}`}>{t(key)}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

