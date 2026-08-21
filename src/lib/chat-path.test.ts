import { describe, expect, it } from "vitest";
import { chatBasePath, stripLocalePrefix } from "./chat-path";

describe("stripLocalePrefix", () => {
  it("leaves unprefixed paths alone", () => {
    expect(stripLocalePrefix("/discover")).toBe("/discover");
    expect(stripLocalePrefix("/")).toBe("/");
  });

  it("strips all configured locales including beta", () => {
    expect(stripLocalePrefix("/fr/plan")).toBe("/plan");
    expect(stripLocalePrefix("/he/trails")).toBe("/trails");
    expect(stripLocalePrefix("/ro/discover")).toBe("/discover");
    expect(stripLocalePrefix("/el/airport")).toBe("/airport");
    expect(stripLocalePrefix("/de")).toBe("/");
    expect(stripLocalePrefix("/pl/")).toBe("/");
  });
});

describe("chatBasePath", () => {
  it("maps locale home and hubs to suggestion buckets", () => {
    expect(chatBasePath("/")).toBe("/");
    expect(chatBasePath("/fr")).toBe("/");
    expect(chatBasePath("/he/discover/omodos")).toBe("/discover");
    expect(chatBasePath("/ro/trails")).toBe("/trails");
    expect(chatBasePath("/fr/plan")).toBe("/plan");
    expect(chatBasePath("/en/search")).toBe("/search");
  });
});
