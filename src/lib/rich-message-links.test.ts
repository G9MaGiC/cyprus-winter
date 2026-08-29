import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { routing } from "@/i18n/routing";

/**
 * Link handlers are passed to t.rich() as tag functions, so messages must use
 * the tag form (<fooLink>text</fooLink>). The ICU-argument form ({fooLink})
 * interpolates the handler function itself as a React child and crashes the
 * page at render (BUG-349: /guides/troodos-december, broken since PR #137).
 */
describe("rich message link tags", () => {
  it("no locale uses the {…Link} argument form", () => {
    for (const locale of routing.locales) {
      const raw = readFileSync(join(process.cwd(), "messages", `${locale}.json`), "utf8");
      const hits = raw.match(/\{[a-zA-Z]*Link\}/g) ?? [];
      expect(hits, `${locale}.json: ${hits.join(", ")}`).toEqual([]);
    }
  });
});
