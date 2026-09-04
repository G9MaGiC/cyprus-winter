import { describe, expect, it } from "vitest";
import { invalidSlugRewriteTarget } from "@/lib/invalid-slug-404";

describe("invalidSlugRewriteTarget (404 proxy rewrite)", () => {
  it("passes valid slugs through, prefixed or not", () => {
    expect(invalidSlugRewriteTarget("/discover/larnaca-aliki")).toBeNull();
    expect(invalidSlugRewriteTarget("/el/discover/larnaca-aliki")).toBeNull();
    expect(invalidSlugRewriteTarget("/trails/aphrodite")).toBeNull();
    expect(invalidSlugRewriteTarget("/book/winery/tsiakkas")).toBeNull();
    expect(invalidSlugRewriteTarget("/he/book/winery/tsiakkas")).toBeNull();
    expect(invalidSlugRewriteTarget("/weather/december")).toBeNull();
  });

  it("passes trail slug aliases and legacy ids through (they 308-redirect downstream)", () => {
    expect(invalidSlugRewriteTarget("/trails/artemis-trail")).toBeNull();
    expect(invalidSlugRewriteTarget("/he/trails/aphrodite-trail")).toBeNull();
    expect(invalidSlugRewriteTarget("/trails/stavrovouni")).toBeNull();
  });

  it("matches weather months case-insensitively (the page lowercases its param)", () => {
    expect(invalidSlugRewriteTarget("/weather/December")).toBeNull();
    expect(invalidSlugRewriteTarget("/de/weather/JANUARY")).toBeNull();
    expect(invalidSlugRewriteTarget("/weather/Tuesday")).toBe("/weather/Tuesday/__404__");
  });

  it("never trips on Object.prototype member names in the path", () => {
    expect(invalidSlugRewriteTarget("/constructor/x")).toBeNull();
    expect(invalidSlugRewriteTarget("/__proto__/x")).toBeNull();
    expect(invalidSlugRewriteTarget("/de/toString/x")).toBeNull();
    expect(invalidSlugRewriteTarget("/hasOwnProperty/x")).toBeNull();
  });

  it("rewrites unknown slugs to a non-matching sub-path", () => {
    expect(invalidSlugRewriteTarget("/discover/zzz-not-real")).toBe(
      "/discover/zzz-not-real/__404__"
    );
    expect(invalidSlugRewriteTarget("/he/trails/zzz")).toBe("/he/trails/zzz/__404__");
    expect(invalidSlugRewriteTarget("/book/guide/zzz")).toBe("/book/guide/zzz/__404__");
    expect(invalidSlugRewriteTarget("/de/weather/tuesday")).toBe("/de/weather/tuesday/__404__");
    expect(invalidSlugRewriteTarget("/regions/atlantis")).toBe("/regions/atlantis/__404__");
  });

  it("stays fail-open on shapes it does not own", () => {
    expect(invalidSlugRewriteTarget("/")).toBeNull();
    expect(invalidSlugRewriteTarget("/discover")).toBeNull();
    expect(invalidSlugRewriteTarget("/discover/a/b")).toBeNull();
    expect(invalidSlugRewriteTarget("/plan")).toBeNull();
    expect(invalidSlugRewriteTarget("/book/somethingelse/x")).toBeNull();
    // a non-locale first segment is not stripped, so this is a 3-segment
    // unknown shape, not a discover lookup
    expect(invalidSlugRewriteTarget("/foo/discover/zzz")).toBeNull();
  });

  it("decodes percent-encoded slugs before the lookup and survives bad encoding", () => {
    expect(invalidSlugRewriteTarget("/discover/larnaca%2Daliki")).toBeNull();
    expect(invalidSlugRewriteTarget("/discover/%E2%82")).toBe("/discover/%E2%82/__404__");
  });
});
