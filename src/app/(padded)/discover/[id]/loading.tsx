import { LAYOUT, CARD, SKELETON, SECTION, LAYER, STRIP } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

function NavSkeleton() {
  return (
    <nav className="flex flex-col gap-1 mb-6" aria-hidden>
      <div className={`h-4 w-24 ${SKELETON.block}`} />
      <div className={`h-3 w-48 ${SKELETON.block}`} />
    </nav>
  );
}

function DetailHeroSkeleton() {
  return (
    <div className={`relative ${LAYOUT.heroBleedX} mb-10 sm:mb-14`} aria-hidden>
      <div className={`${SKELETON.media} rounded-none`} />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <div className={`h-6 w-20 ${SKELETON.block} rounded-full mb-3`} />
        <div className={`h-9 w-3/4 max-w-md ${SKELETON.bar} mb-2`} />
        <div className={`h-4 w-32 ${SKELETON.block}`} />
      </div>
    </div>
  );
}

export default async function AttractionLoading() {
  const t = await getTranslations("common");
  return (
    <div className="min-h-screen bg-sand">
      <div
        className={`${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyDetail} ${LAYOUT.detailMobileStickyClearance} animate-pulse`}
        aria-busy
        aria-live="polite"
        role="status"
        aria-label={t("loading.attraction")}
      >
        <NavSkeleton />
        <DetailHeroSkeleton />

        <div className="space-y-10 sm:space-y-14">
          <section aria-hidden>
            <div className={`h-4 w-24 ${SKELETON.bar} ${SECTION.headingGap}`} />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-8 w-24 ${SKELETON.card} rounded-md`} />
              ))}
            </div>
            <div className="mt-4">
              <div className={`h-4 w-20 ${SKELETON.bar} mb-2`} />
              <div className={`h-4 w-full max-w-lg ${SKELETON.block}`} />
            </div>
          </section>

          <section aria-hidden>
            <div className={`h-4 w-28 ${SKELETON.bar} ${SECTION.headingGap}`} />
            <div className={`${CARD.base} ${CARD.content} space-y-3`}>
              <div className={`h-4 w-full ${SKELETON.block}`} />
              <div className={`h-4 w-full ${SKELETON.block}`} />
              <div className={`h-4 w-4/5 ${SKELETON.block}`} />
            </div>
          </section>

          <section aria-hidden>
            <div className={`h-4 w-32 ${SKELETON.bar} ${SECTION.headingGap}`} />
            <div className={`${CARD.base} ${CARD.content}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className={`h-3 w-16 ${SKELETON.bar}`} />
                    <div className={`h-4 w-full ${SKELETON.block}`} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section aria-hidden>
            <div className={`h-4 w-24 ${SKELETON.bar} ${SECTION.headingGap}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className={`${CARD.base} overflow-hidden`}>
                  <div className={`${SKELETON.media} rounded-t-xl`} />
                  <div className={`${CARD.content} space-y-2`}>
                    <div className={`h-5 w-3/4 ${SKELETON.block}`} />
                    <div className={`h-4 w-full ${SKELETON.block}`} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 ${LAYER.stickyContent} ${STRIP.stickyBottomBar} ${LAYOUT.safeAreaX} py-3 sm:py-4 sm:hidden`}
        aria-hidden
      >
        <div className={`${LAYOUT.detail} mx-auto`}>
          <div className={`h-12 w-full ${SKELETON.block} rounded-xl`} />
        </div>
      </div>
    </div>
  );
}
