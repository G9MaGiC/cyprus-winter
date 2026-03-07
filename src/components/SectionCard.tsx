import { CARD } from "@/lib/design-tokens";

type BorderAccent = "terracotta" | "aegean" | "golden" | "sage";

type SectionCardProps = {
  title: string;
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
  children,
  className = "",
  borderAccent = "terracotta",
}: SectionCardProps) {
  return (
    <section className={`${CARD.base} ${CARD.contentLg} border-l-4 ${accentClasses[borderAccent]} ${className}`}>
      <h2 className="font-display font-semibold text-olive mb-4 text-lg">{title}</h2>
      {children}
    </section>
  );
}
