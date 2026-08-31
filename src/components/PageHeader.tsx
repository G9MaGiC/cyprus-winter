import AppLink from "@/components/AppLink";
import { SECTION, TYPE } from "@/lib/design-tokens";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useTranslations } from "next-intl";

export type BreadcrumbItem = { label: string; href: string; isCurrent?: boolean };

type PageHeaderProps = {
  backHref?: string;
  backLabel?: string;
  title: string;
  description: string;
  descriptionSecondary?: string;
  breadcrumbItems?: BreadcrumbItem[];
  children?: React.ReactNode;
};

export default function PageHeader({
  backHref = "/",
  backLabel,
  title,
  description,
  descriptionSecondary,
  breadcrumbItems,
  children,
}: PageHeaderProps) {
  const tCommon = useTranslations("common");
  const resolvedBackLabel = backLabel ?? tCommon("back");
  // The back link already provides a tab stop to backHref — drop the breadcrumb
  // that duplicates it so keyboard users don't hit two adjacent stops for the
  // same target (AUD-93).
  const dedupedBreadcrumbs = breadcrumbItems?.filter(
    (item) => item.isCurrent || item.href !== backHref
  );

  return (
    <div className={SECTION.headingMarginLarge}>
      <nav aria-label={tCommon("aria.pageNavigation")} className="flex flex-col gap-1">
      <AppLink
        href={backHref}
        className="inline-flex items-center min-h-[44px] py-2 text-terracotta hover:text-terracotta-muted text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded"
      >
        <span aria-hidden>←</span> {resolvedBackLabel}
      </AppLink>
      {dedupedBreadcrumbs && dedupedBreadcrumbs.length > 1 && (
        <Breadcrumbs items={dedupedBreadcrumbs} className="py-1 px-0 text-xs text-muted-ink" />
      )}
      </nav>
      <h1 className={`${TYPE.pageTitle} mt-3 sm:mt-4`}>
        {title}
      </h1>
      <p className="text-muted-ink mt-2 max-w-xl prose-body break-words">{description}</p>
      {descriptionSecondary && (
        <p className="text-muted-ink text-sm mt-2 max-w-xl break-words">{descriptionSecondary}</p>
      )}
      {children}
    </div>
  );
}
