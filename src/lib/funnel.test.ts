import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getEventSourceBreakdownInRange,
  getFunnelCountsInRange,
} from "./funnel";

type ConversionRow = {
  event: string;
  properties?: Record<string, unknown> | null;
  created_at: string;
};

const supabaseState = vi.hoisted(() => ({
  client: null as { from: (table: string) => unknown } | null,
}));

vi.mock("./supabase", () => ({
  getSupabase: () => supabaseState.client,
}));

function createPagedSupabase(rows: ConversionRow[]) {
  return {
    from(table: string) {
      expect(table).toBe("conversion_events");
      const filters: {
        events?: string[];
        startIso?: string;
        endIso?: string;
        range?: { from: number; to: number };
      } = {};

      const builder = {
        select: vi.fn(() => builder),
        in: vi.fn((_column: string, events: string[]) => {
          filters.events = events;
          return builder;
        }),
        gte: vi.fn((_column: string, startIso: string) => {
          filters.startIso = startIso;
          return builder;
        }),
        lt: vi.fn((_column: string, endIso: string) => {
          filters.endIso = endIso;
          return builder;
        }),
        range: vi.fn((from: number, to: number) => {
          filters.range = { from, to };
          return builder;
        }),
        then(resolve: (value: { data: ConversionRow[]; error: null }) => void) {
          let data = rows;
          if (filters.events) {
            data = data.filter((row) => filters.events?.includes(row.event));
          }
          if (filters.startIso) {
            data = data.filter((row) => row.created_at >= filters.startIso!);
          }
          if (filters.endIso) {
            data = data.filter((row) => row.created_at < filters.endIso!);
          }
          const page = filters.range
            ? data.slice(filters.range.from, filters.range.to + 1)
            : data.slice(0, 1000);
          resolve({ data: page, error: null });
        },
      };
      return builder;
    },
  };
}

describe("funnel Supabase aggregation", () => {
  beforeEach(() => {
    supabaseState.client = null;
  });

  it("counts conversion events beyond the Supabase default row cap", async () => {
    const rows = Array.from({ length: 1001 }, (): ConversionRow => ({
      event: "plan_add",
      created_at: "2026-05-10T00:00:00.000Z",
    }));
    supabaseState.client = createPagedSupabase(rows);

    await expect(
      getFunnelCountsInRange(new Date("2026-05-01T00:00:00.000Z"))
    ).resolves.toEqual({ plan_add: 1001 });
  });

  it("includes source breakdown rows beyond the Supabase default row cap", async () => {
    const rows = [
      ...Array.from({ length: 1000 }, (): ConversionRow => ({
        event: "shop_click",
        properties: { source: "home" },
        created_at: "2026-05-10T00:00:00.000Z",
      })),
      {
        event: "shop_click",
        properties: { source: "detail" },
        created_at: "2026-05-10T00:00:00.000Z",
      },
    ];
    supabaseState.client = createPagedSupabase(rows);

    await expect(
      getEventSourceBreakdownInRange(
        ["shop_click"],
        new Date("2026-05-01T00:00:00.000Z")
      )
    ).resolves.toEqual({
      shop_click: [
        { source: "home", count: 1000 },
        { source: "detail", count: 1 },
      ],
    });
  });
});
