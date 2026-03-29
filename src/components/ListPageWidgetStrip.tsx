import { LAYOUT, SECTION } from "@/lib/design-tokens";

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
    <div className={`${SECTION.headingGap} ${className}`}>
      {sentinelId && (
        <div
          id={sentinelId}
          className="h-px pointer-events-none"
          aria-hidden
        />
      )}
      <div
        className={`w-full min-w-0 ${sticky ? `sticky ${LAYOUT.stickyTop} z-10 ${LAYOUT.stickyBarX} pt-2 sm:pt-0 pb-3 sm:pb-4 bg-background/97 backdrop-blur-md border-b border-sand-200/70 shadow-[0_1px_0_rgba(201,111,82,0.03)]` : ""}`}
        role="region"
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </div>
  );
}
