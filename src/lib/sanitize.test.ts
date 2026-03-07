import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeForStorage } from "./sanitize";

describe("sanitizeText", () => {
  it("returns empty string for non-string input", () => {
    expect(sanitizeText(null as unknown as string)).toBe("");
    expect(sanitizeText(undefined as unknown as string)).toBe("");
  });

  it("strips HTML tags", () => {
    expect(sanitizeText("<script>alert(1)</script>")).toBe("alert(1)");
    expect(sanitizeText("<b>Hello</b>")).toBe("Hello");
    expect(sanitizeText("a <div>b</div> c")).toBe("a b c");
  });

  it("normalizes whitespace", () => {
    expect(sanitizeText("  foo   bar  ")).toBe("foo bar");
  });

  it("returns empty for empty string", () => {
    expect(sanitizeText("")).toBe("");
  });

  it("returns empty when maxLength is 0", () => {
    expect(sanitizeText("hello", 0)).toBe("");
  });

  it("strips HTML then truncates when both", () => {
    expect(sanitizeText("<b>hello</b> world", 5)).toBe("hello");
  });

  it("truncates to maxLength when provided", () => {
    expect(sanitizeText("hello world", 5)).toBe("hello");
  });
});

describe("sanitizeForStorage", () => {
  it("delegates to sanitizeText", () => {
    expect(sanitizeForStorage("<p>test</p>")).toBe("test");
    expect(sanitizeForStorage("  a  b  ")).toBe("a b");
  });
});
