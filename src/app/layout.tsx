import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LAYOUT } from "@/lib/design-tokens";
import { schemaForLdJson } from "@/lib/schema-ldjson";
import { SITE_URL } from "@/lib/site-url";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import BottomNav from "@/components/BottomNav";
import LocaleSelector from "@/components/LocaleSelector";
import ConversionTracker from "@/components/ConversionTracker";
import ScrollToTop from "@/components/ScrollToTop";

const AIAssistant = dynamic(() => import("@/components/AIAssistant"), { loading: () => null });
const OnboardingModal = dynamic(() => import("@/components/OnboardingModal"), { loading: () => null });

const Providers = dynamic(() => import("@/components/Providers"), { ssr: true });

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const ogImage = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Cyprus Winter | Trails, Wineries & Villages",
  description:
    "Cyprus winter guide: Troodos trails, wineries, villages. Trail conditions, tastings, events. Sixteen degrees when home is six. Free trip planner—plan or explore when you land.",
  manifest: "/manifest.json",
  keywords: ["Cyprus winter", "winter in Cyprus", "Cyprus trails", "Cyprus wineries", "Troodos hiking", "winter sun Europe", "Cyprus trip planning", "what to do Cyprus winter"],
  openGraph: {
    title: "Cyprus Winter | Trails, Wineries & Villages",
    description: "Cyprus winter: Troodos trails, wineries, villages. Trail conditions, tastings, events. Plan or explore when you land.",
    type: "website",
    url: SITE_URL,
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Kourion ancient theatre above Mediterranean coast, Cyprus winter" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cyprus Winter | Trails, Wineries & Villages",
    description: "Cyprus winter: Troodos trails, wineries, villages. Trail conditions, tastings. Plan or explore when you land.",
    images: [ogImage],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cyprus Winter",
  },
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Cyprus Winter",
  description: "Cyprus winter: trails, villages, wine, events. Plan your trip or explore when you land. Trail conditions, winery tastings, local secrets.",
  url: SITE_URL,
};

/**
 * Root layout for non-locale routes (/, /discover, /trails, etc.).
 * Locale routes (/en, /de, etc.) use [locale]/layout.tsx with i18n.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaForLdJson(webSiteSchema) }}
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${fraunces.variable} font-sans antialiased min-h-screen bg-background`}
      >
        {/* JavaScript disabled warning */}
        <noscript>
          <div className="bg-terracotta text-white px-4 py-3 text-center text-sm">
            <strong>JavaScript is required</strong> for full functionality. 
            You can still browse trails and places, but features like the itinerary planner and AI assistant require JavaScript.
          </div>
        </noscript>
        
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[9999] min-h-[44px] inline-flex items-center justify-center px-4 py-2 bg-terracotta text-white rounded-full font-medium -translate-y-[200%] focus-visible:translate-y-0 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Skip to main content
        </a>
        <Providers>
          <ConversionTracker />
          <ScrollToTop />
          <Nav />
          <main id="main-content" className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))] min-h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
          <BottomNav />
        <footer role="contentinfo" aria-label="Site footer" className={`border-t border-sand-200/80 bg-sand-100/80 py-10 ${LAYOUT.safeAreaX} pb-[max(calc(5rem+env(safe-area-inset-bottom)),1.5rem)] md:pb-[max(1.5rem,env(safe-area-inset-bottom))]`}>
          <div className={`${LAYOUT.listNarrow} mx-auto text-center`}>
            <nav aria-label="Essentials" className="flex flex-wrap justify-center gap-6 text-sm font-medium text-olive/80 mb-4">
              <Link href="/discover" className="min-h-[44px] py-2 inline-flex items-center hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">Discover</Link>
              <Link href="/plan" className="min-h-[44px] py-2 inline-flex items-center hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">Plan</Link>
              <Link href="/airport" className="min-h-[44px] py-2 inline-flex items-center hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">Arriving</Link>
              <Link href="/weather" className="min-h-[44px] py-2 inline-flex items-center hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">Weather</Link>
              <Link href="/bookings" className="min-h-[44px] py-2 inline-flex items-center hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded">Bookings</Link>
            </nav>
            <p className="text-sm text-olive/70 prose-body max-w-md mx-auto break-words">
              Whether you found us from a Google search or at the airport—trails, villages, wine.
            </p>
            <p className="text-xs text-olive/70 mt-2 max-w-md mx-auto leading-relaxed break-words">
              Emergency <strong>112</strong> · Tourist info <strong>1460</strong> · Ambulance <strong>199</strong>.
            </p>
            <p className="text-xs text-olive/70 mt-3 max-w-md mx-auto leading-relaxed break-words">
              Drive on the left. Pack layers. The island rewards the curious. Winter runs November to March. Questions? Tap Ask AI.
            </p>
            <LocaleSelector variant="footer" />
          </div>
        </footer>
        </Providers>
        <AIAssistant />
        <OnboardingModal />
      </body>
    </html>
  );
}
