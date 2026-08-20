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
    expect(analytics.trackProduct).toHaveBeenCalledWith("trail_view", { trail_id: "artemis" });
  });

  it("does not record trail_view on the trails index or report form", () => {
    nav.pathname = "/trails";
    const { rerender } = render(<ConversionTracker />);
    expect(analytics.trackProduct).not.toHaveBeenCalled();

    nav.pathname = "/trails/artemis/report";
    rerender(<ConversionTracker />);
    expect(analytics.trackProduct).not.toHaveBeenCalled();
  });
});
