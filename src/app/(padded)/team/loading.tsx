import { LAYOUT, CARD, SKELETON } from "@/lib/design-tokens";

function MemberSkeleton() {
  return (
    <div className={`${CARD.base} ${CARD.content}`}>
      <div className={`w-16 h-16 rounded-full ${SKELETON.block} mb-4`} />
      <div className={`h-6 w-40 ${SKELETON.block} mb-1`} />
      <div className={`h-4 w-28 ${SKELETON.block} mb-3`} />
      <div className={`h-4 w-full ${SKELETON.block} mb-1`} />
      <div className={`h-4 w-4/5 ${SKELETON.block}`} />
    </div>
  );
}

export default function TeamLoading() {
  return (
    <div
      className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}
      aria-busy
      role="status"
    >
      <div className="animate-pulse">
        <div className={`h-4 w-20 ${SKELETON.block} mb-4`} />
        <div className={`h-9 w-40 ${SKELETON.bar} mb-2`} />
        <div className={`h-4 max-w-md ${SKELETON.block} mb-10`} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <MemberSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
