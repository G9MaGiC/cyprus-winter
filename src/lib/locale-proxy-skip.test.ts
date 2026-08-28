import { describe, expect, it } from "vitest";
import { shouldSkipLocaleProxy } from "@/lib/locale-proxy-skip";

describe("shouldSkipLocaleProxy", () => {
  it("skips PWA manifest routes so locale middleware cannot rewrite them", () => {
    expect(shouldSkipLocaleProxy("/manifests")).toBe(true);
    expect(shouldSkipLocaleProxy("/manifests/en")).toBe(true);
    expect(shouldSkipLocaleProxy("/manifests/de")).toBe(true);
  });

  it("does not skip normal app routes", () => {
    expect(shouldSkipLocaleProxy("/")).toBe(false);
    expect(shouldSkipLocaleProxy("/discover")).toBe(false);
    expect(shouldSkipLocaleProxy("/en/discover")).toBe(false);
    expect(shouldSkipLocaleProxy("/manifest")).toBe(false);
  });
});
