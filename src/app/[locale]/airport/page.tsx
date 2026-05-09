import AirportPage from "@/app/(padded)/airport/page";
import { airportPageMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata } from "@/lib/locale-seo";

export default AirportPage;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return applyLocaleToMetadata(airportPageMeta, "/airport", locale);
}
