import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock React
vi.mock("react", () => ({
  useState: vi.fn((init: unknown) => [typeof init === "function" ? (init as () => unknown)() : init, vi.fn()]),
  useEffect: vi.fn(),
  useCallback: vi.fn((fn: unknown) => fn),
  useRef: vi.fn((val: unknown) => ({ current: val })),
}));

const mockEmptyDays = () => {
  const out: Record<number, string[]> = {};
  for (let d = 1; d <= 14; d++) out[d] = [];
  return out;
};

const mockAddToDayIfMissing = vi.fn();
const mockRemoveFromDay = vi.fn();
const mockClearDay = vi.fn();
const mockApplyTemplate = vi.fn();
const mockMergeTemplate = vi.fn();
const mockGetPlace = vi.fn();

vi.mock("@/hooks/useItinerary", () => ({
  useItinerary: vi.fn(() => ({
    days: mockEmptyDays(),
    activeDay: 1,
    setActiveDay: vi.fn(),
    hydrated: true,
    copied: false,
    addToDayIfMissing: mockAddToDayIfMissing,
    removeFromDay: mockRemoveFromDay,
    getPlace: mockGetPlace,
    lastAddedId: null,
    hasContent: false,
    hasWineries: false,
    applyTemplate: mockApplyTemplate,
    mergeTemplate: mockMergeTemplate,
    clearDay: mockClearDay,
    copyItinerary: vi.fn(),
    copyShareLink: vi.fn(),
    linkCopied: false,
    sharePath: "/plan",
    toggleInDay: vi.fn(),
  })),
  MAX_DAYS: 14,
}));

vi.mock("@/hooks/usePlanUrlActions", () => ({
  usePlanUrlActions: vi.fn(),
}));

vi.mock("@/hooks/useTripDates", () => ({
  useTripDates: vi.fn(() => ({
    dates: { start: null, end: null },
    setTripDates: vi.fn(),
    hydrated: true,
    daysUntil: null,
    withinSevenDays: false,
    tripLength: null,
  })),
}));

describe("ComboChoice type", () => {
  it("is exported from usePlanPage", async () => {
    // Type-level check - just verify the module exports
    const mod = await import("@/hooks/usePlanPage");
    expect(mod).toBeDefined();
  });
});

describe("usePlanPage hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("can be imported without error", async () => {
    const mod = await import("@/hooks/usePlanPage");
    expect(typeof mod.usePlanPage).toBe("function");
  });

  it("returns expected shape", async () => {
    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();

    // Modal state
    expect(result).toHaveProperty("showClearModal");
    expect(result).toHaveProperty("setShowClearModal");
    expect(result).toHaveProperty("templateChoice");
    expect(result).toHaveProperty("setTemplateChoice");
    expect(result).toHaveProperty("comboChoice");
    expect(result).toHaveProperty("setComboChoice");
    expect(result).toHaveProperty("showBrowseModal");
    expect(result).toHaveProperty("setShowBrowseModal");

    // Trip dates
    expect(result).toHaveProperty("dates");
    expect(result).toHaveProperty("setTripDates");
    expect(result).toHaveProperty("datesHydrated");
    expect(result).toHaveProperty("daysUntil");
    expect(result).toHaveProperty("withinSevenDays");
    expect(result).toHaveProperty("tripLength");

    // Itinerary
    expect(result).toHaveProperty("days");
    expect(result).toHaveProperty("activeDay");
    expect(result).toHaveProperty("activeItems");
    expect(result).toHaveProperty("hydrated");
    expect(result).toHaveProperty("hasContent");

    // Derived
    expect(result).toHaveProperty("totalPlaces");
    expect(result).toHaveProperty("activeDaysCount");
    expect(result).toHaveProperty("displayDaysCount");

    // Refs
    expect(result).toHaveProperty("lastAddedCardRef");
    expect(result).toHaveProperty("quickStartRef");

    // Handlers
    expect(result).toHaveProperty("handleTemplateClick");
    expect(result).toHaveProperty("handleReplaceTemplate");
    expect(result).toHaveProperty("handleAddTemplate");
    expect(result).toHaveProperty("handleComboClick");
    expect(result).toHaveProperty("handleAddCombo");
    expect(result).toHaveProperty("handleReplaceCombo");
    expect(result).toHaveProperty("handleClearDayConfirm");
    expect(result).toHaveProperty("scrollToQuickStart");
  });

  it("initial modal states are false/null", async () => {
    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    expect(result.showClearModal).toBe(false);
    expect(result.templateChoice).toBeNull();
    expect(result.comboChoice).toBeNull();
    expect(result.showBrowseModal).toBe(false);
  });
});

describe("usePlanPage derived values", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("activeItems is empty when day has no items", async () => {
    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    expect(result.activeItems).toEqual([]);
  });

  it("totalPlaces is 0 when days are empty", async () => {
    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    expect(result.totalPlaces).toBe(0);
  });

  it("activeDaysCount is 0 when no days have content", async () => {
    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    expect(result.activeDaysCount).toBe(0);
  });

  it("displayDaysCount defaults to 1 when no content and no tripLength", async () => {
    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    expect(result.displayDaysCount).toBe(1);
  });

  it("displayDaysCount uses tripLength when available", async () => {
    const { useTripDates } = await import("@/hooks/useTripDates");
    (useTripDates as ReturnType<typeof vi.fn>).mockReturnValue({
      dates: { start: "2026-03-21", end: "2026-03-25" },
      setTripDates: vi.fn(),
      hydrated: true,
      daysUntil: 0,
      withinSevenDays: true,
      tripLength: 5,
    });

    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    expect(result.displayDaysCount).toBe(5);
  });

  it("displayDaysCount uses MAX_DAYS when hasContent and no tripLength", async () => {
    const { useTripDates } = await import("@/hooks/useTripDates");
    (useTripDates as ReturnType<typeof vi.fn>).mockReturnValue({
      dates: { start: null, end: null },
      setTripDates: vi.fn(),
      hydrated: true,
      daysUntil: null,
      withinSevenDays: false,
      tripLength: null,
    });

    const { useItinerary } = await import("@/hooks/useItinerary");
    (useItinerary as ReturnType<typeof vi.fn>).mockReturnValue({
      days: { ...mockEmptyDays(), 1: ["kourion"] },
      activeDay: 1,
      setActiveDay: vi.fn(),
      hydrated: true,
      copied: false,
      addToDayIfMissing: mockAddToDayIfMissing,
      removeFromDay: mockRemoveFromDay,
      getPlace: mockGetPlace,
      lastAddedId: null,
      hasContent: true,
      hasWineries: false,
      applyTemplate: mockApplyTemplate,
      mergeTemplate: mockMergeTemplate,
      clearDay: mockClearDay,
      copyItinerary: vi.fn(),
      copyShareLink: vi.fn(),
      linkCopied: false,
      sharePath: "/plan?plan=1%3Akourion",
      toggleInDay: vi.fn(),
    });

    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    expect(result.displayDaysCount).toBe(14);
  });
});

async function resetItineraryMock() {
  const { useItinerary } = await import("@/hooks/useItinerary");
  (useItinerary as ReturnType<typeof vi.fn>).mockReturnValue({
    days: mockEmptyDays(),
    activeDay: 1,
    setActiveDay: vi.fn(),
    hydrated: true,
    copied: false,
    addToDayIfMissing: mockAddToDayIfMissing,
    removeFromDay: mockRemoveFromDay,
    getPlace: mockGetPlace,
    lastAddedId: null,
    hasContent: false,
    hasWineries: false,
    applyTemplate: mockApplyTemplate,
    mergeTemplate: mockMergeTemplate,
    clearDay: mockClearDay,
    copyItinerary: vi.fn(),
    copyShareLink: vi.fn(),
    linkCopied: false,
    sharePath: "/plan",
    toggleInDay: vi.fn(),
  });
}

describe("usePlanPage handler functions", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetItineraryMock();
  });

  it("handleTemplateClick calls applyTemplate directly when no content", async () => {
    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    result.handleTemplateClick("classic");
    expect(mockApplyTemplate).toHaveBeenCalledWith("classic");
  });

  it("handleTemplateClick sets templateChoice when hasContent", async () => {
    const { useItinerary } = await import("@/hooks/useItinerary");
    (useItinerary as ReturnType<typeof vi.fn>).mockReturnValue({
      days: { ...mockEmptyDays(), 1: ["kourion"] },
      activeDay: 1,
      setActiveDay: vi.fn(),
      hydrated: true,
      copied: false,
      addToDayIfMissing: mockAddToDayIfMissing,
      removeFromDay: mockRemoveFromDay,
      getPlace: mockGetPlace,
      lastAddedId: null,
      hasContent: true,
      hasWineries: false,
      applyTemplate: mockApplyTemplate,
      mergeTemplate: mockMergeTemplate,
      clearDay: mockClearDay,
      copyItinerary: vi.fn(),
      copyShareLink: vi.fn(),
      linkCopied: false,
      sharePath: "/plan",
      toggleInDay: vi.fn(),
    });

    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    // When hasContent is true, handleTemplateClick should set templateChoice
    // Since useState returns a setter mock, we can't check state directly
    // but we verify applyTemplate was NOT called
    result.handleTemplateClick("classic");
    expect(mockApplyTemplate).not.toHaveBeenCalled();
  });

  it("handleReplaceTemplate calls applyTemplate with skipConfirm when templateChoice is set", async () => {
    // We simulate by using useState mock that returns a specific templateChoice
    const react = await import("react");
    const useStateMock = react.useState as ReturnType<typeof vi.fn>;

    let callIndex = 0;
    useStateMock.mockImplementation((init: unknown) => {
      callIndex++;
      // 2nd useState call is templateChoice - return "classic"
      if (callIndex === 2) return ["classic", vi.fn()];
      return [typeof init === "function" ? (init as () => unknown)() : init, vi.fn()];
    });

    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    result.handleReplaceTemplate();
    expect(mockApplyTemplate).toHaveBeenCalledWith("classic", true);
  });

  it("handleReplaceTemplate does nothing when templateChoice is null", async () => {
    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    result.handleReplaceTemplate();
    expect(mockApplyTemplate).not.toHaveBeenCalled();
  });

  it("handleAddTemplate calls mergeTemplate when templateChoice is set", async () => {
    const react = await import("react");
    const useStateMock = react.useState as ReturnType<typeof vi.fn>;

    let callIndex = 0;
    useStateMock.mockImplementation((init: unknown) => {
      callIndex++;
      if (callIndex === 2) return ["mountain", vi.fn()];
      return [typeof init === "function" ? (init as () => unknown)() : init, vi.fn()];
    });

    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    result.handleAddTemplate();
    expect(mockMergeTemplate).toHaveBeenCalledWith("mountain");
  });

  it("handleAddTemplate does nothing when templateChoice is null", async () => {
    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    result.handleAddTemplate();
    expect(mockMergeTemplate).not.toHaveBeenCalled();
  });

  it("handleComboClick adds items when no content", async () => {
    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    result.handleComboClick(["id1", "id2"], "Test Combo");
    expect(mockAddToDayIfMissing).toHaveBeenCalledWith("id1");
    expect(mockAddToDayIfMissing).toHaveBeenCalledWith("id2");
  });

  it("handleClearDayConfirm calls clearDay", async () => {
    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    result.handleClearDayConfirm();
    expect(mockClearDay).toHaveBeenCalled();
  });

  it("handleAddCombo does nothing when comboChoice is null", async () => {
    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    result.handleAddCombo();
    expect(mockAddToDayIfMissing).not.toHaveBeenCalled();
  });

  it("handleReplaceCombo does nothing when comboChoice is null", async () => {
    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    result.handleReplaceCombo();
    expect(mockClearDay).not.toHaveBeenCalled();
    expect(mockAddToDayIfMissing).not.toHaveBeenCalled();
  });

  it("handleAddCombo processes items when comboChoice exists", async () => {
    const react = await import("react");
    const useStateMock = react.useState as ReturnType<typeof vi.fn>;

    let callIndex = 0;
    useStateMock.mockImplementation((init: unknown) => {
      callIndex++;
      // 3rd useState call is comboChoice
      if (callIndex === 3) return [{ label: "Test", ids: ["a", "b"] }, vi.fn()];
      return [typeof init === "function" ? (init as () => unknown)() : init, vi.fn()];
    });

    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    result.handleAddCombo();
    expect(mockAddToDayIfMissing).toHaveBeenCalledWith("a");
    expect(mockAddToDayIfMissing).toHaveBeenCalledWith("b");
  });

  it("handleReplaceCombo clears day then adds items when comboChoice exists", async () => {
    const react = await import("react");
    const useStateMock = react.useState as ReturnType<typeof vi.fn>;

    let callIndex = 0;
    useStateMock.mockImplementation((init: unknown) => {
      callIndex++;
      if (callIndex === 3) return [{ label: "Test", ids: ["x", "y"] }, vi.fn()];
      return [typeof init === "function" ? (init as () => unknown)() : init, vi.fn()];
    });

    const { usePlanPage } = await import("@/hooks/usePlanPage");
    const result = usePlanPage();
    result.handleReplaceCombo();
    expect(mockClearDay).toHaveBeenCalled();
    expect(mockAddToDayIfMissing).toHaveBeenCalledWith("x");
    expect(mockAddToDayIfMissing).toHaveBeenCalledWith("y");
  });
});
