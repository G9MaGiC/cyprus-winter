/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import AIAssistantTrigger from "./AIAssistantTrigger";
import { AI_PULSE_SEEN_KEY } from "@/lib/local-storage-keys";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/hooks/useBlockingOverlaysActive", () => ({
  useBlockingOverlaysActive: vi.fn(() => false),
}));

const { useBlockingOverlaysActive } = await import("@/hooks/useBlockingOverlaysActive");

const memoryStore: Record<string, string> = {};

function wipeLocalStorage() {
  for (const k of Object.keys(memoryStore)) delete memoryStore[k];
}

describe("AIAssistantTrigger pulse", () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: (k: string) => memoryStore[k] ?? null,
        setItem: (k: string, v: string) => {
          memoryStore[k] = v;
        },
        removeItem: (k: string) => {
          delete memoryStore[k];
        },
        clear: () => {
          wipeLocalStorage();
        },
        get length() {
          return Object.keys(memoryStore).length;
        },
        key: () => null,
      },
    });
  });

  beforeEach(() => {
    cleanup();
    wipeLocalStorage();
    vi.mocked(useBlockingOverlaysActive).mockReturnValue(false);
  });

  it("applies ai-chat-trigger-pulse on default variant when pulse not seen", async () => {
    render(<AIAssistantTrigger />);
    const btn = screen.getByRole("button");
    await waitFor(() => {
      expect(btn.className).toContain("ai-chat-trigger-pulse");
    });
  });

  it("does not pulse when localStorage marks pulse seen", async () => {
    localStorage.setItem(AI_PULSE_SEEN_KEY, "true");
    render(<AIAssistantTrigger />);
    const btn = screen.getByRole("button");
    await waitFor(() => {
      expect(btn.className).not.toContain("ai-chat-trigger-pulse");
    });
  });

  it("does not pulse on tertiaryOnDark variant", async () => {
    render(<AIAssistantTrigger variant="tertiaryOnDark" />);
    const btn = screen.getByRole("button");
    await waitFor(() => {
      expect(btn.className).not.toContain("ai-chat-trigger-pulse");
    });
  });

  it("removes pulse and marks seen after click", async () => {
    render(<AIAssistantTrigger />);
    const btn = screen.getByRole("button");
    await waitFor(() => {
      expect(btn.className).toContain("ai-chat-trigger-pulse");
    });
    fireEvent.click(btn);
    expect(btn.className).not.toContain("ai-chat-trigger-pulse");
    expect(localStorage.getItem(AI_PULSE_SEEN_KEY)).toBe("true");
  });

  it("does not pulse while blocking overlay is active", async () => {
    vi.mocked(useBlockingOverlaysActive).mockReturnValue(true);
    render(<AIAssistantTrigger />);
    const btn = screen.getByRole("button");
    await waitFor(() => {
      expect(btn.className).not.toContain("ai-chat-trigger-pulse");
    });
  });
});
