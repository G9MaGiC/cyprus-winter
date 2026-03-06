import { LAYOUT, SECTION, CARD } from "@/lib/design-tokens";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background" aria-busy aria-live="polite" role="status" aria-label="Loading">
      {/* Hero skeleton */}
      <div className="relative min-h-[75vh] sm:min-h-[82vh] flex flex-col items-center justify-end sm:justify-center pb-16 sm:pb-24">
        <div className="absolute inset-0 bg-sand-200/50 animate-pulse" />
        <div className={`relative w-full ${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} text-center`}>
          <div className="h-4 w-32 bg-olive/20 rounded mx-auto mb-3" />
          <div className="h-12 sm:h-16 w-48 sm:w-64 bg-olive/30 rounded mx-auto mb-3" />
          <div className="h-5 w-72 max-w-full bg-olive/20 rounded mx-auto mb-8" />
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-32 bg-olive/30 rounded-lg" />
            <div className="flex gap-3">
              <div className="h-11 w-24 bg-olive/20 rounded-lg" />
              <div className="h-11 w-24 bg-olive/20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
      {/* Content skeleton */}
      <div className={`${LAYOUT.safeAreaX} ${SECTION.py}`}>
        <div className={`${LAYOUT.list} mx-auto`}>
          <div className="h-9 w-32 bg-olive/20 rounded mb-2 mx-auto" />
          <div className="h-4 w-64 bg-sand-200 rounded mb-10 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${CARD.base} overflow-hidden`}>
                <div className="aspect-[4/3] bg-sand-200/70 animate-pulse" />
                <div className={CARD.content}>
                  <div className="h-5 w-24 bg-olive/20 rounded mb-2" />
                  <div className="h-4 w-full bg-sand-200/80 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
