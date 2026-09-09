/** @vitest-environment jsdom */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { AIAssistant } from "./AIAssistant";

/**
 * Characterization tests for the AIAssistant trap (batch 70). Two behaviors
 * here are exactly why migrating this dialog onto the shared hook is risky,
 * so they are pinned: the keydown listener lives on document (Escape must
 * work even when activeElement is <body> — the initial-focus fallback can
 * leave it there), and close restores focus through a bespoke chain
 * (previously focused element, else the first visible nav trigger).
 */

afterEach(cleanup);

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("./hooks/useAIChat", () => ({
  useAIChat: () => ({
    messages: [],
    input: "",
    setInput: vi.fn(),
    loading: false,
    suggestions: [],
    sendMessage: vi.fn(),
    clearChat: vi.fn(),
  }),
}));

vi.mock("./AIChatMessages", () => ({
  AIChatMessages: () => <div />,
}));

vi.mock("./AIChatInput", () => ({
  AIChatInput: () => (
    <div>
      <input aria-label="chat input" />
      <button type="button">send</button>
    </div>
  ),
}));

vi.mock("lucide-react", () => ({
  X: () => null,
}));

// jsdom's offsetParent is always null; the close-fallback uses it as a
// visibility probe, so approximate it: display:none → null (invisible),
// otherwise the parent. The shim must not flatten the very distinction the
// fallback exists to make (skip the hidden desktop trigger, land on the
// visible hamburger) — and it is restored afterAll so it can never leak
// into another suite if per-file isolation is ever turned off.
const originalOffsetParent = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "offsetParent"
);
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetParent", {
    configurable: true,
    get() {
      const el = this as HTMLElement;
      return el.style.display === "none" ? null : el.parentElement;
    },
  });
});
afterAll(() => {
  if (originalOffsetParent) {
    Object.defineProperty(HTMLElement.prototype, "offsetParent", originalOffsetParent);
  }
});

function openAssistant() {
  act(() => {
    window.dispatchEvent(new Event("open-ai-assistant"));
  });
  return screen.getByRole("dialog");
}

describe("AIAssistant trap", () => {
  it("opens on the trigger event and moves initial focus to the first focusable", async () => {
    render(<AIAssistant />);
    openAssistant();
    // Deferred a frame; first match of the shared selector is the clear button.
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "ai.clear" }))
    );
  });

  it("Escape closes even when focus is on <body> (document-level listener)", async () => {
    render(<AIAssistant />);
    openAssistant();
    await waitFor(() => expect(document.activeElement).not.toBe(document.body));

    (document.activeElement as HTMLElement).blur();
    expect(document.activeElement).toBe(document.body);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("wraps Tab in both directions through the panel", async () => {
    render(<AIAssistant />);
    openAssistant();
    await waitFor(() => expect(document.activeElement).not.toBe(document.body));
    const first = screen.getByRole("button", { name: "ai.clear" });
    const last = screen.getByRole("button", { name: "send" });

    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("close restores focus to the previously focused element", async () => {
    render(
      <>
        <button type="button">trigger</button>
        <AIAssistant />
      </>
    );
    const trigger = screen.getByRole("button", { name: "trigger" });
    trigger.focus();
    openAssistant();
    await waitFor(() => expect(document.activeElement).not.toBe(trigger));

    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);
  });

  it("falls back to the first visible nav trigger when the opener unmounted", async () => {
    function Harness() {
      const [showTrigger, setShowTrigger] = useState(true);
      return (
        <>
          <nav>
            {/* Mirrors the real Nav: the desktop More button matches the
                fallback's selector first but is display:none on mobile —
                the fallback must skip it for the visible hamburger. */}
            <button type="button" aria-expanded="false" style={{ display: "none" }}>
              desktop more
            </button>
            <button type="button" aria-expanded="false">
              hamburger
            </button>
          </nav>
          {showTrigger && <button type="button">trigger</button>}
          <button type="button" onClick={() => setShowTrigger(false)}>
            unmount trigger
          </button>
          <AIAssistant />
        </>
      );
    }
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "trigger" });
    trigger.focus();
    openAssistant();
    await waitFor(() => expect(document.activeElement).not.toBe(trigger));

    // The opener disappears (e.g. drawer opened from the mobile menu, which
    // closes itself) before the dialog is dismissed.
    fireEvent.click(screen.getByRole("button", { name: "unmount trigger" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "hamburger" })
    );
  });
});
