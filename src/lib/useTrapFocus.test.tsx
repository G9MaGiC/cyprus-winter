// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

afterEach(cleanup);
import { useRef, useState } from "react";
import { FOCUSABLE_SELECTOR, useFocusTrap, useTrapFocus } from "@/lib/useTrapFocus";

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

function Sheet({ onEscape }: { onEscape: () => void }) {
  const [open, setOpen] = useState(false);
  const [extra, setExtra] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap({ active: open, containerRef: ref, onEscape });
  return (
    <div>
      <button onClick={() => setOpen(true)}>open</button>
      <button onClick={() => setExtra(true)}>add</button>
      {open && (
        <div role="group" aria-label="sheet" ref={ref}>
          <button>first</button>
          <button>last</button>
          {extra && <button>extra</button>}
        </div>
      )}
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

  it("useFocusTrap: focuses the first focusable on activation and wraps Tab both ways", () => {
    render(<Sheet onEscape={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    const first = screen.getByRole("button", { name: "first" });
    const last = screen.getByRole("button", { name: "last" });
    expect(document.activeElement).toBe(first);

    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("useFocusTrap: re-queries focusables per keypress, so content mounted after open joins the cycle", () => {
    render(<Sheet onEscape={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    fireEvent.click(screen.getByRole("button", { name: "add" }));
    const extra = screen.getByRole("button", { name: "extra" });

    extra.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    // A snapshot taken at open (the old Nav/BottomNav shape) would still
    // treat "last" as the cycle edge and leave Tab on "extra" to the browser.
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "first" }));
  });

  it("useFocusTrap: Escape reaches onEscape even with focus outside the container", () => {
    const onEscape = vi.fn();
    render(<Sheet onEscape={onEscape} />);
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    (document.activeElement as HTMLElement).blur();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("useFocusTrap: registers its keydown listener only while active (the BUG-359 shape, structurally)", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const onEscape = vi.fn();
    render(<Sheet onEscape={onEscape} />);
    const keydownAdds = () =>
      addSpy.mock.calls.filter(([type]) => type === "keydown").length;
    // Not merely "Escape does nothing while closed" — no listener EXISTS,
    // so the guard cannot be deleted without this failing.
    expect(keydownAdds()).toBe(0);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onEscape).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    expect(keydownAdds()).toBe(1);
    addSpy.mockRestore();
  });

  it("useFocusTrap: an inline (unstable) onEscape neither re-steals focus nor goes stale", () => {
    const calls: string[] = [];
    const { rerender } = render(<Sheet onEscape={() => calls.push("first")} />);
    fireEvent.click(screen.getByRole("button", { name: "open" }));
    const last = screen.getByRole("button", { name: "last" });
    last.focus();
    // A parent re-render hands the hook a brand-new callback identity.
    rerender(<Sheet onEscape={() => calls.push("second")} />);
    // The trap effect must not re-fire and yank focus back to "first"...
    expect(document.activeElement).toBe(last);
    // ...and Escape must still reach the LATEST callback, not a stale one.
    fireEvent.keyDown(document, { key: "Escape" });
    expect(calls).toEqual(["second"]);
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
