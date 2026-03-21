import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCookieConsent,
  setCookieConsent,
  hasAnalyticsConsent,
  COOKIE_CONSENT_KEY,
} from "./cookie-consent";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _reset: () => { store = {}; },
  };
})();

const dispatchEventMock = vi.fn();

beforeEach(() => {
  localStorageMock._reset();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  dispatchEventMock.mockClear();
  vi.stubGlobal("window", {
    localStorage: localStorageMock,
    dispatchEvent: dispatchEventMock,
    CustomEvent: class CustomEvent {
      type: string;
      detail: any;
      constructor(type: string, opts: any) {
        this.type = type;
        this.detail = opts?.detail;
      }
    },
  });
  vi.stubGlobal("localStorage", localStorageMock);
  vi.stubGlobal("CustomEvent", (globalThis as any).window.CustomEvent);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("COOKIE_CONSENT_KEY", () => {
  it("has the expected value", () => {
    expect(COOKIE_CONSENT_KEY).toBe("cyprus-winter:cookie-consent");
  });
});

describe("getCookieConsent", () => {
  it("returns null when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    expect(getCookieConsent()).toBeNull();
  });

  it("returns null when no consent stored", () => {
    expect(getCookieConsent()).toBeNull();
  });

  it('returns "all" when stored', () => {
    localStorageMock.setItem(COOKIE_CONSENT_KEY, "all");
    expect(getCookieConsent()).toBe("all");
  });

  it('returns "essential" when stored', () => {
    localStorageMock.setItem(COOKIE_CONSENT_KEY, "essential");
    expect(getCookieConsent()).toBe("essential");
  });

  it("returns null for invalid stored value", () => {
    localStorageMock.setItem(COOKIE_CONSENT_KEY, "invalid");
    expect(getCookieConsent()).toBeNull();
  });
});

describe("setCookieConsent", () => {
  it("stores the value in localStorage", () => {
    setCookieConsent("all");
    expect(localStorageMock.setItem).toHaveBeenCalledWith(COOKIE_CONSENT_KEY, "all");
  });

  it("dispatches cookie-consent-change event", () => {
    setCookieConsent("essential");
    expect(dispatchEventMock).toHaveBeenCalledTimes(1);
    const event = dispatchEventMock.mock.calls[0][0];
    expect(event.type).toBe("cookie-consent-change");
    expect(event.detail).toBe("essential");
  });

  it("is a no-op when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    // Should not throw
    setCookieConsent("all");
  });
});

describe("hasAnalyticsConsent", () => {
  it("returns true when consent is all", () => {
    localStorageMock.setItem(COOKIE_CONSENT_KEY, "all");
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it("returns false when consent is essential", () => {
    localStorageMock.setItem(COOKIE_CONSENT_KEY, "essential");
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it("returns false when no consent stored", () => {
    expect(hasAnalyticsConsent()).toBe(false);
  });
});
