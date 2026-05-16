export const TRACK_EVENTS = [
  "web_vital",
  "page_view",
  "discover_view",
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
] as const;

export type TrackEventName = (typeof TRACK_EVENTS)[number];

export const PRODUCT_EVENTS = [
  "plan_add",
  "plan_view",
  "plan_remove",
  "plan_share",
  "plan_day_change",
  "plan_template_apply",
] as const satisfies readonly TrackEventName[];

export type ProductEventName = (typeof PRODUCT_EVENTS)[number];

