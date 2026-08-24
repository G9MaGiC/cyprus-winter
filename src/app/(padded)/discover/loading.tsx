import { HOME, HUB, LAYOUT, CARD, SKELETON, SECTION, LAYER, STRIP } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

function CardSkeleton() {
  return (
    <div className={`${CARD.base} overflow-hidden`}>
      <div className={SKELETON.media} />
      <div className={`${CARD.content} space-y-2`}>
        <div className={`h-5 w-3/4 ${SKELETON.block}`} />
        <div className={`h-4 w-full ${SKELETON.block}`} />
        <div className={`h-4 w-4/5 ${SKELETON.block}`} />
        <div className="flex gap-2 pt-2">
          <div className={`h-6 w-16 ${SKELETON.block}`} />
          <div className={`h-6 w-20 ${SKELETON.block}`} />
          <div className={`h-6 w-14 ${SKELETON.block}`} />
        </div>
      </div>
    </div>
  );
}

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

function PlaceOfDaySkeleton() {
  return (
    <section className={`${SECTION.pySub} ${LAYOUT.safeAreaX}`}>
      <div className={`${LAYOUT.list} mx-auto`}>
        <div className={`h-3 w-24 ${SKELETON.block} ${SECTION.headingGap}`} />
        <div className={`${CARD.base} ${CARD.planCombo} overflow-hidden flex flex-col sm:flex-row`}>
          <div className={`sm:w-2/5 shrink-0 aspect-[4/3] sm:aspect-square ${SKELETON.block}`} />
          <div className={`flex-1 ${CARD.content} flex flex-col justify-between gap-4`}>
            <div>
              <div className={`h-7 w-3/4 ${SKELETON.block}`} />
              <div className={`h-4 w-full mt-2 ${SKELETON.block}`} />
              <div className={`h-4 w-4/5 mt-1 ${SKELETON.block}`} />
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className={`h-10 w-28 ${SKELETON.block} rounded-lg`} />
              <div className={`h-10 w-28 ${SKELETON.block} rounded-lg`} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function DiscoverLoading() {
  const t = await getTranslations("common");
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst} overflow-x-hidden flex flex-col ${HUB.shellGap}`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label={t("loading.discover")}
    >
      <HeroSkeleton />

      <section className={`${LAYOUT.safeAreaX} -mt-4`}>
        <div className={`${LAYOUT.list} mx-auto`}>
          <div className="max-w-2xl mx-auto">
            <div className={`h-12 w-full rounded-lg ${SKELETON.block}`} />
          </div>
        </div>
      </section>

      <PlaceOfDaySkeleton />

      <div className="-mt-4 sm:-mt-6">
        <div className={`sticky ${LAYOUT.stickyTop} ${LAYER.stickyContent} ${STRIP.stickySandBar} ${LAYOUT.stickyBarX} py-4 sm:py-5`}>
          <div className={`${LAYOUT.list} mx-auto space-y-3`}>
            <div className={`h-3 w-32 ${SKELETON.block}`} />
            <div className="flex gap-2.5 overflow-x-hidden pb-1">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className={`min-h-[44px] h-11 w-24 ${SKELETON.block} shrink-0 rounded-lg`} />
              ))}
            </div>
          </div>
        </div>

        <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX}`}>
          <div className={`h-4 w-full max-w-md pt-6 sm:pt-8 pb-2 ${SKELETON.block}`} />
          <div className="pt-2 space-y-12 sm:space-y-16">
            <div className={HUB.sectionPy}>
              <div className={`h-8 w-40 mb-4 sm:mb-6 ${SKELETON.block}`} />
              <div className={`grid sm:grid-cols-2 lg:grid-cols-3 ${HOME.gridGap}`}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
