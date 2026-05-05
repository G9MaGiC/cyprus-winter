import { Link } from "@/i18n/navigation";
import { CTA, SECTION } from "@/lib/design-tokens";
import { TrackOnClick } from "@/components/TrackOnClick";

export default function PlanWineryBar() {
  return (
    <div
      role="region"
      aria-label="Winery bookings"
      className="rounded-2xl border border-sand-200/90 bg-white/90 p-5 sm:p-6 flex flex-wrap items-center gap-3 sm:gap-4 min-h-[44px] shadow-sm"
    >
      <TrackOnClick event="shop_click" properties={{ source: "plan_winery_bar", action: "book_tastings" }}>
        <Link href="/bookings?intent=new" className={CTA.primaryCompact}>
          Book tastings
        </Link>
      </TrackOnClick>
      <TrackOnClick event="shop_click" properties={{ source: "plan_winery_bar", action: "browse_wineries" }}>
        <Link href="/discover?filter=winery" className={CTA.secondaryCompact}>
          Browse wineries
        </Link>
      </TrackOnClick>
      <TrackOnClick event="shop_click" properties={{ source: "plan_winery_bar", action: "my_bookings" }}>
        <Link href="/bookings" className={SECTION.aegeanLink}>
          My bookings
        </Link>
      </TrackOnClick>
    </div>
  );
}
