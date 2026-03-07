import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "el", "de", "pl"],
  defaultLocale: "en",
  pathnames: {
    "/": "/",
    "/discover": {
      en: "/discover",
      el: "/anakalypte",
      de: "/entdecken",
      pl: "/odkrywaj",
    },
    "/plan": {
      en: "/plan",
      el: "/schedias",
      de: "/planen",
      pl: "/planuj",
    },
    "/trails": {
      en: "/trails",
      el: "/monopatia",
      de: "/wanderwege",
      pl: "/szlaki",
    },
    "/events": {
      en: "/events",
      el: "/events",
      de: "/veranstaltungen",
      pl: "/wydarzenia",
    },
    "/airport": {
      en: "/airport",
      el: "/aerodromio",
      de: "/flughafen",
      pl: "/lotnisko",
    },
    "/team": {
      en: "/team",
      el: "/omada",
      de: "/team",
      pl: "/zespol",
    },
    "/bookings": {
      en: "/bookings",
      el: "/kratiseis",
      de: "/buchungen",
      pl: "/rezerwacje",
    },
    "/account": {
      en: "/account",
      el: "/logarias",
      de: "/konto",
      pl: "/konto",
    },
    "/weather": {
      en: "/weather",
      el: "/kairos",
      de: "/wetter",
      pl: "/pogoda",
    },
  },
});

export type Locale = (typeof routing.locales)[number];
