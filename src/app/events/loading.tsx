import { LAYOUT } from "@/lib/design-tokens";

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
      <div className="h-4 w-16 bg-sand-200 rounded mb-4" />
      <div className="h-9 w-56 bg-olive/20 rounded mb-3" />
      <div className="h-4 w-full max-w-xl bg-sand-200 rounded mb-2" />
      <div className="h-4 w-72 bg-sand-200/80 rounded mb-10" />

      {/* Filter skeletons — Type + Region */}
      <div className="flex flex-wrap gap-4 lg:gap-6 mb-10">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <div className="h-3 w-10 bg-sand-200 rounded" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-11 w-16 sm:w-20 bg-sand-200/90 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <div className="h-3 w-14 bg-sand-200 rounded" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-11 w-20 sm:w-24 bg-sand-200/90 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Month jump skeleton */}
      <div className="h-3 w-24 bg-sand-200 rounded mb-3" />
      <div className="flex flex-wrap gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-11 w-14 bg-sand-200/90 rounded-lg" />
        ))}
      </div>

      {/* Event card skeletons */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-sand-200/90 h-40" />
        ))}
      </div>
    </div>
  );
}
