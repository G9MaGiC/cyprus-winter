import PostHeroBand from "@/components/PostHeroBand";
import { POST_HERO, SKELETON } from "@/lib/design-tokens";

export function TripModeChipsSkeleton() {
  return (
    <PostHeroBand>
      <div className={`${POST_HERO.chipNav} gap-2`} aria-hidden>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-11 w-28 sm:w-32 rounded-full ${SKELETON.bar}`} />
        ))}
      </div>
    </PostHeroBand>
  );
}
