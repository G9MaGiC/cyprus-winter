import { LAYOUT, CARD } from "@/lib/design-tokens";

export default function WeatherMonthLoading() {
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.detail} mx-auto ${LAYOUT.safeAreaX} py-12 sm:py-16`}
      aria-busy
      aria-live="polite"
      role="status"
      aria-label="Loading weather"
    >
      <div className="animate-pulse space-y-8">
        <div className="h-4 w-16 bg-sand-200 rounded" />
        <div className="h-10 w-56 bg-olive/20 rounded mb-4" />
        <div className="h-4 w-full max-w-xl bg-sand-200 rounded mb-2" />
        <div className="h-4 w-2/3 max-w-md bg-sand-200 rounded" />
        <div className={`${CARD.base} ${CARD.content}`}>
          <div className="space-y-4">
            <div className="h-6 w-32 bg-sand-200 rounded" />
            <div className="h-4 w-full bg-sand-200/80 rounded" />
            <div className="h-4 w-4/5 bg-sand-200/60 rounded" />
            <div className="h-4 w-3/4 bg-sand-200/60 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
