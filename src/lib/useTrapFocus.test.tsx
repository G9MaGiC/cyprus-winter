// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

afterEach(cleanup);
import { useRef } from "react";
import { FOCUSABLE_SELECTOR, useTrapFocus } from "@/lib/useTrapFocus";

/**
 * First coverage for the shared focus trap (batch 67, the safe slice of the
 * deferred consolidation): Tab wraps last→first, Shift+Tab wraps
 * first→last, Escape fires the callback, and the shared selector excludes
 * disabled controls so the cycle can never strand on one.
 */

function Dialog({ onEscape }: { onEscape?: () => void }) {
  const trap = useTrapFocus();
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      role="dialog"
      ref={ref}
      onKeyDown={(e) => trap(e, ref.current, onEscape)}
    >
      <button>first</button>
      <a href="https://example.com">middle</a>
      <button disabled>disabled</button>
      <button>last</button>
    </div>
  );
}

describe("useTrapFocus", () => {
  it("Tab on the last focusable wraps to the first", () => {
    render(<Dialog />);
    const dialog = screen.getByRole("dialog");
    const last = screen.getByRole("button", { name: "last" });
    last.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "first" })
    );
  });

  it("Shift+Tab on the first focusable wraps to the last (skipping the disabled button)", () => {
    render(<Dialog />);
    const dialog = screen.getByRole("dialog");
    const first = screen.getByRole("button", { name: "first" });
    first.focus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "last" })
    );
  });

  it("Tab in the middle of the cycle is left to the browser", () => {
    render(<Dialog />);
    const dialog = screen.getByRole("dialog");
    const middle = screen.getByRole("link", { name: "middle" });
    middle.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(middle);
  });

  it("Escape fires the callback", () => {
    const onEscape = vi.fn();
    render(<Dialog onEscape={onEscape} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("the shared selector excludes disabled controls and includes inputs", () => {
    const host = document.createElement("div");
    host.innerHTML =
      '<button disabled>d</button><input /><input disabled /><a href="/x">a</a><span tabindex="0">s</span><span tabindex="-1">n</span>';
    const matched = Array.from(host.querySelectorAll(FOCUSABLE_SELECTOR));
    expect(matched.map((el) => el.tagName.toLowerCase() + (el.getAttribute("tabindex") ?? ""))).toEqual([
      "input",
      "a",
      "span0",
    ]);
  });
});
