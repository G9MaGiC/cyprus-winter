export type NavLink = {
  href: string;
  /** Translation key in nav namespace (e.g. "discover", "plan") */
  labelKey: string;
};

export const navPrimaryLinks: readonly NavLink[] = [
  { href: "/", labelKey: "home" },
  { href: "/discover", labelKey: "discover" },
  { href: "/trails", labelKey: "trails" },
  { href: "/plan", labelKey: "plan" },
];

export const navMoreLinks: readonly NavLink[] = [
  { href: "/weather", labelKey: "weather" },
  { href: "/events", labelKey: "events" },
  { href: "/bookings", labelKey: "bookings" },
  { href: "/airport", labelKey: "arriving" },
  { href: "/secrets", labelKey: "secrets" },
  { href: "/account", labelKey: "account" },
  { href: "/team", labelKey: "team" },
];

export const bottomPrimaryLinks: readonly NavLink[] = [
  { href: "/", labelKey: "home" },
  { href: "/discover", labelKey: "discover" },
  { href: "/trails", labelKey: "trails" },
  { href: "/plan", labelKey: "plan" },
];

export const bottomOverflowLinks: readonly NavLink[] = [
  { href: "/search", labelKey: "search" },
  { href: "/weather", labelKey: "weather" },
  { href: "/events", labelKey: "events" },
  { href: "/bookings", labelKey: "bookings" },
  { href: "/airport", labelKey: "arriving" },
  { href: "/secrets", labelKey: "secrets" },
  { href: "/team", labelKey: "team" },
  { href: "/account", labelKey: "account" },
];
