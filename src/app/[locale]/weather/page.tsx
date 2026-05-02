import WeatherPage from "@/app/(padded)/weather/page";
import { weatherHubPageMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata } from "@/lib/locale-seo";

export default WeatherPage;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return applyLocaleToMetadata(weatherHubPageMeta, "/weather", locale);
}
