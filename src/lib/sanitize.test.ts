import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeForStorage, sanitizeMarkdownLinks } from "./sanitize";

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

describe("sanitizeMarkdownLinks", () => {
  it("strips javascript: links", () => {
    expect(sanitizeMarkdownLinks("[click](javascript:alert(1))")).toBe("click");
  });

  it("strips entity-encoded javascript: links (XSS bypass)", () => {
    expect(sanitizeMarkdownLinks("[click](&#106;avascript:alert(1))")).toBe("click");
    expect(sanitizeMarkdownLinks("[x](&#x6a;avascript:void(0))")).toBe("x");
  });

  it("strips whitespace-obfuscated javascript: links", () => {
    expect(sanitizeMarkdownLinks("[x](java\tscript:alert(1))")).toBe("x");
    expect(sanitizeMarkdownLinks("[x](java\nscript:void(0))")).toBe("x");
  });

  it("strips data: protocol links", () => {
    expect(sanitizeMarkdownLinks("[x](data:text/html,payload)")).toBe("x");
  });

  it("keeps safe links", () => {
    expect(sanitizeMarkdownLinks("[ok](https://example.com)")).toBe("[ok](https://example.com)");
    expect(sanitizeMarkdownLinks("[rel](/path)")).toBe("[rel](/path)");
  });
});

describe("sanitizeForStorage", () => {
  it("delegates to sanitizeText", () => {
    expect(sanitizeForStorage("<p>test</p>")).toBe("test");
    expect(sanitizeForStorage("  a  b  ")).toBe("a b");
  });
});
