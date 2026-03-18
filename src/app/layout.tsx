import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { schemaForLdJson } from "@/lib/schema-ldjson";
import { SITE_URL } from "@/lib/site-url";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import BottomNav from "@/components/BottomNav";
import FooterWithTranslations from "@/components/FooterWithTranslations";
import ConversionTrackerClient from "@/components/ConversionTrackerClient";
import WebVitalsReporter from "@/components/WebVitalsReporter";
import ScrollToTop from "@/components/ScrollToTop";
import { LAYOUT } from "@/lib/design-tokens";

const Providers = dynamic(() => import("@/components/Providers"), { ssr: true });
import ClientComponents from "@/components/ClientComponents";

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
  title: "Cyprus Winter | Mediterranean Winter Escape",
  description:
    "Cyprus in winter: mild, uncrowded, real. Troodos trails, villages, wineries, ancient sites. Sixteen degrees when home is six. Plan trails, wineries, villages. Free trip planner.",
  manifest: "/manifest.json",
  keywords: ["Cyprus winter", "winter in Cyprus", "Cyprus trails", "Cyprus wineries", "Troodos hiking", "winter sun Europe", "Cyprus trip planning", "what to do Cyprus winter"],
  openGraph: {
    title: "Cyprus Winter | Mediterranean Winter Escape",
    description: "Cyprus in winter: mild, uncrowded, real. Trails, villages, wineries, ancient sites. Plan or explore when you land.",
    type: "website",
    url: SITE_URL,
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Kourion ancient theatre above Mediterranean coast, Cyprus winter" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cyprus Winter | Mediterranean Winter Escape",
    description: "Cyprus in winter: mild, uncrowded, real. Trails, villages, wineries. Plan or explore when you land.",
    images: [ogImage],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cyprus Winter",
  },
  alternates: { canonical: SITE_URL },
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Cyprus Winter",
  description: "Cyprus in winter: Mediterranean escape. Trails, villages, wineries, ancient sites. Plan your trip or explore when you land.",
  url: SITE_URL,
};

/**
 * Root layout for non-locale routes (/, /discover, /trails, etc.).
 * Locale routes (/en, /de, etc.) use [locale]/layout.tsx with i18n.
 * NextIntlClientProvider enables translations for Nav, Footer on all routes.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaForLdJson(webSiteSchema) }}
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${fraunces.variable} font-sans antialiased min-h-screen bg-background`}
        suppressHydrationWarning
      >
        {/* JavaScript disabled warning */}
        <noscript>
          <div className="bg-terracotta text-white px-4 py-3 text-center text-sm">
            <strong>{tCommon("noscript.title")}</strong> {tCommon("noscript.body")}
          </div>
        </noscript>
        
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[9999] min-h-[44px] inline-flex items-center justify-center px-4 py-2 bg-terracotta text-white rounded-full font-medium -translate-y-[200%] focus-visible:translate-y-0 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {tCommon("skipToContent")}
        </a>
        <NextIntlClientProvider messages={messages}>
        <Providers>
          <ConversionTrackerClient />
          <WebVitalsReporter />
          <ScrollToTop />
          <Nav />
          <main id="main-content" className={`pt-0 min-h-screen ${LAYOUT.mainPaddingBottom}`}>
            {children}
          </main>
          <BottomNav />
          <FooterWithTranslations />
        </Providers>
        <ClientComponents />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
