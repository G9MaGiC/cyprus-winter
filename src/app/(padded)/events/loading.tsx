import { LAYOUT, CARD, SKELETON, SECTION, STRIP } from "@/lib/design-tokens";
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

export default async function EventsLoading() {
  const t = await getTranslations("common");
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst} animate-pulse`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label={t("loading.events")}
    >
      <HeroSkeleton />

      {/* Filter skeleton — matches sticky ListPageWidgetStrip on live page */}
      <div className={SECTION.headingGap}>
        <div
          className={`sticky ${LAYOUT.stickyTop} z-10 ${LAYOUT.stickyBarX} pt-2 sm:pt-0 pb-3 sm:pb-4 ${STRIP.stickySandBar}`}
        >
          <div className={`${CARD.base} ${CARD.content}`}>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 lg:gap-6">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <div className={`h-3 w-10 ${SKELETON.block}`} />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-11 w-16 sm:w-20 ${SKELETON.block}`} />
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <div className={`h-3 w-14 ${SKELETON.block}`} />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`h-11 w-20 sm:w-24 ${SKELETON.block}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Month jump skeleton */}
      <div className={`h-3 w-24 ${SKELETON.block} mb-3`} />
      <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-11 w-14 ${SKELETON.block}`} />
        ))}
      </div>

      {/* Event card skeletons */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${SKELETON.card} h-40`} />
        ))}
      </div>
    </div>
  );
}
