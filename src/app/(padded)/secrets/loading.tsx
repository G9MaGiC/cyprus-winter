import { HOME, LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

function SecretSkeleton() {
  return (
    <div className={`${CARD.base} ${CARD.content} border-s-4 border-s-golden/30`}>
      <div className="flex justify-between mb-3">
        <div className={`h-3 w-16 ${SKELETON.block}`} />
        <div className={`h-3 w-12 ${SKELETON.block}`} />
      </div>
      <div className={`h-5 w-3/4 ${SKELETON.block} mb-2`} />
      <div className={`h-4 w-full ${SKELETON.block} mb-1`} />
      <div className={`h-4 w-4/5 ${SKELETON.block}`} />
    </div>
  );
}

export default async function SecretsLoading() {
  const t = await getTranslations("common");
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label={t("loading.content")}
    >
      <div className="animate-pulse">
        <div className={`h-4 w-20 ${SKELETON.block} mb-4`} />
        <div className={`h-9 w-48 ${SKELETON.bar} mb-2`} />
        <div className={`h-4 max-w-lg ${SKELETON.block} mb-4`} />
        <div className={`h-11 w-32 ${SKELETON.block} mb-10`} />
        <div className={`grid sm:grid-cols-2 lg:grid-cols-3 ${HOME.gridGap}`}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SecretSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
