import { describe, it, expect } from "vitest";
import { mergeBookings } from "./bookings-storage";
import type { Booking } from "./bookings";

function booking(overrides: Partial<Booking> & { id: string; createdAt: string }): Booking {
  return {
    type: "winery_tasting",
    providerId: "tsiakkas",
    providerName: "Tsiakkas",
    date: "2026-03-15",
    partySize: 2,
    guestEmail: "test@example.com",
    guestName: "Test",
    status: "pending",
    ...overrides,
  };
}

describe("mergeBookings", () => {
  it("returns empty array when both local and api are empty", () => {
    expect(mergeBookings([], [])).toEqual([]);
  });

  it("returns api bookings sorted when local is empty", () => {
    const api = [
      booking({ id: "b1", createdAt: "2026-03-10T10:00:00Z" }),
      booking({ id: "b2", createdAt: "2026-03-12T10:00:00Z" }),
    ];
    const result = mergeBookings([], api);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("b2");
    expect(result[1].id).toBe("b1");
  });

  it("returns local bookings sorted when api is empty", () => {
    const local = [
      booking({ id: "b1", createdAt: "2026-03-12T10:00:00Z" }),
      booking({ id: "b2", createdAt: "2026-03-10T10:00:00Z" }),
    ];
    const result = mergeBookings(local, []);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("b1");
    expect(result[1].id).toBe("b2");
  });

  it("dedupes by id with API winning when overlap", () => {
    const local = [
      booking({
        id: "b1",
        guestName: "Local",
        status: "pending",
        createdAt: "2026-03-12T10:00:00Z",
      }),
    ];
    const api = [
      booking({
        id: "b1",
        guestName: "API",
        status: "confirmed",
        createdAt: "2026-03-12T10:00:00Z",
      }),
    ];
    const result = mergeBookings(local, api);
    expect(result).toHaveLength(1);
    expect(result[0].guestName).toBe("API");
    expect(result[0].status).toBe("confirmed");
  });

  it("keeps local-only bookings that are not on the API", () => {
    const local = [
      booking({ id: "local-only", status: "pending", createdAt: "2026-03-11T10:00:00Z" }),
    ];
    const api = [
      booking({ id: "api-only", status: "confirmed", createdAt: "2026-03-12T10:00:00Z" }),
    ];
    const result = mergeBookings(local, api);
    expect(result.map((b) => b.id)).toEqual(["api-only", "local-only"]);
  });

  it("merges different ids and sorts by createdAt descending", () => {
    const local = [booking({ id: "b1", createdAt: "2026-03-11T10:00:00Z" })];
    const api = [
      booking({ id: "b2", createdAt: "2026-03-12T10:00:00Z" }),
      booking({ id: "b3", createdAt: "2026-03-10T10:00:00Z" }),
    ];
    const result = mergeBookings(local, api);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe("b2");
    expect(result[1].id).toBe("b1");
    expect(result[2].id).toBe("b3");
  });
});
