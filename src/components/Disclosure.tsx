import { TYPE } from "@/lib/design-tokens";

export type DisclosureProps = {
  id?: string;
  summary: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function Disclosure({
  id,
  summary,
  defaultOpen = false,
  children,
  className = "",
}: DisclosureProps) {
  return (
    <details id={id} className={`group ${className}`} {...(defaultOpen ? { open: true } : {})}>
      <summary className="list-none cursor-pointer min-h-[44px] flex items-center justify-between gap-2 py-2 -mx-1 px-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden [&::marker]:hidden">
        <span className={`${TYPE.sectionTitle} text-xl sm:text-2xl`}>{summary}</span>
        <span
          className="text-olive/60 text-sm shrink-0 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        >
          ▾
        </span>
      </summary>
      <div className="mt-4 sm:mt-6">{children}</div>
    </details>
  );
}
