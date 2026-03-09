import { Link } from "@/i18n/navigation";
import HomePageContent from "@/app/_home/HomePageContent";

type Props = {
  params: Promise<{ locale: string }>;
};

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
