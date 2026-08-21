/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import SearchBar from "./SearchBar";

const nav = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  pathname: "/search",
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  usePathname: () => nav.pathname,
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}));

const messages = {
  nav: { searchAria: "Search places and trails" },
  search: {
    placeholder: "Find a place or trail",
    typeAtLeastTwo: "Type at least 2 characters",
    noResults: 'Nothing for "{query}". Try Troodos, Nissi, Omodos, or browse Discover.',
    browseByCategory: "Or browse by category",
    browseDiscover: "Browse Discover",
    viewTrails: "View all trails",
    planTrip: "Plan your trip",
  },
  common: {
    place: "Place",
    placeTypes: {
      trail: "Trail",
      event: "Event",
      winery: "Winery",
      restaurant: "Restaurant",
      activity: "Activity",
      beach: "Beach",
      village: "Village",
      monastery: "Monastery",
      ancientSite: "Ancient site",
      nature: "Nature",
    },
  },
};

function renderBar(props: Partial<React.ComponentProps<typeof SearchBar>> = {}) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SearchBar {...props} />
    </NextIntlClientProvider>
  );
}

describe("SearchBar", () => {
  beforeEach(() => {
    nav.push.mockClear();
    nav.replace.mockClear();
    nav.pathname = "/search";
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows type-at-least-two hint for a single character", () => {
    renderBar();
    const input = screen.getByRole("combobox", { name: "Search places and trails" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "o" } });
    expect(screen.getByRole("status").textContent).toContain("Type at least 2 characters");
  });

  it("opens a listbox of results and navigates on Enter", async () => {
    renderBar();
    const input = screen.getByRole("combobox", { name: "Search places and trails" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "omodos" } });

    expect(await screen.findByRole("listbox")).toBeTruthy();
    expect(screen.getAllByRole("option").length).toBeGreaterThan(0);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => {
      expect(nav.push).toHaveBeenCalled();
    });
    const href = String(nav.push.mock.calls[0]?.[0] ?? "");
    expect(href).toMatch(/\/(discover|trails|events)\//);
  });

  it("keeps options free of nested links (BUG-173)", async () => {
    renderBar();
    const input = screen.getByRole("combobox", { name: "Search places and trails" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "artemis" } });
    await screen.findByRole("listbox");
    for (const option of screen.getAllByRole("option")) {
      expect(option.querySelector("a")).toBeNull();
    }
  });
});
