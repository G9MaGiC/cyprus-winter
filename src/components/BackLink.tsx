import AppLink from "@/components/AppLink";

type BackLinkProps = {
  href: string;
  label: string;
};

export default function BackLink({ href, label }: BackLinkProps) {
  return (
    <AppLink
      href={href}
      className="inline-flex items-center min-h-[44px] py-2 max-w-full min-w-0 text-terracotta hover:text-terracotta-muted text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded truncate"
      aria-label={label}
    >
      <span aria-hidden>←</span> {label}
    </AppLink>
  );
}
