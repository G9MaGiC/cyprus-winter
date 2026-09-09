/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest";
import { liveElementById } from "./PlanStickyAddBar";

/**
 * The sticky bar's sentinel lookup must never observe a staged streaming
 * copy (BUG-353 class): a [hidden] node never intersects, which would pin
 * the bar on forever since the effect never re-queries (batch 70/72).
 */

afterEach(() => {
  document.body.innerHTML = "";
});

describe("liveElementById", () => {
  it("prefers the live copy over a hidden staged duplicate, in either order", () => {
    document.body.innerHTML =
      '<div hidden><div id="s"></div></div><div id="s" data-live></div>';
    expect(liveElementById("s")?.dataset.live).toBe("");

    document.body.innerHTML =
      '<div id="s" data-live></div><div hidden><div id="s"></div></div>';
    expect(liveElementById("s")?.dataset.live).toBe("");
  });

  it("returns null when every match sits inside [hidden] (never observe a staged node)", () => {
    document.body.innerHTML = '<div hidden><div id="s"></div></div>';
    expect(liveElementById("s")).toBeNull();
  });

  it("returns null when the id is absent", () => {
    expect(liveElementById("missing")).toBeNull();
  });
});
