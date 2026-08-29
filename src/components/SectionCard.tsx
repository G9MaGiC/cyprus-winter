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
  terracotta: "border-s-terracotta/40",
  aegean: "border-s-aegean/40",
  golden: "border-s-golden/40",
  sage: "border-s-sage/40",
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
    <section id={id} className={`${CARD.base} ${CARD.contentLg} border-s-4 ${accentClasses[borderAccent]} ${className}`}>
      <h2 className={`${TYPE.cardTitle} ${subtitle ? "mb-1.5" : SECTION.headingGap}`}>{title}</h2>
      {subtitle && <p className={`text-sm text-muted-ink ${SECTION.headingGap}`}>{subtitle}</p>}
      {children}
    </section>
  );
}
