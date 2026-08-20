import { airports } from "@/data/airport";

export type PlanSustainabilityLinkId = "villages" | "troodosConditions" | "airportBuses";

export type PlanSustainabilityLink = {
  id: PlanSustainabilityLinkId;
  href: string;
};

export function airportHasBusOptions(): boolean {
  return airports.some((a) => a.transport.some((t) => /^bus$/i.test(t.type)));
}

/** Calm Plan-page links. Public transport only when airport data lists buses. */
export function getPlanSustainabilityLinks(): PlanSustainabilityLink[] {
  const links: PlanSustainabilityLink[] = [
    { id: "villages", href: "/villages" },
    { id: "troodosConditions", href: "/trails" },
  ];
  if (airportHasBusOptions()) {
    links.push({ id: "airportBuses", href: "/airport" });
  }
  return links;
}
