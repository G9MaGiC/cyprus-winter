import { LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";

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
        <div className={`h-4 w-24 ${SKELETON.block} mb-6`} aria-hidden />
        <div className="flex flex-wrap gap-2 mb-3">
          <div className={`h-8 w-16 ${SKELETON.block} rounded-full`} />
          <div className={`h-8 w-20 ${SKELETON.block} rounded-full`} />
        </div>
        <div className={`h-9 w-56 ${SKELETON.bar} mb-2`} />
        <div className={`h-4 w-32 ${SKELETON.block} mb-6`} />
        <div className={`aspect-video mb-6 overflow-hidden rounded-xl ${SKELETON.block}`} />
        <div className={`h-4 w-full ${SKELETON.block} mb-2`} />
        <div className={`h-4 w-3/4 ${SKELETON.block}`} />
      </div>
    </div>
  );
}
