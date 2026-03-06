import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatReportedAgo } from "./format";

describe("formatReportedAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for dates within the last hour', () => {
    vi.setSystemTime(new Date("2026-03-05T12:00:00Z"));
    expect(formatReportedAgo("2026-03-05T11:30:00Z")).toBe("Just now");
  });

  it('returns "Xh ago" for dates within the last 24 hours', () => {
    vi.setSystemTime(new Date("2026-03-05T14:00:00Z"));
    expect(formatReportedAgo("2026-03-05T12:00:00Z")).toBe("2h ago");
  });

  it('returns "Yesterday" for 1 day ago', () => {
    vi.setSystemTime(new Date("2026-03-05T12:00:00Z"));
    expect(formatReportedAgo("2026-03-04T12:00:00Z")).toBe("Yesterday");
  });

  it('returns "Xd ago" for dates within the last week', () => {
    vi.setSystemTime(new Date("2026-03-05T12:00:00Z"));
    expect(formatReportedAgo("2026-03-03T12:00:00Z")).toBe("2d ago");
  });

  it("returns locale date string for older dates", () => {
    vi.setSystemTime(new Date("2026-03-05T12:00:00Z"));
    const result = formatReportedAgo("2026-02-20T12:00:00Z");
    expect(result).toMatch(/\d/);
  });
});
