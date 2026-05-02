import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { NextIntlClientProvider } from "next-intl";
// Alias setRequestLocale to avoid "defined multiple times" with Turbopack
import { getMessages, setRequestLocale as setLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LAYOUT, TOKENS } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import { SerwistProvider } from "../serwist";

const Providers = dynamic(() => import("@/components/Providers"), { ssr: true });

/**
 * Layout shell only — do not set page title/description here (would override all locale children).
 * Home metadata: `src/app/[locale]/page.tsx`. Other routes: each page or segment layout.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(SITE_URL),
    manifest: "/manifest.json",
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
        <Providers includeOnboarding={false}>
          <div className={LAYOUT.paddedTop}>
            {children}
          </div>
        </Providers>
      </SerwistProvider>
    </NextIntlClientProvider>
  );
}
