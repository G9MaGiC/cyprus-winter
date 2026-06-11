/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { track, trackProduct } from "@/lib/analytics";

describe("analytics storage guards", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(null, { status: 204 }))));
  });

  it("does not throw when sessionStorage is blocked for product events", () => {
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

    expect(() => trackProduct("plan_view", { item_count: 1 })).not.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not throw when localStorage is blocked for consent checks", () => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: () => {
          throw new DOMException("Blocked", "SecurityError");
        },
      },
    });

    expect(() => track("first_add_to_plan", { count: 1 })).not.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });
});
