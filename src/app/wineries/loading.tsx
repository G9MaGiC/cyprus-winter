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
        </div>
      </div>
    </div>
  );
}

export default function WineriesLoading() {
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label="Loading wineries"
    >
      <div className="animate-pulse">
        <div className="h-4 w-20 bg-sand-200/80 rounded mb-4" />
        <div className="h-9 w-64 bg-olive/20 rounded mb-2" />
        <div className="h-4 max-w-lg bg-sand-200/80 rounded mb-4" />
        <div className="h-11 w-32 bg-sand-200/80 rounded-lg mb-10" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
