import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFrom = vi.fn();
const mockSupabase = {
  from: mockFrom,
};

vi.mock("./supabase", () => ({
  getSupabase: () => mockSupabase,
}));

import {
  getSubscribersForTripCountdown,
  markPushSent,
  deletePushSubscription,
  getSubscribersForWeatherDigest,
  markWeatherPushSent,
} from "./push-subscriptions";

function chainMock(data: unknown[] | null = [], error: unknown = null) {
  const result = { data, error };
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.in = vi.fn().mockResolvedValue(result);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.delete = vi.fn().mockReturnValue(chain);
  return chain;
}

describe("getSubscribersForTripCountdown", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Need to import afterEach
  it("returns filtered subscribers not yet notified today", async () => {
    const rows = [
      {
        id: "1",
        client_id: "c1",
        subscription: { endpoint: "e", keys: { p256dh: "p", auth: "a" } },
        trip_start_date: "2026-03-21",
        push_trip_countdown: true,
        last_push_at: null,
      },
      {
        id: "2",
        client_id: "c2",
        subscription: { endpoint: "e", keys: { p256dh: "p", auth: "a" } },
        trip_start_date: "2026-03-22",
        push_trip_countdown: true,
        last_push_at: "2026-03-20T08:00:00Z", // already sent today
      },
    ];
    const chain = chainMock(rows);
    // Override .in to resolveValue
    chain.in = vi.fn().mockResolvedValue({ data: rows, error: null });
    mockFrom.mockReturnValue(chain);

    const result = await getSubscribersForTripCountdown();
    // row 2 was sent today so filtered out
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("returns empty array on query error", async () => {
    const chain = chainMock(null, { message: "db error" });
    chain.in = vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } });
    mockFrom.mockReturnValue(chain);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await getSubscribersForTripCountdown();
    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });
});

describe("markPushSent", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("calls update on the push_subscriptions table", async () => {
    const chain = chainMock();
    chain.eq = vi.fn().mockResolvedValue({ error: null });
    chain.update = vi.fn().mockReturnValue(chain);
    mockFrom.mockReturnValue(chain);

    await markPushSent("sub-1");
    expect(mockFrom).toHaveBeenCalledWith("push_subscriptions");
    expect(chain.update).toHaveBeenCalled();
    expect(chain.eq).toHaveBeenCalledWith("id", "sub-1");
  });
});

describe("deletePushSubscription", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("calls delete on the push_subscriptions table", async () => {
    const chain = chainMock();
    chain.eq = vi.fn().mockResolvedValue({ error: null });
    chain.delete = vi.fn().mockReturnValue(chain);
    mockFrom.mockReturnValue(chain);

    await deletePushSubscription("sub-1");
    expect(mockFrom).toHaveBeenCalledWith("push_subscriptions");
    expect(chain.delete).toHaveBeenCalled();
  });
});

describe("getSubscribersForWeatherDigest", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns subscribers not sent in last 6 hours", async () => {
    const rows = [
      {
        id: "1",
        client_id: "c1",
        subscription: { endpoint: "e", keys: { p256dh: "p", auth: "a" } },
        trip_start_date: null,
        push_trip_countdown: false,
        push_weather_digest: true,
        last_push_at: null,
        last_weather_push_at: null,
      },
      {
        id: "2",
        client_id: "c2",
        subscription: { endpoint: "e", keys: { p256dh: "p", auth: "a" } },
        trip_start_date: null,
        push_trip_countdown: false,
        push_weather_digest: true,
        last_push_at: null,
        last_weather_push_at: "2026-03-20T10:00:00Z", // 2 hours ago, within 6h window
      },
    ];

    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockResolvedValue({ data: rows, error: null });
    mockFrom.mockReturnValue(chain);

    const result = await getSubscribersForWeatherDigest();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("returns empty array on error", async () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockResolvedValue({ data: null, error: { message: "err" } });
    mockFrom.mockReturnValue(chain);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await getSubscribersForWeatherDigest();
    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });
});

describe("markWeatherPushSent", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("calls update with weather push timestamp", async () => {
    const chain = chainMock();
    chain.eq = vi.fn().mockResolvedValue({ error: null });
    chain.update = vi.fn().mockReturnValue(chain);
    mockFrom.mockReturnValue(chain);

    await markWeatherPushSent("sub-2");
    expect(mockFrom).toHaveBeenCalledWith("push_subscriptions");
    expect(chain.update).toHaveBeenCalled();
  });
});
