import { describe, it, expect } from "vitest";
import { TOKENS, LAYOUT, CTA, SECTION, CARD, EMPTY_STATE_DASHED, PILL, EMPTY_STATE, HERO } from "./design-tokens";

describe("TOKENS", () => {
  it("has expected color keys", () => {
    expect(TOKENS.terracotta).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(TOKENS.aegean).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(TOKENS.charcoal).toBeDefined();
  });
});

describe("LAYOUT", () => {
  it("has list and form max-widths", () => {
    expect(LAYOUT.list).toContain("max-w");
    expect(LAYOUT.form).toContain("max-w");
  });
});

describe("CTA", () => {
  it("primaryCompact includes terracotta", () => {
    expect(CTA.primaryCompact).toContain("terracotta");
  });
});

describe("SECTION", () => {
  it("has blockGap defined", () => {
    expect(SECTION.blockGap).toBeDefined();
  });
});

describe("CARD", () => {
  it("base includes rounded", () => {
    expect(CARD.base).toMatch(/rounded/);
  });
});

describe("HERO", () => {
  it("section contains min-h", () => {
    expect(HERO.section).toContain("min-h");
  });
});

describe("PILL", () => {
  it("base contains rounded-full", () => {
    expect(PILL.base).toContain("rounded-full");
  });
});

describe("EMPTY_STATE", () => {
  it("is a non-empty string", () => {
    expect(EMPTY_STATE.length).toBeGreaterThan(0);
  });
});

describe("EMPTY_STATE_DASHED", () => {
  it("is a non-empty string", () => {
    expect(typeof EMPTY_STATE_DASHED).toBe("string");
    expect(EMPTY_STATE_DASHED.length).toBeGreaterThan(0);
  });
});
