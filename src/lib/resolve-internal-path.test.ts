import { describe, expect, it } from "vitest";
import { resolveInternalPath } from "@/lib/resolve-internal-path";

describe("resolveInternalPath", () => {
  it("rejects external URLs", () => {
    expect(resolveInternalPath("https://evil.com")).toBe("/discover");
    expect(resolveInternalPath("//evil.com")).toBe("/discover");
  });

  it("allows known discover places", () => {
    expect(resolveInternalPath("/discover/omodos")).toBe("/discover/omodos");
  });

  it("rejects unknown discover ids", () => {
    expect(resolveInternalPath("/discover/not-a-real-place-xyz")).toBe("/discover");
  });

  it("resolves trail slugs to canonical id", () => {
    const path = resolveInternalPath("/trails/artemis-trail");
    expect(path).toBe("/trails/artemis");
  });

  it("resolves legacy Stavrovouni trail id to stavrovouni-trail", () => {
    expect(resolveInternalPath("/trails/stavrovouni")).toBe("/trails/stavrovouni-trail");
  });

  it("redirects trail ids under /discover/ to /trails/{id}", () => {
    expect(resolveInternalPath("/discover/artemis")).toBe("/trails/artemis");
    expect(resolveInternalPath("/discover/stavrovouni-trail")).toBe("/trails/stavrovouni-trail");
  });

  it("preserves query on safe paths", () => {
    expect(resolveInternalPath("/discover?filter=bouldering")).toBe(
      "/discover?filter=bouldering"
    );
  });
});
