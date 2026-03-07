import AppLink from "@/components/AppLink";
import { LAYOUT } from "@/lib/design-tokens";
import { FOOTER_SENTINEL_ID } from "@/lib/footer";
import LocaleLinks from "./LocaleLinks";

const footerLinkClass =
  "min-h-[44px] py-2 inline-flex items-center text-olive/80 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded";

export default function SiteFooter() {
  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      className={`border-t border-sand-200/80 bg-sand-100/80 ${LAYOUT.safeAreaX} pb-[max(calc(5rem+env(safe-area-inset-bottom)),1.5rem)] md:pb-[max(1.5rem,env(safe-area-inset-bottom))]`}
    >
      {/* Sentinel: when in view, sticky bars hide to prevent overlap */}
      <div id={FOOTER_SENTINEL_ID} className="h-px -mt-px" aria-hidden />
      <div className={`${LAYOUT.listNarrow} mx-auto py-12 sm:py-16`}>
        <p className="font-display text-lg sm:text-xl text-charcoal/90 mb-8 sm:mb-10 text-center max-w-lg mx-auto">
          Cyprus in winter: mild, uncrowded, real. Trails, villages, heritage.
        </p>

        <div className="flex flex-col sm:flex-row sm:justify-center sm:gap-x-12 gap-y-6 mb-10">
          <nav aria-label="Plan and essentials" className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-1 text-sm">
            <AppLink href="/discover" className={footerLinkClass}>Discover</AppLink>
            <AppLink href="/plan" className={footerLinkClass}>Plan</AppLink>
            <AppLink href="/weather" className={footerLinkClass}>Weather</AppLink>
            <AppLink href="/bookings" className={footerLinkClass}>Bookings</AppLink>
            <AppLink href="/airport" className={footerLinkClass}>Arriving</AppLink>
          </nav>
          <nav aria-label="Explore by type" className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-1 text-sm sm:border-l sm:border-sand-200/80 sm:pl-12">
            <AppLink href="/beaches" className={footerLinkClass}>Beaches</AppLink>
            <AppLink href="/wineries" className={footerLinkClass}>Wineries</AppLink>
            <AppLink href="/villages" className={footerLinkClass}>Villages</AppLink>
            <AppLink href="/regions/troodos" className={footerLinkClass}>Troodos</AppLink>
            <AppLink href="/regions/paphos" className={footerLinkClass}>Paphos</AppLink>
          </nav>
        </div>

        <div className="inline-flex flex-wrap justify-center gap-x-4 gap-y-1 px-4 py-3 rounded-xl bg-sand-200/60 border border-sand-200/80 mb-6 text-xs text-olive/80 mx-auto w-fit">
          <span>Emergency <strong className="text-charcoal font-semibold">112</strong></span>
          <span>Tourist info <strong className="text-charcoal font-semibold">1460</strong></span>
          <span>Ambulance <strong className="text-charcoal font-semibold">199</strong></span>
        </div>

        <p className="text-xs text-olive/60 max-w-md mx-auto text-center leading-relaxed mb-8">
          Drive on the left. Pack layers. The island rewards the curious. Tap Ask AI anytime.
        </p>

        <LocaleLinks />
      </div>
    </footer>
  );
}
