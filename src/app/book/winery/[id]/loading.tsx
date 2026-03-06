import { LAYOUT } from "@/lib/design-tokens";

export default function WineryBookingLoading() {
  return (
    <div
      className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} animate-pulse`}
      aria-busy
      aria-label="Loading booking form"
    >
      <div className="h-4 w-24 bg-sand-200 rounded mb-6" />
      <div className="h-9 w-48 bg-olive/20 rounded mb-3" />
      <div className="h-4 w-full max-w-md bg-sand-200 rounded mb-8" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-sand-200" />
        ))}
      </div>
      <div className="h-12 w-40 rounded-full bg-sand-200 mt-8" />
    </div>
  );
}
