import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LAYOUT, TOKENS } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import Nav from "@/components/Nav";
import BottomNav from "@/components/BottomNav";
import ConversionTracker from "@/components/ConversionTracker";
import ScrollToTop from "@/components/ScrollToTop";
import { SerwistProvider } from "../serwist";
import { Link } from "@/i18n/navigation";
import LocaleSelector from "@/components/LocaleSelector";

const AIAssistant = dynamic(() => import("@/components/AIAssistant"), { loading: () => null });
const Providers = dynamic(() => import("@/components/Providers"), { ssr: true });
const StickyPlanBarProvider = dynamic(
  () => import("@/contexts/StickyPlanBarContext").then((m) => ({ default: m.StickyPlanBarProvider })),
  { ssr: true }
);

const ogImage = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;

// Generate metadata with hreflang support
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  // Build alternate language links for SEO
  const languages: Record<string, string> = {};
  routing.locales.forEach((loc) => {
    languages[loc] = `${SITE_URL}/${loc}`;
  });
  
  return {
    metadataBase: new URL(SITE_URL),
    title: "Cyprus Winter | Trails, Heritage & Villages",
    description:
      "Cyprus winter guide: Troodos trails, heritage, villages. Trail conditions, ancient stone, olive groves. Plan or explore when you land. Sixteen degrees when home is six.",
    manifest: "/manifest.json",
    keywords: ["Cyprus winter", "winter in Cyprus", "Cyprus trails", "Cyprus wineries", "Troodos hiking", "winter sun Europe", "Cyprus trip planning", "what to do Cyprus winter", "Cyprus ski", "Cyprus winter events", "Cyprus winter family", "Cyprus Venetian bridges", "Cyprus waterfalls winter"],
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages,
    },
    openGraph: {
      title: "Cyprus Winter | Trails, Heritage & Villages",
      description: "Cyprus winter: Troodos trails, heritage, villages. Trail conditions, ancient stone, olive groves. Plan or explore when you land.",
      type: "website",
      url: SITE_URL,
      locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Kourion ancient theatre above Mediterranean coast, Cyprus winter" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Cyprus Winter | Trails, Heritage & Villages",
      description: "Cyprus winter: Troodos trails, heritage, villages. Trail conditions, ancient stone. Plan or explore when you land.",
      images: [ogImage],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Cyprus Winter",
    },
  };
}

export const viewport: Viewport = {
  themeColor: TOKENS.charcoal,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations();

  return (
    <NextIntlClientProvider messages={messages}>
      <SerwistProvider swUrl="/serwist/sw.js">
        <Providers>
        <>
          {/* JavaScript disabled warning */}
          <noscript>
            <div className="bg-terracotta text-white px-4 py-3 text-center text-sm">
              <strong>JavaScript is required</strong> for full functionality. 
              You can still browse trails and places, but features like the itinerary planner and chat require JavaScript.
            </div>
          </noscript>
          
          <a
            href="#main-content"
            className="fixed left-4 top-4 z-[9999] min-h-[44px] inline-flex items-center justify-center px-4 py-2 bg-terracotta text-white rounded-full font-medium -translate-y-[200%] focus-visible:translate-y-0 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Skip to main content
          </a>
          <StickyPlanBarProvider>
            <ConversionTracker />
            <ScrollToTop />
            <Nav />
            <main id="main-content" className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] min-h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
              {children}
            </main>
            <BottomNav />
          <footer role="contentinfo" aria-label="Site footer" className={`border-t border-sand-200/80 bg-sand-100/80 ${LAYOUT.safeAreaX} pb-[max(calc(5rem+env(safe-area-inset-bottom)),1.5rem)] md:pb-[max(1.5rem,env(safe-area-inset-bottom))]`}>
            <div id="footer-sentinel" className="h-px -mt-px" aria-hidden />
            <div className={`${LAYOUT.listNarrow} mx-auto py-12 sm:py-16`}>
              <p className="font-display text-lg sm:text-xl text-charcoal/90 mb-8 sm:mb-10 text-center max-w-lg mx-auto">
                {t("footer.tagline")}
              </p>
              <div className="flex flex-col sm:flex-row sm:justify-center sm:gap-x-12 gap-y-6 mb-10">
                <nav aria-label="Plan and essentials" className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-1 text-sm">
                  <Link href="/discover" className="min-h-[44px] py-2 inline-flex items-center text-olive/80 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">{t("footer.discover")}</Link>
                  <Link href="/plan" className="min-h-[44px] py-2 inline-flex items-center text-olive/80 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">{t("footer.plan")}</Link>
                  <Link href="/weather" className="min-h-[44px] py-2 inline-flex items-center text-olive/80 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">{t("footer.weather")}</Link>
                  <Link href="/bookings" className="min-h-[44px] py-2 inline-flex items-center text-olive/80 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">{t("footer.bookings")}</Link>
                  <Link href="/airport" className="min-h-[44px] py-2 inline-flex items-center text-olive/80 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">{t("footer.arriving")}</Link>
                </nav>
                <nav aria-label="Explore by type" className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-1 text-sm sm:border-l sm:border-sand-200/80 sm:pl-12">
                  <Link href="/beaches" className="min-h-[44px] py-2 inline-flex items-center text-olive/80 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">{t("footer.beaches")}</Link>
                  <Link href="/wineries" className="min-h-[44px] py-2 inline-flex items-center text-olive/80 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">{t("footer.wineries")}</Link>
                  <Link href="/villages" className="min-h-[44px] py-2 inline-flex items-center text-olive/80 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">{t("footer.villages")}</Link>
                  <Link href="/regions/troodos" className="min-h-[44px] py-2 inline-flex items-center text-olive/80 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">{t("footer.troodos")}</Link>
                  <Link href="/regions/paphos" className="min-h-[44px] py-2 inline-flex items-center text-olive/80 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">{t("footer.paphos")}</Link>
                </nav>
              </div>
              <div className="inline-flex flex-wrap justify-center gap-x-4 gap-y-1 px-4 py-3 rounded-xl bg-sand-200/60 border border-sand-200/80 mb-6 text-xs text-olive/80 mx-auto w-fit">
                <span>Emergency <strong className="text-charcoal font-semibold">112</strong></span>
                <span>Tourist info <strong className="text-charcoal font-semibold">1460</strong></span>
                <span>Ambulance <strong className="text-charcoal font-semibold">199</strong></span>
              </div>
              <p className="text-xs text-olive/60 max-w-md mx-auto text-center leading-relaxed mb-8">
                {t("footer.practical")}
              </p>
              <LocaleSelector variant="footer" />
            </div>
          </footer>
          </StickyPlanBarProvider>
          <AIAssistant />
        </>
        </Providers>
      </SerwistProvider>
    </NextIntlClientProvider>
  );
}
