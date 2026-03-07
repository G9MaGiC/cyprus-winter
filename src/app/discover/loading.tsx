import { LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";

function CardSkeleton() {
  return (
    <div className={`${CARD.base} overflow-hidden`}>
      <div className={SKELETON.media} />
      <div className={`${CARD.content} space-y-2`}>
        <div className={`h-5 w-3/4 ${SKELETON.block}`} />
        <div className={`h-4 w-full ${SKELETON.block}`} />
        <div className={`h-4 w-4/5 ${SKELETON.block}`} />
        <div className="flex gap-2 pt-2">
          <div className={`h-6 w-16 ${SKELETON.block}`} />
          <div className={`h-6 w-20 ${SKELETON.block}`} />
          <div className={`h-6 w-14 ${SKELETON.block}`} />
        </div>
      </div>
    </div>
  );
}

export default function DiscoverLoading() {
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label="Loading discover"
    >
      <div className="animate-pulse mb-10">
        <div className={`h-4 w-20 ${SKELETON.block} mb-4`} />
        <div className={`h-9 w-48 ${SKELETON.bar} mb-3`} />
        <div className={`h-4 w-full max-w-xl ${SKELETON.block} mb-2`} />
        <div className={`h-4 w-3/4 max-w-lg ${SKELETON.block}`} />
      </div>
      <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1 mb-6 scrollbar-none sm:flex-wrap">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`min-h-[44px] h-11 w-24 ${SKELETON.block} shrink-0`} />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
