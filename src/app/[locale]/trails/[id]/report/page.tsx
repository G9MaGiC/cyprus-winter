import TrailReportPage from "@/app/(padded)/trails/[id]/report/page";
import { notFound } from "next/navigation";
import { trails } from "@/data/trails";
import { buildTranslatedHubMetadata } from "@/lib/translated-page-meta";

export { generateStaticParams } from "@/app/(padded)/trails/[id]/report/page";

export default TrailReportPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const trail = trails.find((t) => t.id === id || t.slug === id);
  if (!trail) notFound();
  return buildTranslatedHubMetadata("trailReport", locale, `/trails/${id}/report`);
}
