import { LAYOUT, CARD, SKELETON, SECTION, LAYER, STRIP } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

function HeroSkeleton() {
  return (
    <section className={`relative -mx-4 sm:-mx-6 overflow-hidden ${SECTION.headingMarginLarge}`}>
      <div className={`relative aspect-[3/1] sm:aspect-[16/9] min-h-[260px] sm:min-h-[200px] ${SKELETON.block}`} />
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] pt-[calc(4.5rem+env(safe-area-inset-top,0px))]">
        <div className={`h-4 w-16 ${SKELETON.block} mb-2`} />
        <div className={`h-9 w-56 ${SKELETON.bar} mb-2`} />
        <div className={`h-4 w-full max-w-md ${SKELETON.block}`} />
      </div>
    </section>
  );
}

export default async function PlanLoading() {
  const t = await getTranslations("common");
  return (
    <div
      className="min-h-screen bg-sand"
      aria-busy
      aria-live="polite"
      role="status"
      aria-label={t("loading.plan")}
    >
      <div
        className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyPlan} flex flex-col gap-8 sm:gap-12 md:gap-16 animate-pulse`}
      >
        <HeroSkeleton />

        <div className={`mb-8 rounded-xl bg-white/90 border border-sand-200/80 border-l-4 border-l-aegean/40 ${CARD.contentLg}`}>
          <div className={`h-5 w-40 ${SKELETON.bar} mb-4`} />
          <div className="flex flex-wrap gap-4">
            <div className={`h-10 w-32 ${SKELETON.block}`} />
            <div className={`h-10 w-32 ${SKELETON.block}`} />
          </div>
        </div>

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

        <div
          className={`sticky ${LAYER.stickyContent} ${LAYOUT.stickyTop} ${LAYOUT.stickyBarX} pt-4 pb-4 sm:pt-5 sm:pb-5 mb-6 sm:mb-8 ${STRIP.stickySandBar}`}
        >
          <div className="flex gap-2 sm:gap-2.5 overflow-x-hidden pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`min-h-[44px] h-11 w-20 ${SKELETON.card} shrink-0 rounded-full`} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`h-64 ${SKELETON.card} overflow-hidden`} />
          <div className={`h-48 ${SKELETON.card} border-l-4 border-l-terracotta/40 p-6`} />
        </div>
      </div>
    </div>
  );
}
