import { LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function WeatherMonthLoading() {
  const t = useTranslations("common");
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} py-12 sm:py-16`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label={t("loading.weatherMonth")}
    >
      <div className="animate-pulse space-y-8">
        <div className={`h-4 w-16 ${SKELETON.block}`} />
        <div className={`h-10 w-56 ${SKELETON.bar} mb-4`} />
        <div className={`h-4 w-full max-w-xl ${SKELETON.block} mb-2`} />
        <div className={`h-4 w-2/3 max-w-md ${SKELETON.block}`} />
        <div className={`${CARD.base} ${CARD.content}`}>
          <div className="space-y-4">
            <div className={`h-6 w-32 ${SKELETON.block}`} />
            <div className={`h-4 w-full ${SKELETON.block}`} />
            <div className={`h-4 w-4/5 ${SKELETON.block}`} />
            <div className={`h-4 w-3/4 ${SKELETON.block}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
