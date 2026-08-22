import { describe, expect, it } from "vitest";
import { extractCyclingSlugs } from "./fetch-vc-route-index";

describe("fetch-vc-route-index", () => {
  it("extracts cycling route slugs from index HTML", () => {
    const html = `
      <a href="https://www.visitcyprus.com/discover-cyprus/nature/cycling/cy-rc06-divine-coast/">Divine Coast</a>
      <a href="https://www.visitcyprus.com/discover-cyprus/nature/cycling/athalassa-national-forest-park-cycling-route/">Athalassa</a>
    `;
    expect(extractCyclingSlugs(html)).toEqual([
      "athalassa-national-forest-park-cycling-route",
      "cy-rc06-divine-coast",
    ]);
  });
});
