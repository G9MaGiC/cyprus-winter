import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { NextIntlClientProvider } from "next-intl";
// Alias setRequestLocale to avoid "defined multiple times" with Turbopack
import { getMessages, getTranslations, setRequestLocale as setLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LAYOUT, TOKENS } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { SerwistProvider } from "../serwist";

const Providers = dynamic(() => import("@/components/Providers"), { ssr: true });

const ogImage = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;

// Generate metadata with hreflang support and locale-specific copy
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("meta");
  const alternates = buildStrategyAAlternates("/");

  return {
    metadataBase: new URL(SITE_URL),
    title: t("homeTitle"),
    description: t("homeDescription"),
    manifest: "/manifest.json",
    keywords: ["Cyprus winter", "winter in Cyprus", "Cyprus trails", "Cyprus wineries", "Troodos hiking", "winter sun Europe", "Cyprus trip planning", "what to do Cyprus winter", "Cyprus ski", "Cyprus winter events", "Cyprus winter family", "Cyprus Venetian bridges", "Cyprus waterfalls winter"],
    alternates,
    openGraph: {
      title: t("homeTitle"),
      description: t("homeDescription"),
      type: "website",
      url: alternates.canonical,
      locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Kourion ancient theatre above Mediterranean coast, Cyprus winter" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("homeTitle"),
      description: t("homeDescription"),
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
  setLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SerwistProvider swUrl="/serwist/sw.js">
        <Providers includeOnboarding={false} includeOfflineQueue={false}>
          <div className={LAYOUT.paddedTop}>
            {children}
          </div>
        </Providers>
      </SerwistProvider>
    </NextIntlClientProvider>
  );
}
