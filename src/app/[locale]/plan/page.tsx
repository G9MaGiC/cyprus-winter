import PlanPage from "@/app/(padded)/plan/page";
import { buildPlanPageMetadata } from "@/lib/plan-share-meta";

export default PlanPage;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string | string[] }>;
}) {
  const [{ locale }, { plan }] = await Promise.all([params, searchParams]);
  return buildPlanPageMetadata(locale, plan);
}
