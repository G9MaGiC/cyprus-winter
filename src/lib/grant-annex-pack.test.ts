import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "docs/grant");

function read(name: string): string {
  return readFileSync(join(root, name), "utf8");
}

describe("PRE-SEED annex kit (G0)", () => {
  it("includes an IRIS submit checklist that does not claim the proposal is filed", () => {
    const readme = read("README.md");
    expect(readme).toMatch(/IRIS/);
    expect(readme).toMatch(/11 Sep(?:tember)? 2026/);
    expect(readme.toLowerCase()).not.toMatch(/iris shows submitted/);
    expect(readme).toMatch(/\[HOST ORGANISATION/);
  });

  it("pitch records live productionReady false and does not claim IRIS submitted", () => {
    const pitch = readFileSync(join(process.cwd(), "GRANT_PITCH.md"), "utf8");
    expect(pitch).toMatch(/productionReady:\s*\*\*false\*\*|productionReady: false/);
    expect(pitch.toLowerCase()).not.toMatch(/iris shows submitted/);
  });

  it("drafts Part B against Excellence, Added value, Implementation, SWOT, and DNSH", () => {
    const partB = read("PART_B.md");
    expect(partB).toMatch(/Excellence/);
    expect(partB).toMatch(/Added value/i);
    expect(partB).toMatch(/Implementation/);
    expect(partB).toMatch(/SWOT/);
    expect(partB).toMatch(/Do No Significant Harm|DNSH/);
    expect(partB).toMatch(/Visit Cyprus/);
    expect(partB).toMatch(/official template/);
    expect(partB).toMatch(/thin `\/partner`/i);
    expect(partB).not.toMatch(/no partner UI/i);
  });

  it("keeps DNSH free of fake carbon numbers", () => {
    const dnsh = read("DNSH.md");
    expect(dnsh).toMatch(/season/i);
    expect(dnsh).not.toMatch(/\d+\s*kg\s*CO2/i);
  });

  it("specs the partner portal without replacing booking lookup auth", () => {
    const spec = read("G2_PARTNER_PORTAL_SPEC.md");
    expect(spec).toMatch(/401/);
    expect(spec).toMatch(/providerId/);
    expect(spec).toMatch(/lookup-token|lookup token/i);
    expect(spec).toMatch(/winter hours/i);
    expect(spec).not.toMatch(/replace Bearer/i);
  });

  it("records live public health without claiming productionReady true", () => {
    const evidence = JSON.parse(read("production-health-public.json")) as {
      url: string;
      public: { productionReady: boolean };
    };
    expect(evidence.url).toMatch(/\/api\/health$/);
    expect(evidence.public.productionReady).toBe(false);
    expect(read("PRODUCTION_HEALTH.md")).toMatch(/productionReady.*false/i);
    expect(read("PRODUCTION_HEALTH.md").toLowerCase()).not.toMatch(/productionready:\s*true/);
    expect(read("production-health-public.json")).not.toMatch(/UPSTASH|HEALTH_SECRET|hint/i);
  });

  it("has Annex II wireframes for home, Discover, Plan, Book, Ask AI, Bookings, cycling, wine route, and partner at two widths", () => {
    const shots = [
      "home-1280.png",
      "home-390.png",
      "discover-1280.png",
      "discover-390.png",
      "discover-cycling-1280.png",
      "discover-cycling-390.png",
      "discover-accessible-1280.png",
      "discover-accessible-390.png",
      "discover-family-1280.png",
      "discover-family-390.png",
      "plan-1280.png",
      "plan-390.png",
      "book-winery-1280.png",
      "book-winery-390.png",
      "ask-ai-1280.png",
      "ask-ai-390.png",
      "bookings-1280.png",
      "bookings-390.png",
      "cycling-1280.png",
      "cycling-390.png",
      "wine-route-1280.png",
      "wine-route-390.png",
      "partner-1280.png",
      "partner-390.png",
    ];
    for (const file of shots) {
      expect(existsSync(join(root, "wireframes", file)), file).toBe(true);
    }
    expect(existsSync(join(root, "ANNEX_II.pdf")), "ANNEX_II.pdf").toBe(true);
    const pdf = readFileSync(join(root, "ANNEX_II.pdf"));
    expect(pdf.byteLength).toBeGreaterThan(50_000);
    expect(pdf.subarray(0, 5).toString("utf8")).toBe("%PDF-");
  });
});
