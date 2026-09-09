/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FOCUSABLE_SELECTOR } from "@/lib/useTrapFocus";
import BottomNav from "./BottomNav";

/**
 * Characterization tests for the BottomNav "More" sheet trap (batch 70).
 * Pins the two close paths' deliberate asymmetry: Escape restores focus to
 * the trigger synchronously, outside tap closes WITHOUT restoring (yanking
 * focus back mid-pointer-interaction fights the user).
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

vi.mock("@/contexts/StickyPlanBarContext", () => ({
  useStickyPlanBar: () => ({
    stickyPlanVisible: false,
    setStickyPlanVisible: vi.fn(),
  }),
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

vi.mock("lucide-react", () => ({
  CalendarDays: () => null,
  Compass: () => null,
  Home: () => null,
  MoreHorizontal: () => null,
  Route: () => null,
}));

function openMore() {
  const trigger = screen.getByRole("button", { name: "aria.moreNavigation" });
  fireEvent.click(trigger);
  const list = screen.getByRole("list");
  const menu = list.parentElement;
  if (!menu) throw new Error("more sheet did not open");
  return { trigger, menu };
}

describe("BottomNav More sheet trap", () => {
  it("moves initial focus into the sheet and wraps Tab in both directions", () => {
    render(<BottomNav />);
    const { menu } = openMore();
    const links = Array.from(menu.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    const first = links[0];
    const last = links[links.length - 1];
    expect(document.activeElement).toBe(first);

    last.focus();
    fireEvent.keyDown(menu, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(menu, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("Escape closes the sheet and restores focus to the trigger synchronously", () => {
    render(<BottomNav />);
    const { trigger, menu } = openMore();

    fireEvent.keyDown(menu, { key: "Escape" });
    expect(screen.queryByRole("list")).toBeNull();
    // No rAF here — closeMore focuses the trigger in the same tick.
    expect(document.activeElement).toBe(trigger);
  });

  it("outside click closes the sheet without restoring focus to the trigger", () => {
    render(<BottomNav />);
    const { trigger, menu } = openMore();
    // The trap must actually be holding focus first — otherwise the
    // focus-falls-to-body assertion below passes even with no trap at all.
    expect(document.activeElement).toBe(menu.querySelector("a"));

    fireEvent.click(document.body);
    expect(screen.queryByRole("list")).toBeNull();
    // The focused link unmounted; focus falls to body, deliberately NOT the trigger.
    expect(document.activeElement).toBe(document.body);
    expect(document.activeElement).not.toBe(trigger);
  });
});
