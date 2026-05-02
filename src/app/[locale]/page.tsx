import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import HomePageContent from "@/app/_home/HomePageContent";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { SITE_URL } from "@/lib/site-url";

const ogImage = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("meta");
  const base: Metadata = {
    title: t("homeTitle"),
    description: t("homeDescription"),
    keywords: [
      "Cyprus winter",
      "winter in Cyprus",
      "Cyprus trails",
      "Cyprus wineries",
      "Troodos hiking",
      "winter sun Europe",
      "Cyprus trip planning",
      "what to do Cyprus winter",
      "Cyprus ski",
      "Cyprus winter events",
      "Cyprus winter family",
      "Cyprus Venetian bridges",
      "Cyprus waterfalls winter",
    ],
    openGraph: {
      title: t("homeTitle"),
      description: t("homeDescription"),
      type: "website",
      url: SITE_URL,
      locale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Kourion ancient theatre above Mediterranean coast, Cyprus winter",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("homeTitle"),
      description: t("homeDescription"),
      images: [ogImage],
    },
  };
  return applyLocaleToMetadata(base, "", locale);
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;

  return (
    <HomePageContent
      sharePath={`/${locale}`}
      LinkComponent={Link}
      planSubtitle="Build your itinerary. Add places from Discover—saves as you go."
    />
  );
}
