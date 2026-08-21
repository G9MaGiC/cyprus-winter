import { LAYOUT, CARD, SKELETON, SECTION } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

function PageHeaderSkeleton() {
  return (
    <header className="mb-8" aria-hidden>
      <div className={`h-4 w-20 ${SKELETON.block} mb-4`} />
      <div className={`h-3 w-40 ${SKELETON.block} mb-6`} />
      <div className={`h-9 w-64 ${SKELETON.bar} mb-2`} />
      <div className={`h-4 w-full max-w-lg ${SKELETON.block}`} />
    </header>
  );
}

function TrustStripSkeleton() {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8 ${CARD.content} ${SKELETON.card} rounded-xl`} aria-hidden>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`h-5 w-5 ${SKELETON.block} rounded-full shrink-0`} />
          <div className={`h-4 w-24 ${SKELETON.block}`} />
        </div>
      ))}
    </div>
  );
}

function BookingCardSkeleton() {
  return (
    <div className={`${CARD.content} rounded-xl ${SKELETON.card} border-l-4 border-l-aegean/40`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className={`h-5 w-48 ${SKELETON.bar}`} />
          <div className={`h-4 w-32 ${SKELETON.block}`} />
          <div className={`h-4 w-40 ${SKELETON.block}`} />
        </div>
        <div className={`h-7 w-20 ${SKELETON.block} rounded-full shrink-0`} />
      </div>
    </div>
  );
}

export default async function BookingsLoading() {
  const t = await getTranslations("common");
  return (
    <div className="min-h-screen bg-sand" aria-busy aria-live="polite" role="status" aria-label={t("loading.bookings")}>
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} animate-pulse min-h-[60vh]`}>
        <PageHeaderSkeleton />
        <TrustStripSkeleton />

        <div className={`flex flex-wrap items-center gap-4 mb-8 rounded-xl ${CARD.base} ${CARD.content}`} aria-hidden>
          <div className={`h-8 w-8 ${SKELETON.block} rounded`} />
          <div className={`h-4 w-32 ${SKELETON.block}`} />
          <span className="w-px h-6 bg-sand-200 hidden sm:block" />
          <div className={`h-8 w-8 ${SKELETON.block} rounded`} />
          <div className={`h-4 w-24 ${SKELETON.block}`} />
        </div>

        <section className="mb-10" aria-hidden>
          <div className={`h-5 w-28 ${SKELETON.bar} ${SECTION.headingGap}`} />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        </section>

        <section aria-hidden>
          <div className={`h-5 w-36 ${SKELETON.bar} ${SECTION.headingGap}`} />
          <div className={`${CARD.base} ${CARD.content} space-y-4`}>
            <div className={`h-4 w-full max-w-md ${SKELETON.block}`} />
            <div className="flex flex-wrap gap-3">
              <div className={`h-12 flex-1 min-w-[200px] ${SKELETON.block} rounded-lg`} />
              <div className={`h-12 w-28 ${SKELETON.block} rounded-lg`} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
