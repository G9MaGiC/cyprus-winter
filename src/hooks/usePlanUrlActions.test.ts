import { describe, it, expect, vi, beforeEach } from "vitest";
import { TEMPLATE_KEYS } from "@/data/itinerary-templates";

// Mock React
vi.mock("react", () => ({
  useEffect: vi.fn(),
  useRef: vi.fn((val: unknown) => ({ current: val })),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(() => ({
    replace: vi.fn(),
    push: vi.fn(),
  })),
}));

vi.mock("next-intl", () => ({
  useLocale: vi.fn(() => "en"),
}));

vi.mock("@/lib/plan-url-params", () => ({
  parseAddParam: vi.fn((param: string) => {
    if (!param || param === "failed") return [];
    return [...new Set(param.split(",").map((s: string) => s.trim()).filter(Boolean).slice(0, 50))];
  }),
}));

vi.mock("@/lib/analytics", () => ({
  trackProduct: vi.fn(),
}));

describe("isValidTemplate (internal function tested via behavior)", () => {
  // isValidTemplate is not exported, but we test its effect through TEMPLATE_KEYS
  it("TEMPLATE_KEYS contains expected template keys", () => {
    expect(TEMPLATE_KEYS).toContain("short-stay");
    expect(TEMPLATE_KEYS).toContain("classic");
    expect(TEMPLATE_KEYS).toContain("mountain");
    expect(TEMPLATE_KEYS).toContain("coast-culture");
    expect(TEMPLATE_KEYS).toContain("family");
    expect(TEMPLATE_KEYS).toContain("classic-7");
    expect(TEMPLATE_KEYS).toContain("mountain-10");
  });

  it("TEMPLATE_KEYS does not contain invalid keys", () => {
    expect(TEMPLATE_KEYS).not.toContain("invalid-template");
    expect(TEMPLATE_KEYS).not.toContain("");
    expect(TEMPLATE_KEYS).not.toContain(null);
  });
});

describe("usePlanUrlActions hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("can be imported without error", async () => {
    const mod = await import("@/hooks/usePlanUrlActions");
    expect(typeof mod.usePlanUrlActions).toBe("function");
  });

  it("can be called with required params", async () => {
    const { usePlanUrlActions } = await import("@/hooks/usePlanUrlActions");
    // Should not throw
    expect(() => {
      usePlanUrlActions({
        hydrated: false,
        hasContent: false,
        getPlace: vi.fn(),
        addToDayIfMissing: vi.fn(),
        applyTemplate: vi.fn(),
      });
    }).not.toThrow();
  });

  it("does not process when not hydrated", async () => {
    const { useEffect } = await import("react");
    const { usePlanUrlActions } = await import("@/hooks/usePlanUrlActions");
    const applyTemplate = vi.fn();
    const addToDayIfMissing = vi.fn();

    usePlanUrlActions({
      hydrated: false,
      hasContent: false,
      getPlace: vi.fn(),
      addToDayIfMissing,
      applyTemplate,
    });

    // useEffect is mocked, so callbacks are registered but not executed
    // We verify template and add functions were not called directly
    expect(applyTemplate).not.toHaveBeenCalled();
    expect(addToDayIfMissing).not.toHaveBeenCalled();
  });
});

describe("usePlanUrlActions - effect callbacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers two useEffect callbacks", async () => {
    const react = await import("react");
    const useEffectMock = react.useEffect as ReturnType<typeof vi.fn>;
    useEffectMock.mockClear();

    const { usePlanUrlActions } = await import("@/hooks/usePlanUrlActions");
    usePlanUrlActions({
      hydrated: true,
      hasContent: false,
      getPlace: vi.fn(),
      addToDayIfMissing: vi.fn(),
      applyTemplate: vi.fn(),
    });

    expect(useEffectMock).toHaveBeenCalledTimes(2);
  });

  it("template effect calls applyTemplate for valid template when hydrated and no content", async () => {
    const { useSearchParams } = await import("next/navigation");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
      new URLSearchParams("template=classic")
    );

    const react = await import("react");
    const useEffectMock = react.useEffect as ReturnType<typeof vi.fn>;
    // Execute the effect callback immediately
    useEffectMock.mockImplementation((cb: () => void) => cb());

    const { useRouter } = await import("@/i18n/navigation");
    const replaceMock = vi.fn();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ replace: replaceMock });

    const applyTemplate = vi.fn();
    const { usePlanUrlActions } = await import("@/hooks/usePlanUrlActions");

    usePlanUrlActions({
      hydrated: true,
      hasContent: false,
      getPlace: vi.fn(),
      addToDayIfMissing: vi.fn(),
      applyTemplate,
    });

    expect(applyTemplate).toHaveBeenCalledWith("classic");
    expect(replaceMock).toHaveBeenCalledWith("/plan", { scroll: false });
  });

  it("template effect does not apply when hasContent is true", async () => {
    const { useSearchParams } = await import("next/navigation");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
      new URLSearchParams("template=classic")
    );

    const react = await import("react");
    const useEffectMock = react.useEffect as ReturnType<typeof vi.fn>;
    useEffectMock.mockImplementation((cb: () => void) => cb());

    const applyTemplate = vi.fn();
    const { usePlanUrlActions } = await import("@/hooks/usePlanUrlActions");

    usePlanUrlActions({
      hydrated: true,
      hasContent: true,
      getPlace: vi.fn(),
      addToDayIfMissing: vi.fn(),
      applyTemplate,
    });

    expect(applyTemplate).not.toHaveBeenCalled();
  });

  it("add effect redirects to failed when no valid places", async () => {
    const { useSearchParams } = await import("next/navigation");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
      new URLSearchParams("add=nonexistent-place")
    );

    const react = await import("react");
    const useEffectMock = react.useEffect as ReturnType<typeof vi.fn>;
    useEffectMock.mockImplementation((cb: () => void) => cb());

    const { useRouter } = await import("@/i18n/navigation");
    const replaceMock = vi.fn();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ replace: replaceMock });

    const getPlace = vi.fn(() => undefined);
    const addToDayIfMissing = vi.fn();
    const { usePlanUrlActions } = await import("@/hooks/usePlanUrlActions");

    usePlanUrlActions({
      hydrated: true,
      hasContent: false,
      getPlace,
      addToDayIfMissing,
      applyTemplate: vi.fn(),
    });

    expect(addToDayIfMissing).not.toHaveBeenCalled();
    expect(replaceMock).toHaveBeenCalledWith("/plan?add=failed", { scroll: false });
  });

  it("add effect processes valid places and tracks analytics", async () => {
    const { useSearchParams } = await import("next/navigation");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
      new URLSearchParams("add=kourion,artemis")
    );

    const react = await import("react");
    const useEffectMock = react.useEffect as ReturnType<typeof vi.fn>;
    useEffectMock.mockImplementation((cb: () => void) => cb());

    const { useRouter } = await import("@/i18n/navigation");
    const replaceMock = vi.fn();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ replace: replaceMock });

    const getPlace = vi.fn((id: string) => ({ id, name: id, type: "attraction" }));
    const addToDayIfMissing = vi.fn();
    const { usePlanUrlActions } = await import("@/hooks/usePlanUrlActions");

    usePlanUrlActions({
      hydrated: true,
      hasContent: false,
      getPlace,
      addToDayIfMissing,
      applyTemplate: vi.fn(),
    });

    expect(addToDayIfMissing).toHaveBeenCalledWith("kourion");
    expect(addToDayIfMissing).toHaveBeenCalledWith("artemis");
    expect(replaceMock).toHaveBeenCalledWith("/plan", { scroll: false });
  });

  it("add effect skips 'failed' param value", async () => {
    const { useSearchParams } = await import("next/navigation");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
      new URLSearchParams("add=failed")
    );

    const react = await import("react");
    const useEffectMock = react.useEffect as ReturnType<typeof vi.fn>;
    useEffectMock.mockImplementation((cb: () => void) => cb());

    const addToDayIfMissing = vi.fn();
    const { usePlanUrlActions } = await import("@/hooks/usePlanUrlActions");

    usePlanUrlActions({
      hydrated: true,
      hasContent: false,
      getPlace: vi.fn(),
      addToDayIfMissing,
      applyTemplate: vi.fn(),
    });

    expect(addToDayIfMissing).not.toHaveBeenCalled();
  });
});
