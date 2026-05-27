import { LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";

function MonthSkeleton() {
  return (
    <div className={`${CARD.base} ${CARD.content}`}>
      <div className={`h-6 w-24 ${SKELETON.block} mb-3`} />
      <div className={`h-4 w-full ${SKELETON.block} mb-1`} />
      <div className={`h-4 w-4/5 ${SKELETON.block} mb-3`} />
      <div className="flex gap-4">
        <div className={`h-8 w-16 ${SKELETON.block}`} />
        <div className={`h-8 w-16 ${SKELETON.block}`} />
      </div>
    </div>
  );
}

export default function WeatherLoading() {
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}
      aria-busy
      role="status"
    >
      <div className="animate-pulse">
        <div className={`h-4 w-20 ${SKELETON.block} mb-4`} />
        <div className={`h-9 w-48 ${SKELETON.bar} mb-2`} />
        <div className={`h-4 max-w-lg ${SKELETON.block} mb-10`} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <MonthSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
