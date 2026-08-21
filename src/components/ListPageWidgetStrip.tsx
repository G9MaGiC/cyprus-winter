import { LAYOUT, SECTION, STRIP } from "@/lib/design-tokens";

type ListPageWidgetStripProps = {
  /** When true, strip sticks to top on scroll with backdrop blur */
  sticky?: boolean;
  /** Optional sentinel id - renders a 1px sentinel above the strip for StickyPlanBar */
  sentinelId?: string;
  /** Accessible name for the filter/stats region (required — pass i18n label from caller) */
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
};

export default function ListPageWidgetStrip({
  sticky = false,
  sentinelId,
  ariaLabel,
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
        className={`w-full min-w-0 ${sticky ? `sticky ${LAYOUT.stickyTop} z-10 ${LAYOUT.stickyBarX} pt-2 sm:pt-0 pb-3 sm:pb-4 ${STRIP.stickySandBar}` : ""}`}
        role="region"
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </div>
  );
}
