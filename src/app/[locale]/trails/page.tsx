import TrailsPage from "@/app/(padded)/trails/page";
import { trailsListPageMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata } from "@/lib/locale-seo";

export default TrailsPage;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return applyLocaleToMetadata(trailsListPageMeta, "/trails", locale);
}
