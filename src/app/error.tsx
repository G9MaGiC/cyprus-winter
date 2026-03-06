"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LAYOUT, CTA } from "@/lib/design-tokens";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} pb-[max(2rem,env(safe-area-inset-bottom))] bg-sand`}>
      <div className={`${LAYOUT.formNarrow} mx-auto text-center`}>
        <h1 className="font-display text-2xl font-bold text-olive mb-2">
          A small glitch
        </h1>
        <p className="text-olive/80 mb-6 leading-relaxed prose-body break-words">
          A small glitch. Try again or head home—the trails, villages, and tastings are still there.
        </p>
        <p className="text-olive/60 text-sm mb-6">
          Use the menu for Discover, Trails, or Plan. Or tap Ask AI—we&apos;ll point you to Nissi, Troodos, Lefkara.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={reset}
            className={`px-6 py-3 ${CTA.primaryCompact}`}
          >
            Try again
          </button>
          <Link
            href="/"
            className={`px-6 py-3 ${CTA.secondaryCompact}`}
          >
            Go home
          </Link>
        </div>
        <p className="mt-8 text-sm text-olive/60 break-words">
          Emergency <strong>112</strong> · Tourist info <strong>1460</strong> · Ambulance <strong>199</strong>
        </p>
      </div>
    </main>
  );
}
