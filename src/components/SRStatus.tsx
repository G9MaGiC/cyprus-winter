"use client";

export function SRStatus({ message }: { message: string }) {
  // `!fixed` on top of sr-only: the default `position: absolute` takes the
  // element's static position, so an SRStatus inside a wide horizontal
  // scroll row (with no positioned ancestor) lands far off-canvas relative
  // to the initial containing block and silently expands
  // documentElement.scrollWidth — a page-level horizontal-scroll bug the
  // visual QA gate catches. position: fixed never contributes to scroll
  // geometry and screen readers treat the live region identically.
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only !fixed" role="status">
      {message}
    </div>
  );
}

