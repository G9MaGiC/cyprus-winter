import PlanPageClient from "./PlanPageClient";
import { preload } from "react-dom";

const PLAN_HERO_IMAGE = "/images/cyprus/cyprus-village-omodos.jpg";

/**
 * Plan funnel entry: server shell wraps the client itinerary (localStorage, URL ?add=).
 * Hero copy and metadata are localized via `[locale]/plan` generateMetadata.
 */
export default function PlanPage() {
  preload(PLAN_HERO_IMAGE, { as: "image" });
  return <PlanPageClient />;
}
