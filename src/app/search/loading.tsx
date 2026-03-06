import { LAYOUT, CARD } from "@/lib/design-tokens";

export default function SearchLoading() {
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label="Loading search"
    >
      <div className="animate-pulse">
        <div className="h-4 w-16 bg-sand-200/80 rounded mb-6" />
        <div className="h-8 w-52 bg-olive/20 rounded mb-2" />
        <div className="h-4 max-w-md bg-sand-200/80 rounded mb-8" />
        <div className="h-12 max-w-xl bg-sand-200/80 rounded-lg mb-8" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`${CARD.base} p-4 flex items-center gap-4`}>
              <div className="h-14 w-20 shrink-0 rounded-lg bg-sand-200/80" />
              <div className="flex-1 min-w-0">
                <div className="h-5 w-32 bg-olive/20 rounded mb-2" />
                <div className="h-4 w-full max-w-xs bg-sand-200/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
