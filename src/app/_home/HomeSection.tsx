import { HOME, LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";

type HomeSectionProps = {
  id: string;
  title: string;
  subtitle?: string;
  kicker?: string;
  alt?: boolean;
  children: React.ReactNode;
};

export default function HomeSection({ id, title, subtitle, kicker, alt, children }: HomeSectionProps) {
  return (
    <section
      aria-labelledby={id}
      className={`${HOME.sectionPy} ${alt ? SECTION.alt : "bg-background"} ${LAYOUT.safeAreaX} scroll-mt-24`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <header className={`text-center ${HOME.headerMargin}`}>
          {kicker ? (
            <p className={`${TYPE.kicker} text-sage mb-2`}>{kicker}</p>
          ) : null}
          <h2 id={id} className={`${TYPE.sectionTitle} ${SECTION.titleGap}`}>
            {title}
          </h2>
          {subtitle ? (
            <p className={`${TYPE.sectionSubtitle} max-w-xl mx-auto ${SECTION.headingGap}`}>{subtitle}</p>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
}

