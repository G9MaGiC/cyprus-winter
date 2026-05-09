import { LAYOUT, SECTION, CARD, SKELETON } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function RootLoading() {
  const t = useTranslations("common");

  return (
    <div
      className="min-h-screen bg-background"
      aria-busy
      aria-live="polite"
      role="status"
      aria-label={t("loading.generic")}
    >
      {/* Hero skeleton */}
      <div className="relative min-h-[75vh] sm:min-h-[82vh] flex flex-col items-center justify-end sm:justify-center pb-16 sm:pb-24">
        <div className={`absolute inset-0 ${SKELETON.block} rounded-none`} />
        <div className={`relative w-full ${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} text-center`}>
          <div className={`h-4 w-32 ${SKELETON.bar} mx-auto mb-3`} />
          <div className={`h-12 sm:h-16 w-48 sm:w-64 ${SKELETON.bar} mx-auto mb-3`} />
          <div className={`h-5 w-72 max-w-full ${SKELETON.bar} mx-auto mb-8`} />
          <div className="flex flex-col items-center gap-4">
            <div className={`h-12 w-32 ${SKELETON.block}`} />
            <div className="flex gap-3">
              <div className={`h-11 w-24 ${SKELETON.block}`} />
              <div className={`h-11 w-24 ${SKELETON.block}`} />
            </div>
          </div>
        </div>
      </div>
      {/* Content skeleton */}
      <div className={`${LAYOUT.safeAreaX} ${SECTION.py}`}>
        <div className={`${LAYOUT.list} mx-auto`}>
          <div className={`h-9 w-32 ${SKELETON.bar} mb-2 mx-auto`} />
          <div className={`h-4 w-64 ${SKELETON.block} mb-10 mx-auto`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${CARD.base} overflow-hidden`}>
                <div className={SKELETON.media} />
                <div className={CARD.content}>
                  <div className={`h-5 w-24 ${SKELETON.bar} mb-2`} />
                  <div className={`h-4 w-full ${SKELETON.block}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
