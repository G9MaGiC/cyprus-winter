import { describe, it, expect } from "vitest";
import { AUTH_HERO_IMAGE, getAttractionImage, getTrailImage } from "./cyprus-images";

const LOCAL = "/images/cyprus";

describe("AUTH_HERO_IMAGE", () => {
  it("is a string pointing to the village omodos image", () => {
    expect(AUTH_HERO_IMAGE).toBe(`${LOCAL}/cyprus-village-omodos.jpg`);
  });
});

describe("getAttractionImage", () => {
  it("returns specific image for known beach IDs", () => {
    expect(getAttractionImage("nissi-beach", "beach")).toBe(`${LOCAL}/cyprus-beach-nissi.jpg`);
    expect(getAttractionImage("fig-tree-bay", "beach")).toBe(`${LOCAL}/cyprus-fig-tree-bay.jpg`);
    expect(getAttractionImage("konnos-bay", "beach")).toBe(`${LOCAL}/cyprus-konnos-bay.jpg`);
  });

  it("returns specific image for known ancient site IDs", () => {
    expect(getAttractionImage("kourion", "ancient")).toBe(`${LOCAL}/cyprus-ancient-kourion.jpg`);
    expect(getAttractionImage("pafos-mosaics", "ancient")).toBe(`${LOCAL}/cyprus-pafos-mosaics.jpg`);
    expect(getAttractionImage("salamis", "ancient")).toBe(`${LOCAL}/cyprus-salamis.jpg`);
  });

  it("returns specific image for known village IDs", () => {
    expect(getAttractionImage("lefkara", "village")).toBe(`${LOCAL}/cyprus-lefkara.jpg`);
    expect(getAttractionImage("omodos", "village")).toBe(`${LOCAL}/cyprus-village-omodos.jpg`);
    expect(getAttractionImage("polis", "village")).toBe(`${LOCAL}/cyprus-polis.jpg`);
  });

  it("returns specific image for monastery IDs", () => {
    expect(getAttractionImage("kykkos", "monastery")).toBe(`${LOCAL}/cyprus-monastery-kykkos.jpg`);
    expect(getAttractionImage("st-neophytos", "monastery")).toBe(`${LOCAL}/cyprus-monastery-kykkos.jpg`);
  });

  it("returns winery-specific image for winery type", () => {
    expect(getAttractionImage("domes-sergiou", "winery")).toBe(`${LOCAL}/domes-sergiou-hero.png`);
    expect(getAttractionImage("kolios", "winery")).toBe(`${LOCAL}/cyprus-winery-troodos.jpg`);
  });

  it("returns fallback winery image for unknown winery IDs", () => {
    expect(getAttractionImage("unknown-winery", "winery")).toBe(`${LOCAL}/cyprus-winery-troodos.jpg`);
  });

  it("returns restaurant-specific image for restaurant type", () => {
    expect(getAttractionImage("zygi-tavernas", "restaurant")).toBe(`${LOCAL}/cyprus-governors-beach.jpg`);
    expect(getAttractionImage("lefkara-tavernas", "restaurant")).toBe(`${LOCAL}/cyprus-lefkara.jpg`);
  });

  it("returns fallback restaurant image for unknown restaurant IDs", () => {
    expect(getAttractionImage("unknown-restaurant", "restaurant")).toBe(`${LOCAL}/cyprus-village-omodos.jpg`);
  });

  it("returns type-based fallback for unknown attraction IDs", () => {
    expect(getAttractionImage("unknown-beach", "beach")).toBe(`${LOCAL}/cyprus-governors-beach.jpg`);
    expect(getAttractionImage("unknown-ancient", "ancient")).toBe(`${LOCAL}/cyprus-ancient-kourion.jpg`);
    expect(getAttractionImage("unknown-village", "village")).toBe(`${LOCAL}/cyprus-village-omodos.jpg`);
    expect(getAttractionImage("unknown-monastery", "monastery")).toBe(`${LOCAL}/cyprus-monastery-kykkos.jpg`);
    expect(getAttractionImage("unknown-nature", "nature")).toBe(`${LOCAL}/cyprus-trail-troodos.jpg`);
  });

  it("returns global fallback for completely unknown type", () => {
    expect(getAttractionImage("unknown-id", "unknown-type")).toBe(`${LOCAL}/cyprus-trail-troodos.jpg`);
  });

  it("prioritizes map lookup over type fallback for non-winery/restaurant types", () => {
    // st-hilarion is in the map as ancient, should return the mapped value regardless of type param
    expect(getAttractionImage("st-hilarion", "ancient")).toBe(`${LOCAL}/cyprus-st-hilarion.jpg`);
  });
});

describe("getTrailImage", () => {
  it("returns specific image for known trail IDs", () => {
    expect(getTrailImage("artemis")).toBe(`${LOCAL}/cyprus-trail-troodos.jpg`);
    expect(getTrailImage("caledonia-falls")).toBe(`${LOCAL}/cyprus-trail-waterfall.jpg`);
    expect(getTrailImage("cape-greco")).toBe(`${LOCAL}/cyprus-trail-coastal.jpg`);
    expect(getTrailImage("avakas-gorge")).toBe(`${LOCAL}/cyprus-trail-gorge.jpg`);
  });

  it("returns Troodos fallback for unknown trail IDs", () => {
    expect(getTrailImage("unknown-trail")).toBe(`${LOCAL}/cyprus-trail-troodos.jpg`);
  });

  it("returns correct images for waterfall trails", () => {
    expect(getTrailImage("caledonia-falls")).toBe(`${LOCAL}/cyprus-trail-waterfall.jpg`);
    expect(getTrailImage("millomeris-falls")).toBe(`${LOCAL}/cyprus-trail-waterfall.jpg`);
    expect(getTrailImage("kryos-potamos-loop")).toBe(`${LOCAL}/cyprus-trail-waterfall.jpg`);
  });

  it("returns correct images for coastal trails", () => {
    expect(getTrailImage("cape-greco")).toBe(`${LOCAL}/cyprus-trail-coastal.jpg`);
    expect(getTrailImage("aphrodite")).toBe(`${LOCAL}/cyprus-trail-coastal.jpg`);
    expect(getTrailImage("petra-tou-romiou")).toBe(`${LOCAL}/cyprus-trail-coastal.jpg`);
  });

  it("returns correct images for gorge trails", () => {
    expect(getTrailImage("avakas-gorge")).toBe(`${LOCAL}/cyprus-trail-gorge.jpg`);
    expect(getTrailImage("adonis")).toBe(`${LOCAL}/cyprus-trail-gorge.jpg`);
    expect(getTrailImage("smigies")).toBe(`${LOCAL}/cyprus-trail-gorge.jpg`);
  });

  it("returns special image for lefkara-path", () => {
    expect(getTrailImage("lefkara-path")).toBe(`${LOCAL}/cyprus-lefkara.jpg`);
  });

  it("returns st-hilarion image for pentadaktylos", () => {
    expect(getTrailImage("pentadaktylos")).toBe(`${LOCAL}/cyprus-st-hilarion.jpg`);
  });
});
