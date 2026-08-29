import TrailReportPage from "@/app/(padded)/trails/[id]/report/page";
import { notFound } from "next/navigation";
import { buildTranslatedHubMetadata } from "@/lib/translated-page-meta";
import { findTrailByIdOrSlug } from "@/lib/trail-resolve";

export { generateStaticParams } from "@/app/(padded)/trails/[id]/report/page";

export default TrailReportPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const trail = findTrailByIdOrSlug(id);
  if (!trail) notFound();
  return buildTranslatedHubMetadata("trailReport", locale, `/trails/${trail.id}/report`);
}
