import { describe, expect, it } from "vitest";
import { isSafeMarkdownHref, isSafeUrl } from "./safe-url";

describe("isSafeUrl", () => {
  it("allows relative paths, hashes, and http(s)", () => {
    expect(isSafeUrl("/discover/omodos")).toBe(true);
    expect(isSafeUrl("/plan?add=artemis")).toBe(true);
    expect(isSafeUrl("#section")).toBe(true);
    expect(isSafeUrl("https://example.com/path")).toBe(true);
    expect(isSafeUrl("http://example.com/path")).toBe(true);
  });

  it("blocks dangerous protocols", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("data:text/html,hi")).toBe(false);
    expect(isSafeUrl("&#106;avascript:alert(1)")).toBe(false);
  });

  it("blocks protocol-relative and slash tricks", () => {
    expect(isSafeUrl("//evil.com")).toBe(false);
    expect(isSafeUrl("//evil.com/phish")).toBe(false);
    expect(isSafeUrl(" /\\evil.com")).toBe(false);
    expect(isSafeUrl("/%5C%5Cevil.com")).toBe(false);
  });

  it("blocks control chars and incomplete URLs", () => {
    expect(isSafeUrl("/discover/\u0000omodos")).toBe(false);
    expect(isSafeUrl("https://")).toBe(false);
  });
});

describe("isSafeMarkdownHref", () => {
  it("allows tourism app paths and external https", () => {
    expect(isSafeMarkdownHref("/discover/omodos")).toBe(true);
    expect(isSafeMarkdownHref("/plan?add=artemis")).toBe(true);
    expect(isSafeMarkdownHref("/cycling")).toBe(true);
    expect(isSafeMarkdownHref("#section")).toBe(true);
    expect(isSafeMarkdownHref("https://example.com/path")).toBe(true);
  });

  it("blocks privileged same-origin paths even when isSafeUrl would allow them", () => {
    expect(isSafeUrl("/admin/stats")).toBe(true);
    expect(isSafeMarkdownHref("/admin/stats")).toBe(false);
    expect(isSafeMarkdownHref("/partner")).toBe(false);
    expect(isSafeMarkdownHref("/login")).toBe(false);
    expect(isSafeMarkdownHref("/api/health")).toBe(false);
  });
});
