import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { buildStrings } from "./extract";

/**
 * Freshness guard for the translator inventory (batch 83). strings.json is
 * generated from the live data/source tree; nothing else ever read it back,
 * so it drifted silently twice (the PR #236 airport scheme, then batch 80's
 * bestFor tag edits). This re-extracts in memory and diffs against the
 * committed file — a data or copy edit without `npm run i18n:extract` now
 * fails the suite with the exact keys that moved.
 */
describe("i18n extract inventory freshness", () => {
  it("committed strings.json matches a fresh extraction", async () => {
    const committedPath = path.join(__dirname, "strings.json");
    const committed = JSON.parse(fs.readFileSync(committedPath, "utf8")) as Record<
      string,
      string
    >;
    const fresh = await buildStrings();

    const committedKeys = new Set(Object.keys(committed));
    const freshKeys = new Set(Object.keys(fresh));
    const stale = [...committedKeys].filter((k) => !freshKeys.has(k));
    const missing = [...freshKeys].filter((k) => !committedKeys.has(k));
    const changed = [...freshKeys].filter(
      (k) => committedKeys.has(k) && committed[k] !== fresh[k]
    );

    expect(stale, "keys in strings.json no longer produced by extraction — run npm run i18n:extract").toEqual([]);
    expect(missing, "keys extraction now produces but strings.json lacks — run npm run i18n:extract").toEqual([]);
    expect(changed, "keys whose value drifted from the source — run npm run i18n:extract").toEqual([]);
  }, 60_000);
});
