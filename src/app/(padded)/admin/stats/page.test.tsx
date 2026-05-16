/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminStatsPage from "./page";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values?.error ? `${key}:${String(values.error)}` : key,
}));

vi.mock("@/components/BackLink", () => ({
  default: ({ label }: { label: string }) => <span>{label}</span>,
}));

describe("AdminStatsPage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("exchanges the admin key for an HttpOnly session instead of storing the raw secret", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      if (input === "/api/admin/session" && init?.method !== "POST") {
        return Promise.resolve(new Response(null, { status: 401 }));
      }
      if (input === "/api/admin/session" && init?.method === "POST") {
        return Promise.resolve(Response.json({ ok: true }));
      }
      if (input === "/api/stats") {
        return Promise.resolve(
          Response.json({
            bookingsThisMonth: 0,
            partnerRevenueEur: 0,
            partnerRevenueByWinery: [],
            funnel: [],
            storage: "supabase",
          })
        );
      }
      return Promise.resolve(Response.json({ ok: true }));
    });

    render(<AdminStatsPage />);

    await screen.findByRole("button", { name: "key.submit" });
    fireEvent.change(screen.getByLabelText("key.aria"), { target: { value: "secret-value" } });
    fireEvent.click(screen.getByRole("button", { name: "key.submit" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/session",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ secret: "secret-value" }),
        })
      );
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/stats",
        expect.objectContaining({ credentials: "include" })
      );
    });

    const statsCall = fetchMock.mock.calls.find(([input]) => input === "/api/stats");
    expect((statsCall?.[1] as RequestInit | undefined)?.headers).toBeUndefined();
    expect(sessionStorage.getItem("cyprus-admin-key")).toBeNull();
  });
});
