import TrailReportPage from "@/app/(padded)/trails/[id]/report/page";
import { buildTranslatedHubMetadata } from "@/lib/translated-page-meta";

export { generateStaticParams } from "@/app/(padded)/trails/[id]/report/page";

export default TrailReportPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  return buildTranslatedHubMetadata("trailReport", locale, `/trails/${id}/report`);
}
