import { describe, expect, it } from "vitest";
import { resolveTrailCardConditions } from "./trail-card-conditions";

describe("resolveTrailCardConditions", () => {
  const editorial = {
    trailId: "artemis",
    status: "open" as const,
    surface: "dry" as const,
    tip: "Quiet in winter.",
    lastReportedAt: "2026-01-01T00:00:00.000Z",
  };

  it("uses a fresh hiker report over editorial conditions", () => {
    const view = resolveTrailCardConditions(editorial, {
      trailId: "artemis",
      status: "caution",
      surface: "snow",
      reportedAt: "2026-08-19T12:00:00.000Z",
      temperatureC: 4,
      note: "Patchy snow on the ridge.",
    });
    expect(view.source).toBe("report");
    expect(view.status).toBe("caution");
    expect(view.surface).toBe("snow");
    expect(view.lastReportedAt).toBe("2026-08-19T12:00:00.000Z");
    expect(view.temperatureC).toBe(4);
    expect(view.tip).toBe("Patchy snow on the ridge.");
  });

  it("falls back to editorial when there is no report", () => {
    const view = resolveTrailCardConditions(editorial, undefined);
    expect(view.source).toBe("editorial");
    expect(view.status).toBe("open");
    expect(view.tip).toBe("Quiet in winter.");
  });

  it("marks trails with neither report nor editorial as none", () => {
    const view = resolveTrailCardConditions(undefined, undefined);
    expect(view.source).toBe("none");
    expect(view.status).toBeUndefined();
  });
});
