import { describe, expect, it } from "vitest";
import { findTrailByIdOrSlug, isTrailSlugAlias } from "./trail-resolve";

describe("trail-resolve", () => {
  it("finds trail by id", () => {
    const trail = findTrailByIdOrSlug("artemis");
    expect(trail?.id).toBe("artemis");
  });

  it("finds trail by slug alias", () => {
    const trail = findTrailByIdOrSlug("artemis-trail");
    expect(trail?.id).toBe("artemis");
  });

  it("detects slug alias vs canonical id", () => {
    const trail = findTrailByIdOrSlug("artemis-trail");
    expect(trail).toBeDefined();
    expect(isTrailSlugAlias("artemis-trail", trail!)).toBe(true);
    expect(isTrailSlugAlias("artemis", trail!)).toBe(false);
  });
});
