import { describe, it, expect } from "vitest";
import { isSafeInternalPath } from "./safe-internal-path";

describe("isSafeInternalPath", () => {
  it("allows known app routes", () => {
    expect(isSafeInternalPath("/discover/kourion")).toBe(true);
    expect(isSafeInternalPath("/trails/artemis")).toBe(true);
    expect(isSafeInternalPath("/plan?add=artemis")).toBe(true);
    expect(isSafeInternalPath("/search?q=troodos")).toBe(true);
    expect(isSafeInternalPath("/cycling")).toBe(true);
    expect(isSafeInternalPath("/cycling?from=discover")).toBe(true);
  });

  it("rejects external and unsafe paths", () => {
    expect(isSafeInternalPath("")).toBe(false);
    expect(isSafeInternalPath("https://evil.com")).toBe(false);
    expect(isSafeInternalPath("//evil.com")).toBe(false);
    expect(isSafeInternalPath("/admin/stats")).toBe(false);
    expect(isSafeInternalPath("/partner")).toBe(false);
    expect(isSafeInternalPath("/discover/../../etc/passwd")).toBe(false);
  });
});
