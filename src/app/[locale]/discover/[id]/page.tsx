import AttractionPage from "@/app/(padded)/discover/[id]/page";
import { discoverDetailMetadata } from "@/lib/locale-metadata-dynamic";

export { generateStaticParams } from "@/app/(padded)/discover/[id]/page";

export default AttractionPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  return discoverDetailMetadata(id, locale);
}
