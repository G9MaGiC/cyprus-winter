import { LAYOUT } from "@/lib/design-tokens";

type ListPageWidgetStripProps = {
  /** When true, strip sticks to top on scroll with backdrop blur */
  sticky?: boolean;
  /** Optional sentinel id - renders a 1px sentinel above the strip for StickyPlanBar */
  sentinelId?: string;
  /** Optional aria-label for the region (default: "Page filters and stats") */
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
};

export default function ListPageWidgetStrip({
  sticky = false,
  sentinelId,
  ariaLabel = "Page filters and stats",
  children,
  className = "",
}: ListPageWidgetStripProps) {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      {sentinelId && (
        <div
          id={sentinelId}
          className="h-px pointer-events-none"
          aria-hidden
        />
      )}
      <div
        className={
          sticky
            ? `sticky top-0 z-10 ${LAYOUT.stickyBarX} pt-2 pb-4 -mt-2 bg-sand/95 backdrop-blur-sm supports-[backdrop-filter]:bg-sand/90 border-b border-sand-200/80`
            : ""
        }
        role="region"
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </div>
  );
}
