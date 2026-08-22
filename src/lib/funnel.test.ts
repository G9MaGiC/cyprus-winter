import { describe, expect, it } from "vitest";
import { FUNNEL_ORDER } from "@/lib/funnel";

describe("FUNNEL_ORDER", () => {
  it("includes mid-funnel plan and hub events already tracked in product analytics", () => {
    expect(FUNNEL_ORDER).toContain("shop_click");
    expect(FUNNEL_ORDER).toContain("plan_view");
    expect(FUNNEL_ORDER).toContain("plan_share");
    expect(FUNNEL_ORDER).toContain("hub_footer_click");
    expect(FUNNEL_ORDER).toContain("guide_directory_view");
    expect(FUNNEL_ORDER).toContain("guide_match_click");
    expect(FUNNEL_ORDER.indexOf("plan_view")).toBeLessThan(FUNNEL_ORDER.indexOf("plan_add"));
    expect(FUNNEL_ORDER.indexOf("plan_add")).toBeLessThan(FUNNEL_ORDER.indexOf("booking_start"));
  });
});
