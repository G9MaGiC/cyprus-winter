import WeatherMonthPage from "@/app/(padded)/weather/[month]/page";
import { weatherMonthMetadata } from "@/lib/locale-metadata-dynamic";

export { generateStaticParams } from "@/app/(padded)/weather/[month]/page";

export default WeatherMonthPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; month: string }>;
}) {
  const { locale, month } = await params;
  return weatherMonthMetadata(month, locale);
}
