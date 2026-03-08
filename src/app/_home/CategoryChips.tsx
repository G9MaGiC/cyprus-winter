import Link from "next/link";
import { CTA, SECTION } from "@/lib/design-tokens";

type Chip = {
  href: string;
  label: string;
  ariaLabel: string;
  variant: "primary" | "secondary" | "tertiary";
};

const primary: Chip[] = [
  { href: "/discover?filter=village", label: "Villages", ariaLabel: "Villages", variant: "primary" },
  { href: "/discover?filter=winery", label: "Wineries", ariaLabel: "Wineries", variant: "primary" },
  { href: "/trails", label: "Trails", ariaLabel: "Trails", variant: "secondary" },
  { href: "/events", label: "Events", ariaLabel: "Events", variant: "secondary" },
  { href: "/discover?filter=family", label: "Family-friendly", ariaLabel: "Family-friendly", variant: "secondary" },
  { href: "/trails", label: "Trail conditions", ariaLabel: "Trail conditions", variant: "secondary" },
  { href: "/discover", label: "All", ariaLabel: "See all", variant: "secondary" },
];

const also: Chip[] = [
  { href: "/discover?filter=ancient", label: "Culture", ariaLabel: "Culture", variant: "tertiary" },
  { href: "/discover?filter=beach", label: "Coasts", ariaLabel: "Coasts", variant: "tertiary" },
  { href: "/discover?filter=monastery", label: "Monasteries", ariaLabel: "Monasteries", variant: "tertiary" },
];

function chipClass(v: Chip["variant"]) {
  if (v === "primary") return CTA.chipPrimary;
  if (v === "secondary") return CTA.chipSecondary;
  return CTA.chipTertiary;
}

export default function CategoryChips() {
  return (
    <>
      <div className="relative">
        <div
          className="flex flex-nowrap sm:flex-wrap overflow-x-auto scroll-smooth scroll-touch sm:overflow-visible justify-start sm:justify-center gap-3 pb-2 -mx-1 sm:mx-0 px-1 sm:px-0 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="navigation"
          aria-label="Browse by category"
        >
          {primary.map((c) => (
            <Link key={`${c.href}-${c.label}`} href={c.href} className={chipClass(c.variant)} aria-label={c.ariaLabel}>
              {c.label}
            </Link>
          ))}
        </div>
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-r from-transparent to-sand/80 sm:hidden"
          aria-hidden
        />
      </div>

      <div className={`mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-sand-200/80`}>
        <p className={`text-center text-sage text-sm ${SECTION.titleGap}`}>Also: Culture, Coasts, Monasteries</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {also.map((c) => (
            <Link key={`${c.href}-${c.label}`} href={c.href} className={chipClass(c.variant)} aria-label={c.ariaLabel}>
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

