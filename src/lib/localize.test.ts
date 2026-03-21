import { describe, it, expect } from "vitest";
import { getLocalizedName } from "./localize";
import type { WithName } from "./localize";

describe("getLocalizedName", () => {
  const place: WithName = {
    name: "Troodos",
    nameEl: "Τρόοδος",
    nameDe: "Troodos-Gebirge",
    namePl: "Troodos (góry)",
  };

  it("returns Greek name for locale 'el'", () => {
    expect(getLocalizedName(place, "el")).toBe("Τρόοδος");
  });

  it("returns German name for locale 'de'", () => {
    expect(getLocalizedName(place, "de")).toBe("Troodos-Gebirge");
  });

  it("returns Polish name for locale 'pl'", () => {
    expect(getLocalizedName(place, "pl")).toBe("Troodos (góry)");
  });

  it("returns English name for locale 'en'", () => {
    expect(getLocalizedName(place, "en")).toBe("Troodos");
  });

  it("falls back to English name for unknown locale", () => {
    expect(getLocalizedName(place, "fr")).toBe("Troodos");
  });

  it("falls back to English name when locale-specific name is missing", () => {
    const partial: WithName = { name: "Omodos" };
    expect(getLocalizedName(partial, "el")).toBe("Omodos");
    expect(getLocalizedName(partial, "de")).toBe("Omodos");
    expect(getLocalizedName(partial, "pl")).toBe("Omodos");
  });

  it("falls back to English when locale name is empty string", () => {
    const withEmpty: WithName = { name: "Lefkara", nameEl: "" };
    expect(getLocalizedName(withEmpty, "el")).toBe("Lefkara");
  });
});
