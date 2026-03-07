import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn, formatNumber, truncate, debounce, throttle } from "./utils";

describe("cn", () => {
  it("joins string classes", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignores falsy values", () => {
    expect(cn("a", null, undefined, false, "b")).toBe("a b");
  });

  it("handles object with boolean values", () => {
    expect(cn({ active: true, disabled: false })).toBe("active");
  });

  it("includes number as string", () => {
    expect(cn(42)).toBe("42");
  });

  it("handles mixed inputs", () => {
    expect(cn("base", { active: true }, "tail")).toBe("base active tail");
  });
});

describe("formatNumber", () => {
  it("formats with locale thousands separator", () => {
    expect(formatNumber(1000)).toMatch(/1.000|1,000/);
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("formats negative numbers", () => {
    expect(formatNumber(-1000)).toMatch(/-1.000|-1,000/);
  });
});

describe("truncate", () => {
  it("returns string as-is when within maxLength", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("returns full string when length equals maxLength", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates to ellipsis when maxLength is 4", () => {
    expect(truncate("hello", 4)).toBe("h…");
  });

  it("truncates with ellipsis when over maxLength", () => {
    expect(truncate("hello world", 8)).toBe("hello…");
  });
});

describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("calls fn after delay", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("resets timer on repeated calls", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("passes args to fn when called", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced("a", 1);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith("a", 1);
  });
});

describe("throttle", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("calls fn immediately", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("ignores calls within limit", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("allows call after limit elapses", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled();
    vi.advanceTimersByTime(100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
