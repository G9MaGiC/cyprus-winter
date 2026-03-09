/**
 * Shared types for Home page components.
 * LinkProps ensures AppLink and next-intl Link work interchangeably.
 */
export type LinkProps = {
  href: string;
  prefetch?: "auto";
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
};
