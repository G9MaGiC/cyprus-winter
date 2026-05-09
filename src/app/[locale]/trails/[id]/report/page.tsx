import TrailReportPage from "@/app/(padded)/trails/[id]/report/page";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { trailReportPageMeta } from "@/lib/locale-page-meta";

export { generateStaticParams } from "@/app/(padded)/trails/[id]/report/page";

export default TrailReportPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  return applyLocaleToMetadata(trailReportPageMeta, `/trails/${id}/report`, locale);
}
