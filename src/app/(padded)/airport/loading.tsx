import { LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function AirportLoading() {
  const t = useTranslations("common");
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.listNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst} flex flex-col gap-10 sm:gap-14`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label={t("loading.airportGuide")}
    >
      <div className="animate-pulse">
        <div className={`h-4 w-24 ${SKELETON.block} mb-4`} />
        <div className={`h-9 w-56 ${SKELETON.bar} mb-2`} />
        <div className={`h-4 max-w-md ${SKELETON.block} mb-8`} />
        <div className="h-14 w-full rounded-xl bg-aegean/10 border border-aegean/20 mb-8" />
        <div className="flex gap-3 mb-10">
          <div className={`h-11 w-16 ${SKELETON.block}`} />
          <div className={`h-11 w-16 ${SKELETON.block}`} />
        </div>
        <div className="space-y-10">
          {[1, 2].map((i) => (
            <div key={i} className={`overflow-hidden ${CARD.base}`}>
              <div className="h-20 bg-terracotta/20" />
              <div className={CARD.content}>
                <div className={`h-5 w-24 ${SKELETON.bar} mb-4`} />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className={`h-16 ${SKELETON.block}`} />
                  ))}
                </div>
                <div className={`h-5 w-28 ${SKELETON.bar} mt-6 mb-3`} />
                <div className="space-y-2">
                  <div className={`h-4 w-full ${SKELETON.block}`} />
                  <div className={`h-4 w-4/5 ${SKELETON.block}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={`mt-10 ${CARD.content} ${SKELETON.card}`}>
          <div className={`h-5 w-28 ${SKELETON.bar} mb-4`} />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-4 w-full ${SKELETON.block}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
