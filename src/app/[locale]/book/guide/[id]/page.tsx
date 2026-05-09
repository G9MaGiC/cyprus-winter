import GuideBookPage from "@/app/(padded)/book/guide/[id]/page";
import { bookGuideMetadata } from "@/lib/locale-metadata-dynamic";

export { generateStaticParams } from "@/app/(padded)/book/guide/[id]/page";

export default GuideBookPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  return bookGuideMetadata(id, locale);
}
