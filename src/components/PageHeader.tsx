import Link from "next/link";
import { SECTION, TYPE } from "@/lib/design-tokens";

type PageHeaderProps = {
  backHref?: string;
  backLabel?: string;
  title: string;
  description: string;
  descriptionSecondary?: string;
  children?: React.ReactNode;
};

export default function PageHeader({
  backHref = "/",
  backLabel = "Back",
  title,
  description,
  descriptionSecondary,
  children,
}: PageHeaderProps) {
  return (
    <div className={SECTION.headingMarginLarge}>
      <Link
        href={backHref}
        className="inline-flex items-center min-h-[44px] py-2 text-terracotta/90 hover:text-terracotta text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded"
      >
        ← {backLabel}
      </Link>
      <h1 className={`${TYPE.pageTitle} mt-3 sm:mt-4`}>
        {title}
      </h1>
      <p className="text-olive/70 mt-2 max-w-xl prose-body break-words">{description}</p>
      {descriptionSecondary && (
        <p className="text-olive/60 text-sm mt-2 max-w-xl break-words">{descriptionSecondary}</p>
      )}
      {children}
    </div>
  );
}
