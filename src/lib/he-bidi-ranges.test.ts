import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Bidi guard for the Hebrew catalog: a numeric range like 24–48 inside RTL
 * text takes the paragraph's direction under UAX#9 N1 and renders reversed
 * (48–24) unless the range is wrapped in LRI…PDI isolates (U+2066…U+2069).
 * The content batches held this convention from day one; this pins it for
 * every string, so no future key ships a range that reads backwards.
 */

const LRI = "⁦";
const RLI = "⁧";
const FSI = "⁨";
const PDI = "⁩";

function unisolatedRanges(value: string): boolean {
  let depth = 0;
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    if (c === LRI || c === RLI || c === FSI) depth++;
    else if (c === PDI) depth = Math.max(0, depth - 1);
    else if (
      depth === 0 &&
      /\d/.test(c) &&
      /[–—-]/.test(value[i + 1] ?? "") &&
      /\d/.test(value[i + 2] ?? "")
    ) {
      return true;
    } else if (
      // An ICU placeholder range like {min}–{max} fills in as digits at
      // render time and reverses exactly the same way — treat the tight
      // }–{ boundary as a range (spaced " — " separators stay exempt).
      depth === 0 &&
      c === "}" &&
      /[–—-]/.test(value[i + 1] ?? "") &&
      (value[i + 2] ?? "") === "{"
    ) {
      return true;
    }
  }
  return false;
}

describe("Hebrew catalog bidi ranges", () => {
  it("every digit–digit range in a Hebrew string is direction-isolated", () => {
    const catalog = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../messages/he.json"), "utf8")
    ) as Record<string, unknown>;
    const offenders: string[] = [];
    const walk = (obj: Record<string, unknown>, prefix: string) => {
      for (const [key, value] of Object.entries(obj)) {
        const p = prefix ? `${prefix}.${key}` : key;
        if (typeof value === "string") {
          // Every he.json string renders inside the dir="rtl" page paragraph
          // (src/app/layout.tsx), so even a Hebrew-free string's range takes
          // the RTL direction under UAX#9 N1 — scan all of them.
          if (unisolatedRanges(value)) {
            offenders.push(p);
          }
        } else if (value && typeof value === "object") {
          walk(value as Record<string, unknown>, p);
        }
      }
    };
    walk(catalog, "");
    expect(offenders, `unisolated ranges: ${offenders.join(", ")}`).toEqual([]);
  });
});
