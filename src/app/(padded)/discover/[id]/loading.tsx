import { LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

export default async function AttractionLoading() {
  const t = await getTranslations("common");
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyDetail}`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label={t("loading.attraction")}
    >
      <div className="animate-pulse">
        <div className={`h-4 w-28 ${SKELETON.block} mb-6`} />
        <div className={`relative ${LAYOUT.heroBleedX} mt-6 mb-10 sm:mb-14`}>
          <div className={`${SKELETON.media} rounded-none`} />
        </div>
        <div className={`${CARD.base} ${CARD.content}`}>
          <div className={`h-5 w-3/4 ${SKELETON.bar} mb-2`} />
          <div className={`h-4 w-full ${SKELETON.block} mb-2`} />
          <div className={`h-4 w-4/5 ${SKELETON.block} mb-4`} />
          <div className={`h-3 w-24 ${SKELETON.bar} mb-3`} />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-8 w-20 ${SKELETON.block}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
