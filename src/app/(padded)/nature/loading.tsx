import { LAYOUT } from "@/lib/design-tokens";

export default function NatureLoading() {
  return (
    <div
      className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} animate-pulse space-y-6`}
      aria-hidden
    >
      <div className="h-10 w-2/3 max-w-md rounded-lg bg-sand-200" />
      <div className="h-4 w-full max-w-xl rounded bg-sand-200" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-sand-200" />
        ))}
      </div>
    </div>
  );
}
