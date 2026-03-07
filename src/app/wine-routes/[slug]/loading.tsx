import { LAYOUT, CARD } from "@/lib/design-tokens";

export default function WineRouteLoading() {
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} py-12 sm:py-16`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label="Loading wine route"
    >
      <div className="animate-pulse space-y-8">
        <div className="h-4 w-24 bg-sand-200 rounded" />
        <div className="h-10 w-64 bg-olive/20 rounded mb-4" />
        <div className="h-4 w-full max-w-2xl bg-sand-200 rounded mb-2" />
        <div className="h-4 w-3/4 max-w-xl bg-sand-200 rounded" />
        <div className={`${CARD.base} overflow-hidden`}>
          <div className="aspect-[16/9] bg-sand-200/70" />
          <div className={`${CARD.content} space-y-3`}>
            <div className="h-5 w-full bg-sand-200/80 rounded" />
            <div className="h-4 w-full bg-sand-200/60 rounded" />
            <div className="h-4 w-4/5 bg-sand-200/60 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
