import { describe, expect, it } from "vitest";
import { extractExcursionSlugs } from "./fetch-vc-excursions-index";

describe("fetch-vc-excursions-index", () => {
  it("extracts excursion slugs from index HTML", () => {
    const html = `<a href="https://www.visitcyprus.com/discover-cyprus/nature/excursions/cedar-valley/">Cedar</a>`;
    expect(extractExcursionSlugs(html)).toEqual(["cedar-valley"]);
  });
});
