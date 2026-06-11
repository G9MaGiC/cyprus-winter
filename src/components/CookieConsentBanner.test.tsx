/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type React from "react";
import CookieConsentBanner from "@/components/CookieConsentBanner";

vi.mock("@/components/AppLink", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const messages = {
  common: {
    cookies: {
      title: "Cookies",
      body: "We use cookies.",
      learnMore: "Learn more",
      essentialOnly: "Essential only",
      essentialShort: "Essential",
      accept: "Accept",
    },
  },
};

function renderBanner() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <CookieConsentBanner />
    </NextIntlClientProvider>
  );
}

describe("CookieConsentBanner", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    class ResizeObserverMock {
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  it("renders and dismisses without crashing when localStorage is blocked", async () => {
    Object.defineProperty(window, "localStorage", {
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

    expect(() => renderBanner()).not.toThrow();
    expect(screen.getByRole("dialog", { name: /cookies/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /essential only/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /cookies/i })).toBeNull();
    });
  });
});
