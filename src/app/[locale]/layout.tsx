import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { TOKENS } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import Nav from "@/components/Nav";
import BottomNav from "@/components/BottomNav";
import ConversionTracker from "@/components/ConversionTracker";
import ScrollToTop from "@/components/ScrollToTop";
import { SerwistProvider } from "../serwist";
import { Link } from "@/i18n/navigation";
import LocaleSelector from "@/components/LocaleSelector";
import SiteFooter from "@/components/SiteFooter";

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
          <SiteFooter
            labels={{
              tagline: t("footer.tagline"),
              discover: t("footer.discover"),
              plan: t("footer.plan"),
              weather: t("footer.weather"),
              bookings: t("footer.bookings"),
              arriving: t("footer.arriving"),
              beaches: t("footer.beaches"),
              wineries: t("footer.wineries"),
              villages: t("footer.villages"),
              troodos: t("footer.troodos"),
              paphos: t("footer.paphos"),
              practical: t("footer.practical"),
            }}
            localeSwitcher={<LocaleSelector variant="footer" />}
            LinkComponent={Link}
          />
          </StickyPlanBarProvider>
          <AIAssistant />
        </>
        </Providers>
      </SerwistProvider>
    </NextIntlClientProvider>
  );
}
