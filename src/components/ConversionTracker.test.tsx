/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import ConversionTracker from "./ConversionTracker";

const nav = vi.hoisted(() => ({
  pathname: "/trails/artemis",
  search: new URLSearchParams(),
}));

const analytics = vi.hoisted(() => ({
  track: vi.fn(),
  trackProduct: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  track: analytics.track,
  trackProduct: analytics.trackProduct,
}));

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => nav.pathname,
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => nav.search,
}));

describe("ConversionTracker trail_view", () => {
  beforeEach(() => {
    nav.pathname = "/trails/artemis";
    nav.search = new URLSearchParams();
    analytics.track.mockClear();
    analytics.trackProduct.mockClear();
  });

  it("records trail_view for a known trail detail without marketing consent", () => {
    render(<ConversionTracker />);
    expect(analytics.trackProduct).toHaveBeenCalledWith("page_view", { path: "/trails/artemis" });
    expect(analytics.trackProduct).toHaveBeenCalledWith("trail_view", { trail_id: "artemis" });
  });

  it("does not record trail_view on the trails index or report form", () => {
    nav.pathname = "/trails";
    const { rerender } = render(<ConversionTracker />);
    expect(analytics.trackProduct).toHaveBeenCalledWith("page_view", { path: "/trails" });
    expect(analytics.trackProduct).not.toHaveBeenCalledWith("trail_view", expect.anything());

    analytics.trackProduct.mockClear();
    nav.pathname = "/trails/artemis/report";
    rerender(<ConversionTracker />);
    expect(analytics.trackProduct).toHaveBeenCalledWith("page_view", { path: "/trails/artemis/report" });
    expect(analytics.trackProduct).not.toHaveBeenCalledWith("trail_view", expect.anything());
  });
});

describe("ConversionTracker discover_filter", () => {
  beforeEach(() => {
    nav.pathname = "/discover";
    nav.search = new URLSearchParams("filter=accessible");
    analytics.track.mockClear();
    analytics.trackProduct.mockClear();
  });

  it("records first-party discover_view and discover_filter", () => {
    render(<ConversionTracker />);
    expect(analytics.trackProduct).toHaveBeenCalledWith("discover_view", { filter: "accessible" });
    expect(analytics.trackProduct).toHaveBeenCalledWith("discover_filter", { filter: "accessible" });
  });
});

describe("ConversionTracker winery_detail_view", () => {
  beforeEach(() => {
    nav.pathname = "/discover/tsiakkas";
    nav.search = new URLSearchParams();
    analytics.track.mockClear();
    analytics.trackProduct.mockClear();
  });

  it("records winery_detail_view without marketing consent", () => {
    render(<ConversionTracker />);
    expect(analytics.trackProduct).toHaveBeenCalledWith("page_view", { path: "/discover/tsiakkas" });
    expect(analytics.trackProduct).toHaveBeenCalledWith("winery_detail_view", { placeId: "tsiakkas" });
    expect(analytics.track).not.toHaveBeenCalled();
  });
});
