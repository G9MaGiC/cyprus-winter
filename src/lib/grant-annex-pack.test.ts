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

  it("drafts Part B against Excellence, Added value, Implementation, SWOT, and DNSH", () => {
    const partB = read("PART_B.md");
    expect(partB).toMatch(/Excellence/);
    expect(partB).toMatch(/Added value/i);
    expect(partB).toMatch(/Implementation/);
    expect(partB).toMatch(/SWOT/);
    expect(partB).toMatch(/Do No Significant Harm|DNSH/);
    expect(partB).toMatch(/Visit Cyprus/);
    expect(partB).toMatch(/official template/);
    expect(partB).not.toMatch(/blockchain/i);
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

  it("has Annex II wireframes for home, Discover, Plan, Book, Ask AI, and Bookings at two widths", () => {
    const shots = [
      "home-1280.png",
      "home-390.png",
      "discover-1280.png",
      "discover-390.png",
      "plan-1280.png",
      "plan-390.png",
      "book-winery-1280.png",
      "book-winery-390.png",
      "ask-ai-1280.png",
      "ask-ai-390.png",
      "bookings-1280.png",
      "bookings-390.png",
    ];
    for (const file of shots) {
      expect(existsSync(join(root, "wireframes", file)), file).toBe(true);
    }
  });
});
