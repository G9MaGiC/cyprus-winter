export const TRACK_EVENTS = [
  "web_vital",
  "page_view",
  "discover_view",
  "discover_filter",
  "trail_view",
  "winery_detail_view",
  "booking_start",
  "booking_complete",
  "shop_click",
  "plan_add",
  "plan_view",
  "plan_remove",
  "plan_share",
  "plan_day_change",
  "plan_template_apply",
  "onboarding_started",
  "onboarding_dismissed",
  "onboarding_intent_planning",
  "onboarding_intent_exploring",
  "onboarding_intent_browsing",
  "first_add_to_plan",
  "first_booking",
  "arrival_quick_action_click",
  "inline_plan_add_click",
  "decision_rationale_view",
  "booking_trust_strip_view",
  "booking_stepper_progress",
  "trip_length_recommendation_shown",
  "today_adapt_action_click",
  "hub_footer_click",
  "guide_directory_view",
  "guide_match_click",
] as const;

export type TrackEventName = (typeof TRACK_EVENTS)[number];

/** Events that must be recorded by trusted server workflows, not clients. */
export const SERVER_ONLY_TRACK_EVENTS = [
  "booking_complete",
  "first_booking",
] as const;

export type ServerOnlyTrackEventName = (typeof SERVER_ONLY_TRACK_EVENTS)[number];
export type ClientTrackEventName = Exclude<TrackEventName, ServerOnlyTrackEventName>;

export const CLIENT_TRACK_EVENTS = TRACK_EVENTS.filter(
  (event) => !(SERVER_ONLY_TRACK_EVENTS as readonly string[]).includes(event)
);

export const PRODUCT_EVENTS = [
  "page_view",
  "plan_add",
  "plan_view",
  "plan_remove",
  "plan_share",
  "plan_day_change",
  "plan_template_apply",
  "booking_start",
  "hub_footer_click",
  "shop_click",
  "trail_view",
  "winery_detail_view",
  "discover_view",
  "discover_filter",
  "guide_directory_view",
  "guide_match_click",
] as const satisfies readonly TrackEventName[];

export type ProductEventName = (typeof PRODUCT_EVENTS)[number];

export function isProductEvent(event: string): event is ProductEventName {
  return (PRODUCT_EVENTS as readonly string[]).includes(event);
}

