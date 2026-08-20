import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { toSafeJsonForScript } from "@/lib/json-script";

describe("toSafeJsonForScript", () => {
  it("escapes < so JSON cannot break out of a script tag", () => {
    expect(toSafeJsonForScript({ html: "</script>" })).toContain("\\u003c/script>");
    expect(toSafeJsonForScript({ html: "</script>" })).not.toContain("</script>");
  });
});

describe("JSON-LD script embedding", () => {
  it("locale events layout uses the script-safe serializer", () => {
    const src = readFileSync("src/app/[locale]/events/layout.tsx", "utf8");
    expect(src).toContain("toSafeJsonForScript");
    expect(src).not.toMatch(/dangerouslySetInnerHTML=\{\{\s*__html:\s*JSON\.stringify/);
  });
});
