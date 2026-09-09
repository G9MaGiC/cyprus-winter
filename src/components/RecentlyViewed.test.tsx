/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, fireEvent } from "@testing-library/react";
import { RecentlyViewedStrip } from "./RecentlyViewed";

/**
 * The home-mounted strip is storage-gated, so a broken mount or a broken
 * read renders nothing and looks identical to "no history" — pin both
 * directions (batch 72; the batch-66 wire shipped without a guard).
 */

afterEach(() => {
  cleanup();
  localStorage.clear();
});

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
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

function seed() {
  localStorage.setItem(
    "cyprus-recently-viewed",
    JSON.stringify([
      {
        id: "omodos",
        name: "Omodos",
        type: "village",
        region: "Limassol",
        viewedAt: new Date().toISOString(),
      },
    ])
  );
}

describe("RecentlyViewedStrip", () => {
  it("renders the visited place for a returning visitor", async () => {
    seed();
    render(<RecentlyViewedStrip />);
    await waitFor(() => expect(screen.getByText("Omodos")).toBeDefined());
    expect(screen.getByRole("link", { name: /Omodos/ }).getAttribute("href")).toBe(
      "/discover/omodos"
    );
  });

  it("renders nothing for a fresh visitor", async () => {
    const { container } = render(<RecentlyViewedStrip />);
    // The isClient effect must settle before "empty" means anything.
    await waitFor(() => expect(container.innerHTML).toBe(""));
  });

  it("clear empties the strip and the storage", async () => {
    seed();
    render(<RecentlyViewedStrip />);
    await waitFor(() => expect(screen.getByText("Omodos")).toBeDefined());
    fireEvent.click(screen.getByRole("button", { name: "aria.clearRecentlyViewed" }));
    await waitFor(() => expect(screen.queryByText("Omodos")).toBeNull());
    expect(localStorage.getItem("cyprus-recently-viewed")).toBeNull();
  });
});
