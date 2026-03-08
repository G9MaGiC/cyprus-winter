import Link from "next/link";
import { CTA, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";

const moods = [
  { href: "/trails", label: "Active", ariaLabel: "Active adventures — trails, hiking" },
  { href: "/discover?filter=ancient", label: "Culture", ariaLabel: "Culture — ancient sites, ruins" },
  { href: "/discover?filter=winery", label: "Wine", ariaLabel: "Wine — wineries, tastings" },
  { href: "/discover?filter=quiet", label: "Quiet escapes", ariaLabel: "Quiet escapes — off the beaten path, villages, hidden gems" },
  { href: "/trails", label: "Mountains", ariaLabel: "Mountains — Troodos trails" },
  { href: "/discover?filter=village", label: "Villages", ariaLabel: "Villages — cobbled streets, kafenions" },
  { href: "/discover?filter=monastery", label: "Wellness", ariaLabel: "Wellness — monasteries, quiet spaces" },
];

export default function HomeMoodStrip() {
  return (
    <section
      aria-labelledby="mood-heading"
      className={`${SECTION.pySub} ${LAYOUT.safeAreaX}`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <h2
          id="mood-heading"
          className={`${TYPE.sectionTitle} text-center ${SECTION.headingGap}`}
        >
          Explore by mood
        </h2>
        <div
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          role="navigation"
          aria-label="Explore by how you feel"
        >
          {moods.map((m) => (
            <Link
              key={m.href + m.label}
              href={m.href}
              className={`${CTA.chipSecondary} rounded-xl`}
              aria-label={m.ariaLabel}
            >
              {m.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
