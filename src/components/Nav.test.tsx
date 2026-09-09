/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Nav from "./Nav";

/**
 * Characterization tests for Nav's two manual focus traps (batch 70): the
 * behavior below is the contract any future consolidation onto a shared
 * hook must preserve — including the BUG-359 guard, the regression that
 * made consolidation risky in the first place.
 */

afterEach(cleanup);

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/components/AppLink", () => ({
  default: (
    props: React.ComponentProps<"a"> & { prefetch?: boolean; locale?: string }
  ) => {
    const { prefetch, locale, children, ...rest } = props;
    void prefetch;
    void locale;
    return <a {...rest}>{children}</a>;
  },
}));

vi.mock("@/components/LocaleLinks", () => ({
  default: ({ onNavigate }: { onNavigate?: () => void }) => (
    <a href="https://example.com/el" onClick={onNavigate}>
      locale-switch
    </a>
  ),
}));

vi.mock("./AIAssistantTrigger", () => ({
  default: () => null,
  triggerAIAssistant: vi.fn(),
}));

function openMobileMenu() {
  fireEvent.click(screen.getByRole("button", { name: "openMenu" }));
  const menu = document.getElementById("mobile-menu");
  if (!menu) throw new Error("mobile menu did not open");
  return menu;
}

function openMoreMenu() {
  fireEvent.click(screen.getByRole("button", { name: "more" }));
  const menu = document.getElementById("more-menu");
  if (!menu) throw new Error("more menu did not open");
  return menu;
}

describe("Nav mobile menu trap", () => {
  it("moves initial focus into the menu and wraps Tab in both directions", () => {
    render(<Nav />);
    const menu = openMobileMenu();
    const focusables = Array.from(menu.querySelectorAll<HTMLElement>("a, button"));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    expect(document.activeElement).toBe(first);

    last.focus();
    fireEvent.keyDown(menu, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(menu, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("Escape closes the menu and restores focus to the hamburger", async () => {
    render(<Nav />);
    openMobileMenu();
    const hamburger = screen.getByRole("button", { name: "closeMenu" });

    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.getElementById("mobile-menu")).toBeNull();
    // Restore is deferred a frame (requestAnimationFrame in closeMobileMenu).
    await waitFor(() => expect(document.activeElement).toBe(hamburger));
  });

  it("Escape with both menus closed does not move focus (BUG-359 guard)", async () => {
    render(
      <>
        <button type="button">outside</button>
        <Nav />
      </>
    );
    const outside = screen.getByRole("button", { name: "outside" });
    outside.focus();

    fireEvent.keyDown(window, { key: "Escape" });
    // Give a stray deferred restore a frame to (wrongly) run before asserting.
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    expect(document.activeElement).toBe(outside);
  });
});

describe("Nav desktop More menu trap", () => {
  it("moves initial focus into the menu and wraps Tab in both directions", () => {
    render(<Nav />);
    const menu = openMoreMenu();
    const focusables = Array.from(menu.querySelectorAll<HTMLElement>("a, button"));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    expect(document.activeElement).toBe(first);

    last.focus();
    fireEvent.keyDown(menu, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(menu, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("Escape closes the menu and restores focus to the More button", async () => {
    render(<Nav />);
    openMoreMenu();
    const moreButton = screen.getByRole("button", { name: "more" });

    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.getElementById("more-menu")).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(moreButton));
  });
});
