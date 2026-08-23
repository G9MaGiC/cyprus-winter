/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActionButtons } from "./ActionButtons";

const push = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("ActionButtons", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("save_to_plan navigates with ?add= when placeId is in payload", () => {
    render(
      <ActionButtons
        actions={[
          { type: "save_to_plan", label: "Add to plan", payload: { placeId: "artemis" } },
        ]}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Add to plan" }));
    expect(push).toHaveBeenCalledWith("/plan?add=artemis");
  });

  it("save_to_plan uses payload.path when provided", () => {
    render(
      <ActionButtons
        actions={[
          { type: "save_to_plan", label: "Add", payload: { path: "/plan?add=omodos" } },
        ]}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(push).toHaveBeenCalledWith("/plan?add=omodos");
  });

  it("save_to_plan falls back to /plan without id", () => {
    render(
      <ActionButtons actions={[{ type: "save_to_plan", label: "Open plan" }]} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Open plan" }));
    expect(push).toHaveBeenCalledWith("/plan");
  });
});
