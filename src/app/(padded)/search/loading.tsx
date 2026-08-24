import { LAYOUT, CARD, SKELETON, SECTION } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

function NavSkeleton() {
  return (
    <nav className="flex flex-col gap-1 mb-8" aria-hidden>
      <div className={`h-4 w-16 ${SKELETON.block}`} />
      <div className={`h-3 w-36 ${SKELETON.block}`} />
    </nav>
  );
}

function SearchResultSkeleton() {
  return (
    <div className={`${CARD.base} ${CARD.content}`}>
      <div className="space-y-2">
        <div className={`h-5 w-32 ${SKELETON.bar}`} />
        <div className={`h-4 w-full max-w-xs ${SKELETON.block}`} />
      </div>
    </div>
  );
}

export default async function SearchLoading() {
  const t = await getTranslations("common");
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label={t("loading.search")}
    >
      <div className="animate-pulse">
        <NavSkeleton />

        <div className={`h-8 w-52 ${SKELETON.bar} mb-2`} aria-hidden />
        <div className={`h-4 max-w-md ${SKELETON.block} mb-8`} aria-hidden />

        <div className={`h-12 max-w-xl ${SKELETON.block} rounded-xl mb-8`} aria-hidden />

        <section className={SECTION.footerBlock} aria-hidden>
          <div className={`h-3 w-40 ${SKELETON.bar} mb-3`} />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className={`h-11 w-24 ${SKELETON.card} rounded-xl shrink-0`} />
            ))}
          </div>
        </section>

        <section className="mt-10" aria-hidden>
          <div className={`h-6 w-48 ${SKELETON.bar} ${SECTION.headingGap}`} />
          <ul className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <li key={i}>
                <SearchResultSkeleton />
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 pt-6 border-t border-sand-200/80" aria-hidden>
          <div className={`h-4 w-56 ${SKELETON.block} mb-3`} />
          <div className={`h-11 w-32 ${SKELETON.block} rounded-xl`} />
        </div>
      </div>
    </div>
  );
}
