import { describe, it, expect } from "vitest";
import { isSafeUrl } from "./safe-url";

describe("isSafeUrl", () => {
  // Safe URLs
  it("allows relative paths starting with /", () => {
    expect(isSafeUrl("/about")).toBe(true);
    expect(isSafeUrl("/discover/some-place")).toBe(true);
  });

  it("allows hash links", () => {
    expect(isSafeUrl("#section")).toBe(true);
    expect(isSafeUrl("#")).toBe(true);
  });

  it("allows https URLs", () => {
    expect(isSafeUrl("https://cypruswinter.com")).toBe(true);
    expect(isSafeUrl("https://example.com/path?q=1")).toBe(true);
  });

  it("allows http URLs", () => {
    expect(isSafeUrl("http://example.com")).toBe(true);
  });

  // Dangerous protocols
  it("rejects javascript: protocol", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects data: protocol", () => {
    expect(isSafeUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("rejects vbscript: protocol", () => {
    expect(isSafeUrl("vbscript:msgbox")).toBe(false);
  });

  it("rejects file: protocol", () => {
    expect(isSafeUrl("file:///etc/passwd")).toBe(false);
  });

  // Case insensitivity
  it("rejects dangerous protocols regardless of case", () => {
    expect(isSafeUrl("JavaScript:alert(1)")).toBe(false);
    expect(isSafeUrl("JAVASCRIPT:alert(1)")).toBe(false);
    expect(isSafeUrl("DATA:text/html,foo")).toBe(false);
  });

  // HTML entity bypass prevention
  it("rejects javascript: with decimal HTML entities", () => {
    // &#106; = 'j'
    expect(isSafeUrl("&#106;avascript:alert(1)")).toBe(false);
  });

  it("rejects javascript: with hex HTML entities", () => {
    // &#x6a; = 'j'
    expect(isSafeUrl("&#x6a;avascript:alert(1)")).toBe(false);
  });

  it("rejects fully encoded javascript: with entities", () => {
    // &#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58; = javascript:
    expect(
      isSafeUrl("&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)")
    ).toBe(false);
  });

  // Edge cases
  it("rejects empty string", () => {
    expect(isSafeUrl("")).toBe(false);
  });

  it("rejects whitespace-only string", () => {
    expect(isSafeUrl("   ")).toBe(false);
  });

  it("handles leading/trailing whitespace", () => {
    expect(isSafeUrl("  https://example.com  ")).toBe(true);
    expect(isSafeUrl("  javascript:alert(1)  ")).toBe(false);
    expect(isSafeUrl("  /path  ")).toBe(true);
  });

  it("rejects non-standard protocols (mailto, tel, etc. — not explicitly allowed)", () => {
    expect(isSafeUrl("mailto:user@example.com")).toBe(false);
    expect(isSafeUrl("tel:+1234567890")).toBe(false);
    expect(isSafeUrl("ftp://server.com")).toBe(false);
  });

  it("rejects bare words (not a path, not a protocol)", () => {
    expect(isSafeUrl("just-text")).toBe(false);
  });
});
