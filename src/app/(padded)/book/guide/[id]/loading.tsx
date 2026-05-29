import { LAYOUT, SKELETON } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

export default async function GuideBookLoading() {
  const t = await getTranslations("common");
  return (
    <div className={`min-h-screen bg-sand ${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <div className={`h-10 w-48 ${SKELETON.block}`} aria-hidden />
      <div className={`mt-6 h-10 w-64 ${SKELETON.block}`} aria-hidden />
      <div className={`mt-4 h-4 w-full ${SKELETON.block}`} aria-hidden />
      <div className={`mt-2 h-4 w-3/4 ${SKELETON.block}`} aria-hidden />
      <div className="mt-8 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-14 ${SKELETON.block}`} aria-hidden />
        ))}
      </div>
      <p className="sr-only" aria-busy="true">
        {t("loading.bookingForm")}
      </p>
    </div>
  );
}
