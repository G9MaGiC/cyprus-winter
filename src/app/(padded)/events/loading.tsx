import { LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";

export default function EventsLoading() {
  return (
    <div
      className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} animate-pulse`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label="Loading events"
    >
      {/* Header skeleton */}
      <div className={`h-4 w-16 ${SKELETON.block} mb-4`} />
      <div className={`h-9 w-56 ${SKELETON.bar} mb-3`} />
      <div className={`h-4 w-full max-w-xl ${SKELETON.block} mb-2`} />
      <div className={`h-4 w-72 ${SKELETON.block} mb-10`} />

      {/* Filter skeletons — Type + Region (CARD wrapper) */}
      <div className={`${CARD.base} ${CARD.content} mb-6 sm:mb-8`}>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 lg:gap-6">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <div className={`h-3 w-10 ${SKELETON.block}`} />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-11 w-16 sm:w-20 ${SKELETON.block}`} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <div className={`h-3 w-14 ${SKELETON.block}`} />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-11 w-20 sm:w-24 ${SKELETON.block}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Month jump skeleton */}
      <div className={`h-3 w-24 ${SKELETON.block} mb-3`} />
      <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-11 w-14 ${SKELETON.block}`} />
        ))}
      </div>

      {/* Event card skeletons */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${SKELETON.card} h-40`} />
        ))}
      </div>
    </div>
  );
}
