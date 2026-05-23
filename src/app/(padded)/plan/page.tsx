import PlanPageClient from "./PlanPageClient";

/**
 * Plan funnel entry: server shell wraps the client itinerary (localStorage, URL ?add=).
 * Hero copy and metadata are localized via `[locale]/plan` generateMetadata.
 */
export default function PlanPage() {
  return <PlanPageClient />;
}
