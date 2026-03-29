import { CARD, TYPE, SECTION } from "@/lib/design-tokens";

type BorderAccent = "terracotta" | "aegean" | "golden" | "sage";

type SectionCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  borderAccent?: BorderAccent;
  id?: string;
};

const accentClasses: Record<BorderAccent, string> = {
  terracotta: "border-l-terracotta/60",
  aegean: "border-l-aegean/60",
  golden: "border-l-golden/60",
  sage: "border-l-sage/60",
};

export default function SectionCard({
  title,
  subtitle,
  children,
  className = "",
  borderAccent = "terracotta",
  id,
}: SectionCardProps) {
  return (
    <section id={id} className={`rounded-2xl ${CARD.base} ${CARD.contentLg} border-l-[5px] ${accentClasses[borderAccent]} ${className}`}>
      <h2 className={`${TYPE.cardTitle} ${subtitle ? "mb-1.5" : SECTION.headingGap}`}>{title}</h2>
      {subtitle && <p className={`text-sm text-olive/60 ${SECTION.headingGap}`}>{subtitle}</p>}
      {children}
    </section>
  );
}
