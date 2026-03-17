import AppLink from "@/components/AppLink";
import { CTA, SECTION } from "@/lib/design-tokens";

export default function PlanWineryBar() {
  return (
    <div
      role="region"
      aria-label="Winery bookings"
      className="rounded-2xl border border-sand-200/90 bg-white/90 p-5 sm:p-6 flex flex-wrap items-center gap-3 sm:gap-4 min-h-[44px] shadow-sm"
    >
      <AppLink href="/bookings" className={CTA.primaryCompact}>
        Book tastings
      </AppLink>
      <AppLink href="/discover?filter=winery" className={CTA.secondaryCompact}>
        Browse wineries
      </AppLink>
      <AppLink href="/bookings" className={SECTION.aegeanLink}>
        My bookings
      </AppLink>
    </div>
  );
}
