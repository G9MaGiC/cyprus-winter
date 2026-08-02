import { describe, expect, it } from "vitest";
import { isSafeUrl } from "./safe-url";

describe("isSafeUrl", () => {
  it("allows relative app paths and http/https links", () => {
    expect(isSafeUrl("/discover/omodos")).toBe(true);
    expect(isSafeUrl("/plan?add=artemis")).toBe(true);
    expect(isSafeUrl("#section")).toBe(true);
    expect(isSafeUrl("https://example.com/path")).toBe(true);
    expect(isSafeUrl("http://example.com/path")).toBe(true);
  });

  it("rejects dangerous protocols after entity decoding", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("data:text/html,hi")).toBe(false);
    expect(isSafeUrl("&#106;avascript:alert(1)")).toBe(false);
  });

  it("rejects protocol-relative and slash/backslash URLs", () => {
    expect(isSafeUrl("//evil.com")).toBe(false);
    expect(isSafeUrl("//evil.com/phish")).toBe(false);
    expect(isSafeUrl(" /\\evil.com")).toBe(false);
    expect(isSafeUrl("/%5C%5Cevil.com")).toBe(false);
  });

  it("rejects control characters and malformed URLs", () => {
    expect(isSafeUrl("/discover/\u0000omodos")).toBe(false);
    expect(isSafeUrl("https://")).toBe(false);
  });
});
