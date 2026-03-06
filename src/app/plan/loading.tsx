import { LAYOUT, CARD } from "@/lib/design-tokens";

export default function PlanLoading() {
  return (
    <div className="min-h-screen bg-sand" aria-busy="true" aria-live="polite" role="status" aria-label="Loading plan">
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} animate-pulse`}>
        <div className="h-4 w-20 bg-sand-200/80 rounded mb-4" />
        <div className="h-9 w-64 bg-olive/20 rounded mb-3" />
        <div className="h-4 w-full max-w-xl bg-sand-200/80 rounded mb-10" />
        <div className={`flex justify-between gap-4 mb-8 rounded-xl bg-white/80 border border-sand-200/80 ${CARD.content}`}>
          <div className="flex gap-4">
            <div className="h-8 w-24 bg-sand-200/80 rounded" />
            <div className="h-8 w-20 bg-sand-200/80 rounded" />
          </div>
          <div className="h-10 w-32 bg-sand-200/80 rounded-lg" />
        </div>
        <div className="mb-8">
          <div className="h-5 w-24 bg-olive/20 rounded mb-4" />
          <div className="grid sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/90 border border-sand-200/80 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 w-20 bg-white/90 border border-sand-200/80 rounded-xl shrink-0" />
          ))}
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-white/90 border border-sand-200/80 rounded-xl" />
          <div className="h-80 bg-white/90 border border-sand-200/80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
