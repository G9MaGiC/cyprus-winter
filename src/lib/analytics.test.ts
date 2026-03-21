import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies before importing the module under test
vi.mock("@/lib/cookie-consent", () => ({
  hasAnalyticsConsent: vi.fn(() => true),
}));

vi.mock("@/lib/track-events", () => ({
  PRODUCT_EVENTS: [
    "plan_add",
    "plan_view",
    "plan_remove",
    "plan_share",
    "plan_day_change",
    "plan_template_apply",
  ] as const,
}));

import { track, trackProduct } from "./analytics";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";

const mockHasAnalyticsConsent = vi.mocked(hasAnalyticsConsent);

describe("analytics", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn(() => Promise.resolve(new Response()));
    vi.stubGlobal("fetch", fetchSpy);
    vi.stubGlobal("window", {
      location: { pathname: "/test-page" },
    });
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn(() => "test-uuid-1234"),
    });
    mockHasAnalyticsConsent.mockReturnValue(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("track", () => {
    it("sends event to /api/track with correct payload shape", () => {
      track("page_view", { source: "home" });

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toBe("/api/track");
      expect(options.method).toBe("POST");
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(options.keepalive).toBe(true);

      const body = JSON.parse(options.body);
      expect(body.event).toBe("page_view");
      expect(body.properties.source).toBe("home");
      expect(body.properties.path).toBe("/test-page");
      expect(body.eventId).toBe("test-uuid-1234");
      expect(body.sessionId).toMatch(/^sid_/);
    });

    it("does not track when analytics consent is denied", () => {
      mockHasAnalyticsConsent.mockReturnValue(false);
      track("page_view");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("does not track when window is undefined (SSR)", () => {
      vi.stubGlobal("window", undefined);
      track("page_view");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("includes path in properties from window.location", () => {
      vi.stubGlobal("window", {
        location: { pathname: "/discover/lefkara" },
      });
      track("discover_view");

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.properties.path).toBe("/discover/lefkara");
    });

    it("reuses session id from sessionStorage", () => {
      (sessionStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue("sid_existing");
      track("page_view");
      track("discover_view");

      const body1 = JSON.parse(fetchSpy.mock.calls[0][1].body);
      const body2 = JSON.parse(fetchSpy.mock.calls[1][1].body);
      expect(body1.sessionId).toBe("sid_existing");
      expect(body2.sessionId).toBe("sid_existing");
    });

    it("creates and stores session id when none exists", () => {
      (sessionStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
      track("page_view");

      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        "cw_sid",
        expect.stringMatching(/^sid_\d+_[a-z0-9]+$/)
      );
    });

    it("silently catches fetch errors", () => {
      fetchSpy.mockRejectedValue(new Error("Network error"));
      // Should not throw
      expect(() => track("page_view")).not.toThrow();
    });

    it("sends event without extra properties", () => {
      track("booking_complete");
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.event).toBe("booking_complete");
      expect(body.properties.path).toBe("/test-page");
    });
  });

  describe("trackProduct", () => {
    it("sends product events without requiring consent", () => {
      mockHasAnalyticsConsent.mockReturnValue(false);
      trackProduct("plan_add", { itemId: "lefkara" });

      expect(fetchSpy).toHaveBeenCalledOnce();
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.event).toBe("plan_add");
      expect(body.properties.itemId).toBe("lefkara");
    });

    it("rejects events not in the PRODUCT_EVENTS allowlist", () => {
      trackProduct("page_view" as any);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("allows all product event names", () => {
      const productEvents = [
        "plan_add",
        "plan_view",
        "plan_remove",
        "plan_share",
        "plan_day_change",
        "plan_template_apply",
      ];
      for (const event of productEvents) {
        fetchSpy.mockClear();
        trackProduct(event as any);
        expect(fetchSpy).toHaveBeenCalledOnce();
      }
    });

    it("does not send when window is undefined (SSR)", () => {
      vi.stubGlobal("window", undefined);
      trackProduct("plan_add");
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("getEventId fallback", () => {
    it("generates fallback event id when crypto.randomUUID is unavailable", () => {
      vi.stubGlobal("crypto", {});
      track("page_view");

      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.eventId).toMatch(/^e_\d+_[a-z0-9]+$/);
    });
  });
});
