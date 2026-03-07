export type NavLink = {
  href: string;
  label: string;
};

export const navPrimaryLinks: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/trails", label: "Trails" },
  { href: "/weather", label: "Weather" },
  { href: "/events", label: "Events" },
  { href: "/plan", label: "Plan" },
  { href: "/bookings", label: "Bookings" },
  { href: "/airport", label: "Arriving" },
];

export const navMoreLinks: readonly NavLink[] = [
  { href: "/secrets", label: "Local secrets" },
  { href: "/account", label: "Account" },
  { href: "/team", label: "Team" },
];

export const bottomPrimaryLinks: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/trails", label: "Trails" },
  { href: "/weather", label: "Weather" },
  { href: "/plan", label: "Plan" },
];

export const bottomOverflowLinks: readonly NavLink[] = [
  { href: "/search", label: "Search" },
  { href: "/bookings", label: "Bookings" },
  { href: "/book/guide", label: "Guides" },
  { href: "/events", label: "Events" },
  { href: "/airport", label: "Arriving" },
  { href: "/secrets", label: "Local secrets" },
  { href: "/team", label: "Team" },
  { href: "/account", label: "Account" },
];

