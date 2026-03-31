"use client";

import { useTranslations } from "next-intl";
import { CALLOUT } from "@/lib/design-tokens";

const CHECK = (
  <svg aria-hidden="true" className="w-4 h-4 text-sage shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function BookingValueStack({ variant }: { variant: "winery" | "guide" }) {
  const t = useTranslations("book.valueStack");

  const items = variant === "winery"
    ? [t("winery.tasting"), t("winery.tour"), t("winery.recommendations"), t("winery.noCost")]
    : [t("guide.guidedHike"), t("guide.localKnowledge"), t("guide.safetyBriefing"), t("guide.noCost")];

  return (
    <div className="space-y-3">
      <div className={`${CALLOUT.tip} p-4`}>
        <p className="text-sm font-semibold text-olive mb-2">{t("title")}</p>
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-olive/80">
              {CHECK}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-sage text-center">{t("riskReversal")}</p>
      <div className="rounded-lg bg-terracotta/5 border border-terracotta/15 px-4 py-2.5 text-center">
        <p className="text-xs font-medium text-terracotta">{t("urgency")}</p>
      </div>
    </div>
  );
}
