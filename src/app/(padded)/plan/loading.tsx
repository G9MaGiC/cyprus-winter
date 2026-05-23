import { LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function PlanLoading() {
  const t = useTranslations("common");
  return (
    <div className="min-h-screen bg-sand" aria-busy="true" aria-live="polite" role="status" aria-label={t("loading.plan")}>
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyPlan} flex flex-col gap-8 sm:gap-12 md:gap-16 animate-pulse`}>
        {/* Hero */}
        <div className={`h-4 w-20 ${SKELETON.block} mb-4`} />
        <div className={`h-9 w-64 ${SKELETON.bar} mb-3`} />
        <div className={`h-4 w-full max-w-xl ${SKELETON.block} mb-10`} />
        {/* Trip dates SectionCard */}
        <div className={`mb-8 rounded-xl bg-white/90 border border-sand-200/80 border-l-4 border-l-aegean/40 ${CARD.contentLg}`}>
          <div className={`h-5 w-40 ${SKELETON.bar} mb-4`} />
          <div className="flex flex-wrap gap-4">
            <div className={`h-10 w-32 ${SKELETON.block}`} />
            <div className={`h-10 w-32 ${SKELETON.block}`} />
          </div>
        </div>
        {/* Start here — Add to Day + Templates grid */}
        <div className="mb-8">
          <div className={`h-6 w-24 ${SKELETON.bar} mb-2`} />
          <div className={`h-4 w-64 ${SKELETON.block} mb-4`} />
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-11 w-24 ${SKELETON.card} rounded-full shrink-0`} />
            ))}
          </div>
          <div className={`h-4 w-36 ${SKELETON.bar} mb-3`} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-[72px] ${SKELETON.card}`} />
            ))}
          </div>
        </div>
        {/* Day selector */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-11 w-20 ${SKELETON.card} shrink-0`} />
          ))}
        </div>
        {/* Day content + Add next stop */}
        <div className="space-y-6">
          <div className={`h-64 ${SKELETON.card} overflow-hidden`} />
          <div className={`h-48 ${SKELETON.card} border-l-4 border-l-terracotta/40 p-6`} />
        </div>
      </div>
    </div>
  );
}
