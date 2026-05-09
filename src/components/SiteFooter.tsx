import AppLink from "@/components/AppLink";
import { LAYOUT, SECTION } from "@/lib/design-tokens";
import { FOOTER_SENTINEL_ID } from "@/lib/footer";
import LocaleLinks from "./LocaleLinks";
import { useTranslations } from "next-intl";

const footerLinkClass =
  "min-h-[44px] py-2 inline-flex items-center text-olive/80 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded";

export type SiteFooterProps = {
  /** Translated labels (from getTranslations). Omit for root layout (English). */
  labels?: {
    tagline: string;
    discover: string;
    plan: string;
    weather: string;
    bookings: string;
    arriving: string;
    beaches: string;
    wineries: string;
    villages: string;
    troodos: string;
    paphos: string;
    practical: string;
    privacy: string;
    terms: string;
  };
  /** Locale switcher (e.g. LocaleSelector). Omit for root layout (LocaleLinks). */
  localeSwitcher?: React.ReactNode;
  /** Use next-intl Link for locale-prefixed hrefs. Pass Link when in [locale] layout. */
  LinkComponent?: React.ComponentType<React.PropsWithChildren<{ href: string; prefetch?: "auto" | boolean; className?: string }>>;
};

const DEFAULT_LABELS = {
  tagline: "Cyprus in winter: mild, uncrowded, real. Trails, villages, heritage.",
  discover: "Discover",
  plan: "Plan",
  weather: "Weather",
  bookings: "Bookings",
  arriving: "Arriving",
  beaches: "Beaches",
  wineries: "Wineries",
  villages: "Villages",
  troodos: "Troodos",
  paphos: "Paphos",
  practical: "Drive on the left. Pack layers. The island rewards the curious. Tap Ask AI anytime.",
  privacy: "Privacy",
  terms: "Terms",
};

const FOOTER_LINKS: { href: string; key: keyof typeof DEFAULT_LABELS }[] = [
  { href: "/discover", key: "discover" },
  { href: "/plan", key: "plan" },
  { href: "/weather", key: "weather" },
  { href: "/bookings", key: "bookings" },
  { href: "/airport", key: "arriving" },
  { href: "/beaches", key: "beaches" },
  { href: "/wineries", key: "wineries" },
  { href: "/villages", key: "villages" },
  { href: "/regions/troodos", key: "troodos" },
  { href: "/regions/paphos", key: "paphos" },
];

export default function SiteFooter({ labels, localeSwitcher, LinkComponent = AppLink }: SiteFooterProps) {
  const L = labels ?? DEFAULT_LABELS;
  const tCommon = useTranslations("common");

  return (
    <footer
      role="contentinfo"
      aria-label={tCommon("aria.siteFooter")}
      className={`border-t border-sand-200/80 bg-sand-100/80 ${LAYOUT.safeAreaX} pb-[max(calc(5rem+env(safe-area-inset-bottom)),1.5rem)] md:pb-[max(1.5rem,env(safe-area-inset-bottom))]`}
    >
      <div id={FOOTER_SENTINEL_ID} className="h-px -mt-px" aria-hidden />
      <div className={`${LAYOUT.listNarrow} mx-auto py-12 sm:py-16`}>
        <p className={`font-display text-lg sm:text-xl text-charcoal/90 text-center max-w-lg mx-auto ${SECTION.headingMargin}`}>
          {L.tagline}
        </p>

        <nav
          aria-label={tCommon("aria.footerNav")}
          className={`flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm ${SECTION.headingGap}`}
        >
          {FOOTER_LINKS.map(({ href, key }) => (
            <LinkComponent key={href} href={href} prefetch="auto" className={footerLinkClass}>
              {L[key]}
            </LinkComponent>
          ))}
        </nav>

        <nav
          aria-label={tCommon("aria.footerLegal")}
          className={`flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-olive/70 ${SECTION.headingGap}`}
        >
          <LinkComponent href="/privacy" prefetch="auto" className={footerLinkClass}>
            {L.privacy}
          </LinkComponent>
          <LinkComponent href="/terms" prefetch="auto" className={footerLinkClass}>
            {L.terms}
          </LinkComponent>
        </nav>

        <div className={`inline-flex flex-wrap justify-center gap-x-4 gap-y-1 px-4 py-3 rounded-xl bg-sand-200/60 border border-sand-200/80 text-xs text-olive/80 mx-auto w-fit ${SECTION.headingGap}`}>
          <span>
            {tCommon("emergency")} <strong className="text-charcoal font-semibold">112</strong>
          </span>
          <span>
            {tCommon("touristInfo")} <strong className="text-charcoal font-semibold">1460</strong>
          </span>
          <span>
            {tCommon("ambulance")} <strong className="text-charcoal font-semibold">199</strong>
          </span>
        </div>

        <p className={`text-xs text-olive/70 max-w-md mx-auto text-center leading-relaxed ${SECTION.headingGap}`}>
          {L.practical}
        </p>

        {localeSwitcher ?? <LocaleLinks />}
      </div>
    </footer>
  );
}
