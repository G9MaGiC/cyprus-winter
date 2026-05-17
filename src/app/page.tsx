import { Suspense } from "react";
import HomePageContent from "@/app/_home/HomePageContent";
import HomeHeroView from "@/app/_home/HomeHeroView";
import { getHomeHeroCopy } from "@/app/_home/home-hero-copy";
import HomeSkipNav from "@/app/_home/HomeSkipNav";
import { HomeHeroSkeleton } from "@/app/_home/skeletons";

async function HomeHeroSection() {
  const copy = await getHomeHeroCopy();
  return <HomeHeroView {...copy} />;
}

export default async function Home() {
  return (
    <div className="relative overflow-hidden bg-background">
      <HomeSkipNav />
      <Suspense fallback={<HomeHeroSkeleton />}>
        <HomeHeroSection />
      </Suspense>
      <HomePageContent />
    </div>
  );
}
