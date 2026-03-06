import Link from "next/link";
import { LAYOUT, CTA } from "@/lib/design-tokens";

export default function NotFound() {
  return (
    <main className={`min-h-screen flex flex-col items-center justify-center ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} pb-[max(2rem,env(safe-area-inset-bottom))] bg-sand`}>
      <div className={`${LAYOUT.formNarrow} mx-auto text-center`}>
        <p className="text-olive/60 text-sm mb-2">404</p>
        <h1 className="font-display text-2xl font-bold text-olive mb-2">
          Page not found
        </h1>
        <p className="text-olive/80 mb-6 leading-relaxed prose-body break-words">
          No worries. This page doesn&apos;t exist or has been moved. These things happen. The island&apos;s still here. The trails, villages, and tastings are waiting. Head home or start exploring.
        </p>
        <p className="text-olive/60 text-sm mb-6">
          Use the menu to jump to Discover, Trails, or Plan. Or tap Ask AI if you&apos;re not sure where to start.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className={`px-6 py-3 ${CTA.primaryCompact}`}>
            Go home
          </Link>
          <Link href="/discover" className={`px-6 py-3 ${CTA.secondaryCompact}`}>
            Discover Cyprus
          </Link>
        </div>
        <p className="mt-8 text-sm text-olive/60 break-words">
          Emergency <strong>112</strong> · Tourist info <strong>1460</strong> · Ambulance <strong>199</strong>
        </p>
      </div>
    </main>
  );
}
