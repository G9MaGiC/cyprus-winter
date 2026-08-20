import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { wineries } from "@/data/wineries";
import { getAttractionImage, resolveWineryImage } from "./cyprus-images";

describe("resolveWineryImage", () => {
  it("returns partner asset for domes-sergiou", () => {
    expect(resolveWineryImage("domes-sergiou")).toBe("/images/cyprus/domes-sergiou-hero.png");
  });

  it("uses Laona route fallback for unknown Laona winery", () => {
    expect(resolveWineryImage("fikardos")).toBe("/images/cyprus/cyprus-vineyard-laona.jpg");
  });

  it("uses winter Lofou vineyard for Krasochoria route fallback", () => {
    expect(resolveWineryImage("ayia-mavri")).toBe("/images/cyprus/cyprus-vineyard-lofou-january.jpg");
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
    expect(getAttractionImage("tsiakkas", "winery")).toBe(resolveWineryImage("tsiakkas"));
    expect(getAttractionImage("tsiakkas", "winery")).toBe("/images/cyprus/winery-tsiakkas.jpg");
  });
});

describe("winery image files on disk (G10)", () => {
  it("every winery resolves to a committed public file", () => {
    for (const winery of wineries) {
      const url = resolveWineryImage(winery.id);
      expect(url.startsWith("/images/"), `${winery.id} ${url}`).toBe(true);
      expect(existsSync(join(process.cwd(), "public", url)), `${winery.id} -> ${url}`).toBe(true);
    }
  });

  it("maps Tsiakkas to a Pelendri vineyard file, not a generic mountain fallback", () => {
    expect(resolveWineryImage("tsiakkas")).toBe("/images/cyprus/winery-tsiakkas.jpg");
  });

  it("does not use the Ktima Gerolemo Omodos tasting photo for Mystes (Paphos)", () => {
    expect(resolveWineryImage("mystes")).not.toBe("/images/cyprus/cyprus-winery-omodos-tasting.jpg");
    expect(resolveWineryImage("mystes")).toBe("/images/cyprus/cyprus-vineyard-laona.jpg");
  });

  it("maps Krasochoria verified partners to the January Lofou vineyard", () => {
    expect(resolveWineryImage("zambartas")).toBe("/images/cyprus/cyprus-vineyard-lofou-january.jpg");
    expect(resolveWineryImage("santo")).toBe("/images/cyprus/cyprus-vineyard-lofou-january.jpg");
  });

  it("maps Savvas to Silikou terroir and uses it for Commandaria fallback", () => {
    expect(resolveWineryImage("savvas")).toBe("/images/cyprus/cyprus-vineyard-silikou.jpg");
    expect(resolveWineryImage("monagri")).toBe("/images/cyprus/cyprus-vineyard-silikou.jpg");
  });
});
