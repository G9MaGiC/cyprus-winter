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
    track("onboarding_started", { source: "home" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends marketing events when analytics consent is granted", () => {
    vi.mocked(hasAnalyticsConsent).mockReturnValue(true);
    track("onboarding_started", { source: "home" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string).event).toBe("onboarding_started");
  });

  it("sends first-party funnel events without marketing consent", () => {
    trackProduct("page_view", { path: "/discover" });
    trackProduct("booking_start", { wineryId: "tsiakkas" });
    trackProduct("hub_footer_click", { action: "plan" });
    trackProduct("plan_add", { item_id: "tsiakkas" });
    trackProduct("trail_view", { trail_id: "artemis" });
    trackProduct("winery_detail_view", { placeId: "tsiakkas" });
    expect(fetchMock).toHaveBeenCalledTimes(6);
    const events = fetchMock.mock.calls.map((call) => JSON.parse(call[1].body as string).event);
    expect(events).toEqual([
      "page_view",
      "booking_start",
      "hub_footer_click",
      "plan_add",
      "trail_view",
      "winery_detail_view",
    ]);
  });
});
