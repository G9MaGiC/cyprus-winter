import { LAYOUT, CARD } from "@/lib/design-tokens";

function CardSkeleton() {
  return (
    <div className={`${CARD.base} overflow-hidden`}>
      <div className="aspect-[4/3] bg-sand-200/70 rounded-none" />
      <div className={`${CARD.content} space-y-2`}>
        <div className="h-5 w-3/4 bg-sand-200/80 rounded" />
        <div className="h-4 w-full bg-sand-200/60 rounded" />
        <div className="h-4 w-4/5 bg-sand-200/60 rounded" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 bg-sand-200/70 rounded-md" />
          <div className="h-6 w-20 bg-sand-200/70 rounded-md" />
          <div className="h-6 w-14 bg-sand-200/70 rounded-md" />
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
        <div className="h-4 w-20 bg-sand-200 rounded mb-4" />
        <div className="h-9 w-48 bg-olive/20 rounded mb-3" />
        <div className="h-4 w-full max-w-xl bg-sand-200 rounded mb-2" />
        <div className="h-4 w-3/4 max-w-lg bg-sand-200 rounded" />
      </div>
      <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1 mb-6 scrollbar-none sm:flex-wrap">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="min-h-[44px] h-11 w-24 bg-sand-200/90 rounded-lg shrink-0" />
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
