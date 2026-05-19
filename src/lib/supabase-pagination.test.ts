import { describe, expect, it, vi } from "vitest";
import { fetchAllSupabaseRows } from "./supabase-pagination";

describe("fetchAllSupabaseRows", () => {
  it("requests every range until the final partial page", async () => {
    const rows = [1, 2, 3, 4, 5].map((value) => ({ value }));
    const ranges: Array<[number, number]> = [];

    const result = await fetchAllSupabaseRows(
      () => ({
        range: vi.fn(async (from: number, to: number) => {
          ranges.push([from, to]);
          return { data: rows.slice(from, to + 1), error: null };
        }),
      }),
      2
    );

    expect(result).toEqual({ data: rows, error: null });
    expect(ranges).toEqual([
      [0, 1],
      [2, 3],
      [4, 5],
    ]);
  });
});
