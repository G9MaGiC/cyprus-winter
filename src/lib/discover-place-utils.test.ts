import { describe, expect, it } from "vitest";
import { isBufferZoneCulturalNote } from "./discover-place-utils";

describe("isBufferZoneCulturalNote", () => {
  it("detects buffer zone references case-insensitively", () => {
    expect(isBufferZoneCulturalNote("Near the buffer zone; check access.")).toBe(true);
    expect(isBufferZoneCulturalNote("Buffer Zone area")).toBe(true);
  });

  it("returns false for unrelated notes", () => {
    expect(isBufferZoneCulturalNote("Dress modestly for monastery visits.")).toBe(false);
    expect(isBufferZoneCulturalNote(undefined)).toBe(false);
  });
});
