import { LAYOUT } from "@/lib/design-tokens";

export default function BookingsLoading() {
  return (
    <div className="min-h-screen bg-sand" aria-busy aria-live="polite" role="status" aria-label="Loading bookings">
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} animate-pulse min-h-[60vh]`}>
        <div className="h-4 w-20 bg-sand-200/80 rounded mb-4" />
        <div className="h-9 w-64 bg-olive/20 rounded mb-2" />
        <div className="h-4 w-full max-w-lg bg-sand-200/80 rounded mb-8" />
        <div className="flex flex-wrap gap-4 p-5 rounded-xl bg-white/90 border border-sand-200/80 mb-8">
          <div className="h-8 w-24 bg-sand-200/80 rounded" />
          <div className="h-8 w-20 bg-sand-200/80 rounded" />
          <div className="h-8 w-24 bg-sand-200/80 rounded" />
        </div>
        <div className="space-y-4 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 sm:h-24 rounded-xl bg-white/90 border border-sand-200/80" />
          ))}
        </div>
        <div className="p-6 rounded-xl bg-white/90 border border-sand-200/80">
          <div className="h-5 w-32 bg-olive/20 rounded mb-4" />
          <div className="flex flex-wrap gap-3">
            <div className="h-10 w-24 bg-sand-200/80 rounded-lg" />
            <div className="h-10 w-20 bg-sand-200/80 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
