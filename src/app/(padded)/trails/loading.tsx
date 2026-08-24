import { LAYOUT, CARD, SKELETON, SECTION, LAYER, STRIP } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

function HeroSkeleton() {
  return (
    <section className={`relative ${LAYOUT.heroBleedX} overflow-hidden ${SECTION.headingMarginLarge}`}>
      <div className={`relative aspect-[3/1] sm:aspect-[16/9] min-h-[260px] sm:min-h-[200px] ${SKELETON.block}`} />
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))] pt-[calc(4.5rem+env(safe-area-inset-top,0px))]">
        <div className={`h-4 w-16 ${SKELETON.block} mb-2`} />
        <div className={`h-9 w-56 ${SKELETON.bar} mb-2`} />
        <div className={`h-4 w-full max-w-md ${SKELETON.block} mb-3`} />
        <div className="flex flex-wrap gap-2">
          <div className={`h-11 w-32 ${SKELETON.block} rounded-lg`} />
          <div className={`h-11 w-24 ${SKELETON.block} rounded-lg`} />
        </div>
      </div>
    </section>
  );
}

export default async function TrailsLoading() {
  const t = await getTranslations("common");
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst} overflow-x-hidden flex flex-col gap-12 sm:gap-16 animate-pulse`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label={t("loading.trails")}
    >
      <HeroSkeleton />

      <section className={`${LAYOUT.safeAreaX} -mt-4`}>
        <div className={`${LAYOUT.list} mx-auto`}>
          <div className="max-w-2xl mx-auto">
            <div className={`h-12 w-full rounded-lg ${SKELETON.block}`} />
          </div>
        </div>
      </section>

      <div className={`flex flex-wrap gap-4 ${CARD.content} rounded-xl bg-white/90 border border-sand-200/80 mx-auto w-full max-w-3xl`}>
        <div className={`h-8 w-24 ${SKELETON.block}`} />
        <div className={`h-8 w-20 ${SKELETON.block}`} />
        <div className={`h-8 w-24 ${SKELETON.block}`} />
      </div>

      <div className="-mt-4 sm:-mt-6">
        <div
          className={`sticky ${LAYOUT.stickyTop} ${LAYER.stickyContent} ${STRIP.stickySandBar} ${LAYOUT.stickyBarX} py-4 sm:py-5`}
        >
          <div className={`${LAYOUT.list} mx-auto space-y-3`}>
            <div className="flex flex-wrap gap-3">
              <div className={`min-h-[44px] h-11 w-16 ${SKELETON.block} shrink-0 rounded-lg`} />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`min-h-[44px] h-11 w-20 ${SKELETON.block} shrink-0 rounded-lg`} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`min-h-[44px] h-11 w-24 ${SKELETON.block} shrink-0 rounded-lg`} />
              ))}
            </div>
          </div>
        </div>

        <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} pt-6 sm:pt-8 space-y-12 sm:space-y-16`}>
          <div>
            <div className={`h-5 w-32 ${SKELETON.bar} mb-3`} />
            <div className={`h-4 w-48 ${SKELETON.block} mb-4`} />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className={`h-28 sm:h-24 ${SKELETON.card}`} />
              ))}
            </div>
          </div>
          <div>
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
    </div>
  );
}
