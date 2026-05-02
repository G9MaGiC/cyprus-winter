import PlanPage from "@/app/(padded)/plan/page";
import { planSegmentMeta } from "@/lib/locale-page-meta";
import { applyLocaleToMetadata } from "@/lib/locale-seo";

export default PlanPage;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return applyLocaleToMetadata(planSegmentMeta, "/plan", locale);
}
