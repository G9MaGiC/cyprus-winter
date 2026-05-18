/** @vitest-environment jsdom */
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OfflineQueueProcessor from "./OfflineQueueProcessor";
import { processQueue } from "@/lib/offline-queue";

vi.mock("@/lib/offline-queue", () => ({
  processQueue: vi.fn(() => Promise.resolve({ processed: 0, succeeded: 0 })),
}));

describe("OfflineQueueProcessor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  it("drains persisted mutations on mount when the app starts online", async () => {
    render(<OfflineQueueProcessor />);

    await waitFor(() => expect(processQueue).toHaveBeenCalledTimes(1));
  });
});
