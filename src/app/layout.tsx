import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import dynamic from "next/dynamic";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { schemaForLdJson } from "@/lib/schema-ldjson";
import { SITE_URL } from "@/lib/site-url";
import { ogLocaleFor } from "@/lib/locale-seo";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { Plus_Jakarta_Sans, Fraunces, Noto_Sans_Hebrew, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import LocaleSuggestionBar from "@/components/LocaleSuggestionBar";
import BottomNav from "@/components/BottomNav";
import FooterWithTranslations from "@/components/FooterWithTranslations";
import ConversionTrackerClient from "@/components/ConversionTrackerClient";
import WebVitalsReporter from "@/components/WebVitalsReporter";
import DebugErrorReporter from "@/components/DebugErrorReporter";
import DebugErrorBoundary from "@/components/DebugErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import { LAYOUT, LAYER } from "@/lib/design-tokens";
import ClientComponents from "@/components/ClientComponents";
import { SerwistProvider } from "@/app/serwist";

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

// Neither brand face ships Hebrew glyphs; `he` gets Hebrew-capable equivalents
// (applied via html[dir="rtl"] rules in globals.css, loaded only for that locale).
const notoSansHebrew = Noto_Sans_Hebrew({
  variable: "--font-sans-he",
  subsets: ["hebrew"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const frankRuhlLibre = Frank_Ruhl_Libre({
  variable: "--font-display-he",
  subsets: ["hebrew"],
  weight: ["400", "600", "700"],
  display: "swap",
});

import { pwaManifestHref } from "@/lib/pwa-manifest";

const ogImage = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const [tHome, tMeta] = await Promise.all([
    getTranslations({ locale, namespace: "home" }),
    getTranslations({ locale, namespace: "meta" }),
  ]);
  return {
    metadataBase: new URL(SITE_URL),
    title: tMeta("homeTitle"),
    description: tMeta("homeDescription"),
    manifest: pwaManifestHref(locale),
    keywords: ["Cyprus winter", "winter in Cyprus", "Cyprus trails", "Cyprus wineries", "Troodos hiking", "winter sun Europe", "Cyprus trip planning", "what to do Cyprus winter"],
    openGraph: {
      title: tMeta("homeTitle"),
      description: tMeta("homeDescription"),
      type: "website",
      locale: ogLocaleFor("en"),
      url: SITE_URL,
      images: [{ url: ogImage, width: 1200, height: 630, alt: tMeta("ogImageAlt") }],
    },
    // Card type only: title/description/image fall back to each page's og:* —
    // a full twitter block here leaks the HOMEPAGE card onto every page that
    // doesn't define its own (metadata merges per top-level key; AUD E2-04).
    twitter: {
      card: "summary_large_image",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: tHome("title"),
    },
    alternates: buildStrategyAAlternates("/"),
  };
}

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Cyprus Winter",
  description:
    "A quieter Cyprus in winter. Discover mild coastlines, mountain villages, open trails, wineries, and local places worth slowing down for.",
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

  // The suggestion bar addresses a visitor who reads the TARGET language, so
  // it needs every locale's own copy, not the current catalog's — built here
  // (server) from the catalogs so the i18n gates see the strings (they were
  // previously hardcoded in the component; review finding).
  const localeSuggestStrings = Object.fromEntries(
    await Promise.all(
      routing.locales.map(async (l) => {
        const t = await getTranslations({ locale: l, namespace: "common.localeSuggest" });
        return [
          l,
          { body: t("body"), cta: t("cta"), dismiss: t("dismiss"), aria: t("aria") },
        ] as const;
      })
    )
  );
  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaForLdJson(webSiteSchema) }}
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${fraunces.variable} ${
          dir === "rtl" ? `${notoSansHebrew.variable} ${frankRuhlLibre.variable}` : ""
        } font-sans antialiased min-h-screen bg-background`}
      >
        {/* JavaScript disabled warning */}
        <noscript>
          <div className="bg-terracotta text-white px-4 py-3 text-center text-sm">
            <strong>{tCommon("noscript.title")}</strong> {tCommon("noscript.body")}
          </div>
        </noscript>
        
        <a
          href="#main-content"
          className={`fixed start-4 top-4 ${LAYER.skipNav} min-h-[44px] inline-flex items-center justify-center px-4 py-2 bg-terracotta text-white rounded-full font-medium -translate-y-[200%] focus-visible:translate-y-0 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
        >
          {tCommon("skipToContent")}
        </a>
        {/* Early-body anchor: CookieConsentBanner portals here so the consent
            choice sits at the START of the tab/reading order, not ~100 stops
            after the footer (BUG-360). Mount timing stays deferred in
            ClientComponents for the LCP fix. */}
        <div id="pre-nav-overlays"></div>
        <NextIntlClientProvider messages={messages}>
          <SerwistProvider swUrl="/sw.js">
          <DebugErrorBoundary>
            <Providers>
              <ConversionTrackerClient />
            <DebugErrorReporter />
              <WebVitalsReporter />
              <ScrollToTop />
              <Nav />
              <LocaleSuggestionBar strings={localeSuggestStrings} />
              <main id="main-content" className={`pt-0 min-h-screen ${LAYOUT.mainPaddingBottom}`}>
                {children}
              </main>
              <BottomNav />
              <FooterWithTranslations />
            </Providers>
          </DebugErrorBoundary>
          <ClientComponents />
          </SerwistProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
