/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import AdminStatsPage from "./page";

vi.mock("@/components/BackLink", () => ({
  default: ({ href, label }: { href: string; label: string }) => <a href={href}>{label}</a>,
}));

const messages = {
  nav: { home: "Home" },
  admin: {
    stats: {
      title: "Admin stats",
      subtitle: "Private stats",
      signOut: "Sign out",
      signOutError: "Could not sign out",
      loading: "Loading stats",
      loadError: "Could not load {error}",
      key: {
        placeholder: "Admin key",
        aria: "Admin key",
        submit: "Unlock",
        invalid: "Invalid key",
      },
      bookingsThisMonth: {
        title: "Bookings",
        total: "Total bookings",
      },
      partnerRevenueThisMonth: {
        title: "Partner revenue",
        subtitle: "Lead fees",
      },
      funnelThisMonth: {
        title: "Funnel",
        subtitle: "Conversion events",
        table: {
          event: "Event",
          count: "Count",
        },
        empty: "No events",
      },
      storage: "Storage: {storage}",
      storageUnknown: "unknown",
    },
  },
};

function renderPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <AdminStatsPage />
    </NextIntlClientProvider>
  );
}

describe("AdminStatsPage", () => {
  beforeEach(() => {
    cleanup();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("exchanges the admin secret for an HttpOnly session and does not store or send the raw secret", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            bookingsThisMonth: 0,
            partnerRevenueEur: 0,
            partnerRevenueByWinery: [],
            funnel: [],
            storage: "supabase",
          }),
          { status: 200 }
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    renderPage();

    const input = await screen.findByLabelText("Admin key");
    fireEvent.change(input, { target: { value: "test-admin-secret" } });
    fireEvent.click(screen.getByRole("button", { name: "Unlock" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/session",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ secret: "test-admin-secret" }),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/stats",
      expect.objectContaining({
        credentials: "include",
      })
    );
    expect(fetchMock.mock.calls[2][1]).not.toHaveProperty("headers");
    expect(sessionStorage.getItem("cyprus-admin-key")).toBeNull();
  });

  it("keeps the authenticated view when the HttpOnly logout request fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            bookingsThisMonth: 0,
            partnerRevenueEur: 0,
            partnerRevenueByWinery: [],
            funnel: [],
            storage: "supabase",
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response("{}", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    renderPage();

    const signOut = await screen.findByRole("button", { name: "Sign out" });
    fireEvent.click(signOut);

    await screen.findByText("Could not sign out");
    expect(screen.getByRole("button", { name: "Sign out" })).toBeTruthy();
    expect(screen.queryByLabelText("Admin key")).toBeNull();
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/admin/session",
      expect.objectContaining({ method: "DELETE", credentials: "include" })
    );
  });
});
