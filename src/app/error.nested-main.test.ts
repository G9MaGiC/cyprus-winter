import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("root error page landmark", () => {
  it("does not nest a second <main> inside the root layout landmark", () => {
    const src = readFileSync("src/app/error.tsx", "utf8");
    expect(src).not.toMatch(/<main\b/);
    expect(src).toMatch(/role="alert"/);
  });
});
