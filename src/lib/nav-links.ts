export type NavLink = {
  href: string;
  label: string;
};

export const navPrimaryLinks: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/trails", label: "Trails" },
  { href: "/plan", label: "Plan" },
];

export const navMoreLinks: readonly NavLink[] = [
  { href: "/weather", label: "Weather" },
  { href: "/events", label: "Events" },
  { href: "/bookings", label: "Bookings" },
  { href: "/airport", label: "Arriving" },
  { href: "/secrets", label: "Local secrets" },
  { href: "/account", label: "Account" },
  { href: "/team", label: "Team" },
];

export const bottomPrimaryLinks: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/trails", label: "Trails" },
  { href: "/plan", label: "Plan" },
];

export const bottomOverflowLinks: readonly NavLink[] = [
  { href: "/search", label: "Search" },
  { href: "/weather", label: "Weather" },
  { href: "/events", label: "Events" },
  { href: "/bookings", label: "Bookings" },
  { href: "/airport", label: "Arriving" },
  { href: "/secrets", label: "Local secrets" },
  { href: "/team", label: "Team" },
  { href: "/account", label: "Account" },
];

