"use client";

import Link from "next/link";
import Disclosure from "@/components/Disclosure";
import { winterTipsHiking } from "@/data/winter-tips";
import { SECTION } from "@/lib/design-tokens";
import type { Trail } from "@/data/trails";

type TrailsTipsSectionProps = {
  /** First trail for report link; used when no unknown trails */
  reportTrail: Trail | null;
};

export default function TrailsTipsSection({ reportTrail }: TrailsTipsSectionProps) {
  return (
    <section aria-labelledby="tips-heading" className={`${SECTION.pySub} border-t border-sand-200/80`}>
      <Disclosure id="tips-heading" summary="Before you go" defaultOpen={false}>
        <div className="rounded-xl bg-sand-100/80 border border-sand-200/80 p-4 sm:p-6 border-l-4 border-l-sage/50">
          <p className={`text-xs text-olive/60 ${SECTION.headingGap} break-words italic`}>
            Conditions are crowd-sourced, not guaranteed. Hiking involves risks — prepare for weather, pack layers, and follow local advice.
          </p>
          <p className={`text-sm text-olive/80 break-words`}>
            Layers, conditions check, tell someone your route.
          </p>
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-sand-200/80 gap-4">
            {winterTipsHiking.slice(0, 4).map((tip) => (
              <div
                key={tip.id}
                className="py-3 sm:py-0 sm:px-6 first:pt-0 last:pb-0 sm:first:pl-0 sm:last:pr-0"
              >
                <h3 className="prose-label text-olive">{tip.title}</h3>
                <p className="text-sm text-olive/80 mt-1 leading-relaxed break-words">{tip.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-sand-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/plan"
                className="inline-flex items-center min-h-[44px] py-2 text-sm font-medium text-terracotta hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
              >
                Add to plan →
              </Link>
              {reportTrail && (
                <Link
                  href={`/trails/${reportTrail.id}/report`}
                  className={`text-sm font-medium ${SECTION.aegeanLink}`}
                >
                  Report conditions
                </Link>
              )}
            </div>
            <p className="text-xs text-olive/60">Build a day — add trails to your plan</p>
            <Link href="/guides/troodos-december" className={`text-sm ${SECTION.aegeanLink}`}>
              Troodos December guide →
            </Link>
          </div>
        </div>
      </Disclosure>
    </section>
  );
}
