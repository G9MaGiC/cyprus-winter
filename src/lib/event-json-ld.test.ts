import { describe, it, expect } from "vitest";
import { startDateForEventJsonLd } from "./event-json-ld";

describe("startDateForEventJsonLd", () => {
  it("returns undefined for human-readable phrases", () => {
    expect(startDateForEventJsonLd("Weekends in December")).toBeUndefined();
    expect(startDateForEventJsonLd("2 weeks before Lent")).toBeUndefined();
    expect(startDateForEventJsonLd(undefined)).toBeUndefined();
  });

  it("accepts ISO date-only strings", () => {
    expect(startDateForEventJsonLd("2026-12-05")).toBe("2026-12-05");
  });

  it("accepts ISO datetime strings", () => {
    expect(startDateForEventJsonLd("2026-12-05T14:00:00Z")).toBe("2026-12-05T14:00:00.000Z");
  });
});
