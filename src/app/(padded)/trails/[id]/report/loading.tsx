import { LAYOUT, SKELETON } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function TrailReportLoading() {
  const t = useTranslations("common");
  return (
    <div
      className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} animate-pulse`}
      aria-busy="true"
      aria-live="polite"
      role="status"
      aria-label={t("loading.reportForm")}
    >
      <div className={`h-4 w-24 ${SKELETON.block} mb-6`} />
      <div className={`h-8 w-40 ${SKELETON.bar} mb-2`} />
      <div className={`h-4 w-64 ${SKELETON.block} mb-8`} />
      <div className="space-y-6">
        <div>
          <div className={`h-4 w-16 ${SKELETON.block} mb-3`} />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-10 w-20 ${SKELETON.block}`} />
            ))}
          </div>
        </div>
        <div>
          <div className={`h-4 w-14 ${SKELETON.block} mb-3`} />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-10 w-16 ${SKELETON.block}`} />
            ))}
          </div>
        </div>
        <div className={`h-24 ${SKELETON.block}`} />
        <div className={`h-12 ${SKELETON.block}`} />
      </div>
      <div className={`h-12 w-full ${SKELETON.block} mt-8`} />
    </div>
  );
}
