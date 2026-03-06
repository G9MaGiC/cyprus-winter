"use client";
import StickyPlanBar from "./StickyPlanBar";

export default function StickyPlanBarBlock({ sentinelId }: { sentinelId: string }) {
  return (
    <>
      <div id={sentinelId} className="h-px" aria-hidden />
      <StickyPlanBar sentinelId={sentinelId} />
    </>
  );
}
