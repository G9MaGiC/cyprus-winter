import { LAYOUT, CARD } from "@/lib/design-tokens";

export default function AttractionLoading() {
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyDetail}`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label="Loading attraction"
    >
      <div className="animate-pulse">
        <div className="h-4 w-28 bg-sand-200/80 rounded mb-6" />
        <div className={`relative ${LAYOUT.heroBleedX} mt-6 mb-10 sm:mb-14`}>
          <div className={`${CARD.media} rounded-none`} />
        </div>
        <div className={`${CARD.base} ${CARD.content}`}>
          <div className="h-5 w-3/4 bg-olive/20 rounded mb-2" />
          <div className="h-4 w-full bg-sand-200/80 rounded mb-2" />
          <div className="h-4 w-4/5 bg-sand-200/60 rounded mb-4" />
          <div className="h-3 w-24 bg-olive/10 rounded mb-3" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 bg-sand-200/80 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
