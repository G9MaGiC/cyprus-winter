import { LAYOUT, CARD } from "@/lib/design-tokens";

export default function PlanLoading() {
  return (
    <div className="min-h-screen bg-sand" aria-busy="true" aria-live="polite" role="status" aria-label="Loading plan">
      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} animate-pulse`}>
        {/* Hero */}
        <div className="h-4 w-20 bg-sand-200/80 rounded mb-4" />
        <div className="h-9 w-64 bg-olive/20 rounded mb-3" />
        <div className="h-4 w-full max-w-xl bg-sand-200/80 rounded mb-10" />
        {/* Trip dates SectionCard */}
        <div className={`mb-8 rounded-xl bg-white/90 border border-sand-200/80 border-l-4 border-l-aegean/40 ${CARD.contentLg}`}>
          <div className="h-5 w-40 bg-olive/20 rounded mb-4" />
          <div className="flex flex-wrap gap-4">
            <div className="h-10 w-32 bg-sand-200/80 rounded-lg" />
            <div className="h-10 w-32 bg-sand-200/80 rounded-lg" />
          </div>
        </div>
        {/* Start here — Add to Day + Templates grid */}
        <div className="mb-8">
          <div className="h-6 w-24 bg-olive/20 rounded mb-2" />
          <div className="h-4 w-64 bg-sand-200/80 rounded mb-4" />
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-11 w-24 bg-white/90 border border-sand-200/60 rounded-full shrink-0" />
            ))}
          </div>
          <div className="h-4 w-36 bg-olive/15 rounded mb-3" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-[72px] bg-white/90 border border-sand-200/80 rounded-xl" />
            ))}
          </div>
        </div>
        {/* Day selector */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-11 w-20 bg-white/80 border border-sand-200/60 rounded-lg shrink-0" />
          ))}
        </div>
        {/* Day content + Add next stop */}
        <div className="space-y-6">
          <div className="h-64 bg-white/90 border border-sand-200/80 rounded-xl overflow-hidden" />
          <div className="h-48 rounded-xl bg-white/90 border border-sand-200/80 border-l-4 border-l-terracotta/40 p-6" />
        </div>
      </div>
    </div>
  );
}
