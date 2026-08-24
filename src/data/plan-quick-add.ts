/** Quick-add place IDs shown on Plan page (labels from planQuick.quickAddPlaces i18n). */
export const PLAN_QUICK_ADD_PLACE_IDS = ["artemis", "kourion", "domes-sergiou", "omodos"] as const;

/** @deprecated Use PLAN_QUICK_ADD_PLACE_IDS + i18n labels */
export const PLAN_QUICK_ADD_PLACES = PLAN_QUICK_ADD_PLACE_IDS.map((id) => ({ id, label: id }));
