/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import HubFooter from "./HubFooter";
import { OPEN_AI_EVENT } from "./AIAssistantTrigger";

vi.mock("next/navigation", () => ({
  usePathname: () => "/wineries",
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/analytics", () => ({
  track: vi.fn(),
  trackProduct: vi.fn(),
}));

const messages = {
  common: {
    planYourTrip: "Plan your trip",
    askAI: "Ask AI",
    askAITrailsAria: "Ask AI for trail suggestions",
  },
};

function renderFooter(props: Partial<React.ComponentProps<typeof HubFooter>> = {}) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <HubFooter body="Build a day around this hub." ariaLabel="Hub actions" {...props} />
    </NextIntlClientProvider>
  );
}

describe("HubFooter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders Plan CTA with optional E2E test id", () => {
    renderFooter({ primaryTestId: "hub-plan-cta" });
    const plan = screen.getByTestId("hub-plan-cta");
    expect(plan.getAttribute("href")).toBe("/plan");
    expect(plan.textContent).toContain("Plan your trip");
  });

  it("dispatches OPEN_AI_EVENT when Ask AI is clicked", () => {
    const spy = vi.fn();
    window.addEventListener(OPEN_AI_EVENT, spy);
    renderFooter();
    fireEvent.click(screen.getByRole("button", { name: "Ask AI for trail suggestions" }));
    expect(spy).toHaveBeenCalledTimes(1);
    window.removeEventListener(OPEN_AI_EVENT, spy);
  });

  it("hides Ask AI when showAskAi is false", () => {
    renderFooter({ showAskAi: false });
    expect(screen.queryByRole("button", { name: "Ask AI for trail suggestions" })).toBeNull();
    expect(screen.getByRole("link", { name: "Plan your trip" })).toBeTruthy();
  });
});
