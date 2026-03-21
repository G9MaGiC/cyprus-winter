import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("weather-live", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T12:00:00Z"));
    mockFetch.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function makeWeatherResponse(min: number, max: number, precip = 0) {
    return {
      ok: true,
      json: () =>
        Promise.resolve({
          daily: {
            temperature_2m_min: [min],
            temperature_2m_max: [max],
            precipitation_sum: [precip],
          },
        }),
    };
  }

  describe("getLiveWeather", () => {
    it("fetches coast and troodos weather and returns rounded values", async () => {
      mockFetch
        .mockResolvedValueOnce(makeWeatherResponse(12.3, 18.7)) // coast
        .mockResolvedValueOnce(makeWeatherResponse(2.1, 8.9)); // troodos

      const mod = await import("./weather-live");
      const result = await mod.getLiveWeather();

      expect(result).not.toBeNull();
      expect(result!.coast).toEqual({ minC: 12, maxC: 19 });
      expect(result!.troodos).toEqual({ minC: 2, maxC: 9 });
      expect(result!.updatedAt).toBeDefined();
    });

    it("returns cached data on second call within TTL", async () => {
      mockFetch
        .mockResolvedValueOnce(makeWeatherResponse(10, 20))
        .mockResolvedValueOnce(makeWeatherResponse(0, 5));

      const mod = await import("./weather-live");
      const first = await mod.getLiveWeather();

      mockFetch.mockReset();
      const second = await mod.getLiveWeather();
      expect(second).toEqual(first);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("refetches after cache expires", async () => {
      mockFetch
        .mockResolvedValueOnce(makeWeatherResponse(10, 20))
        .mockResolvedValueOnce(makeWeatherResponse(0, 5));

      const mod = await import("./weather-live");
      await mod.getLiveWeather();

      // Advance past 1-hour TTL
      vi.advanceTimersByTime(61 * 60 * 1000);

      mockFetch
        .mockResolvedValueOnce(makeWeatherResponse(15, 25))
        .mockResolvedValueOnce(makeWeatherResponse(3, 10));

      const result = await mod.getLiveWeather();
      expect(result!.coast).toEqual({ minC: 15, maxC: 25 });
    });

    it("returns null when fetch fails and no cache", async () => {
      mockFetch.mockResolvedValue({ ok: false });

      const mod = await import("./weather-live");
      const result = await mod.getLiveWeather();
      expect(result).toBeNull();
    });

    it("returns stale cache when fetch fails", async () => {
      mockFetch
        .mockResolvedValueOnce(makeWeatherResponse(10, 20))
        .mockResolvedValueOnce(makeWeatherResponse(0, 5));

      const mod = await import("./weather-live");
      const first = await mod.getLiveWeather();

      // Expire cache
      vi.advanceTimersByTime(61 * 60 * 1000);

      mockFetch.mockResolvedValue({ ok: false });
      const result = await mod.getLiveWeather();
      expect(result).toEqual(first);
    });
  });

  describe("getWeatherAtCoords", () => {
    it("fetches weather at given coordinates", async () => {
      mockFetch.mockResolvedValue(makeWeatherResponse(14.6, 22.3, 1.5));

      const mod = await import("./weather-live");
      const result = await mod.getWeatherAtCoords(34.68, 33.04);

      expect(result).not.toBeNull();
      expect(result!.minC).toBe(15);
      expect(result!.maxC).toBe(22);
      expect(result!.precipitationMm).toBe(1.5);
    });

    it("rounds coordinates to 2 decimals for cache key", async () => {
      mockFetch.mockResolvedValue(makeWeatherResponse(10, 20, 0));

      const mod = await import("./weather-live");
      await mod.getWeatherAtCoords(34.6789, 33.0412);

      // Same rounded coords should use cache
      mockFetch.mockReset();
      const result = await mod.getWeatherAtCoords(34.6801, 33.0399);
      expect(result).not.toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("returns null when fetch fails and no cache", async () => {
      mockFetch.mockResolvedValue({ ok: false });

      const mod = await import("./weather-live");
      const result = await mod.getWeatherAtCoords(35.0, 33.0);
      expect(result).toBeNull();
    });

    it("returns stale cache when fetch fails", async () => {
      mockFetch.mockResolvedValue(makeWeatherResponse(12, 18, 0));

      const mod = await import("./weather-live");
      const first = await mod.getWeatherAtCoords(34.68, 33.04);

      // Expire cache
      vi.advanceTimersByTime(61 * 60 * 1000);
      mockFetch.mockResolvedValue({ ok: false });

      const result = await mod.getWeatherAtCoords(34.68, 33.04);
      expect(result).toEqual(first);
    });
  });
});
