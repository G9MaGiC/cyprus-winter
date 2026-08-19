/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { track, trackProduct } from "./analytics";

const fetchMock = vi.fn().mockResolvedValue({ ok: true });

vi.mock("./cookie-consent", () => ({
  hasAnalyticsConsent: vi.fn(),
}));

import { hasAnalyticsConsent } from "./cookie-consent";

describe("analytics consent", () => {
  beforeEach(() => {
    fetchMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(hasAnalyticsConsent).mockReturnValue(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not send marketing events without analytics consent", () => {
    track("page_view", { path: "/discover" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends marketing events when analytics consent is granted", () => {
    vi.mocked(hasAnalyticsConsent).mockReturnValue(true);
    track("page_view", { path: "/discover" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string).event).toBe("page_view");
  });

  it("sends first-party funnel events without marketing consent", () => {
    trackProduct("booking_start", { wineryId: "tsiakkas" });
    trackProduct("hub_footer_click", { action: "plan" });
    trackProduct("plan_add", { item_id: "tsiakkas" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const events = fetchMock.mock.calls.map((call) => JSON.parse(call[1].body as string).event);
    expect(events).toEqual(["booking_start", "hub_footer_click", "plan_add"]);
  });
});
