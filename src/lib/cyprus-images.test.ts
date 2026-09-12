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
    // ktima-vassiliades carried this guard before the 2026-09-02 quarantine.
    expect(resolveWineryImage("vlassides")).toBe("/images/cyprus/cyprus-winery-barrels.jpg");
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

  it("maps cycling hub places to existing regional files instead of one identical trail fallback", () => {
    expect(getAttractionImage("troodos-cycling-hub", "nature")).toBe("/images/cyprus/cyprus-trail-troodos.jpg");
    expect(getAttractionImage("akamas-latchi-cycling", "nature")).toBe("/images/cyprus/cyprus-trail-coastal.jpg");
    expect(getAttractionImage("limassol-coastal-cycle", "nature")).toBe("/images/cyprus/cyprus-governors-beach.jpg");
    expect(getAttractionImage("pitsilia-cycling-loop", "nature")).toBe("/images/cyprus/cyprus-vineyard-mountain.jpg");
    expect(getAttractionImage("krasochoria-gravel-loop", "nature")).toBe(
      "/images/cyprus/cyprus-vineyard-lofou-january.jpg"
    );
    expect(getAttractionImage("silikou-valley-trail", "nature")).toBe("/images/cyprus/cyprus-vineyard-silikou.jpg");
    const urls = [
      "troodos-cycling-hub",
      "akamas-latchi-cycling",
      "limassol-coastal-cycle",
      "pitsilia-cycling-loop",
      "krasochoria-gravel-loop",
      "silikou-valley-trail",
    ].map((id) => getAttractionImage(id, "nature"));
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(existsSync(join(process.cwd(), "public", url)), url).toBe(true);
    }
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

  it("maps Krasochoria estates to the January Lofou vineyard", () => {
    // santo carried the second assertion before the 2026-09-02 quarantine.
    expect(resolveWineryImage("zambartas")).toBe("/images/cyprus/cyprus-vineyard-lofou-january.jpg");
  });

  it("maps Commandaria-route wineries to Silikou terroir via route fallback", () => {
    // savvas/monagri carried this guard before the 2026-09-02 quarantine;
    // revecca and the Silikou museum are the public Commandaria carriers now.
    expect(resolveWineryImage("revecca")).toBe("/images/cyprus/cyprus-vineyard-silikou.jpg");
    expect(resolveWineryImage("silikou-museum")).toBe("/images/cyprus/cyprus-vineyard-silikou.jpg");
  });
});
