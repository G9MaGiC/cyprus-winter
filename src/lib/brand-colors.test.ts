import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { BRAND_COLORS, BRAND_CSS_VARS } from "./brand-colors";
import { TOKENS } from "./design-tokens";

const GLOBALS_CSS = join(process.cwd(), "src/app/globals.css");

function parseRootCssVars(css: string): Map<string, string> {
  const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
  if (!rootMatch) return new Map();
  const vars = new Map<string, string>();
  const re = /--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rootMatch[1])) !== null) {
    vars.set(m[1], m[2].toLowerCase());
  }
  return vars;
}

describe("brand-colors", () => {
  it("TOKENS match BRAND_COLORS for shared keys", () => {
    expect(TOKENS.cloud).toBe(BRAND_COLORS.cloud);
    expect(TOKENS.sand).toBe(BRAND_COLORS.sand);
    expect(TOKENS.sandMid).toBe(BRAND_COLORS.sandMid);
    expect(TOKENS.sandDark).toBe(BRAND_COLORS.sandDark);
    expect(TOKENS.charcoal).toBe(BRAND_COLORS.charcoal);
    expect(TOKENS.olive).toBe(BRAND_COLORS.olive);
    expect(TOKENS.oliveMuted).toBe(BRAND_COLORS.oliveMuted);
    expect(TOKENS.terracotta).toBe(BRAND_COLORS.terracotta);
    expect(TOKENS.terracottaMuted).toBe(BRAND_COLORS.terracottaMuted);
    expect(TOKENS.golden).toBe(BRAND_COLORS.golden);
    expect(TOKENS.aegean).toBe(BRAND_COLORS.aegean);
    expect(TOKENS.sage).toBe(BRAND_COLORS.sage);
    expect(TOKENS.sageMuted).toBe(BRAND_COLORS.sageMuted);
  });

  it("globals.css :root brand vars match BRAND_CSS_VARS", () => {
    const css = readFileSync(GLOBALS_CSS, "utf8");
    const rootVars = parseRootCssVars(css);
    for (const [name, hex] of Object.entries(BRAND_CSS_VARS)) {
      const actual = rootVars.get(name);
      expect(actual, `--${name} missing or mismatched in globals.css`).toBe(hex.toLowerCase());
    }
  });

  it("globals.css uses canonical terracotta rgba for tap/selection/pulse", () => {
    const css = readFileSync(GLOBALS_CSS, "utf8");
    expect(css).toContain("rgba(181, 87, 56");
    expect(css).not.toContain("rgba(180, 91, 66");
  });
});
