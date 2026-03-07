"use client";
import StickyPlanBar from "./StickyPlanBar";

/**
 * Renders StickyPlanBar only. The page must provide a sentinel (div with id={sentinelId})
 * placed near the Plan CTA so the sticky appears only when that CTA scrolls out of view.
 */
export default function StickyPlanBarBlock({ sentinelId }: { sentinelId: string }) {
  return <StickyPlanBar sentinelId={sentinelId} />;
}
