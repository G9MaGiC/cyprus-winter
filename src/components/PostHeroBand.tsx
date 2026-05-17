import { POST_HERO } from "@/lib/design-tokens";
import type { ReactNode } from "react";

/** Card-style band overlapping the home hero (trip mode chips, etc.). */
export default function PostHeroBand({ children }: { children: ReactNode }) {
  return (
    <div className={POST_HERO.wrap}>
      <div className={POST_HERO.inner}>
        <div className={POST_HERO.panel}>{children}</div>
      </div>
    </div>
  );
}
