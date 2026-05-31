import { describe, it, expect } from "vitest";
import { getAttractionImage, resolveWineryImage } from "./cyprus-images";

describe("resolveWineryImage", () => {
  it("returns partner asset for domes-sergiou", () => {
    expect(resolveWineryImage("domes-sergiou")).toBe("/images/cyprus/domes-sergiou-hero.png");
  });

  it("uses Laona route fallback for unknown Laona winery", () => {
    expect(resolveWineryImage("fikardos")).toBe("/images/cyprus/cyprus-vineyard-laona.jpg");
  });

  it("uses Krasochoria fallback for unknown Krasochoria winery", () => {
    expect(resolveWineryImage("ayia-mavri")).toBe("/images/cyprus/cyprus-winery-troodos.jpg");
  });

  it("uses per-id barrel image for mapped Krasochoria winery", () => {
    expect(resolveWineryImage("ktima-vassiliades")).toBe("/images/cyprus/cyprus-winery-barrels.jpg");
  });
});

describe("getAttractionImage", () => {
  it("maps choirokoitia to dedicated image", () => {
    expect(getAttractionImage("choirokoitia", "ancient")).toBe(
      "/images/cyprus/cyprus-choirokoitia.jpg"
    );
  });

  it("delegates wineries to resolveWineryImage", () => {
    expect(getAttractionImage("tsiakkas", "winery")).toBe(
      "/images/cyprus/cyprus-vineyard-mountain.jpg"
    );
  });
});
