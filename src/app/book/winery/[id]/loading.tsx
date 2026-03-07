import { LAYOUT, SKELETON } from "@/lib/design-tokens";

export default function WineryBookingLoading() {
  return (
    <div
      className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} animate-pulse`}
      aria-busy
      aria-label="Loading booking form"
    >
      <div className={`h-4 w-24 ${SKELETON.block} mb-6`} />
      <div className={`h-9 w-48 ${SKELETON.bar} mb-3`} />
      <div className={`h-4 w-full max-w-md ${SKELETON.block} mb-8`} />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-12 ${SKELETON.block}`} />
        ))}
      </div>
      <div className={`h-12 w-40 rounded-full ${SKELETON.block} mt-8`} />
    </div>
  );
}
