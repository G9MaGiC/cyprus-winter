import { LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function TrailsLoading() {
  const t = useTranslations("common");
  return (
    <div className="min-h-screen bg-sand" aria-busy="true" aria-live="polite" role="status" aria-label={t("loading.trails")}>
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} animate-pulse`}>
        <div className={`h-4 w-20 ${SKELETON.block} mb-4`} />
        <div className={`h-9 w-64 ${SKELETON.bar} mb-2`} />
        <div className={`h-4 w-full max-w-lg ${SKELETON.block} mb-8`} />
        <div className={`flex flex-wrap gap-4 ${CARD.content} rounded-xl bg-white/90 border border-sand-200/80 mb-8`}>
          <div className={`h-8 w-24 ${SKELETON.block}`} />
          <div className={`h-8 w-20 ${SKELETON.block}`} />
          <div className={`h-8 w-24 ${SKELETON.block}`} />
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          <div className={`h-10 w-16 ${SKELETON.block}`} />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-10 w-20 ${SKELETON.block}`} />
          ))}
          <div className={`h-10 w-16 ${SKELETON.block} ml-4`} />
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-10 w-24 ${SKELETON.block}`} />
          ))}
        </div>
        <div className="mb-6">
          <div className={`h-5 w-32 ${SKELETON.bar} mb-3`} />
          <div className={`h-4 w-48 ${SKELETON.block} mb-4`} />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className={`h-28 sm:h-24 ${SKELETON.card}`} />
            ))}
          </div>
        </div>
        <div className="mb-8">
          <div className={`h-5 w-24 ${SKELETON.bar} mb-3`} />
          <div className={`h-[300px] sm:h-[360px] ${SKELETON.block}`} />
        </div>
        <div>
          <div className={`h-5 w-28 ${SKELETON.bar} mb-4`} />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-28 sm:h-24 ${SKELETON.card}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
