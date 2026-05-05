import { Link } from "@/i18n/navigation";
import { CTA, SECTION } from "@/lib/design-tokens";

export default function PlanAddFailedAlert() {
  return (
    <div
      className="p-5 sm:p-6 rounded-2xl bg-terracotta/5 border border-terracotta/20 text-sm text-olive"
      role="alert"
      aria-live="assertive"
    >
      <p className={SECTION.titleGap}>That place is no longer in our list.</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/discover" className={CTA.secondaryCompact} aria-label="Browse Discover to find places">
          Browse Discover
        </Link>
        <Link href="/trails" className={CTA.secondaryCompact} aria-label="View trails">
          View trails
        </Link>
      </div>
    </div>
  );
}
