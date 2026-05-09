import WineRoutePage from "@/app/(padded)/wine-routes/[slug]/page";
import { wineRouteSlugMetadata } from "@/lib/locale-metadata-dynamic";

export { generateStaticParams } from "@/app/(padded)/wine-routes/[slug]/page";

export default WineRoutePage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  return wineRouteSlugMetadata(slug, locale);
}
