import { LAYOUT, SECTION } from "@/lib/design-tokens";
import ShareLinks from "@/components/ShareLinks";
import BackToTopLink from "@/components/BackToTopLink";

type HomeShareSectionProps = {
  sharePath?: string;
};

const defaultSharePath = "/";
const shareText =
  "Cyprus Winter — the Mediterranean's best-kept secret. Trails, villages, heritage. Often sixteen degrees when home is six.";

export default function HomeShareSection({ sharePath = defaultSharePath }: HomeShareSectionProps) {
  return (
    <section
      aria-labelledby="home-share-heading"
      className={`bg-charcoal text-white ${SECTION.py} pb-[max(3rem,env(safe-area-inset-bottom))] text-center`}
    >
      <div className={`${LAYOUT.safeAreaX} ${LAYOUT.listNarrow} mx-auto`}>
        <h2 id="home-share-heading" className="sr-only">
          Share Cyprus Winter
        </h2>
        <p className="text-white/90 font-semibold text-lg">Share Cyprus Winter</p>
        <p className="text-white/80 text-sm mt-3 max-w-lg mx-auto leading-relaxed prose-body">
          Planning ahead or already here? Tap the chat bubble. Add places as you browse—your plan
          saves automatically.
        </p>
        <p className="text-white/90 text-xs font-medium uppercase tracking-wider mt-6 mb-2 prose-label">
          Share with someone heading to Cyprus
        </p>
        <div className="flex justify-center gap-4">
          <ShareLinks
            path={sharePath}
            text={shareText}
            ariaLabel="Share via"
            className="share-links-footer"
          />
        </div>
        <div className="mt-6 pt-4 border-t border-white/20">
          <BackToTopLink />
        </div>
      </div>
    </section>
  );
}
