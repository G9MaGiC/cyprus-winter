import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";

type HomeSectionProps = {
  id: string;
  title: string;
  subtitle?: string;
  alt?: boolean;
  children: React.ReactNode;
};

export default function HomeSection({ id, title, subtitle, alt, children }: HomeSectionProps) {
  return (
    <section aria-labelledby={id} className={`${SECTION.py} ${alt ? SECTION.alt : ""} ${LAYOUT.safeAreaX}`}>
      <div className={`${LAYOUT.list} mx-auto`}>
        <h2 id={id} className={`${TYPE.sectionTitle} text-center ${SECTION.titleGap}`}>
          {title}
        </h2>
        {subtitle ? (
          <p className={`${TYPE.sectionSubtitle} text-center max-w-xl mx-auto ${SECTION.headingGap}`}>{subtitle}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}

