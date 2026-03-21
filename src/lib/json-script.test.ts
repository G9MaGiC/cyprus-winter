import { describe, it, expect } from "vitest";
import { toSafeJsonForScript } from "./json-script";

describe("toSafeJsonForScript", () => {
  it("serializes plain objects", () => {
    expect(toSafeJsonForScript({ a: 1 })).toBe('{"a":1}');
  });

  it("escapes < to prevent script breakout", () => {
    const result = toSafeJsonForScript({ html: "</script>" });
    expect(result).not.toContain("<");
    expect(result).toContain("\\u003c");
  });

  it("escapes multiple < characters", () => {
    const result = toSafeJsonForScript({ a: "<b>", c: "<i>" });
    expect(result).not.toContain("<");
  });

  it("handles strings with no special characters", () => {
    expect(toSafeJsonForScript("hello")).toBe('"hello"');
  });

  it("handles null", () => {
    expect(toSafeJsonForScript(null)).toBe("null");
  });

  it("handles arrays", () => {
    expect(toSafeJsonForScript([1, 2])).toBe("[1,2]");
  });

  it("handles nested objects with < in values", () => {
    const result = toSafeJsonForScript({ nested: { val: "<script>alert(1)</script>" } });
    expect(result).not.toContain("<");
    expect(JSON.parse(result.replace(/\\u003c/g, "<"))).toEqual({
      nested: { val: "<script>alert(1)</script>" },
    });
  });
});
