import Link from "next/link";
import { CTA, SECTION } from "@/lib/design-tokens";

export default function PlanWineryBar() {
  return (
    <div
      role="region"
      aria-label="Winery bookings"
      className="rounded-2xl border border-sand-200/90 bg-white/90 p-5 sm:p-6 flex flex-wrap items-center gap-3 sm:gap-4 min-h-[44px] shadow-sm"
    >
      <Link href="/bookings" className={CTA.primaryCompact}>
        Book tastings
      </Link>
      <Link href="/discover?filter=winery" className={CTA.secondaryCompact}>
        Browse wineries
      </Link>
      <Link href="/bookings" className={SECTION.aegeanLink}>
        My bookings
      </Link>
    </div>
  );
}
