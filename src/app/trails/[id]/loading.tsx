import { LAYOUT, CARD } from "@/lib/design-tokens";

export default function TrailLoading() {
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyDetail}`}
      aria-busy="true"
      aria-live="polite"
      role="status"
      aria-label="Loading trail"
    >
      <div className="animate-pulse">
        <div className="h-4 w-24 bg-sand-200/80 rounded mb-6" aria-hidden />
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="h-8 w-16 bg-sand-200/80 rounded-full" />
          <div className="h-8 w-20 bg-sand-200/80 rounded-full" />
        </div>
        <div className="h-9 w-56 bg-olive/20 rounded mb-2" />
        <div className="h-4 w-32 bg-sand-200/80 rounded mb-6" />
        <div className={`${CARD.base} aspect-video mb-6 overflow-hidden`} />
        <div className="h-4 w-full bg-sand-200/80 rounded mb-2" />
        <div className="h-4 w-3/4 bg-sand-200/60 rounded" />
      </div>
    </div>
  );
}
