import { CARD, HERO, LAYOUT, SKELETON, STRIP } from "@/lib/design-tokens";

export function HomeHeroSkeleton() {
  return (
    <section aria-hidden className={`${HERO.section} ${LAYOUT.safeAreaX} bg-sand-200/80`}>
      <div className={`${LAYOUT.list} mx-auto min-h-[280px] sm:min-h-[320px] flex flex-col justify-end pb-10 sm:pb-12`}>
        <div className={`h-4 w-32 ${SKELETON.bar} mb-4`} />
        <div className={`h-10 sm:h-12 w-4/5 max-w-lg ${SKELETON.bar} mb-3`} />
        <div className={`h-5 w-3/5 max-w-md ${SKELETON.bar}`} />
      </div>
    </section>
  );
}

export function EditorsPicksSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" aria-hidden>
      {[1, 2].map((i) => (
        <div key={i} className={`${CARD.base} overflow-hidden`}>
          <div className={`${SKELETON.media} rounded-t-xl`} />
          <div className={`${CARD.content} space-y-2`}>
            <div className={`h-5 w-3/4 ${SKELETON.block}`} />
            <div className={`h-4 w-full ${SKELETON.block}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookTastingsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" aria-hidden>
      {[1, 2, 3].map((i) => (
        <div key={i} className={`${CARD.base} overflow-hidden`}>
          <div className={`${SKELETON.media} rounded-t-xl`} />
          <div className={`${CARD.content} space-y-2`}>
            <div className={`h-5 w-2/3 ${SKELETON.block}`} />
            <div className={`h-4 w-full ${SKELETON.block}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchSectionSkeleton() {
  return (
    <section aria-hidden className={`${LAYOUT.safeAreaX} py-8 sm:py-10`}>
      <div className={`${LAYOUT.list} mx-auto`}>
        <div className={`h-4 w-48 ${SKELETON.bar} mb-3 mx-auto`} />
        <div className={`h-12 w-full max-w-xl mx-auto ${SKELETON.bar} rounded-xl`} />
      </div>
    </section>
  );
}

export function WeatherStripSkeleton() {
  return (
    <section
      aria-hidden
      className={`${LAYOUT.safeAreaX} ${STRIP.py} ${STRIP.surfaceSand}`}
    >
      <div className={`${LAYOUT.list} mx-auto flex justify-center`}>
        <div className={`h-6 w-40 ${SKELETON.bar}`} />
      </div>
    </section>
  );
}

const thisWeekBorders = ["border-l-aegean/30", "border-l-sage/40", "border-l-golden/40"] as const;

export function ThisWeekSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" aria-hidden>
      {[1, 2, 3].map((i) => (
        <div key={i} className={`${CARD.content} ${CARD.base} border-l-4 ${thisWeekBorders[i - 1]}`}>
          <div className="h-4 w-20 bg-olive/30 rounded mb-2" />
          <div className="h-8 w-32 bg-olive/30 rounded mt-1" />
          <div className="h-4 w-full bg-sand-300/60 rounded mt-2" />
        </div>
      ))}
    </div>
  );
}
