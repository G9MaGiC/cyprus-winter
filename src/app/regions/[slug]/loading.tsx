import { LAYOUT, CARD } from "@/lib/design-tokens";

export default function RegionLoading() {
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} py-12 sm:py-16`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label="Loading region"
    >
      <div className="animate-pulse space-y-8">
        <div className="h-4 w-20 bg-sand-200 rounded" />
        <div className="h-10 w-48 bg-olive/20 rounded mb-4" />
        <div className="h-4 w-full max-w-2xl bg-sand-200 rounded mb-2" />
        <div className="h-4 w-3/4 max-w-xl bg-sand-200 rounded" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`${CARD.base} overflow-hidden`}>
              <div className="aspect-[4/3] bg-sand-200/70" />
              <div className={`${CARD.content} space-y-2`}>
                <div className="h-5 w-2/3 bg-sand-200/80 rounded" />
                <div className="h-4 w-full bg-sand-200/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
