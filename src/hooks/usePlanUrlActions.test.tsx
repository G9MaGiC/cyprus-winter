/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { Suspense } from "react";
import { usePlanUrlActions } from "./usePlanUrlActions";

const patchMocks = vi.hoisted(() => ({
  patchPlanUrlSearchParams: vi.fn(),
}));

const navMocks = vi.hoisted(() => ({
  template: null as string | null,
  add: null as string | null,
}));

vi.mock("@/lib/plan-url-params", () => ({
  parseAddParam: (param: string) => param.split(",").filter(Boolean),
  patchPlanUrlSearchParams: patchMocks.patchPlanUrlSearchParams,
}));

vi.mock("@/lib/analytics", () => ({
  trackProduct: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get(key: string) {
      if (key === "template") return navMocks.template;
      if (key === "add") return navMocks.add;
      return null;
    },
  }),
}));

vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

describe("usePlanUrlActions", () => {
  beforeEach(() => {
    navMocks.template = null;
    navMocks.add = null;
    patchMocks.patchPlanUrlSearchParams.mockClear();
  });

  it("skips template application when mutationsDisabled", () => {
    const applyTemplate = vi.fn();
    navMocks.template = "short-stay";

    renderHook(
      () =>
        usePlanUrlActions({
          hydrated: true,
          hasContent: false,
          getPlace: () => undefined,
          addToDayIfMissing: vi.fn(),
          applyTemplate,
          mutationsDisabled: true,
        }),
      { wrapper }
    );

    expect(applyTemplate).not.toHaveBeenCalled();
    expect(patchMocks.patchPlanUrlSearchParams).not.toHaveBeenCalled();
  });

  it("applies template when hydrated and plan is empty", () => {
    const applyTemplate = vi.fn();
    navMocks.template = "short-stay";

    renderHook(
      () =>
        usePlanUrlActions({
          hydrated: true,
          hasContent: false,
          getPlace: () => undefined,
          addToDayIfMissing: vi.fn(),
          applyTemplate,
        }),
      { wrapper }
    );

    expect(applyTemplate).toHaveBeenCalledWith("short-stay");
    expect(patchMocks.patchPlanUrlSearchParams).toHaveBeenCalled();
  });

  it("notifies when a template is applied from the URL", () => {
    const applyTemplate = vi.fn();
    const onTemplateApplied = vi.fn();
    navMocks.template = "short-stay";

    renderHook(
      () =>
        usePlanUrlActions({
          hydrated: true,
          hasContent: false,
          getPlace: () => undefined,
          addToDayIfMissing: vi.fn(),
          applyTemplate,
          onTemplateApplied,
        }),
      { wrapper }
    );

    expect(onTemplateApplied).toHaveBeenCalledWith("short-stay");
  });
});
