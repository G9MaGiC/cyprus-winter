import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const appDir = join(process.cwd(), "src/app");

describe("localized route parity", () => {
  it("has locale proxies for booking list routes linked from localized pages", () => {
    for (const route of ["guide", "winery"]) {
      expect(
        existsSync(join(appDir, "[locale]/book", route, "page.tsx")),
        `missing localized /book/${route} route`
      ).toBe(true);
    }
  });

  it("has locale proxies for hub list pages", () => {
    for (const route of ["beaches", "wineries", "villages", "cycling"]) {
      expect(
        existsSync(join(appDir, "[locale]", route, "page.tsx")),
        `missing localized /${route} hub`
      ).toBe(true);
    }
  });
});
