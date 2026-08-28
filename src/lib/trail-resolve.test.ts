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

  it("maps the pre-rename Stavrovouni trail URL to the unique trail id", () => {
    const trail = findTrailByIdOrSlug("stavrovouni");
    expect(trail?.id).toBe("stavrovouni-trail");
    expect(isTrailSlugAlias("stavrovouni", trail!)).toBe(true);
    expect(isTrailSlugAlias("stavrovouni-trail", trail!)).toBe(false);
  });
});
