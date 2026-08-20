import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { airports } from "@/data/airport";
import { getPlanSustainabilityLinks } from "./plan-sustainability";

const CARBON_RE = /carbon|co2|co₂|kg\s*co|emissions/i;

describe("getPlanSustainabilityLinks (G8)", () => {
  it("always includes village days and Troodos trail conditions", () => {
    const links = getPlanSustainabilityLinks();
    expect(links).toEqual(
      expect.arrayContaining([
        { id: "villages", href: "/villages" },
        { id: "troodosConditions", href: "/trails" },
      ]),
    );
  });

  it("adds airport buses only when airport data lists Bus", () => {
    const hasBus = airports.some((a) => a.transport.some((t) => /^bus$/i.test(t.type)));
    expect(hasBus).toBe(true);
    const links = getPlanSustainabilityLinks();
    expect(links.some((l) => l.id === "airportBuses" && l.href === "/airport")).toBe(hasBus);
  });

  it("does not invent island-wide bus routes", () => {
    const hrefs = getPlanSustainabilityLinks().map((l) => l.href);
    expect(hrefs).not.toContain("/buses");
    expect(hrefs.every((h) => h.startsWith("/"))).toBe(true);
  });
});

describe("plan sustainability copy", () => {
  it("English strip copy has no carbon numbers", () => {
    const en = JSON.parse(readFileSync("messages/en.json", "utf8")) as {
      plan: { sustainability?: Record<string, unknown> };
    };
    expect(en.plan.sustainability).toBeDefined();
    const blob = JSON.stringify(en.plan.sustainability);
    expect(blob).not.toMatch(CARBON_RE);
    expect(blob).not.toMatch(/\d+\s*kg/i);
  });
});
