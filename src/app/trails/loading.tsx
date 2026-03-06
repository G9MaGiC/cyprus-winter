import { LAYOUT } from "@/lib/design-tokens";

export default function TrailsLoading() {
  return (
    <div className="min-h-screen bg-sand" aria-busy="true" aria-live="polite" role="status" aria-label="Loading trails">
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} animate-pulse`}>
        <div className="h-4 w-20 bg-sand-200/80 rounded mb-4" />
        <div className="h-9 w-64 bg-olive/20 rounded mb-2" />
        <div className="h-4 w-full max-w-lg bg-sand-200/80 rounded mb-8" />
        <div className="flex flex-wrap gap-4 p-5 rounded-xl bg-white/90 border border-sand-200/80 mb-8">
          <div className="h-8 w-24 bg-sand-200/80 rounded" />
          <div className="h-8 w-20 bg-sand-200/80 rounded" />
          <div className="h-8 w-24 bg-sand-200/80 rounded" />
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="h-10 w-16 bg-sand-200/80 rounded" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-20 bg-sand-200/80 rounded-lg" />
          ))}
          <div className="h-10 w-16 bg-sand-200/80 rounded ml-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-24 bg-sand-200/80 rounded-lg" />
          ))}
        </div>
        <div className="mb-6">
          <div className="h-5 w-32 bg-olive/20 rounded mb-3" />
          <div className="h-4 w-48 bg-sand-200/80 rounded mb-4" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 sm:h-24 bg-white/90 border border-sand-200/80 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="mb-8">
          <div className="h-5 w-24 bg-olive/20 rounded mb-3" />
          <div className="h-[300px] sm:h-[360px] rounded-xl border border-sand-200/80 bg-sand-100/80" />
        </div>
        <div>
          <div className="h-5 w-28 bg-olive/20 rounded mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 sm:h-24 bg-white/90 border border-sand-200/80 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
