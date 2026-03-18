import { LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function SearchLoading() {
  const t = useTranslations("common");
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label={t("loading.search")}
    >
      <div className="animate-pulse">
        <div className={`h-4 w-16 ${SKELETON.block} mb-6`} />
        <div className={`h-8 w-52 ${SKELETON.bar} mb-2`} />
        <div className={`h-4 max-w-md ${SKELETON.block} mb-8`} />
        <div className={`h-12 max-w-xl ${SKELETON.block} mb-8`} />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${CARD.base} ${CARD.content} flex items-center gap-4`}>
              <div className={`h-14 w-20 shrink-0 ${SKELETON.block}`} />
              <div className="flex-1 min-w-0">
                <div className={`h-5 w-32 ${SKELETON.bar} mb-2`} />
                <div className={`h-4 w-full max-w-xs ${SKELETON.block}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
