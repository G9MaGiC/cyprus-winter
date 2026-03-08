import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { TOKENS } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import { SerwistProvider } from "../serwist";

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

  return (
    <NextIntlClientProvider messages={messages}>
      <SerwistProvider swUrl="/serwist/sw.js">
        <Providers>
          <StickyPlanBarProvider>
            <div className="pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">
              {children}
            </div>
          </StickyPlanBarProvider>
        </Providers>
      </SerwistProvider>
    </NextIntlClientProvider>
  );
}
