import { CARD, TYPE } from "@/lib/design-tokens";

type BorderAccent = "terracotta" | "aegean" | "golden" | "sage";

type SectionCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  borderAccent?: BorderAccent;
};

const accentClasses: Record<BorderAccent, string> = {
  terracotta: "border-l-terracotta/40",
  aegean: "border-l-aegean/40",
  golden: "border-l-golden/40",
  sage: "border-l-sage/40",
};

export default function SectionCard({
  title,
  subtitle,
  children,
  className = "",
  borderAccent = "terracotta",
}: SectionCardProps) {
  return (
    <section className={`${CARD.base} ${CARD.contentLg} border-l-4 ${accentClasses[borderAccent]} ${className}`}>
      <h2 className={`${TYPE.cardTitle} ${subtitle ? "mb-1.5" : "mb-4"}`}>{title}</h2>
      {subtitle && <p className="text-sm text-olive/60 mb-4">{subtitle}</p>}
      {children}
    </section>
  );
}
