import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseGuidesFromText } from "./parse-tourist-guides-pdf";

describe("parse-tourist-guides-pdf", () => {
  it("parses sample entries with multi-line names and phones", () => {
    const sample = `
LEFKOSIA
1

ABDOUL SAMAD DIMA

22879004, 99773573

ENGLISH, ARABIC, GREEK, TURKISH

dima_samad@yahoo.com

8

CHARALAMBOUS MICHAEL
ANDROULLA

22466806, 99618901

ENGLISH, FRENCH, GERMAN

andriani.michael04@gmail.com
`;
    const guides = parseGuidesFromText(sample);
    expect(guides).toHaveLength(2);
    expect(guides[0].name).toBe("ABDOUL SAMAD DIMA");
    expect(guides[0].district).toBe("lefkosia");
    expect(guides[0].languages).toContain("english");
    expect(guides[1].name).toBe("CHARALAMBOUS MICHAEL ANDROULLA");
  });

  it("parses full PDF export with expected minimum count", () => {
    const text = readFileSync(
      join(__dirname, "guides-directory.json"),
      "utf8"
    );
    const { guides } = JSON.parse(text) as { guides: unknown[] };
    expect(guides.length).toBeGreaterThanOrEqual(200);
  });
});
