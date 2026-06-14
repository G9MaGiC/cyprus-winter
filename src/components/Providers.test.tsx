/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import Providers from "./Providers";

const renderOfflineQueue = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/components/OfflineQueueProcessor", () => ({
  default: () => {
    renderOfflineQueue();
    return null;
  },
}));

describe("Providers", () => {
  beforeEach(() => {
    renderOfflineQueue.mockClear();
  });

  it("can disable the offline queue processor for nested provider trees", () => {
    render(
      <Providers includeOnboarding={false} includeOfflineQueue={false}>
        <div>Nested locale tree</div>
      </Providers>
    );

    expect(renderOfflineQueue).not.toHaveBeenCalled();
  });
});
