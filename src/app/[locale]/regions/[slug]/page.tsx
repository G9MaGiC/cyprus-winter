import RegionPage from "@/app/(padded)/regions/[slug]/page";
import { regionSlugMetadata } from "@/lib/locale-metadata-dynamic";

export { generateStaticParams } from "@/app/(padded)/regions/[slug]/page";

export default RegionPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  return regionSlugMetadata(slug, locale);
}
