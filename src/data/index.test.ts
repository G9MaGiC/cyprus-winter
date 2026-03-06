import { describe, it, expect } from "vitest";
import { getPlaceById, getAttractionById } from "./index";

describe("getPlaceById", () => {
  it("returns undefined for unknown id", () => {
    expect(getPlaceById("unknown-xyz")).toBeUndefined();
  });

  it("returns plan item for attraction id", () => {
    const p = getPlaceById("omodos");
    expect(p).toBeDefined();
    expect(p?.id).toBe("omodos");
    expect(p?.type).toBe("attraction");
    expect(p?.name).toContain("Omodos");
  });

  it("returns plan item for trail id", () => {
    const p = getPlaceById("artemis");
    expect(p).toBeDefined();
    expect(p?.type).toBe("trail");
  });

  it("returns plan item for trail slug", () => {
    const p = getPlaceById("artemis-trail");
    expect(p).toBeDefined();
    expect(p?.id).toBe("artemis");
    expect(p?.type).toBe("trail");
  });
});

describe("getAttractionById", () => {
  it("returns undefined for unknown id", () => {
    expect(getAttractionById("unknown-xyz")).toBeUndefined();
  });

  it("returns attraction for valid id", () => {
    const a = getAttractionById("omodos");
    expect(a).toBeDefined();
    expect(a?.id).toBe("omodos");
    expect(a?.name).toBeDefined();
  });
});
