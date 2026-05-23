import { Suspense } from "react";
import HomePageContent from "@/app/_home/HomePageContent";
import HomeHeroView from "@/app/_home/HomeHeroView";
import { getHomeHeroCopy } from "@/app/_home/home-hero-copy";
import HomeSkipNav from "@/app/_home/HomeSkipNav";
import { HomeHeroSkeleton } from "@/app/_home/skeletons";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

async function HomeHeroSection({ locale }: { locale: string }) {
  const copy = await getHomeHeroCopy(locale);
  return <HomeHeroView {...copy} />;
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;
  const tHome = await getTranslations({ locale, namespace: "home" });

  return (
    <div className="relative overflow-hidden bg-background">
      <HomeSkipNav />
      <Suspense fallback={<HomeHeroSkeleton />}>
        <HomeHeroSection locale={locale} />
      </Suspense>
      <HomePageContent
        locale={locale}
        sharePath={`/${locale}`}
        planSubtitle={tHome("planSubtitle")}
      />
    </div>
  );
}
