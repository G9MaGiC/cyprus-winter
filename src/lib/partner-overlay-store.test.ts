import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabase, hasSupabase } from "./supabase";
import { getPartnerOverlay, resetPartnerOverlaysForTests } from "./partner-overlay";

vi.mock("./supabase", () => ({
  getSupabase: vi.fn(),
  hasSupabase: vi.fn(() => false),
}));

type OverlayRow = {
  provider_id: string;
  opening_hours: string | null;
  image_url: string | null;
};

/** Simulates PostgREST upsert: only columns present in the payload change. */
function supabaseOverlayStore(initial: OverlayRow | null) {
  let stored: OverlayRow | null = initial ? { ...initial } : null;
  const upserts: Record<string, unknown>[] = [];

  const supabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => ({ data: stored, error: null })),
        })),
      })),
      upsert: vi.fn(async (row: Record<string, unknown>) => {
        upserts.push(row);
        stored = {
          provider_id: String(row.provider_id),
          opening_hours:
            "opening_hours" in row
              ? ((row.opening_hours as string | null) ?? null)
              : (stored?.opening_hours ?? null),
          image_url:
            "image_url" in row
              ? ((row.image_url as string | null) ?? null)
              : (stored?.image_url ?? null),
        };
        return { error: null };
      }),
    })),
  };

  return { supabase, upserts, getStored: () => stored };
}

describe("setPartnerOverlay", () => {
  afterEach(() => {
    resetPartnerOverlaysForTests();
    vi.clearAllMocks();
    vi.mocked(hasSupabase).mockReturnValue(false);
    vi.mocked(getSupabase).mockReturnValue(null);
  });

  it("does not null a stored hero image when a cold isolate patches hours only", async () => {
    const { setPartnerOverlay } = await import("./partner-overlay-store");
    const existing: OverlayRow = {
      provider_id: "tsiakkas",
      opening_hours: "Winter: Tue–Sat 11:00–15:00.",
      image_url: "/images/cyprus/winery-tsiakkas.jpg",
    };
    const { supabase, upserts, getStored } = supabaseOverlayStore(existing);
    vi.mocked(getSupabase).mockReturnValue(
      supabase as unknown as ReturnType<typeof getSupabase>
    );
    // Cold isolate: durable row exists, in-memory cache is empty.
    resetPartnerOverlaysForTests();

    const next = await setPartnerOverlay("tsiakkas", {
      openingHours: "Winter: Wed–Sun 10:00–16:00.",
    });

    expect(getStored()?.image_url).toBe("/images/cyprus/winery-tsiakkas.jpg");
    expect(getStored()?.opening_hours).toBe("Winter: Wed–Sun 10:00–16:00.");
    expect(upserts[0]).not.toHaveProperty("image_url", null);
    expect(next.imageUrl).toBe("/images/cyprus/winery-tsiakkas.jpg");
    expect(getPartnerOverlay("tsiakkas")?.imageUrl).toBe(
      "/images/cyprus/winery-tsiakkas.jpg"
    );
  });
});
