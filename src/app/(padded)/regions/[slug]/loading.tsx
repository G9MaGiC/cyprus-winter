import { LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function RegionLoading() {
  const t = useTranslations("common");
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label={t("loading.region")}
    >
      <div className="animate-pulse space-y-8">
        <div className={`h-4 w-20 ${SKELETON.block}`} />
        <div className={`h-10 w-48 ${SKELETON.bar} mb-4`} />
        <div className={`h-4 w-full max-w-2xl ${SKELETON.block} mb-2`} />
        <div className={`h-4 w-3/4 max-w-xl ${SKELETON.block}`} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`${CARD.base} overflow-hidden`}>
              <div className={SKELETON.media} />
              <div className={`${CARD.content} space-y-2`}>
                <div className={`h-5 w-2/3 ${SKELETON.block}`} />
                <div className={`h-4 w-full ${SKELETON.block}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
