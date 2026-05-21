/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from "vitest";
import { getCookieConsent, setCookieConsent } from "./cookie-consent";

function blockLocalStorage() {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: vi.fn(() => {
        throw new DOMException("blocked", "SecurityError");
      }),
      setItem: vi.fn(() => {
        throw new DOMException("blocked", "SecurityError");
      }),
      removeItem: vi.fn(() => {
        throw new DOMException("blocked", "SecurityError");
      }),
    },
  });
}

describe("cookie consent storage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("treats blocked localStorage as no saved consent", () => {
    blockLocalStorage();

    expect(getCookieConsent()).toBeNull();
  });

  it("still notifies subscribers when localStorage rejects the consent write", () => {
    blockLocalStorage();
    const listener = vi.fn();
    window.addEventListener("cookie-consent-change", listener);

    expect(() => setCookieConsent("essential")).not.toThrow();
    expect(listener).toHaveBeenCalledTimes(1);

    window.removeEventListener("cookie-consent-change", listener);
  });
});
