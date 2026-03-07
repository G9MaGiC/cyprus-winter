import { LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";

export default function BookingsLoading() {
  return (
    <div className="min-h-screen bg-sand" aria-busy aria-live="polite" role="status" aria-label="Loading bookings">
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} animate-pulse min-h-[60vh]`}>
        <div className={`h-4 w-20 ${SKELETON.block} mb-4`} />
        <div className={`h-9 w-64 ${SKELETON.bar} mb-2`} />
        <div className={`h-4 w-full max-w-lg ${SKELETON.block} mb-8`} />
        <div className={`flex flex-wrap gap-4 ${CARD.content} ${SKELETON.card} mb-8`}>
          <div className={`h-8 w-24 ${SKELETON.block}`} />
          <div className={`h-8 w-20 ${SKELETON.block}`} />
          <div className={`h-8 w-24 ${SKELETON.block}`} />
        </div>
        <div className="space-y-4 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-28 sm:h-24 ${SKELETON.card}`} />
          ))}
        </div>
        <div className={`${CARD.content} ${SKELETON.card}`}>
          <div className={`h-5 w-32 ${SKELETON.bar} mb-4`} />
          <div className="flex flex-wrap gap-3">
            <div className={`h-10 w-24 ${SKELETON.block}`} />
            <div className={`h-10 w-20 ${SKELETON.block}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
