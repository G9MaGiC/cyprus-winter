/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import WebVitalsReporter from "@/components/WebVitalsReporter";
import { COOKIE_CONSENT_KEY } from "@/lib/cookie-consent";

const callbacks = vi.hoisted(() => [] as Array<(metric: { name: string; value: number; rating: string }) => void>);

vi.mock("web-vitals", () => ({
  onCLS: (cb: (metric: { name: string; value: number; rating: string }) => void) => callbacks.push(cb),
  onFCP: (cb: (metric: { name: string; value: number; rating: string }) => void) => callbacks.push(cb),
  onLCP: (cb: (metric: { name: string; value: number; rating: string }) => void) => callbacks.push(cb),
  onINP: (cb: (metric: { name: string; value: number; rating: string }) => void) => callbacks.push(cb),
  onTTFB: (cb: (metric: { name: string; value: number; rating: string }) => void) => callbacks.push(cb),
}));

describe("WebVitalsReporter", () => {
  beforeEach(() => {
    callbacks.length = 0;
    localStorage.clear();
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(null, { status: 204 }))));
  });

  it("does not throw when sessionStorage is blocked", () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "all");
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: {
        getItem: () => {
          throw new DOMException("Blocked", "SecurityError");
        },
        setItem: () => {
          throw new DOMException("Blocked", "SecurityError");
        },
      },
    });

    render(<WebVitalsReporter />);

    expect(() => callbacks[0]({ name: "LCP", value: 123.4567, rating: "good" })).not.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
