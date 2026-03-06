import { LAYOUT } from "@/lib/design-tokens";

export default function TrailReportLoading() {
  return (
    <div
      className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} animate-pulse`}
      aria-busy="true"
      aria-live="polite"
      role="status"
      aria-label="Loading report form"
    >
      <div className="h-4 w-24 bg-sand-200 rounded mb-6" />
      <div className="h-8 w-40 bg-olive/20 rounded mb-2" />
      <div className="h-4 w-64 bg-sand-200 rounded mb-8" />
      <div className="space-y-6">
        <div>
          <div className="h-4 w-16 bg-sand-200 rounded mb-3" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-20 bg-sand-200 rounded-lg" />
            ))}
          </div>
        </div>
        <div>
          <div className="h-4 w-14 bg-sand-200 rounded mb-3" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-16 bg-sand-200 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="h-24 bg-sand-200 rounded-lg" />
        <div className="h-12 bg-sand-200 rounded-lg" />
      </div>
      <div className="h-12 w-full rounded-lg bg-sand-200 mt-8" />
    </div>
  );
}
