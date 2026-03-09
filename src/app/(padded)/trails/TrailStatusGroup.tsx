"use client";

import Link from "next/link";
import TrailCard from "@/components/TrailCard";
import { trailConditions } from "@/data/trails";
import type { Trail, TrailConditions } from "@/data/trails";

type TrailStatusGroupProps = {
  label: string;
  trails: Trail[];
  dotColor: string;
  defaultOpen?: boolean;
  reportTrailId?: string;
  /** When true, TrailCards receive undefined conditions (e.g. "No report" group) */
  noConditions?: boolean;
};

export default function TrailStatusGroup({
  label,
  trails,
  dotColor,
  defaultOpen = false,
  reportTrailId,
  noConditions = false,
}: TrailStatusGroupProps) {
  if (trails.length === 0) return null;

  const getConditions = (t: Trail): TrailConditions | undefined =>
    noConditions ? undefined : trailConditions[t.id];

  return (
    <details className="group" open={defaultOpen}>
      <summary
        className="list-none cursor-pointer flex items-center gap-2 text-sm font-medium text-olive/80 mb-4 [&::-webkit-details-marker]:hidden [&::marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded min-h-[44px] items-center"
        role="button"
      >
        <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} aria-hidden />
        {label} ({trails.length})
        <span
          className="text-olive/50 group-open:rotate-180 ml-1 transition-transform duration-200"
          aria-hidden
        >
          ▾
        </span>
      </summary>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        {trails.map((trail) => (
          <TrailCard
            key={trail.id}
            trail={trail}
            conditions={getConditions(trail)}
            featured={false}
          />
        ))}
      </div>
      {reportTrailId && (
        <p className="mt-4 text-sm text-olive/70">
          <Link
            href={`/trails/${reportTrailId}/report`}
            className="inline-flex items-center min-h-[44px] py-2 font-medium text-terracotta hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
          >
            Report conditions
          </Link>
        </p>
      )}
    </details>
  );
}
