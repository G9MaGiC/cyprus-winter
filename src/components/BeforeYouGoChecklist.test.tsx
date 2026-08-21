/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import BeforeYouGoChecklist from "./BeforeYouGoChecklist";
import type { WinterTip } from "@/data/winter-tips";

const tips: WinterTip[] = [
  {
    id: "euro",
    category: "practical",
    title: "Euro EN data",
    body: "EN data body euro",
  },
  {
    id: "drive-left",
    category: "practical",
    title: "Drive EN data",
    body: "EN data body drive",
  },
];

const messages = {
  common: {
    beforeYouGo: {
      heading: "Before you go",
      allSet: "All set. Have a safe trip.",
    },
  },
  home: {
    insiderTips: {
      euro: {
        title: "Euro, cards, and cash",
        body: "Cyprus uses the euro.",
      },
      "drive-left": {
        title: "Drive on the left",
        body: "British legacy.",
      },
    },
  },
};

describe("BeforeYouGoChecklist", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders localized tip copy instead of English data table strings", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <BeforeYouGoChecklist tips={tips} />
      </NextIntlClientProvider>
    );

    expect(screen.getByRole("heading", { name: "Before you go" })).toBeTruthy();
    expect(screen.getByText("Euro, cards, and cash.")).toBeTruthy();
    expect(screen.getByText(/Cyprus uses the euro/)).toBeTruthy();
    expect(screen.queryByText("Euro EN data")).toBeNull();
    expect(screen.queryByText("EN data body euro")).toBeNull();
  });

  it("shows all-set status when every tip is checked", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <BeforeYouGoChecklist tips={tips} />
      </NextIntlClientProvider>
    );

    fireEvent.click(screen.getByLabelText(/Euro, cards, and cash/));
    fireEvent.click(screen.getByLabelText(/Drive on the left/));
    expect(screen.getByRole("status").textContent).toContain("All set");
  });
});
