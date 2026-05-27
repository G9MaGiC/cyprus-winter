"use client";

import { LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function WineRouteLoading() {
  const t = useTranslations("common");
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label={t("loading.wineRoute")}
    >
      <div className="animate-pulse space-y-8">
        <div className={`h-4 w-24 ${SKELETON.block}`} />
        <div className={`h-10 w-64 ${SKELETON.bar} mb-4`} />
        <div className={`h-4 w-full max-w-2xl ${SKELETON.block} mb-2`} />
        <div className={`h-4 w-3/4 max-w-xl ${SKELETON.block}`} />
        <div className={`${CARD.base} overflow-hidden`}>
          <div className={`aspect-[16/9] ${SKELETON.media}`} />
          <div className={`${CARD.content} space-y-3`}>
            <div className={`h-5 w-full ${SKELETON.block}`} />
            <div className={`h-4 w-full ${SKELETON.block}`} />
            <div className={`h-4 w-4/5 ${SKELETON.block}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
