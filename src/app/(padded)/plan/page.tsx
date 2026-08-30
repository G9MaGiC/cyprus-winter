import PlanPageClient from "./PlanPageClient";
import { buildPlanPageMetadata } from "@/lib/plan-share-meta";


/**
 * Plan funnel entry: server shell wraps the client itinerary (localStorage, URL ?add=).
 * Shared `?plan=` links get story-grade title/OG from the encoded places.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[] }>;
}) {
  const { plan } = await searchParams;
  return buildPlanPageMetadata("en", plan);
}

export default function PlanPage() {
  return <PlanPageClient />;
}
